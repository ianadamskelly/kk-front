/* ============================================================
   Enhanced PYP Navigator — Knowledge Base
   ------------------------------------------------------------
   A curated, transparent knowledge base used by evaluator.js.
   Every claim here is reviewable — no AI, no opaque scoring.

   The PYP's signature artefact is the Central Idea + Lines of
   Inquiry (the PYP's analogue to MYP's Statement of Inquiry /
   Inquiry Question), so most evaluator rules target those.

   Sections:
     1. rules               — pattern detectors with severity + advice
     2. examples            — 36+ strong Central Ideas across the 6 themes
     3. transformers        — rewrite a weak Central Idea into a stronger one
     4. keyConcepts         — the 7 PYP key concepts + driving questions
     5. themes              — the 6 transdisciplinary themes (with 2025 descriptors)
     6. learnerProfile      — the 10 attributes
     7. subjectContinuums   — the 6 subjects + sample related concepts (2025)
     8. developmentalPhases — the 4 phases introduced in the 2025 refresh
     9. terminology         — outdated → current PYP term mapping
    10. agencyFraming       — voice / choice / ownership verbs vs teacher-directed
    11. actionForms         — the 5 forms of action + verb hints
    12. atlAlignment        — verb hints per ATL category (shared with MYP/DP)
    13. dimensions          — how rules roll up into a score
   ============================================================ */

window.PYPKB = (function () {
  'use strict';

  /* ---------- helpers used by rule detectors ---------- */
  const containsAny = (text, words) => {
    const t = ' ' + text.toLowerCase() + ' ';
    return words.some(w => t.includes(' ' + w + ' ') || t.includes(' ' + w + ',') || t.includes(' ' + w + '.') || t.includes(' ' + w + '?'));
  };
  const startsWithAny = (text, starters) => {
    const t = text.trim().toLowerCase();
    return starters.some(s => t.startsWith(s + ' ') || t === s);
  };
  const wordCount = (t) => (t.trim().match(/\b[\w'-]+\b/g) || []).length;
  const splitLines = (t) => (t || '').split(/\r?\n|;|·|•|•/).map(s => s.trim()).filter(Boolean);

  /* ============================================================
     1. RULES — ~30 rules covering Central Idea, Lines of Inquiry,
        terminology, agency framing, and action framing.
        Each rule:
          id, area, dimension, severity (low|med|high),
          kind (flag|positive), detect(text, ctx),
          label, note, suggestion, example
     ============================================================ */
  const rules = [

    /* ---------- CENTRAL IDEA — structure & form ---------- */
    {
      id: 'CI-EMPTY',
      area: 'centralIdea',
      dimension: 'structure',
      severity: 'high',
      kind: 'flag',
      detect: (t) => t.trim().length === 0,
      label: 'No Central Idea typed',
      note: 'Type your Central Idea above — a single, concept-rich statement (not a question, not a topic).',
      suggestion: 'Start from the topic and the worked example: "Freshwater is a finite resource that sustains all life and depends on the choices people make."'
    },
    {
      id: 'CI-IS-QUESTION',
      area: 'centralIdea',
      dimension: 'structure',
      severity: 'high',
      kind: 'flag',
      detect: (t) => t.trim().endsWith('?'),
      label: 'Central Idea is written as a question',
      note: 'In the PYP, the Central Idea is a *statement* — a single sentence stating the enduring understanding. Questions go into the Lines of Inquiry.',
      suggestion: 'Rewrite as a declarative sentence: drop the question mark and start with a noun. ("Why does water matter?" → "Water sustains all life…")'
    },
    {
      id: 'CI-TOPIC-ONLY',
      area: 'centralIdea',
      dimension: 'conceptDepth',
      severity: 'high',
      kind: 'flag',
      detect: (t) => {
        const w = wordCount(t);
        return w > 0 && w < 5;
      },
      label: 'Looks like a topic, not a Central Idea',
      note: 'A Central Idea is a *concept-rich statement*, not a topic word. "Water" is a topic. "Freshwater sustains all life and depends on human choices" is a Central Idea.',
      suggestion: 'Build a sentence around the topic that names a concept (form, function, causation, change, connection, perspective, responsibility).'
    },
    {
      id: 'CI-LENGTH-SHORT',
      area: 'centralIdea',
      dimension: 'specificity',
      severity: 'low',
      kind: 'flag',
      detect: (t) => {
        const len = t.trim().length;
        return len > 0 && len < 30;
      },
      label: 'Very short',
      note: 'Strong Central Ideas usually need a subject, a concept verb, and an implication — that rarely fits in fewer than 30 characters.',
      suggestion: 'Add the relationship: depends on, shapes, sustains, influences, reflects.'
    },
    {
      id: 'CI-LENGTH-LONG',
      area: 'centralIdea',
      dimension: 'specificity',
      severity: 'low',
      kind: 'flag',
      detect: (t) => t.trim().length > 220,
      label: 'Very long',
      note: 'Long Central Ideas often hide more than one idea. Children should be able to repeat the Central Idea from memory by the end of the unit.',
      suggestion: 'Keep one idea per sentence; spin off the rest as Lines of Inquiry.'
    },
    {
      id: 'CI-PROPER-NOUN',
      area: 'centralIdea',
      dimension: 'transferability',
      severity: 'med',
      kind: 'flag',
      detect: (t) => {
        const tail = t.replace(/^\s*([A-Z])/, ''); // drop sentence-leading capital
        return /\b[A-Z][a-z]{2,}\b/.test(tail) && !/^[^A-Z]*$/.test(tail);
      },
      label: 'Contains a proper noun',
      note: 'Proper nouns (Nairobi, the Amazon, Mandela, World War II) bind the Central Idea to a single instance. A transferable Central Idea should hold even when the example changes.',
      suggestion: 'Generalise: "Rivers shape the communities that live along them" works in Nairobi *and* the Amazon. The specific cases belong in the Lines of Inquiry.'
    },
    {
      id: 'CI-DATE-OR-NUMBER',
      area: 'centralIdea',
      dimension: 'transferability',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(in 1\d{3}|in 20\d{2}|\d{1,3}%|\$\d|\d{3,})\b/i.test(t),
      label: 'Contains a date or hard number',
      note: 'Specific dates and percentages turn the Central Idea into a fact, not an understanding. Facts go in the body of the unit; the Central Idea names the *transferable* relationship.',
      suggestion: 'Replace "In 1492 Columbus…" with "Exploration changes both the place arrived at and the place left behind."'
    },
    {
      id: 'CI-OPINION-FRAMING',
      area: 'centralIdea',
      dimension: 'structure',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(i think|we believe|it is important to|we should|we must|i feel|i believe)\b/i.test(t),
      label: 'Opinion / exhortation, not an understanding',
      note: 'A Central Idea is a *claim about the world*, not a recommendation or feeling. "We should protect the rainforest" is advocacy; "Human choices shape the future of rainforests" is an understanding.',
      suggestion: 'Strip the modal ("should", "must") and the speaker ("I", "we") — leave a third-person claim about how the world works.'
    },
    {
      id: 'CI-VAGUE-NOUNS',
      area: 'centralIdea',
      dimension: 'specificity',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(things|stuff|something|somehow|various|aspects|factors|interesting|important)\b/i.test(t),
      label: 'Contains vague placeholder nouns',
      note: '"Things", "stuff", "aspects", "factors" — placeholder words that hide what the unit is actually about.',
      suggestion: 'Name the specific phenomenon: not "things that affect families" but "the choices, traditions, and environments that shape family life".'
    },
    {
      id: 'CI-LIST-OF-TOPICS',
      area: 'centralIdea',
      dimension: 'conceptDepth',
      severity: 'med',
      kind: 'flag',
      detect: (t) => {
        const ands = (t.match(/\band\b/gi) || []).length;
        const commas = (t.match(/,/g) || []).length;
        return ands >= 2 && commas >= 1;
      },
      label: 'Reads as a list of topics joined by "and"',
      note: 'Multiple "and"s usually mean the Central Idea is doing the work of several units. A Central Idea anchors a single understanding.',
      suggestion: 'Pick the one underlying idea; move the rest into Lines of Inquiry.'
    },

    /* ---------- CENTRAL IDEA — conceptual quality (positives) ---------- */
    {
      id: 'CI-CAUSAL-LANGUAGE',
      area: 'centralIdea',
      dimension: 'conceptDepth',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(depends on|shapes?|influences?|affects?|reflects?|connects?|sustains?|relies on|determines?|drives?|causes?|enables?)\b/i.test(t),
      label: 'Uses relational / causal language',
      note: 'Verbs like "depends on", "shapes", "sustains", "influences" name the *relationship* — which is what makes a Central Idea transferable.'
    },
    {
      id: 'CI-KEY-CONCEPT-WORD',
      area: 'centralIdea',
      dimension: 'conceptDepth',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(form|function|cause|causation|change|changing|connection|connected|perspective|perspectives|responsibility|responsibilities|system|systems|pattern|patterns|identity|community|environment|culture|relationship|relationships|balance)\b/i.test(t),
      label: 'Touches a recognisable PYP key concept',
      note: 'Naming or evoking a PYP key concept (form, function, causation, change, connection, perspective, responsibility) signals conceptual depth.'
    },
    {
      id: 'CI-TRANSFERABLE-PHRASE',
      area: 'centralIdea',
      dimension: 'transferability',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(all|every|any|across|throughout|over time|in many|whenever|wherever|people|communities|societies|humans|living things|cultures)\b/i.test(t),
      label: 'Uses transferable scope language',
      note: 'Words like "all", "every", "across", "people", "communities" lift the Central Idea from a single case to a generalisable claim.'
    },
    {
      id: 'CI-TENSION-WORDS',
      area: 'centralIdea',
      dimension: 'provocation',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(but|yet|however|despite|tension|balance|both|either|trade-off|tradeoff|while|although)\b/i.test(t),
      label: 'Names a tension or trade-off',
      note: 'Central Ideas that surface a tension (rights *and* responsibilities, change *yet* continuity) tend to drive deeper inquiry.'
    },

    /* ---------- LINES OF INQUIRY ---------- */
    {
      id: 'LOI-EMPTY',
      area: 'linesOfInquiry',
      dimension: 'structure',
      severity: 'high',
      kind: 'flag',
      detect: (t) => splitLines(t).length === 0,
      label: 'No Lines of Inquiry typed',
      note: 'Add 3–4 Lines of Inquiry, one per line. Each line is a focused conceptual angle on the Central Idea.',
      suggestion: 'Use the key-concept stems: form ("what it is like"), causation ("why it is like it is"), responsibility ("our obligation"), change ("how it transforms").'
    },
    {
      id: 'LOI-COUNT-FEW',
      area: 'linesOfInquiry',
      dimension: 'structure',
      severity: 'med',
      kind: 'flag',
      detect: (t) => {
        const n = splitLines(t).length;
        return n > 0 && n < 3;
      },
      label: 'Fewer than 3 Lines of Inquiry',
      note: 'PYP units typically use 3–4 Lines of Inquiry — enough to triangulate the Central Idea but not so many that depth is lost.',
      suggestion: 'Add another conceptual angle. If the Central Idea covers form, add causation or responsibility.'
    },
    {
      id: 'LOI-COUNT-MANY',
      area: 'linesOfInquiry',
      dimension: 'structure',
      severity: 'low',
      kind: 'flag',
      detect: (t) => splitLines(t).length > 4,
      label: 'More than 4 Lines of Inquiry',
      note: 'More than 4 lines usually means the unit is trying to do too much. Combine or remove until the strongest 3–4 remain.',
      suggestion: 'For each line, ask: does this give the Central Idea *new* conceptual traction, or just more examples?'
    },
    {
      id: 'LOI-COUNT-OK',
      area: 'linesOfInquiry',
      dimension: 'structure',
      severity: 'low',
      kind: 'positive',
      detect: (t) => {
        const n = splitLines(t).length;
        return n >= 3 && n <= 4;
      },
      label: 'Lines of Inquiry count is in the 3–4 sweet spot',
      note: '3–4 Lines is the standard PYP range — enough conceptual coverage without diluting depth.'
    },
    {
      id: 'LOI-IS-QUESTION',
      area: 'linesOfInquiry',
      dimension: 'structure',
      severity: 'med',
      kind: 'flag',
      detect: (t) => splitLines(t).some(l => l.endsWith('?')),
      label: 'A Line of Inquiry is written as a question',
      note: 'In PYP planning, Lines of Inquiry are usually *noun phrases* (e.g., "The responsibilities of individuals towards shared water"), not questions. Questions live in the teacher\'s guiding-question bank.',
      suggestion: 'Rewrite as a noun phrase: "How do we share water?" → "How communities share water" or "The shared responsibilities of water users".'
    },
    {
      id: 'LOI-CONCEPT-COVERAGE',
      area: 'linesOfInquiry',
      dimension: 'conceptDepth',
      severity: 'low',
      kind: 'positive',
      detect: (t) => {
        const lines = splitLines(t).join(' ');
        const hits = ['form', 'function', 'cause', 'change', 'connect', 'perspective', 'responsib']
          .filter(c => new RegExp('\\b' + c, 'i').test(lines));
        return hits.length >= 2;
      },
      label: 'Lines of Inquiry span at least two key concepts',
      note: 'Strong sets of Lines deliberately rotate through different key concepts (form / causation / connection / responsibility / change…) so the unit gets conceptual breadth.'
    },
    {
      id: 'LOI-LINE-TOO-LONG',
      area: 'linesOfInquiry',
      dimension: 'specificity',
      severity: 'low',
      kind: 'flag',
      detect: (t) => splitLines(t).some(l => wordCount(l) > 18),
      label: 'A Line of Inquiry is over 18 words',
      note: 'Lines of Inquiry work best as concise noun phrases (≈ 5–12 words). Long lines often hide nested sub-inquiries.',
      suggestion: 'Trim each line so a Year-3 child could repeat it back from memory.'
    },

    /* ---------- TERMINOLOGY — outdated PYP language ---------- */
    {
      id: 'TERM-ATTITUDES',
      area: 'terminology',
      dimension: 'pypAlignment',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(pyp attitudes|the 12 attitudes|attitude of commitment|attitudes list)\b/i.test(t),
      label: 'Outdated element: "PYP Attitudes"',
      note: 'The 2018 enhancement folded the 12 Attitudes into the **Learner Profile** descriptors. Schools still teaching the 12-item attitudes list are running on the pre-2018 framework.',
      suggestion: 'Reference the 10 Learner Profile attributes instead — they now carry the dispositional content that "attitudes" used to.'
    },
    {
      id: 'TERM-REFLECTION-CONCEPT',
      area: 'terminology',
      dimension: 'pypAlignment',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(8\s*key\s*concepts|eight\s*key\s*concepts|reflection\s+(is\s+a\s+|as\s+a\s+)?key\s*concept)\b/i.test(t),
      label: 'Treats Reflection as a key concept',
      note: 'Reflection was *removed* as a key concept in 2018 — there are now **seven**, not eight. Reflection is treated as a *practice* that runs through the whole programme.',
      suggestion: 'Use the seven current key concepts: form, function, causation, change, connection, perspective, responsibility.'
    },
    {
      id: 'TERM-SCOPE-SEQUENCE',
      area: 'terminology',
      dimension: 'pypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\b(scope and sequence|scope-and-sequence|scope & sequence)\b/i.test(t),
      label: 'Outdated term: "Scope and Sequence"',
      note: 'Replaced in **April 2025** by six new **Subject Continuums** with a unified structure (Overall Expectations → Conceptual Understandings → Learning Outcomes). Full transition required by September 2027.',
      suggestion: 'Reference the relevant Subject Continuum instead.'
    },
    {
      id: 'TERM-SERVICE-LEARNING',
      area: 'terminology',
      dimension: 'pypAlignment',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(service learning|service-learning|service learning hours)\b/i.test(t),
      label: 'Outdated term: "Service Learning"',
      note: 'The 2018 framework replaced "Service Learning" with a continuous **Action Cycle** (Choose → Act → Reflect). Action has five forms; community service is one of them.',
      suggestion: 'Re-frame as Action; specify a form (participation, advocacy, social entrepreneurship, social justice, lifestyle choices).'
    },
    {
      id: 'TERM-FIXED-YEAR-LEVEL',
      area: 'terminology',
      dimension: 'pypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\b(grade\s*[1-6]\s*standard|grade-level standard|fixed year level)\b/i.test(t),
      label: 'Refers to fixed year-group standards',
      note: 'The 2025 Subject Continuums organise progression by **four developmental phases**, not fixed grade levels — respecting the wide range in any primary classroom.',
      suggestion: 'Reference the developmental phase (Phase 1–4) that fits the learner, not just the year group.'
    },
    {
      id: 'TERM-CROSS-CURRICULAR',
      area: 'terminology',
      dimension: 'pypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\bcross[-\s]curricular\b/i.test(t),
      label: 'Says "cross-curricular" where "transdisciplinary" is meant',
      note: 'Cross-curricular = subjects clustered around a topic. **Transdisciplinary** = subjects disappear into the inquiry. The PYP is the latter — don\'t soften the language.',
      suggestion: 'Use "transdisciplinary" deliberately.'
    },

    /* ---------- AGENCY — voice, choice, ownership ---------- */
    {
      id: 'AGENCY-VOICE-NAMED',
      area: 'agency',
      dimension: 'agency',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(student voice|children share|learners share|hear from|listen to students|wonder|notice|i wonder|we wondered)\b/i.test(t),
      label: 'Names student voice explicitly',
      note: 'Voice = the learner is *heard*. Phrases like "students share what they noticed" or "children wonder" surface voice as an artefact.'
    },
    {
      id: 'AGENCY-CHOICE-NAMED',
      area: 'agency',
      dimension: 'agency',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(students choose|children choose|learners choose|chose to|select their own|pick which|own line of inquiry|own artefact|decide which)\b/i.test(t),
      label: 'Names student choice explicitly',
      note: 'Choice = the learner *decides*. Choosing which Line of Inquiry to pursue, which artefact to make, or which audience to present to are all valid surfacings of choice.'
    },
    {
      id: 'AGENCY-OWNERSHIP-NAMED',
      area: 'agency',
      dimension: 'agency',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(co-construct|set their own|own goal|own goals|own conference|self-assess|run the conference|peer feedback|own portfolio|own action plan)\b/i.test(t),
      label: 'Names student ownership explicitly',
      note: 'Ownership = the learner takes responsibility. Co-constructing success criteria, self-assessing, running their own conference — all are evidence of ownership.'
    },
    {
      id: 'AGENCY-TEACHER-DIRECTED',
      area: 'agency',
      dimension: 'agency',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(the teacher will tell|i will tell them|students must do|the teacher decides|the teacher chooses for|told to|made to|forced to|assigned to do)\b/i.test(t),
      label: 'Teacher-directed framing',
      note: 'Phrases like "the teacher tells", "students must", "assigned to" close the agency space the 2018 framework deliberately opens up.',
      suggestion: 'Re-frame around what the *learner* decides, chooses, or owns. The teacher\'s job is to design the conditions, not the conclusions.'
    },
    {
      id: 'AGENCY-PICK-BLUE-OR-RED',
      area: 'agency',
      dimension: 'agency',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\b(choose between (a|the) (two|three) options|pick (a|one of)|select from the list)\b/i.test(t),
      label: 'Constrained "pick from the list" framing',
      note: '"Pick blue or red" is not agency — it is allocation. Authentic choice means choosing across an open space of options the learner can also propose.',
      suggestion: 'Where possible, let learners propose options the teacher hadn\'t pre-listed.'
    },

    /* ---------- ACTION — the cycle, partnerships, the five forms ---------- */
    {
      id: 'ACTION-CYCLE-NAMED',
      area: 'action',
      dimension: 'actionFraming',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(choose.*act.*reflect|action cycle|reflect on (their|the) action|plan.*act.*review)\b/i.test(t),
      label: 'Names the Action Cycle (Choose → Act → Reflect)',
      note: 'Naming the cycle signals the 2018 framework\'s shift from action-as-event to action-as-practice.'
    },
    {
      id: 'ACTION-CHARITY-ONLY',
      area: 'action',
      dimension: 'actionFraming',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(donate|donation|charity|fundraise|raise money for|gave them|less fortunate)\b/i.test(t) && !/\b(meet|listen|interview|partner with|co-design|alongside|advocate|advocacy|campaign|investigate)\b/i.test(t),
      label: 'Action framed as charity / one-way giving',
      note: 'Donations and fundraisers can be valid, but on their own they don\'t meet the PYP\'s expectation of dialogue, partnership, and reflection. The shift is from *for* to *with*.',
      suggestion: 'Pair the action with relationship: meet, listen, interview, partner with, then plan together. Or choose a different form (advocacy, social entrepreneurship, lifestyle choice).'
    },
    {
      id: 'ACTION-FORM-NAMED',
      area: 'action',
      dimension: 'actionFraming',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(participation|advocacy|social entrepreneurship|social justice|lifestyle choice|lifestyle choices)\b/i.test(t),
      label: 'Names a recognisable form of action',
      note: 'The five PYP forms — Participation, Advocacy, Social Entrepreneurship, Social Justice, Lifestyle Choices — give the action structure beyond "doing something nice".'
    },
    {
      id: 'ACTION-NO-VERB',
      area: 'action',
      dimension: 'actionFraming',
      severity: 'med',
      kind: 'flag',
      detect: (t) => t.trim().length > 20 && !/\b(interview|meet|partner|co-design|design|investigate|research|campaign|advocate|consult|build|create|present|host|run|organise|organize|launch|publish|teach|exhibit|propose|plant|reduce|share)\b/i.test(t),
      label: 'No concrete action verb',
      note: 'The action description is missing a verb that names what learners will actually *do*.',
      suggestion: 'Add a verb: interview, co-design, advocate, host, launch, propose, build, plant, reduce, share, exhibit…'
    }
  ];

  /* ============================================================
     2. EXAMPLES — strong Central Ideas across the six themes
     All examples marked:
       - sourced  (lifted from a published source)
       - derived  (constructed for this site)
     Each example has: theme, concepts (2–3), age (Phase 1–4),
     central idea, and 3–4 sample Lines of Inquiry.
     ============================================================ */
  const examples = [

    /* ----- Who We Are ----- */
    {
      theme: 'Who We Are',
      phase: 'Phase 1 (ages 3–5)',
      concepts: ['form', 'connection'],
      centralIdea: 'Families come in many shapes and the people in them care for one another in different ways.',
      lines: ['What families look like (form)', 'How people in a family help each other (connection)', 'The traditions that hold families together (perspective)'],
      source: 'derived'
    },
    {
      theme: 'Who We Are',
      phase: 'Phase 2 (ages 5–7)',
      concepts: ['function', 'responsibility'],
      centralIdea: 'The choices we make about our bodies and minds shape how well we live and play.',
      lines: ['How our bodies and minds work (function)', 'The everyday choices that keep us well (responsibility)', 'How feelings change across a day (change)'],
      source: 'derived'
    },
    {
      theme: 'Who We Are',
      phase: 'Phase 3 (ages 7–9)',
      concepts: ['perspective', 'connection'],
      centralIdea: 'Identity is shaped by the communities we belong to and the stories we are told about ourselves.',
      lines: ['The communities that shape who we are (connection)', 'How identity changes as we grow (change)', 'Whose stories about us we accept and whose we question (perspective)'],
      source: 'derived'
    },
    {
      theme: 'Who We Are',
      phase: 'Phase 4 (ages 9–12)',
      concepts: ['causation', 'responsibility'],
      centralIdea: 'Beliefs and values guide the choices people make and the way they treat others.',
      lines: ['Where our beliefs come from (causation)', 'How values are expressed in daily choices (function)', 'The responsibilities our beliefs place on us (responsibility)'],
      source: 'derived'
    },

    /* ----- Where We Are in Place and Time ----- */
    {
      theme: 'Where We Are in Place and Time',
      phase: 'Phase 1 (ages 3–5)',
      concepts: ['form', 'change'],
      centralIdea: 'The places we live in change over time and so do the people who live there.',
      lines: ['What our neighbourhood looks like (form)', 'How a place has changed (change)', 'The people who have lived here before us (perspective)'],
      source: 'derived'
    },
    {
      theme: 'Where We Are in Place and Time',
      phase: 'Phase 2 (ages 5–7)',
      concepts: ['connection', 'change'],
      centralIdea: 'Journeys connect people, places and ideas across time.',
      lines: ['Why people make journeys (causation)', 'How journeys change the people who make them (change)', 'The stories travellers carry with them (perspective)'],
      source: 'derived'
    },
    {
      theme: 'Where We Are in Place and Time',
      phase: 'Phase 3 (ages 7–9)',
      concepts: ['causation', 'perspective'],
      centralIdea: 'Civilisations rise and fall because of the choices people make about land, water and one another.',
      lines: ['How a civilisation organises itself (function)', 'The choices that strengthen or weaken it (causation)', 'Whose version of the story survives (perspective)'],
      source: 'derived'
    },
    {
      theme: 'Where We Are in Place and Time',
      phase: 'Phase 4 (ages 9–12)',
      concepts: ['change', 'responsibility'],
      centralIdea: 'Exploration changes both the place arrived at and the place left behind.',
      lines: ['Why people explore (causation)', 'How a place changes when explorers arrive (change)', 'Whose voices are remembered, and whose are silenced (perspective)', 'Our responsibilities as we keep exploring today (responsibility)'],
      source: 'derived'
    },

    /* ----- How We Express Ourselves ----- */
    {
      theme: 'How We Express Ourselves',
      phase: 'Phase 1 (ages 3–5)',
      concepts: ['form', 'function'],
      centralIdea: 'People share feelings and ideas through colours, sounds, movements and words.',
      lines: ['The many ways we can express a feeling (form)', 'How an audience receives what we share (function)', 'Why some expressions move us more than others (perspective)'],
      source: 'derived'
    },
    {
      theme: 'How We Express Ourselves',
      phase: 'Phase 2 (ages 5–7)',
      concepts: ['function', 'perspective'],
      centralIdea: 'Stories carry the values and questions of the people who tell them.',
      lines: ['How a story is built (form)', 'Why people tell stories (function)', 'How the same story can mean different things to different listeners (perspective)'],
      source: 'derived'
    },
    {
      theme: 'How We Express Ourselves',
      phase: 'Phase 3 (ages 7–9)',
      concepts: ['perspective', 'connection'],
      centralIdea: 'Art reflects the culture that makes it and reshapes the culture that sees it.',
      lines: ['How art shows the world of its maker (perspective)', 'How an audience changes the meaning of a work (connection)', 'The choices an artist makes (causation)'],
      source: 'derived'
    },
    {
      theme: 'How We Express Ourselves',
      phase: 'Phase 4 (ages 9–12)',
      concepts: ['causation', 'change'],
      centralIdea: 'Creative expression evolves as the tools, audiences and beliefs of its makers change.',
      lines: ['How new tools change what artists can make (causation)', 'How audiences shape what survives (perspective)', 'When copying becomes creating (change)'],
      source: 'derived'
    },

    /* ----- How the World Works ----- */
    {
      theme: 'How the World Works',
      phase: 'Phase 1 (ages 3–5)',
      concepts: ['form', 'change'],
      centralIdea: 'Living things grow and change in patterns we can notice and name.',
      lines: ['What growing things look like at different stages (form)', 'How the seasons change living things (change)', 'The patterns we see in nature (connection)'],
      source: 'derived'
    },
    {
      theme: 'How the World Works',
      phase: 'Phase 2 (ages 5–7)',
      concepts: ['function', 'causation'],
      centralIdea: 'Forces are everywhere — they move things, hold things, and change things.',
      lines: ['How forces work (function)', 'What happens when a force changes (causation)', 'How people use forces to make life easier (connection)'],
      source: 'derived'
    },
    {
      theme: 'How the World Works',
      phase: 'Phase 3 (ages 7–9)',
      concepts: ['connection', 'responsibility'],
      centralIdea: 'Freshwater is a finite resource that sustains all life and depends on the choices people make.',
      lines: ['Where freshwater comes from and where it goes (form)', 'How human activity affects freshwater systems (causation)', 'The responsibilities of individuals and communities towards shared water (responsibility)'],
      source: 'sourced (worked example, §4.3 research doc)'
    },
    {
      theme: 'How the World Works',
      phase: 'Phase 4 (ages 9–12)',
      concepts: ['causation', 'change'],
      centralIdea: 'Energy can be transformed but never created — and every transformation costs something.',
      lines: ['How energy moves and changes form (function)', 'The costs hidden in every energy transformation (causation)', 'How human choices change the planet\'s energy story (responsibility)'],
      source: 'derived'
    },

    /* ----- How We Organize Ourselves ----- */
    {
      theme: 'How We Organize Ourselves',
      phase: 'Phase 1 (ages 3–5)',
      concepts: ['function', 'connection'],
      centralIdea: 'People work together in groups so that everyone\'s needs are met.',
      lines: ['The jobs people do in our community (function)', 'How groups work better when people cooperate (connection)', 'What happens when a job is missing (causation)'],
      source: 'derived'
    },
    {
      theme: 'How We Organize Ourselves',
      phase: 'Phase 2 (ages 5–7)',
      concepts: ['function', 'causation'],
      centralIdea: 'Markets bring people together so that goods, services and ideas can be exchanged.',
      lines: ['How a market works (function)', 'Why people trade (causation)', 'How the choices of buyers and sellers shape what is available (responsibility)'],
      source: 'derived'
    },
    {
      theme: 'How We Organize Ourselves',
      phase: 'Phase 3 (ages 7–9)',
      concepts: ['perspective', 'responsibility'],
      centralIdea: 'Rules and laws shape how communities live together — and they can be changed.',
      lines: ['Why communities make rules (causation)', 'Who decides what the rules are (perspective)', 'How rules change over time (change)', 'Our responsibilities as members of a community (responsibility)'],
      source: 'derived'
    },
    {
      theme: 'How We Organize Ourselves',
      phase: 'Phase 4 (ages 9–12)',
      concepts: ['causation', 'connection'],
      centralIdea: 'Economic systems shape what people make, what they value, and what they throw away.',
      lines: ['How an economy works (function)', 'The choices that drive what is produced (causation)', 'How global supply chains connect distant communities (connection)', 'Whose work is rewarded and whose is hidden (perspective)'],
      source: 'derived'
    },

    /* ----- Sharing the Planet ----- */
    {
      theme: 'Sharing the Planet',
      phase: 'Phase 1 (ages 3–5)',
      concepts: ['responsibility', 'connection'],
      centralIdea: 'Living things share spaces and depend on one another to stay well.',
      lines: ['The plants and animals we share our space with (form)', 'How living things depend on each other (connection)', 'Small things we can do to care for them (responsibility)'],
      source: 'derived'
    },
    {
      theme: 'Sharing the Planet',
      phase: 'Phase 2 (ages 5–7)',
      concepts: ['responsibility', 'perspective'],
      centralIdea: 'Sharing means listening, taking turns, and noticing what others need.',
      lines: ['What sharing looks like in our class (form)', 'How sharing feels for the person on either side (perspective)', 'Why sharing sometimes feels hard (causation)'],
      source: 'derived'
    },
    {
      theme: 'Sharing the Planet',
      phase: 'Phase 3 (ages 7–9)',
      concepts: ['causation', 'responsibility'],
      centralIdea: 'When resources are limited, the choices people make decide who has enough.',
      lines: ['Resources that are finite (form)', 'Why some people have less than others (causation)', 'The responsibilities of people who have more (responsibility)'],
      source: 'derived'
    },
    {
      theme: 'Sharing the Planet',
      phase: 'Phase 4 (ages 9–12)',
      concepts: ['responsibility', 'change'],
      centralIdea: 'Rights and responsibilities exist together — neither can survive without the other.',
      lines: ['The rights people share (form)', 'The responsibilities those rights place on us (responsibility)', 'How rights have changed over time (change)', 'Whose rights are still being fought for (perspective)'],
      source: 'derived'
    }
  ];

  /* ============================================================
     3. TRANSFORMERS — patterns that rewrite a weak Central Idea
        Each transformer: label, match (regex), build (function)
     ============================================================ */
  const transformers = [
    {
      label: 'Topic noun → "X depends on the choices people make."',
      match: /^([A-Za-z][A-Za-z\s-]{2,40})\.?$/,
      build: (m) => `${m[1].trim()} depends on the choices people make and the systems they build around it.`
    },
    {
      label: 'Topic noun → "X shapes the communities that live with it."',
      match: /^([A-Za-z][A-Za-z\s-]{2,40})\.?$/,
      build: (m) => `${m[1].trim()} shapes the communities that live with it — and is shaped by them in return.`
    },
    {
      label: 'Topic noun → "Across cultures, people use X to make sense of…"',
      match: /^([A-Za-z][A-Za-z\s-]{2,40})\.?$/,
      build: (m) => `Across cultures and time, people use ${m[1].trim().toLowerCase()} to make sense of themselves and the world around them.`
    },
    {
      label: '"X is Y" → "X is more than Y — it also…"',
      match: /^(.+?)\s+(is|are)\s+(.+)$/i,
      build: (m) => `${m[1]} ${m[2]} more than ${m[3].replace(/\.$/, '')} — they also shape how we live with one another.`
    },
    {
      label: '"X affects/impacts Y" → "X and Y influence each other…"',
      match: /^(.+?)\s+(affects?|impacts?|influences?|shapes?)\s+(.+)$/i,
      build: (m) => `${m[1]} and ${m[3].replace(/\.$/, '')} influence each other, and the choices people make decide the balance between them.`
    },
    {
      label: 'Question → declarative statement',
      match: /^(.+?)\?$/,
      build: (m) => {
        const body = m[1].trim()
          .replace(/^why\s+/i, '')
          .replace(/^how\s+/i, '')
          .replace(/^what\s+/i, '')
          .replace(/^when\s+/i, '')
          .replace(/^who\s+/i, '');
        return body.charAt(0).toUpperCase() + body.slice(1) + ' — and the reasons matter.';
      }
    },
    {
      label: '"We should X" → "The choices we make about X shape…"',
      match: /^we\s+(should|must|need to)\s+(.+)$/i,
      build: (m) => `The choices we make about ${m[2].replace(/\.$/, '')} shape what is possible for us and for those who come after us.`
    },
    {
      label: 'Topic → "X has form, function and meaning — and they connect."',
      match: /^([A-Za-z][A-Za-z\s-]{2,40})\.?$/,
      build: (m) => `${m[1].trim()} has form, function and meaning — and how we understand each one changes how we treat it.`
    }
  ];

  /* ============================================================
     4. KEY CONCEPTS — the 7 PYP transdisciplinary concepts
        (Reflection was removed in the 2018 enhancement.)
     ============================================================ */
  const keyConcepts = [
    { name: 'Form',           question: 'What is it like?',                description: 'The observable features, attributes, and structure of things.' },
    { name: 'Function',       question: 'How does it work?',               description: 'How something operates, the role it plays, what it does.' },
    { name: 'Causation',      question: 'Why is it like it is?',           description: 'Reasons, causes, motivations — why things happen as they do.' },
    { name: 'Change',         question: 'How is it transforming?',         description: 'Movement, transition, growth, evolution over time.' },
    { name: 'Connection',     question: 'How is it linked to other things?', description: 'Relationships, links, interdependence with other systems.' },
    { name: 'Perspective',    question: 'What are the points of view?',    description: 'Different viewpoints, opinions, interpretations and biases.' },
    { name: 'Responsibility', question: 'What is our obligation?',         description: 'Choices, ethics, action — what we owe to each other and the planet.' }
  ];

  /* ============================================================
     5. TRANSDISCIPLINARY THEMES — six themes, 2025 descriptors
        Each theme: name, drivingStatement (the new 2025 opener),
        supports (3 conceptual support statements), iconHint.
     ============================================================ */
  const themes = [
    {
      name: 'Who We Are',
      drivingStatement: 'An inquiry into the nature of the self, who we are as individuals, and who we are together.',
      supports: [
        'Identity, beliefs and values shape how we see ourselves and others.',
        'Physical, mental, social and spiritual well-being are connected.',
        'Families, friendships, communities and cultures hold us together.'
      ]
    },
    {
      name: 'Where We Are in Place and Time',
      drivingStatement: 'An inquiry into orientation in place and time, our shared histories, and our connection to the natural world.',
      supports: [
        'People, places and ideas move across time — and leave traces.',
        'The natural world has its own histories that overlap with ours.',
        'Discovery, exploration and migration shape everyone they touch.'
      ]
    },
    {
      name: 'How We Express Ourselves',
      drivingStatement: 'An inquiry into the ways we discover and express ideas, feelings, nature, culture and beliefs — and the aesthetic.',
      supports: [
        'Creativity is how humans share what cannot easily be said.',
        'Audiences shape what is made, just as makers shape audiences.',
        'Expression carries the values and questions of its maker.'
      ]
    },
    {
      name: 'How the World Works',
      drivingStatement: 'An inquiry into the natural world and its laws, and into the impact of scientific and technological advances on humans and the environment.',
      supports: [
        'Living and non-living systems behave in patterns we can study.',
        'Technologies extend what humans can do — and change us in return.',
        'Every transformation in nature or technology has costs and consequences.'
      ]
    },
    {
      name: 'How We Organize Ourselves',
      drivingStatement: 'An inquiry into the interconnectedness of human-made systems and communities — structures, organisations, decision-making and economic activity.',
      supports: [
        'Communities organise themselves to meet shared needs.',
        'Systems shape what is produced, exchanged and valued.',
        'Decisions made by a few often affect many.'
      ]
    },
    {
      name: 'Sharing the Planet',
      drivingStatement: 'An inquiry into rights and responsibilities in the struggle to share finite resources with other people and other living things — peace and conflict resolution.',
      supports: [
        'All living things depend on one another and on the planet.',
        'Resources are finite, and how they are shared matters.',
        'Rights and responsibilities exist together; neither survives alone.'
      ]
    }
  ];

  /* ============================================================
     6. LEARNER PROFILE — the 10 IB attributes (PYP→DP shared)
     ============================================================ */
  const learnerProfile = [
    { name: 'Inquirers',    descriptor: 'Curious. Develop skills for inquiry and research; love learning lifelong.' },
    { name: 'Knowledgeable', descriptor: 'Explore concepts, ideas and issues of local and global significance.' },
    { name: 'Thinkers',     descriptor: 'Use critical and creative thinking to analyse and take responsible action.' },
    { name: 'Communicators', descriptor: 'Express themselves in more than one language and in many ways.' },
    { name: 'Principled',   descriptor: 'Act with integrity, honesty, fairness, and respect for human dignity.' },
    { name: 'Open-minded',  descriptor: 'Understand and appreciate other cultures, traditions, perspectives.' },
    { name: 'Caring',       descriptor: 'Show empathy, compassion and respect — committed to service.' },
    { name: 'Risk-takers',  descriptor: 'Courageous; explore new ideas and strategies; resilient in adversity.' },
    { name: 'Balanced',     descriptor: 'Understand the importance of intellectual, physical and emotional balance.' },
    { name: 'Reflective',   descriptor: 'Give thoughtful consideration to their own learning and experiences.' }
  ];

  /* ============================================================
     7. SUBJECT CONTINUUMS — six subjects + sample related concepts
        (2025 framework; replaces the legacy Scope and Sequence.)
     ============================================================ */
  const subjectContinuums = {
    'Language': {
      summary: 'Oral, visual and written language; mother tongue and additional languages.',
      relatedConcepts: ['audience', 'purpose', 'voice', 'genre', 'meaning', 'structure', 'context', 'register', 'communication']
    },
    'Mathematics': {
      summary: 'Number, pattern & function, measurement, shape & space, data handling.',
      relatedConcepts: ['pattern', 'equivalence', 'quantity', 'representation', 'relationships', 'space', 'measurement', 'data', 'probability']
    },
    'Science': {
      summary: 'Living things, Earth & space, materials & matter, forces & energy.',
      relatedConcepts: ['systems', 'evidence', 'classification', 'energy', 'forces', 'matter', 'environment', 'interdependence', 'patterns']
    },
    'Social Studies': {
      summary: 'Human systems, social organisation, continuity & change, resources & environment, human-Earth connections.',
      relatedConcepts: ['community', 'culture', 'identity', 'rights', 'governance', 'continuity', 'change', 'place', 'belief']
    },
    'Arts': {
      summary: 'Two strands — creating and responding — across visual arts, music, dance, drama and media.',
      relatedConcepts: ['expression', 'audience', 'composition', 'aesthetic', 'interpretation', 'identity', 'style', 'medium', 'culture']
    },
    'Personal, Social and Physical Education (PSPE)': {
      summary: 'Identity, active living, interactions — the body, the self, and others.',
      relatedConcepts: ['identity', 'well-being', 'movement', 'balance', 'cooperation', 'relationships', 'choice', 'safety', 'respect']
    }
  };

  /* ============================================================
     8. DEVELOPMENTAL PHASES — the four 2025 progression phases
        (replacing fixed grade-level standards).
     ============================================================ */
  const developmentalPhases = [
    { name: 'Phase 1', ages: 'ages 3–5',  flavour: 'Sensory, playful, here-and-now. Inquiry through provocation, materials and shared wonder.' },
    { name: 'Phase 2', ages: 'ages 5–7',  flavour: 'Concrete, story-driven. Inquiry through observation, classification, role-play and beginning research.' },
    { name: 'Phase 3', ages: 'ages 7–9',  flavour: 'Pattern-seeking, comparing, beginning to generalise. Inquiry through investigation and structured action.' },
    { name: 'Phase 4', ages: 'ages 9–12', flavour: 'Abstract, multi-perspective, increasingly student-led. Inquiry through research, debate and authored action (PYPX).' }
  ];

  /* ============================================================
     9. TERMINOLOGY — outdated → current PYP mapping
     ============================================================ */
  const terminology = [
    { old: 'PYP Attitudes (12-item list)', new: 'Folded into the 10 Learner Profile attributes (2018)' },
    { old: 'Eight Key Concepts (including Reflection)', new: 'Seven Key Concepts (Reflection is now a programme-wide practice)' },
    { old: 'Scope and Sequence', new: 'Subject Continuum (2025)' },
    { old: 'Service Learning', new: 'The Action Cycle — Choose → Act → Reflect' },
    { old: 'Fixed grade-level standards', new: 'Four developmental phases (Phase 1–4)' },
    { old: 'Cross-curricular', new: 'Transdisciplinary (subjects disappear into the inquiry)' },
    { old: 'Five Essential Elements (knowledge, concepts, skills, attitudes, action)', new: 'Three Pillars (Learner / Learning & Teaching / Learning Community)' },
    { old: 'Teacher-set unit plan', new: 'Co-constructed Unit of Inquiry with student agency surfaced' }
  ];

  /* ============================================================
    10. AGENCY FRAMING — voice, choice, ownership verb hints
    ============================================================ */
  const agencyFraming = {
    voiceVerbs:     ['notice', 'wonder', 'share', 'name', 'voice', 'speak', 'describe', 'show', 'tell'],
    choiceVerbs:    ['choose', 'select', 'decide', 'pick', 'propose', 'opt for', 'design their own', 'choose between'],
    ownershipVerbs: ['co-construct', 'set their own', 'self-assess', 'peer-assess', 'lead the conference', 'own the portfolio', 'reflect on', 'plan their own action'],
    teacherDirected: ['tell them', 'students must', 'assigned to', 'the teacher decides', 'forced to', 'made to', 'required to', 'told to do']
  };

  /* ============================================================
    11. ACTION FORMS — the five PYP forms with examples
    ============================================================ */
  const actionForms = [
    { name: 'Participation',           example: 'Joining a community clean-up, volunteering at a hospice, helping a neighbour.' },
    { name: 'Advocacy',                example: 'Writing to the council, designing a poster, running an awareness campaign.' },
    { name: 'Social entrepreneurship', example: 'Designing a product or service that solves a real problem.' },
    { name: 'Social justice',          example: 'Confronting unfairness in the playground, the school, or beyond.' },
    { name: 'Lifestyle choices',       example: 'Walking to school, reducing packaging, planting a herb on the windowsill.' }
  ];

  /* ============================================================
    12. ATL ALIGNMENT — the five categories (shared PYP/MYP/DP)
        Verb hints kept primary-age accessible.
    ============================================================ */
  const atlAlignment = {
    'Thinking':        ['notice', 'wonder', 'question', 'compare', 'sort', 'predict', 'explain', 'infer', 'imagine', 'reflect'],
    'Communication':   ['listen', 'speak', 'present', 'show', 'explain', 'read', 'write', 'draw', 'discuss'],
    'Social':          ['cooperate', 'share', 'take turns', 'help', 'resolve', 'negotiate', 'collaborate', 'include'],
    'Self-management': ['plan', 'organise', 'persist', 'manage time', 'set goals', 'review', 'try again', 'be safe'],
    'Research':        ['observe', 'find out', 'investigate', 'collect', 'record', 'cite', 'check sources', 'interview', 'survey']
  };

  /* ============================================================
    13. DIMENSIONS — how rules roll up into a score
        Each rule contributes to one dimension; scoring lives
        in evaluator.js.
    ============================================================ */
  const dimensions = {
    structure:        { label: 'Structure & form',          weight: 1.2 },
    conceptDepth:     { label: 'Conceptual depth',          weight: 1.5 },
    transferability:  { label: 'Transferability',           weight: 1.4 },
    specificity:      { label: 'Specificity',               weight: 1.2 },
    provocation:      { label: 'Provocation',               weight: 1.1 },
    pypAlignment:     { label: 'PYP alignment (2018/2025)', weight: 1.0 },
    agency:           { label: 'Agency (voice/choice/ownership)', weight: 1.3 },
    actionFraming:    { label: 'Action (cycle + partnership)',    weight: 1.2 }
  };

  /* ============================================================
     Public API
     ============================================================ */
  return {
    rules,
    examples,
    transformers,
    keyConcepts,
    themes,
    learnerProfile,
    subjectContinuums,
    developmentalPhases,
    terminology,
    agencyFraming,
    actionForms,
    atlAlignment,
    dimensions,
    helpers: { containsAny, startsWithAny, wordCount, splitLines }
  };
})();
