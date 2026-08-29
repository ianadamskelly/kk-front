/* ============================================================
   Enhanced PYP Navigator — Evaluator Engine
   ------------------------------------------------------------
   Runs PYPKB rules against teacher input and returns a
   structured verdict. No AI, no network — pure rules + scoring.

   Exposes:
     evaluateCentralIdea(text, { theme })
     evaluateLinesOfInquiry(text)
     evaluateAction(text)
     evaluateAgency(text)
     evaluateUnitPlanner(fields)
     suggestRewrites(text)
   ============================================================ */

window.PYPEvaluator = (function (KB) {
  'use strict';

  if (!KB) {
    console.warn('PYPEvaluator: PYPKB not loaded.');
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
      if (hit.neg > 0 && score < lowestCriticalDim) lowestCriticalDim = score;
    });

    let overall = totalWeight > 0 ? Math.round(total / totalWeight) : 0;
    // Cap: a single catastrophic flag should not be diluted by neutral dimensions.
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
     PUBLIC: evaluate a Central Idea
     ============================================================ */
  function evaluateCentralIdea(text, opts) {
    opts = opts || {};
    const theme = opts.theme;
    const { positives, flags, dimensionHits } =
      runRules('centralIdea', text || '', { theme });

    // Pull in terminology checks (old PYP language)
    const term = runRules('terminology', text || '', {});
    term.flags.forEach(f => flags.push(f));
    Object.assign(dimensionHits, term.dimensionHits);

    const relevant = ['structure','conceptDepth','transferability','specificity','provocation','pypAlignment'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    // Find 3 matching examples — prefer the same theme
    let matches = theme
      ? KB.examples.filter(e => e.theme === theme)
      : KB.examples.slice();
    if (matches.length < 3) {
      matches = matches.concat(KB.examples.filter(e => !matches.includes(e)));
    }
    matches = shuffle(matches).slice(0, 3);

    // Rewrites — only when text exists
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
     PUBLIC: suggest Central Idea rewrites using transformers
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
        if (built.length < 20) return;
        const key = built.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ label: tr.label, text: ensurePeriod(built) });
      } catch (e) { /* skip */ }
    });

    return out.slice(0, 5);
  }
  function ensurePeriod(s) {
    s = s.trim();
    if (!/[.?!]$/.test(s)) s += '.';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ============================================================
     PUBLIC: evaluate Lines of Inquiry (one block of text, lines split)
     ============================================================ */
  function evaluateLinesOfInquiry(text) {
    const { positives, flags, dimensionHits } =
      runRules('linesOfInquiry', text || '', {});

    const relevant = ['structure','conceptDepth','specificity'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    return {
      input: text,
      score: rolled.overall,
      band: verdict,
      dimensions: rolled.dimensions,
      positives, flags,
      lines: KB.helpers.splitLines(text || '')
    };
  }

  /* ============================================================
     PUBLIC: evaluate an Action description
     ============================================================ */
  function evaluateAction(text) {
    const { positives, flags, dimensionHits } =
      runRules('action', text || '', {});

    // Terminology (service learning etc.)
    const term = runRules('terminology', text || '', {});
    term.flags.forEach(f => flags.push(f));
    Object.assign(dimensionHits, term.dimensionHits);

    const relevant = ['actionFraming','pypAlignment'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    // Reframes from charity / one-way phrasing toward partnership
    const reframes = [];
    if (/\bfor the community\b/i.test(text || '')) {
      reframes.push({
        from: 'for the community',
        to: 'with the community',
        line: (text || '').replace(/\bfor the community\b/gi, 'with the community')
      });
    }
    if (/\bhelp them\b/i.test(text || '')) {
      reframes.push({
        from: 'help them',
        to: 'partner with them',
        line: (text || '').replace(/\bhelp them\b/gi, 'partner with them')
      });
    }
    if (/\b(donate|fundraise|raise money)\b/i.test(text || '') &&
        !/\b(meet|listen|interview|partner|alongside|advocate)\b/i.test(text || '')) {
      reframes.push({
        from: 'donate / fundraise on its own',
        to: 'donate / fundraise AND build a relationship',
        line: 'Pair the action with relationship: meet, listen, plan together — then act.'
      });
    }

    return {
      input: text,
      score: rolled.overall,
      band: verdict,
      dimensions: rolled.dimensions,
      positives, flags,
      reframes,
      forms: KB.actionForms.map(f => f.name)
    };
  }

  /* ============================================================
     PUBLIC: evaluate Agency framing in a description
     ============================================================ */
  function evaluateAgency(text) {
    const { positives, flags, dimensionHits } =
      runRules('agency', text || '', {});

    const relevant = ['agency'];
    const rolled = rollUp(dimensionHits, relevant);
    const verdict = band(rolled.overall);

    // Surface which of the three faces of agency were detected
    const surfaces = { voice: false, choice: false, ownership: false };
    positives.forEach(p => {
      if (/VOICE/.test(p.id))     surfaces.voice = true;
      if (/CHOICE/.test(p.id))    surfaces.choice = true;
      if (/OWNERSHIP/.test(p.id)) surfaces.ownership = true;
    });

    return {
      input: text,
      score: rolled.overall,
      band: verdict,
      dimensions: rolled.dimensions,
      positives, flags,
      surfaces
    };
  }

  /* ============================================================
     PUBLIC: cross-field validation of the unit planner
     ============================================================ */
  function evaluateUnitPlanner(fields) {
    fields = fields || {};
    const { theme, concepts, ci, loi, atl, action } = fields;
    const issues = [];
    const wins   = [];

    // 1. Central Idea quality (surface only non-low flags)
    if (ci) {
      const v = evaluateCentralIdea(ci, { theme });
      v.flags.filter(f => f.severity !== 'low').forEach(f => issues.push({
        area: 'ci', label: f.label, note: f.note, suggestion: f.suggestion
      }));
      if (v.score >= 75) wins.push({
        area: 'ci',
        label: 'Central Idea is strong',
        note: `Scored ${v.score}/100 — transferable, concept-rich, and well-structured.`
      });
    }

    // 2. Lines of Inquiry (surface only non-low flags)
    if (loi) {
      const v = evaluateLinesOfInquiry(loi);
      v.flags.filter(f => f.severity !== 'low').forEach(f => issues.push({
        area: 'loi', label: f.label, note: f.note, suggestion: f.suggestion
      }));
      if (v.score >= 75) wins.push({
        area: 'loi',
        label: 'Lines of Inquiry are well-shaped',
        note: `Scored ${v.score}/100 — count, length and concept coverage all look good.`
      });
    }

    // 3. Are the named concepts visible in the CI or LOI?
    if (concepts && (ci || loi)) {
      const tokens = concepts.split(/[,;]| and /i).map(s => s.trim().toLowerCase()).filter(Boolean);
      const haystack = ((ci || '') + ' ' + (loi || '')).toLowerCase();
      const missing = tokens.filter(tok => {
        const stem = tok.replace(/(ies|s)$/i, m => m === 'ies' ? 'y' : '');
        return stem && !haystack.includes(stem);
      });
      if (tokens.length && missing.length === tokens.length) {
        issues.push({
          area: 'concepts',
          label: 'Key concepts not visible in the Central Idea or Lines',
          note: `The concepts you named (${tokens.join(', ')}) don't appear anywhere in the inquiry. They'll read as tags, not lenses.`,
          suggestion: 'Re-write the Central Idea or one Line of Inquiry so it actively engages the concept (e.g., name the question-stem for that concept).'
        });
      } else if (tokens.length) {
        wins.push({
          area: 'concepts',
          label: 'Key concepts surface in the inquiry',
          note: 'The named concepts appear in the Central Idea or one of the Lines — that\'s what makes them functional.'
        });
      }
    }

    // 4. Action framing
    if (action) {
      const v = evaluateAction(action);
      v.flags.filter(f => f.severity !== 'low').forEach(f => issues.push({
        area: 'action', label: f.label, note: f.note, suggestion: f.suggestion
      }));
      v.positives.forEach(p => wins.push({
        area: 'action', label: p.label, note: p.note
      }));
    }

    // 5. ATL/Action alignment
    if (atl && action) {
      const verbs = (KB.atlAlignment[atl] || []).map(v => v.toLowerCase());
      const txt = action.toLowerCase();
      const hit = verbs.some(v => txt.includes(v));
      if (verbs.length && !hit) {
        issues.push({
          area: 'atl-action',
          label: `Action verbs don't match the ${atl} ATL category`,
          note: `Your action seed doesn't use verbs typical of ${atl} (${verbs.slice(0, 4).join(', ')}…).`,
          suggestion: `Reword the action to include a verb like "${verbs[0]}" or "${verbs[1]}", or pick a different ATL focus.`
        });
      } else if (hit) {
        wins.push({
          area: 'atl-action',
          label: `Action verbs align with ${atl}`,
          note: 'The action seed naturally exercises the chosen ATL category.'
        });
      }
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
    evaluateCentralIdea,
    evaluateLinesOfInquiry,
    evaluateAction,
    evaluateAgency,
    evaluateUnitPlanner,
    suggestRewrites,
    KB
  };
})(window.PYPKB);
