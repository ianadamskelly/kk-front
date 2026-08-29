/* ============================================================
   Enhanced MYP Navigator — app.js
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
        ? `Approx. ${days.toLocaleString()} days until full launch`
        : 'The Enhanced MYP is live — happy planning!';
    };
    tick(); setInterval(tick, 3600000);
  }

  /* ---------- Tabs ---------- */
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

  /* ---------- Contextual lens example switcher ---------- */
  const lensExamples = {
    individual: { title: 'Individual lens', text: '"How do I evaluate whether a claim in my social media feed is statistically valid?" — students examine personal exposure to misleading data.' },
    local:      { title: 'Local lens',      text: '"Are exam results in our region distributed fairly across schools?" — students gather local data, interview a school-board member, and visualise the distribution.' },
    global:     { title: 'Global lens',     text: '"How can the same data set support two opposite political narratives?" — students compare reporting on the same statistic in three countries.' }
  };
  const lensCards = document.querySelectorAll('.lens-card');
  const lensExampleEl = document.querySelector('[data-lens-example]');
  lensCards.forEach(card => {
    card.addEventListener('click', () => {
      lensCards.forEach(c => c.setAttribute('aria-pressed', 'false'));
      card.setAttribute('aria-pressed', 'true');
      const data = lensExamples[card.dataset.lens];
      if (lensExampleEl && data) {
        lensExampleEl.innerHTML = `<h4>${data.title} — Statistics unit</h4><p>Global Context: <em>Fairness and Development</em>.</p><p>${data.text}</p>`;
      }
    });
  });

  /* ---------- Assessment criteria reveal ---------- */
  const assessButtons = document.querySelectorAll('[data-assess] .ab');
  const assessOut = document.querySelector('[data-assess-out]');
  assessButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      assessButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (assessOut) {
        const subject = btn.dataset.subject;
        const criteria = btn.dataset.criteria.split('·').map(s => `<span class="pill">${s.trim()}</span>`).join(' ');
        assessOut.innerHTML = `<strong>${subject}</strong> — three criteria:<br><br>${criteria}`;
      }
    });
  });

  /* ============================================================
     RICH FEEDBACK RENDERER
     Renders a verdict object from MYPEvaluator into HTML.
     ============================================================ */
  function renderVerdict(v, opts) {
    opts = opts || {};
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
            <div class="dim-row"><span>${d.label}</span><b>${d.score}</b></div>
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
        <h5>Compare with strong examples</h5>
        <ul>${v.matchingExamples.map(e => `<li><span class="tag">${esc(e.subject)}</span> <span class="tag tag-soft">${esc(e.concept)}</span><br>${esc(e.q)}<br><small class="muted">— ${esc(e.source)}</small></li>`).join('')}</ul>
      </div>` : '';

    const ref = (v.reframes && v.reframes.length) ? `
      <div class="verdict-list verdict-rewrites">
        <h5>Reframe</h5>
        <ul>${v.reframes.map(r => `<li><b>${esc(r.from)} → ${esc(r.to)}</b><br><span class="muted">${esc(r.line)}</span></li>`).join('')}</ul>
      </div>` : '';

    const forms = (v.forms && v.forms.length) ? `
      <p class="muted small">Five forms of engagement: ${v.forms.map(f=>`<span class="pill">${esc(f)}</span>`).join(' ')}</p>` : '';

    return head + dims + pos + flg + rwr + ref + ex + forms;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Bind rewrite buttons (delegated)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.rewrite-btn');
    if (!btn) return;
    const txt = btn.dataset.rewrite;
    // find nearest input/textarea above
    const card = btn.closest('.practice-card');
    if (!card) return;
    const inp = card.querySelector('input[data-iqcheck], textarea[data-soi], input[data-ce-input], textarea[data-ce-input]');
    if (inp) { inp.value = txt; inp.focus(); }
  });

  /* ============================================================
     INQUIRY QUESTION HEALTH CHECK (rich)
     ============================================================ */
  const iqInput = document.querySelector('[data-iqcheck]');
  const iqOut   = document.querySelector('[data-iqcheck-out]');
  const iqBtn   = document.querySelector('[data-iqcheck-go]');
  const iqSubj  = document.querySelector('[data-iqcheck-subject]');
  if (iqBtn) {
    iqBtn.addEventListener('click', () => {
      const text = (iqInput.value || '').trim();
      const subject = iqSubj ? iqSubj.value : undefined;
      const v = Eval.evaluateInquiryQuestion(text, { subject });
      iqOut.innerHTML = renderVerdict(v);
    });
    iqInput && iqInput.addEventListener('keydown', e => { if (e.key === 'Enter') iqBtn.click(); });
  }

  /* ============================================================
     SOI → IQ REWRITER (rich)
     ============================================================ */
  const soiInput = document.querySelector('[data-soi]');
  const soiOut   = document.querySelector('[data-soi-out]');
  const soiBtn   = document.querySelector('[data-soi-rewrite]');
  const soiSubj  = document.querySelector('[data-soi-subject]');
  if (soiBtn) {
    soiBtn.addEventListener('click', () => {
      const text = (soiInput.value || '').trim();
      if (!text) { soiOut.innerHTML = '<p class="muted">Type or paste a Statement of Inquiry above first.</p>'; return; }
      const rewrites = Eval.suggestRewrites(text);
      const subject  = soiSubj ? soiSubj.value : undefined;
      // also produce a quick verdict on what they typed
      const v = Eval.evaluateInquiryQuestion(text, { subject });

      let html = '';
      if (rewrites.length) {
        html += `<div class="verdict-list verdict-rewrites"><h5>Rewrite suggestions (click to use)</h5><ul>` +
          rewrites.map(r => `<li><button class="rewrite-btn" data-rewrite="${esc(r.text)}">${esc(r.text)}</button><span class="rewrite-label">${esc(r.label)}</span></li>`).join('') +
          `</ul></div>`;
      } else {
        html += `<p class="muted">No automatic rewrites matched — try the patterns below as a starting point:</p>
          <ul>
            <li>"Why does [topic] depend on…?"</li>
            <li>"When does [topic] stop working — and who pays the price?"</li>
            <li>"Two people study [topic] and reach opposite conclusions. How is that possible?"</li>
          </ul>`;
      }

      html += `<div class="verdict-list verdict-examples"><h5>Strong examples like yours</h5><ul>` +
        (v.matchingExamples || []).map(e => `<li><span class="tag">${esc(e.subject)}</span> <span class="tag tag-soft">${esc(e.concept)}</span><br>${esc(e.q)}</li>`).join('') +
        `</ul></div>`;

      // Pull a rewrite into the SOI textarea on click and let the user re-check
      soiOut.innerHTML = html;
    });
  }

  /* ============================================================
     QUIZ (unchanged behaviour, slightly expanded)
     ============================================================ */
  const quizQuestions = [
    { q: 'Which of these replaces the Statement of Inquiry in the Enhanced MYP?',
      options: ['A required Key + Related Concept sentence','An Inquiry Statement OR an Inquiry Question','A 3-paragraph rationale','A learning outcome from the IB list'],
      a: 1, why: 'Teachers may choose between a statement or a question. No required elements.' },
    { q: 'How many assessment criteria does each subject group have in the Enhanced MYP?',
      options: ['Two','Three','Four','Five'], a: 1,
      why: 'All subjects move from 4 to 3 criteria with fewer strands.' },
    { q: 'What are the three Contextual Lenses?',
      options: ['Individual, Local, Global','Local, National, International','Personal, Cultural, Economic','Past, Present, Future'],
      a: 0, why: 'Individual, Local, Global — paired with (or instead of) the six Global Contexts.' },
    { q: 'What replaces "Service as Action" in the Enhanced MYP?',
      options: ['Compulsory Volunteering','Service Learning Hours','Community Engagement','Action Research Only'],
      a: 2, why: 'Community Engagement — action WITH the community, not TO it.' },
    { q: 'Which is true about the 10 ATL skill clusters?',
      options: ['They are unchanged','They have been doubled','They have been removed; only the 5 categories remain','They are renamed but kept'],
      a: 2, why: 'The 5 categories remain (Thinking/Communication/Social/Self-management/Research); the 10 sub-clusters are retired.' },
    { q: 'In the Enhanced MYP, which is NOT a requirement of the inquiry framing?',
      options: ['Embedding a global context','Embedding a Specified Concept','Using a question mark','Naming an ATL skill in plain English'],
      a: 0, why: 'The global context is now optional in the inquiry framing — it can be paired with the new Contextual Lenses, but isn\'t required.' },
    { q: 'How often must planned + assessed interdisciplinary learning happen in the Enhanced MYP?',
      options: ['Twice per year','Once per year','Once per programme','Whenever the teacher chooses'],
      a: 1, why: 'At least one planned and assessed interdisciplinary experience per year — down from two.' }
  ];
  const quizEl = document.querySelector('[data-quiz]');
  let quizIdx = 0, quizScore = 0;
  function renderQuiz() {
    if (!quizEl) return;
    if (quizIdx >= quizQuestions.length) {
      const grade = quizScore === quizQuestions.length ? 'Outstanding.' : quizScore >= 5 ? 'Solid grasp.' : 'Worth another pass — start with the Overview.';
      quizEl.innerHTML = `<div class="q-final"><h4>You scored ${quizScore} / ${quizQuestions.length}</h4><p>${grade}</p></div>`;
      return;
    }
    const q = quizQuestions[quizIdx];
    quizEl.innerHTML = `
      <div class="q-progress">Question ${quizIdx + 1} of ${quizQuestions.length}</div>
      <div class="q-num">Quick check</div>
      <div class="q-stem">${q.q}</div>
      <div class="q-options">${q.options.map((opt,i)=>`<button class="q-opt" data-i="${i}">${opt}</button>`).join('')}</div>`;
    quizEl.querySelectorAll('.q-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        const correct = i === q.a;
        if (correct) { quizScore++; btn.classList.add('is-correct'); }
        else { btn.classList.add('is-wrong'); quizEl.querySelectorAll('.q-opt')[q.a].classList.add('is-correct'); }
        quizEl.querySelectorAll('.q-opt').forEach(b => b.disabled = true);
        const fb = document.createElement('div');
        fb.className = 'q-feedback';
        fb.innerHTML = `<strong>${correct ? '✓ Correct.' : '✗ Not quite.'}</strong> ${q.why}`;
        quizEl.appendChild(fb);
        const next = document.createElement('button');
        next.className = 'btn btn-primary'; next.textContent = quizIdx === quizQuestions.length - 1 ? 'See result' : 'Next question';
        next.style.marginTop = '8px';
        next.addEventListener('click', () => { quizIdx++; renderQuiz(); });
        quizEl.appendChild(next);
      });
    });
  }
  renderQuiz();
  document.querySelector('[data-quiz-reset]')?.addEventListener('click', () => { quizIdx = 0; quizScore = 0; renderQuiz(); });

  /* ============================================================
     FLASHCARDS
     ============================================================ */
  const flashcards = [
    ['Specified Concept', 'A big idea your subject keeps returning to. One curated list per subject group (~25+). Schools can adapt.'],
    ['Inquiry Question', 'A provocative, non-Googleable question that frames a unit. Replaces the old Statement of Inquiry formula.'],
    ['ATL — Approaches to Learning', 'The five transferable skill categories: Thinking, Communication, Social, Self-management, Research.'],
    ['Contextual Lens', 'Individual, Local, or Global — the specific angle a unit uses to examine its content.'],
    ['Community Engagement', 'The Enhanced MYP\'s renamed Service-as-Action. Four objectives, five forms — action WITH the community.'],
    ['Integrated Core', 'The four programme-wide elements: Interdisciplinary learning, ATL, Community Engagement, Self-Directed Projects.'],
    ['IB Exchange', 'The new interactive platform replacing static IB subject-guide PDFs from 2027.'],
    ['Subject-generic criteria', 'Shared rubric strands (Investigating, Applying, Evaluating) used in earlier MYP years before subject-specific.']
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
     COMMUNITY ENGAGEMENT CHECK  (new)
     ============================================================ */
  const ceInput = document.querySelector('[data-ce-input]');
  const ceOut   = document.querySelector('[data-ce-out]');
  const ceBtn   = document.querySelector('[data-ce-go]');
  if (ceBtn) {
    ceBtn.addEventListener('click', () => {
      const text = (ceInput.value || '').trim();
      if (!text) { ceOut.innerHTML = '<p class="muted">Describe your community engagement plan above.</p>'; return; }
      const v = Eval.evaluateCommunityEngagement(text);
      ceOut.innerHTML = renderVerdict(v);
    });
  }

  /* ============================================================
     CONCEPT USAGE CHECK  (new)
     ============================================================ */
  const cuConcept = document.querySelector('[data-cu-concept]');
  const cuSubject = document.querySelector('[data-cu-subject]');
  const cuTask    = document.querySelector('[data-cu-task]');
  const cuOut     = document.querySelector('[data-cu-out]');
  const cuBtn     = document.querySelector('[data-cu-go]');
  if (cuBtn) {
    cuBtn.addEventListener('click', () => {
      const concept = (cuConcept.value || '').trim();
      const subject = cuSubject.value;
      const task    = (cuTask.value || '').trim();
      if (!concept || !task) { cuOut.innerHTML = '<p class="muted">Enter both a concept and a task description.</p>'; return; }
      const v = Eval.evaluateConceptUsage(concept, task, subject);

      let extra = '';
      if (v.verbSwap && v.verbSwap.length) {
        extra += `<div class="verdict-list verdict-rewrites"><h5>Stronger task verbs to consider</h5>
          <ul>${v.verbSwap.map(v => `<li><span class="tag">${esc(v)}</span></li>`).join('')}</ul></div>`;
      }
      cuOut.innerHTML = renderVerdict(v) + extra;
    });
  }

  /* ============================================================
     UNIT PLANNER — generate outline + cross-field validation
     ============================================================ */
  const planner = document.querySelector('[data-planner]');
  const plannerOut = document.querySelector('[data-planner-out]');
  const plannerFeedback = document.querySelector('[data-planner-feedback]');
  if (planner && plannerOut) {
    planner.querySelector('[data-planner-generate]').addEventListener('click', () => {
      const f = new FormData(planner);
      const fields = {
        title:   (f.get('title')   || 'Untitled Unit').trim(),
        subject: f.get('subject'),
        concept: (f.get('concept') || '—').trim(),
        lens:    f.get('lens'),
        iq:      (f.get('iq')      || '—').trim(),
        atl:     f.get('atl'),
        ce:      (f.get('ce')      || '').trim()
      };

      const criteriaMap = {
        'Sciences': 'Knowing & Understanding · Investigating · Exploring beyond the classroom',
        'Mathematics': 'Knowing & Understanding · Investigating · Exploring beyond the classroom',
        'Arts': 'Investigating · Applying · Evaluating',
        'Language & Literature': 'Understanding · Applying · Communicating',
        'Language Acquisition': 'Knowing & Understanding · Using written form · Using spoken form',
        'Individuals & Societies': 'Planning & Evaluating · Analysing · Applying',
        'Physical & Health Ed': 'Investigating · Applying · Evaluating',
        'Design': 'Investigating · Applying · Evaluating'
      };

      const outline = `ENHANCED MYP — UNIT OUTLINE
============================
Title          : ${fields.title}
Subject        : ${fields.subject}
Specified      : ${fields.concept}
Contextual lens: ${fields.lens}
ATL in focus   : ${fields.atl}

INQUIRY QUESTION
----------------
${fields.iq}

ASSESSMENT
----------
Three criteria : ${criteriaMap[fields.subject] || '—'}
Suggested task : Design an authentic task that requires students to demonstrate ${fields.atl.toLowerCase()} skills while engaging with the concept of "${fields.concept}".

COMMUNITY ENGAGEMENT
--------------------
${fields.ce ? fields.ce : '(Optional) Add an angle where students engage WITH a community partner — dialogue, action research, advocacy, social entrepreneurship, participation, or community-building.'}

QUICK CHECKS
------------
[ ] Can a 12-year-old answer my inquiry question without genuine thinking? If yes — rewrite.
[ ] Is the Specified Concept rewarded by the summative task?
[ ] Have I chosen ONE specific Contextual Lens, not three?
[ ] Have I named the ATL skill in plain English (no formula)?
[ ] If there is a community angle, is it WITH the community, not just FOR it?`;
      plannerOut.textContent = outline;

      // Cross-field feedback
      if (plannerFeedback) {
        const v = Eval.evaluateUnitPlanner(fields);
        let html = '';
        if (v.wins.length) {
          html += `<div class="verdict-list verdict-good"><h5>What\'s working</h5><ul>${
            v.wins.map(w => `<li><b>✓ ${esc(w.label)}.</b> ${esc(w.note)}</li>`).join('')
          }</ul></div>`;
        }
        if (v.issues.length) {
          html += `<div class="verdict-list verdict-bad"><h5>To strengthen</h5><ul>${
            v.issues.map(i => `<li><b>⚠ ${esc(i.label)}.</b> ${esc(i.note)}${i.suggestion?`<div class="sug"><em>Try:</em> ${esc(i.suggestion)}</div>`:''}</li>`).join('')
          }</ul></div>`;
        }
        if (!v.wins.length && !v.issues.length) {
          html = '<p class="muted small">Cross-field validation will appear here once you fill in more fields.</p>';
        }
        plannerFeedback.innerHTML = html;
      }
    });

    planner.querySelector('[data-planner-copy]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(plannerOut.textContent); flash(planner.querySelector('[data-planner-copy]'), 'Copied!'); }
      catch { flash(planner.querySelector('[data-planner-copy]'), 'Press ⌘/Ctrl+C'); }
    });
    planner.querySelector('[data-planner-reset]').addEventListener('click', () => {
      planner.reset();
      plannerOut.textContent = 'Your outline will appear here.';
      if (plannerFeedback) plannerFeedback.innerHTML = '';
    });
  }
  function flash(btn, msg) { const o = btn.textContent; btn.textContent = msg; setTimeout(()=>{btn.textContent=o;},1400); }

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

})(window.MYPEvaluator);
