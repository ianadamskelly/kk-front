/* ============================================================
   Enhanced MYP Navigator — Evaluator Engine
   ------------------------------------------------------------
   Runs MYPKB rules against teacher input and returns a
   structured verdict. No AI, no network — pure rules + scoring.
   ============================================================ */

window.MYPEvaluator = (function (KB) {
  'use strict';

  if (!KB) {
    console.warn('MYPEvaluator: MYPKB not loaded.');
    return {};
  }

  /* ---------- Internal: run rules for an area with context ---------- */
  function runRules(area, text, ctx) {
    const positives = [];
    const flags = [];
    const dimensionHits = {};

    KB.rules.forEach(rule => {
      if (rule.area !== area) return;
      let matched = false;
      try {
        matched = rule.detect(text, ctx);
      } catch (e) {
        matched = false;
      }
      if (!matched) return;

      const resolve = (v) => (typeof v === 'function' ? v(ctx) : v);
      const item = {
        id: rule.id,
        label: resolve(rule.label),
        note: resolve(rule.note),
        suggestion: resolve(rule.suggestion),
        example: resolve(rule.example),
        dimension: rule.dimension,
        severity: rule.severity
      };

      if (rule.kind === 'positive') positives.push(item);
      else flags.push(item);

      dimensionHits[rule.dimension] = dimensionHits[rule.dimension] || { pos: 0, neg: 0, negWeight: 0 };
      if (rule.kind === 'positive') {
        dimensionHits[rule.dimension].pos += 1;
      } else {
        dimensionHits[rule.dimension].neg += 1;
        dimensionHits[rule.dimension].negWeight += severityWeight(rule.severity);
      }
    });

    return { positives, flags, dimensionHits };
  }

  function severityWeight(s) {
    return s === 'high' ? 4 : s === 'med' ? 2 : 1;
  }

  /* ---------- Internal: roll dimensionHits into 0–100 scores ---------- */
  function rollUp(dimensionHits, relevant) {
    const dims = [];
    let total = 0;
    let totalWeight = 0;
    let lowestCriticalDim = 100;

    relevant.forEach(dim => {
      const def = KB.dimensions[dim];
      if (!def) return;
      const hit = dimensionHits[dim] || { pos: 0, neg: 0, negWeight: 0 };
      // Start at 70 (baseline). Each positive +12, each negative -severity*15.
      let score = 70 + (hit.pos * 12) - (hit.negWeight * 15);
      score = Math.max(0, Math.min(100, score));
      dims.push({ id: dim, label: def.label, weight: def.weight, score, hits: hit });
      total += score * def.weight;
      totalWeight += def.weight;
      // Track the worst dimension that actually had negative hits — used to cap overall
      if (hit.neg > 0 && score < lowestCriticalDim) lowestCriticalDim = score;
    });

    let overall = totalWeight > 0 ? Math.round(total / totalWeight) : 0;
    // Cap: overall cannot exceed the worst-hit dimension by more than 25 points.
    // This prevents a single catastrophic flag (e.g. clear recall stem) from being
    // diluted by neutral baselines elsewhere.
    if (lowestCriticalDim < 100) {
      overall = Math.min(overall, lowestCriticalDim + 25);
    }
    return { dimensions: dims, overall };
  }

  function band(score) {
    if (score >= 85) return { id: 'excellent', label: 'Excellent', emoji: '🟢' };
    if (score >= 70) return { id: 'good',      label: 'Strong',    emoji: '🟢' };
    if (score >= 55) return { id: 'fair',      label: 'Almost there', emoji: '🟡' };
    return                  { id: 'poor',      label: 'Rework recommended', emoji: '🔴' };
  }

  /* ============================================================
     PUBLIC: evaluate an inquiry question
     ============================================================ */
  function evaluateInquiryQuestion(text, opts) {
    opts = opts || {};
    const subject = opts.subject;
    const { positives, flags, dimensionHits } =
      runRules('inquiryQuestion', text || '', { subject });

    // Add terminology checks too (they are area=terminology — re-run)
    const term = runRules('terminology', text || '', {});
    term.flags.forEach(f => flags.push(f));
    Object.assign(dimensionHits, term.dimensionHits);

    const relevant = ['provocation','openEndedness','antiGoogleability','specificity','conceptDepth','mypAlignment'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    // Find 3 matching examples — prefer same subject, fall back to any
    let matches = subject
      ? KB.examples.filter(e => e.subject === subject)
      : KB.examples.slice();
    if (matches.length < 3) matches = matches.concat(KB.examples.filter(e => !matches.includes(e)));
    matches = shuffle(matches).slice(0, 3);

    // Build pattern-transformer rewrites (only if text exists)
    const rewrites = (text && text.trim()) ? suggestRewrites(text) : [];

    return {
      input: text,
      score: rolled.overall,
      band: verdict,
      dimensions: rolled.dimensions,
      positives, flags,
      matchingExamples: matches,
      rewrites
    };
  }

  /* ============================================================
     PUBLIC: suggest rewrites using transformers
     ============================================================ */
  function suggestRewrites(text) {
    const out = [];
    const seen = new Set();
    const clean = text.trim().replace(/\s+/g, ' ');

    KB.transformers.forEach(tr => {
      const m = clean.match(tr.match);
      if (!m) return;
      try {
        const built = tr.build(m).replace(/\s+/g, ' ').trim();
        if (built.length < 12) return;
        if (seen.has(built.toLowerCase())) return;
        seen.add(built.toLowerCase());
        out.push({ label: tr.label, text: ensureQuestionMark(built) });
      } catch (e) { /* skip */ }
    });

    return out.slice(0, 5);
  }
  function ensureQuestionMark(s) {
    s = s.trim();
    if (!s.endsWith('?') && !s.endsWith('.')) s += '?';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ============================================================
     PUBLIC: evaluate community engagement description
     ============================================================ */
  function evaluateCommunityEngagement(text) {
    const { positives, flags, dimensionHits } =
      runRules('communityEngagement', text || '', {});

    const term = runRules('terminology', text || '', {});
    term.flags.forEach(f => flags.push(f));
    Object.assign(dimensionHits, term.dimensionHits);

    const relevant = ['partnership','form','specificity','mypAlignment'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    // Concrete rewrite for "for the community" → "with the community"
    const withSuggestions = [];
    if (/\bfor the community\b/i.test(text || '')) {
      withSuggestions.push({
        kind: 'reframe',
        from: 'for the community',
        to: 'with the community',
        line: (text || '').replace(/\bfor the community\b/gi, 'with the community')
      });
    }
    if (/\bhelp them\b/i.test(text || '')) {
      withSuggestions.push({
        kind: 'reframe',
        from: 'help them',
        to: 'learn alongside them',
        line: (text || '').replace(/\bhelp them\b/gi, 'learn alongside them')
      });
    }

    return {
      input: text,
      score: rolled.overall,
      band: verdict,
      dimensions: rolled.dimensions,
      positives, flags,
      reframes: withSuggestions,
      forms: KB.ceFraming.forms
    };
  }

  /* ============================================================
     PUBLIC: evaluate concept usage in a task
     ============================================================ */
  function evaluateConceptUsage(concept, taskText, subject) {
    const ctx = { concept: (concept || '').toLowerCase().trim() };
    const { positives, flags, dimensionHits } =
      runRules('conceptUsage', taskText || '', ctx);

    // Add: is the concept recognised in this subject?
    const subjectConcepts = (KB.concepts[subject] || []).map(c => c.toLowerCase());
    const known = subjectConcepts.includes(ctx.concept);
    if (concept && !known && subject) {
      flags.push({
        id: 'CONCEPT-NOT-RECOGNISED',
        label: 'Concept not in your subject\'s sample list',
        note: `"${concept}" is not on the sample Specified Concepts list for ${subject}. That\'s fine if your school has added it — just confirm it lives in your curriculum overview.`,
        suggestion: `Sample concepts for ${subject}: ${subjectConcepts.join(', ')}.`,
        dimension: 'mypAlignment',
        severity: 'low'
      });
      dimensionHits.mypAlignment = dimensionHits.mypAlignment || { pos: 0, neg: 0, negWeight: 0 };
      dimensionHits.mypAlignment.neg += 1;
      dimensionHits.mypAlignment.negWeight += 1;
    } else if (known) {
      positives.push({
        id: 'CONCEPT-RECOGNISED',
        label: 'Concept matches your subject\'s sample list',
        note: `"${concept}" is on the sample Specified Concepts for ${subject}.`,
        dimension: 'mypAlignment',
        severity: 'low'
      });
      dimensionHits.mypAlignment = dimensionHits.mypAlignment || { pos: 0, neg: 0, negWeight: 0 };
      dimensionHits.mypAlignment.pos += 1;
    }

    const relevant = ['conceptDepth','mypAlignment'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    // Suggest a stronger verb if recall verbs found
    const verbSwap = [];
    if (/^\s*(define|state|list|name|identify|recall|label)\b/i.test(taskText || '')) {
      verbSwap.push('analyse');
      verbSwap.push('evaluate');
      verbSwap.push('investigate');
      verbSwap.push('justify');
      verbSwap.push('design');
    }

    return {
      input: { concept, taskText, subject },
      score: rolled.overall,
      band: verdict,
      dimensions: rolled.dimensions,
      positives, flags,
      verbSwap
    };
  }

  /* ============================================================
     PUBLIC: cross-field validation of the unit planner
     ============================================================ */
  function evaluateUnitPlanner(fields) {
    fields = fields || {};
    const { title, subject, concept, lens, iq, atl, ce } = fields;
    const issues = [];
    const wins   = [];

    // 1. Concept presence in IQ
    if (concept && iq) {
      const tokens = concept.split(/[,;]| and /i).map(s => s.trim()).filter(Boolean);
      const missing = tokens.filter(tok => {
        const stem = KB.helpers.stripPlural(tok);
        return stem && !iq.toLowerCase().includes(stem);
      });
      if (missing.length === tokens.length) {
        issues.push({
          area: 'concept-iq',
          label: 'Concept not echoed in the inquiry question',
          note: `Your concept(s) (${tokens.join(', ')}) don\'t appear in the inquiry question — students might not see what the unit is really about.`,
          suggestion: 'You don\'t have to name the concept — but the question should clearly lead students into thinking about it.'
        });
      } else {
        wins.push({
          area: 'concept-iq',
          label: 'Concept is visible in the inquiry question',
          note: 'A concept that shows up in the question is a concept the unit will actually develop.'
        });
      }
    }

    // 2. Lens alignment with IQ
    if (lens && iq) {
      const t = iq.toLowerCase();
      const lensSignals = {
        Individual: /\b(i|me|my|you|your|yourself|own|personal|feel|believe)\b/i,
        Local:      /\b(school|class|classroom|city|town|neighbour|neighbor|community|local|our|here|in our)\b/i,
        Global:     /\b(world|global|humanity|nation|nations|country|countries|earth|planet|culture|cultures|civilisation)\b/i
      };
      const sig = lensSignals[lens];
      if (sig && !sig.test(t)) {
        issues.push({
          area: 'lens-iq',
          label: `Lens "${lens}" not visible in the inquiry question`,
          note: `You chose the ${lens} lens, but the question doesn\'t signal it. Lens-tags become decorative without language to match.`,
          suggestion: lens === 'Individual'
            ? 'Bring "you/your/I/my" into the question — make it personal.'
            : lens === 'Local'
            ? 'Anchor the question to a real place: our city, our school, our neighbourhood.'
            : 'Stretch the question to the world / humanity / a global system.'
        });
      } else if (sig) {
        wins.push({
          area: 'lens-iq',
          label: `Lens "${lens}" comes through in the question`,
          note: 'The question and the lens reinforce each other — good unit framing.'
        });
      }
    }

    // 3. ATL alignment with the task / CE prompt
    if (atl && ce) {
      const verbs = (KB.atlAlignment[atl] || []).map(v => v.toLowerCase());
      const ceText = ce.toLowerCase();
      const hit = verbs.some(v => ceText.includes(v));
      if (verbs.length && !hit) {
        issues.push({
          area: 'atl-task',
          label: `Task verbs don\'t match the ${atl} ATL category`,
          note: `Your community-engagement description doesn\'t use verbs typical of ${atl} (${verbs.slice(0,4).join(', ')}…).`,
          suggestion: `Either reword the task to include a verb like "${verbs[0]}" or "${verbs[1]}", or pick a different ATL category.`
        });
      } else if (hit) {
        wins.push({
          area: 'atl-task',
          label: `Task verbs align with ${atl}`,
          note: 'The task description naturally exercises the chosen ATL category.'
        });
      }
    }

    // 4. CE framing
    if (ce) {
      const ceVerdict = evaluateCommunityEngagement(ce);
      ceVerdict.flags.forEach(f => issues.push({
        area: 'ce',
        label: f.label,
        note: f.note,
        suggestion: f.suggestion
      }));
      ceVerdict.positives.forEach(p => wins.push({
        area: 'ce',
        label: p.label,
        note: p.note
      }));
    }

    // 5. IQ itself
    if (iq) {
      const iqVerdict = evaluateInquiryQuestion(iq, { subject });
      // surface only the high-severity flags here to keep noise down
      iqVerdict.flags.filter(f => f.severity !== 'low').forEach(f => issues.push({
        area: 'iq',
        label: f.label,
        note: f.note,
        suggestion: f.suggestion
      }));
    }

    return { wins, issues };
  }

  /* ---------- small util ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    evaluateInquiryQuestion,
    evaluateCommunityEngagement,
    evaluateConceptUsage,
    evaluateUnitPlanner,
    suggestRewrites,
    KB
  };
})(window.MYPKB);
