/* ============================================================
   Enhanced PYP Navigator — app.js
   Vanilla JS. Loads after kb.js + evaluator.js.
   ============================================================ */

(function (Eval) {
  'use strict';

  /* ---------- Year stamp ---------- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile nav toggle ---------- */
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      header.classList.toggle('is-open', !open);
    });
    primaryNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        header.classList.remove('is-open');
      });
    });
  }

  /* ---------- Countdown ---------- */
  const countdownEl = document.querySelector('.countdown');
  if (countdownEl) {
    const tick = () => {
      const target = new Date(countdownEl.dataset.target + 'T00:00:00Z');
      const now = new Date();
      const days = Math.max(0, Math.ceil((target - now) / 86400000));
      countdownEl.textContent = days > 0
        ? `Approx. ${days.toLocaleString()} days until the 2027 deadline`
        : 'The Sept 2027 deadline has arrived — let\'s see those Subject Continuums in action.';
    };
    tick(); setInterval(tick, 3600000);
  }

  /* ---------- Tabs (Three Pillars + 2025) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(root => {
    const tabs = root.querySelectorAll('[role="tab"]');
    const panels = root.querySelectorAll('[role="tabpanel"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', e => {
        const idx = Array.from(tabs).indexOf(tab);
        if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(tab); }
      });
    });
    function activate(tab) {
      tabs.forEach(t => { t.setAttribute('aria-selected', 'false'); t.classList.remove('is-active'); });
      panels.forEach(p => { p.hidden = true; p.classList.remove('is-active'); });
      tab.setAttribute('aria-selected', 'true');
      tab.classList.add('is-active');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) { panel.hidden = false; panel.classList.add('is-active'); }
    }
  });

  /* ============================================================
     RICH VERDICT RENDERER (shared across Central Idea, LOI,
     Action, Agency outputs).
     ============================================================ */
  function renderVerdict(v) {
    if (!v) return '<p>No verdict.</p>';
    const head = `
      <div class="verdict-head verdict-${v.band.id}">
        <div class="verdict-score" aria-label="Score">${v.score}<span>/100</span></div>
        <div class="verdict-band"><span class="verdict-emoji">${v.band.emoji}</span> ${v.band.label}</div>
      </div>`;

    const dims = (v.dimensions && v.dimensions.length) ? `
      <div class="dim-grid">
        ${v.dimensions.map(d => `
          <div class="dim">
            <div class="dim-row"><span>${esc(d.label)}</span><b>${d.score}</b></div>
            <div class="dim-bar"><span style="width:${d.score}%"></span></div>
          </div>
        `).join('')}
      </div>` : '';

    const pos = (v.positives && v.positives.length) ? `
      <div class="verdict-list verdict-good">
        <h5>What's working</h5>
        <ul>${v.positives.map(p => `<li><b>✓ ${esc(p.label)}.</b> ${esc(p.note || '')}</li>`).join('')}</ul>
      </div>` : '';

    const flg = (v.flags && v.flags.length) ? `
      <div class="verdict-list verdict-bad">
        <h5>Consider</h5>
        <ul>${v.flags.map(f => `
          <li>
            <b>⚠ ${esc(f.label)}.</b> ${esc(f.note || '')}
            ${f.suggestion ? `<div class="sug"><em>Try:</em> ${esc(f.suggestion)}</div>` : ''}
            ${f.example    ? `<div class="sug"><em>Example:</em> ${esc(f.example)}</div>` : ''}
          </li>`).join('')}</ul>
      </div>` : '';

    const rwr = (v.rewrites && v.rewrites.length) ? `
      <div class="verdict-list verdict-rewrites">
        <h5>Try one of these rewrites</h5>
        <ul>${v.rewrites.map(r => `<li><button class="rewrite-btn" data-rewrite="${esc(r.text)}">${esc(r.text)}</button><span class="rewrite-label">${esc(r.label)}</span></li>`).join('')}</ul>
      </div>` : '';

    const ex = (v.matchingExamples && v.matchingExamples.length) ? `
      <div class="verdict-list verdict-examples">
        <h5>Compare with strong examples (by theme)</h5>
        <ul>${v.matchingExamples.map(e => `
          <li>
            <span class="tag">${esc(e.theme)}</span>
            <span class="tag tag-soft">${esc(e.phase)}</span>
            <span class="tag tag-soft">${(e.concepts || []).map(esc).join(' · ')}</span>
            <br><strong>${esc(e.centralIdea)}</strong>
            ${e.lines && e.lines.length ? `<ul style="margin:6px 0 0;padding-left:1.2em;color:var(--muted);font-size:.9rem">${e.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
            <br><small class="muted">— ${esc(e.source)}</small>
          </li>`).join('')}</ul>
      </div>` : '';

    const ref = (v.reframes && v.reframes.length) ? `
      <div class="verdict-list verdict-rewrites">
        <h5>Reframe</h5>
        <ul>${v.reframes.map(r => `<li><b>${esc(r.from)} → ${esc(r.to)}</b><br><span class="muted">${esc(r.line)}</span></li>`).join('')}</ul>
      </div>` : '';

    const forms = (v.forms && v.forms.length) ? `
      <p class="muted small">Five forms of action: ${v.forms.map(f => `<span class="pill">${esc(f)}</span>`).join(' ')}</p>` : '';

    const surfaces = v.surfaces ? `
      <div class="agency-row" style="margin-top:8px">
        <article class="agency-card" style="${v.surfaces.voice     ? 'border-color:var(--good)' : 'opacity:.55'}"><span class="agency-emoji">🎙️</span><b>Voice</b><span>${v.surfaces.voice     ? 'detected' : 'not detected'}</span></article>
        <article class="agency-card" style="${v.surfaces.choice    ? 'border-color:var(--good)' : 'opacity:.55'}"><span class="agency-emoji">🤲</span><b>Choice</b><span>${v.surfaces.choice    ? 'detected' : 'not detected'}</span></article>
        <article class="agency-card" style="${v.surfaces.ownership ? 'border-color:var(--good)' : 'opacity:.55'}"><span class="agency-emoji">📔</span><b>Ownership</b><span>${v.surfaces.ownership ? 'detected' : 'not detected'}</span></article>
      </div>` : '';

    const lines = (v.lines && v.lines.length) ? `
      <div class="verdict-list verdict-examples">
        <h5>Detected ${v.lines.length} Line${v.lines.length === 1 ? '' : 's'} of Inquiry</h5>
        <ol style="margin:0;padding-left:1.4em">${v.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ol>
      </div>` : '';

    return head + dims + pos + flg + surfaces + lines + rwr + ref + ex + forms;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Delegated: click a rewrite to push it into the nearest input/textarea
  document.addEventListener('click', e => {
    const btn = e.target.closest('.rewrite-btn');
    if (!btn) return;
    const txt = btn.dataset.rewrite;
    const card = btn.closest('.practice-card');
    if (!card) return;
    const inp = card.querySelector('input[data-ci-input], textarea[data-loi-input], textarea[data-action-input], textarea[data-agency-input]');
    if (inp) { inp.value = txt; inp.focus(); }
  });

  /* ============================================================
     CENTRAL IDEA HEALTH CHECK
     ============================================================ */
  const ciInput = document.querySelector('[data-ci-input]');
  const ciOut   = document.querySelector('[data-ci-out]');
  const ciBtn   = document.querySelector('[data-ci-go]');
  const ciTheme = document.querySelector('[data-ci-theme]');
  if (ciBtn) {
    ciBtn.addEventListener('click', () => {
      const text = (ciInput.value || '').trim();
      const theme = ciTheme ? ciTheme.value : undefined;
      const v = Eval.evaluateCentralIdea(text, { theme });
      ciOut.innerHTML = renderVerdict(v);
    });
    ciInput && ciInput.addEventListener('keydown', e => { if (e.key === 'Enter') ciBtn.click(); });
  }

  /* ============================================================
     LINES OF INQUIRY COVERAGE CHECK
     ============================================================ */
  const loiInput = document.querySelector('[data-loi-input]');
  const loiOut   = document.querySelector('[data-loi-out]');
  const loiBtn   = document.querySelector('[data-loi-go]');
  if (loiBtn) {
    loiBtn.addEventListener('click', () => {
      const text = (loiInput.value || '').trim();
      if (!text) { loiOut.innerHTML = '<p class="muted">Paste your Lines of Inquiry above — one per line.</p>'; return; }
      const v = Eval.evaluateLinesOfInquiry(text);
      loiOut.innerHTML = renderVerdict(v);
    });
  }

  /* ============================================================
     ACTION FRAMING CHECK
     ============================================================ */
  const actInput = document.querySelector('[data-action-input]');
  const actOut   = document.querySelector('[data-action-out]');
  const actBtn   = document.querySelector('[data-action-go]');
  if (actBtn) {
    actBtn.addEventListener('click', () => {
      const text = (actInput.value || '').trim();
      if (!text) { actOut.innerHTML = '<p class="muted">Describe your planned action above.</p>'; return; }
      const v = Eval.evaluateAction(text);
      actOut.innerHTML = renderVerdict(v);
    });
  }

  /* ============================================================
     AGENCY CHECK
     ============================================================ */
  const agInput = document.querySelector('[data-agency-input]');
  const agOut   = document.querySelector('[data-agency-out]');
  const agBtn   = document.querySelector('[data-agency-go]');
  if (agBtn) {
    agBtn.addEventListener('click', () => {
      const text = (agInput.value || '').trim();
      if (!text) { agOut.innerHTML = '<p class="muted">Describe one part of your unit above — what students do, choose, or own.</p>'; return; }
      const v = Eval.evaluateAgency(text);
      agOut.innerHTML = renderVerdict(v);
    });
  }

  /* ============================================================
     QUIZ — PYP-specific quick check
     ============================================================ */
  const quizQuestions = [
    { q: 'How many Key Concepts does the Enhanced PYP have?',
      options: ['Six','Seven','Eight','Ten'],
      a: 1, why: 'Seven — the 2018 enhancement removed Reflection (it became a programme-wide practice).' },
    { q: 'What replaced "Service Learning" in the 2018 framework?',
      options: ['Community Service Hours','The Action Cycle (Choose → Act → Reflect)','Volunteering Outcomes','Service Action Logs'],
      a: 1, why: 'The Action Cycle, with five forms — community service is just one of them.' },
    { q: 'A Central Idea is best described as…',
      options: ['A provocative question','A topic word','A single concept-rich statement','A list of learning outcomes'],
      a: 2, why: 'A Central Idea is a single statement of the enduring understanding the unit is built around.' },
    { q: 'What did the 2018 enhancement do with the 12 "PYP Attitudes"?',
      options: ['Removed them entirely','Made them mandatory in every unit','Folded them into the 10 Learner Profile attributes','Renamed them as ATL skills'],
      a: 2, why: 'They were folded into the Learner Profile descriptors. Schools still teaching the separate 12-attitude list are running on the pre-2018 framework.' },
    { q: 'By when must schools implement the 2025 Subject Continuums?',
      options: ['September 2026','September 2027','September 2028','It is voluntary'],
      a: 1, why: 'September 2027 — deliberately aligned with the Enhanced MYP full launch.' },
    { q: 'The 2025 evolution organises learning progression by…',
      options: ['Fixed grade-level standards','Four developmental phases','Eight subject strands','A single PYP scope and sequence'],
      a: 1, why: 'Four developmental phases (3–5, 5–7, 7–9, 9–12), respecting the wide developmental range in any primary classroom.' },
    { q: 'The PYP Exhibition (PYPX) is…',
      options: ['An external examination','A capstone collaborative inquiry in the final PYP year','A teacher\'s portfolio of evidence','An IB-wide art show'],
      a: 1, why: '6–8 weeks of student-led, collaborative, transdisciplinary inquiry with real-world action, in the final PYP year.' }
  ];
  const quizEl = document.querySelector('[data-quiz]');
  let quizIdx = 0, quizScore = 0;
  function renderQuiz() {
    if (!quizEl) return;
    if (quizIdx >= quizQuestions.length) {
      const grade = quizScore === quizQuestions.length ? 'Outstanding.' :
                   quizScore >= 5                       ? 'Solid grasp.' :
                                                          'Worth another pass — start with the Overview.';
      quizEl.innerHTML = `<div class="q-final"><h4>You scored ${quizScore} / ${quizQuestions.length}</h4><p>${grade}</p></div>`;
      return;
    }
    const q = quizQuestions[quizIdx];
    quizEl.innerHTML = `
      <div class="q-progress">Question ${quizIdx + 1} of ${quizQuestions.length}</div>
      <div class="q-num">Quick check</div>
      <div class="q-stem">${esc(q.q)}</div>
      <div class="q-options">${q.options.map((opt, i) => `<button class="q-opt" data-i="${i}">${esc(opt)}</button>`).join('')}</div>`;
    quizEl.querySelectorAll('.q-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        const correct = i === q.a;
        if (correct) { quizScore++; btn.classList.add('is-correct'); }
        else { btn.classList.add('is-wrong'); quizEl.querySelectorAll('.q-opt')[q.a].classList.add('is-correct'); }
        quizEl.querySelectorAll('.q-opt').forEach(b => b.disabled = true);
        const fb = document.createElement('div');
        fb.className = 'q-feedback';
        fb.innerHTML = `<strong>${correct ? '✓ Correct.' : '✗ Not quite.'}</strong> ${esc(q.why)}`;
        quizEl.appendChild(fb);
        const next = document.createElement('button');
        next.className = 'btn btn-primary';
        next.textContent = quizIdx === quizQuestions.length - 1 ? 'See result' : 'Next question';
        next.style.marginTop = '8px';
        next.addEventListener('click', () => { quizIdx++; renderQuiz(); });
        quizEl.appendChild(next);
      });
    });
  }
  renderQuiz();
  document.querySelector('[data-quiz-reset]')?.addEventListener('click', () => { quizIdx = 0; quizScore = 0; renderQuiz(); });

  /* ============================================================
     FLASHCARDS — PYP terms
     ============================================================ */
  const flashcards = [
    ['Central Idea', 'A single concept-rich statement of the enduring understanding a Unit of Inquiry is built around. Not a topic, not a question, not an opinion.'],
    ['Line of Inquiry', 'A focused conceptual angle on the Central Idea — usually a noun phrase, 5–12 words. Each UOI typically has 3–4.'],
    ['The 7 Key Concepts', 'Form, function, causation, change, connection, perspective, responsibility. Reflection was removed in 2018.'],
    ['Action Cycle', 'Choose → Act → Reflect. Five forms — participation, advocacy, social entrepreneurship, social justice, lifestyle choices.'],
    ['Student Agency', 'Voice (the learner is heard), choice (the learner decides), ownership (the learner takes responsibility). The 2018 framework\'s organising principle.'],
    ['Learner Profile', 'The 10 IB attributes — shared across PYP, MYP and DP. In 2018 they absorbed the old "12 attitudes" list.'],
    ['PYP Exhibition (PYPX)', 'Capstone in the final PYP year. 6–8 weeks, student-led, collaborative, transdisciplinary inquiry with a real-world action and public sharing.'],
    ['Subject Continuum', 'The 2025 replacement for the legacy Scope & Sequence. Six continuums, unified structure, phase-based progression.'],
    ['Developmental Phases', 'The four 2025 progression bands — Phase 1 (3–5), Phase 2 (5–7), Phase 3 (7–9), Phase 4 (9–12).'],
    ['Inquiry Learning Progressions', 'The 2025 document describing how inquiry skills mature across ages 5–16 — spanning PYP into MYP Years 1–2.'],
    ['Three Pillars', 'The 2018 framework: the Learner; Learning and Teaching; the Learning Community. The child is named first.'],
    ['Transdisciplinary (vs cross-curricular)', 'Subjects disappear into the inquiry. Cross-curricular = subjects clustered around a topic.']
  ];
  const flashEl = document.querySelector('[data-flash]');
  const flashCount = document.querySelector('[data-flash-count]');
  let flashIdx = 0;
  function renderFlash() {
    if (!flashEl) return;
    flashEl.classList.remove('is-flipped');
    const [term, def] = flashcards[flashIdx];
    flashEl.querySelector('.flash-term').textContent = term;
    flashEl.querySelector('.flash-def').textContent = def;
    if (flashCount) flashCount.textContent = `${flashIdx + 1} / ${flashcards.length}`;
  }
  if (flashEl) {
    flashEl.addEventListener('click', () => flashEl.classList.toggle('is-flipped'));
    flashEl.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flashEl.classList.toggle('is-flipped'); }
      if (e.key === 'ArrowRight') { flashIdx = (flashIdx + 1) % flashcards.length; renderFlash(); }
      if (e.key === 'ArrowLeft')  { flashIdx = (flashIdx - 1 + flashcards.length) % flashcards.length; renderFlash(); }
    });
    document.querySelector('[data-flash-prev]')?.addEventListener('click', () => { flashIdx = (flashIdx - 1 + flashcards.length) % flashcards.length; renderFlash(); });
    document.querySelector('[data-flash-next]')?.addEventListener('click', () => { flashIdx = (flashIdx + 1) % flashcards.length; renderFlash(); });
    renderFlash();
  }

  /* ============================================================
     UNIT OF INQUIRY PLANNER — outline + cross-field validation
     ============================================================ */
  const planner = document.querySelector('[data-planner]');
  const plannerOut = document.querySelector('[data-planner-out]');
  const plannerFeedback = document.querySelector('[data-planner-feedback]');
  if (planner && plannerOut) {
    planner.querySelector('[data-planner-generate]').addEventListener('click', () => {
      const f = new FormData(planner);
      const fields = {
        title:    (f.get('title')    || 'Untitled Unit of Inquiry').trim(),
        theme:    f.get('theme'),
        phase:    f.get('phase'),
        concepts: (f.get('concepts') || '—').trim(),
        ci:       (f.get('ci')       || '—').trim(),
        loi:      (f.get('loi')      || '').trim(),
        atl:      f.get('atl'),
        action:   (f.get('action')   || '').trim()
      };

      const linesFormatted = fields.loi
        ? fields.loi.split(/\r?\n/).map((l, i) => l.trim()).filter(Boolean).map((l, i) => `${i + 1}. ${l}`).join('\n')
        : '(add 3–4 Lines of Inquiry)';

      const outline = `ENHANCED PYP — UNIT OF INQUIRY OUTLINE
======================================
Title              : ${fields.title}
Transdisciplinary  : ${fields.theme}
Developmental phase: ${fields.phase}
Key concepts       : ${fields.concepts}
ATL in focus       : ${fields.atl}

CENTRAL IDEA
------------
${fields.ci}

LINES OF INQUIRY
----------------
${linesFormatted}

ACTION SEED
-----------
${fields.action ? fields.action : '(Optional) Plan an action — choose one of five forms: participation, advocacy, social entrepreneurship, social justice, lifestyle choices. Make it Choose → Act → Reflect.'}

QUICK CHECKS
------------
[ ] Can a Phase ${(fields.phase || '').match(/\d/) || '?'} child repeat the Central Idea from memory by the end of the unit?
[ ] Strip the proper nouns and dates — does the Central Idea still hold?
[ ] Do the Lines of Inquiry use at least two different Key Concepts?
[ ] Where does student VOICE appear? CHOICE? OWNERSHIP?
[ ] If there is action, is it WITH the community (not just FOR it)?
[ ] Does the ATL focus show up in something the children actually do?`;
      plannerOut.textContent = outline;

      // Cross-field feedback
      if (plannerFeedback) {
        const v = Eval.evaluateUnitPlanner(fields);
        let html = '';
        if (v.wins.length) {
          html += `<div class="verdict-list verdict-good"><h5>What's working</h5><ul>${
            v.wins.map(w => `<li><b>✓ ${esc(w.label)}.</b> ${esc(w.note)}</li>`).join('')
          }</ul></div>`;
        }
        if (v.issues.length) {
          html += `<div class="verdict-list verdict-bad"><h5>To strengthen</h5><ul>${
            v.issues.map(i => `<li><b>⚠ ${esc(i.label)}.</b> ${esc(i.note)}${i.suggestion ? `<div class="sug"><em>Try:</em> ${esc(i.suggestion)}</div>` : ''}</li>`).join('')
          }</ul></div>`;
        }
        if (!v.wins.length && !v.issues.length) {
          html = '<p class="muted small">Cross-field validation will appear here once you fill in the Central Idea and Lines of Inquiry.</p>';
        }
        plannerFeedback.innerHTML = html;
      }
    });

    planner.querySelector('[data-planner-copy]').addEventListener('click', async () => {
      const btn = planner.querySelector('[data-planner-copy]');
      try { await navigator.clipboard.writeText(plannerOut.textContent); flash(btn, 'Copied!'); }
      catch { flash(btn, 'Press ⌘/Ctrl+C'); }
    });
    planner.querySelector('[data-planner-reset]').addEventListener('click', () => {
      planner.reset();
      plannerOut.textContent = 'Your UOI outline will appear here.';
      if (plannerFeedback) plannerFeedback.innerHTML = '';
    });
  }
  function flash(btn, msg) { const o = btn.textContent; btn.textContent = msg; setTimeout(() => { btn.textContent = o; }, 1400); }

  /* ============================================================
     GLOSSARY filter
     ============================================================ */
  const glossSearch = document.querySelector('[data-gloss-search]');
  const glossEntries = document.querySelectorAll('[data-glossary] > div');
  if (glossSearch) {
    glossSearch.addEventListener('input', () => {
      const q = glossSearch.value.toLowerCase().trim();
      glossEntries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        entry.classList.toggle('hidden', q.length > 0 && !text.includes(q));
      });
    });
  }

  /* ============================================================
     Highlight nav link on scroll
     ============================================================ */
  const navLinks = document.querySelectorAll('.primary-nav a');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.removeAttribute('aria-current'));
          const link = document.querySelector(`.primary-nav a[href="#${entry.target.id}"]`);
          if (link) link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

})(window.PYPEvaluator);
