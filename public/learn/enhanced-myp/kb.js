/* ============================================================
   Enhanced MYP Navigator — Knowledge Base
   ------------------------------------------------------------
   A curated, transparent knowledge base used by evaluator.js.
   Every claim here is reviewable — no AI, no opaque scoring.

   Sections:
     1. rules               — pattern detectors with severity + advice
     2. examples            — 40+ strong inquiry questions across subjects
     3. transformers        — text-rewriting templates
     4. concepts            — Specified Concepts per subject (sample)
     5. terminology         — outdated → current term mapping
     6. ceFraming           — community-engagement verbs (with vs for)
     7. atlAlignment        — verb hints per ATL category
     8. dimensionWeights    — how dimensions roll up into a score
   ============================================================ */

window.MYPKB = (function () {
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
  const stripPlural = w => w.toLowerCase().replace(/(ies|s)$/i, m => m === 'ies' ? 'y' : '');

  /* ============================================================
     1. RULES — 28 rules, organised by area
     Each rule:
       id, area, dimension, severity (low|med|high), kind (flag|positive),
       detect(text, ctx), label, note, suggestion, example
     ============================================================ */
  const rules = [

    /* ---------- Inquiry Question — anti-recall ---------- */
    {
      id: 'IQ-RECALL-STEM',
      area: 'inquiryQuestion',
      dimension: 'antiGoogleability',
      severity: 'high',
      kind: 'flag',
      detect: (t) => /^\s*(what is|what are|when is|when was|where is|where was|who is|who was|define|name|list|identify|state|describe)\b/i.test(t),
      label: 'Starts with a recall verb',
      note: 'Openings like "What is…", "Who was…", "Define…" lead to a single right answer a student can Google.',
      suggestion: 'Swap the stem for a provocative one: Why does…, How can…, To what extent…, When does…',
      example: 'Instead of "What is photosynthesis?" try "How would the planet change if photosynthesis ran in reverse?"'
    },
    {
      id: 'IQ-YES-NO',
      area: 'inquiryQuestion',
      dimension: 'openEndedness',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /^\s*(is |are |do |does |can |will |has |have |should )/i.test(t),
      label: 'Yes/no question',
      note: 'Auxiliary-verb openings invite a binary answer that closes thinking down.',
      suggestion: 'Re-stem as "How…", "Why…", "Under what conditions…" or pair with "and how do you know?".',
      example: '"Should we use fossil fuels?" → "Under what conditions does the cost of using fossil fuels outweigh the benefit — and who pays that cost?"'
    },
    {
      id: 'IQ-PROVOCATIVE-STEM',
      area: 'inquiryQuestion',
      dimension: 'provocation',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(why|how|to what extent|could|when does|what if|in what ways|how come|how do you know)\b/i.test(t),
      label: 'Uses a provocative question stem',
      note: 'Stems like "Why", "How", "To what extent" open out into investigation rather than recall.'
    },
    {
      id: 'IQ-TENSION-WORDS',
      area: 'inquiryQuestion',
      dimension: 'provocation',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(but|yet|however|despite|unless|paradox|contradict|opposite|same|both|either)\b/i.test(t),
      label: 'Sets up a tension or paradox',
      note: 'Tension words (but/yet/however/despite/opposite) signal a question worth wrestling with.'
    },
    {
      id: 'IQ-ABSOLUTE-WORDS',
      area: 'inquiryQuestion',
      dimension: 'provocation',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(every|all|none|always|never|nobody|everybody|must|impossible)\b/i.test(t),
      label: 'Contains absolute language',
      note: 'Absolutes ("every", "always", "never") invite students to find the exception — productive disequilibrium.'
    },
    {
      id: 'IQ-MULTIPLE-PERSPECTIVES',
      area: 'inquiryQuestion',
      dimension: 'openEndedness',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(perspective|perspectives|different|differs|depend|opposite|both|whose|who decides|who gets to)\b/i.test(t),
      label: 'Invites multiple perspectives',
      note: 'Language that acknowledges varied viewpoints supports rich discussion and avoids "one right answer".'
    },
    {
      id: 'IQ-CONCRETE-ANCHOR',
      area: 'inquiryQuestion',
      dimension: 'specificity',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(social media|classroom|community|city|school|family|playground|neighbour|street|home|country|election|hospital|forest|ocean|river|market|app|phone|kitchen)\b/i.test(t),
      label: 'Anchored to a concrete context',
      note: 'Naming a real-world site (market, social media, hospital, classroom) gives students a foothold for inquiry.'
    },
    {
      id: 'IQ-VAGUE-NOUNS',
      area: 'inquiryQuestion',
      dimension: 'specificity',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(things|stuff|something|somehow|important|interesting|various|aspects|factors)\b/i.test(t),
      label: 'Contains vague placeholder nouns',
      note: '"Things", "stuff", "aspects", "factors" — they hide the real question.',
      suggestion: 'Name the actual phenomenon: not "things that affect ecosystems" but "decisions a farmer makes that change a wetland".'
    },
    {
      id: 'IQ-LENGTH-SHORT',
      area: 'inquiryQuestion',
      dimension: 'specificity',
      severity: 'low',
      kind: 'flag',
      detect: (t) => t.trim().length > 0 && t.trim().length < 25,
      label: 'Very short',
      note: 'Strong inquiry questions usually need room for setup and tension.',
      suggestion: 'Add a concrete context, a paradox, or a specific subject (a place, a person, a moment).'
    },
    {
      id: 'IQ-LENGTH-LONG',
      area: 'inquiryQuestion',
      dimension: 'specificity',
      severity: 'low',
      kind: 'flag',
      detect: (t) => t.trim().length > 230,
      label: 'Very long',
      note: 'Long questions often hide more than one inquiry. Students struggle to hold them in mind.',
      suggestion: 'Try to split into a primary question + 1–2 guiding questions underneath it.'
    },
    {
      id: 'IQ-NO-QUESTION-MARK',
      area: 'inquiryQuestion',
      dimension: 'openEndedness',
      severity: 'low',
      kind: 'flag',
      detect: (t) => t.trim().length > 0 && !t.trim().endsWith('?'),
      label: 'Missing a question mark',
      note: 'In the Enhanced MYP you may use an Inquiry Statement instead — but if this is meant to be a question, it needs the punctuation that signals it.'
    },
    {
      id: 'IQ-COMPLETELY-EMPTY',
      area: 'inquiryQuestion',
      dimension: 'specificity',
      severity: 'high',
      kind: 'flag',
      detect: (t) => t.trim().length === 0,
      label: 'No question typed',
      note: 'Paste or type your inquiry question above.',
      suggestion: 'If you don\'t have one yet, try the SOI → IQ rewriter card to generate a draft.'
    },
    {
      id: 'IQ-CONCEPT-WORDS',
      area: 'inquiryQuestion',
      dimension: 'conceptDepth',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(power|justice|equity|change|system|systems|identity|pattern|patterns|cause|causality|perspective|model|models|evidence|representation|scale|relationship|relationships|truth|meaning|culture|form|function|sustainability|innovation|community|fairness|balance|wellbeing|well-being|expression|audience|context)\b/i.test(t),
      label: 'Touches a recognisable specified concept',
      note: 'Naming or evoking a Specified Concept (power, system, identity, change…) signals conceptual depth.'
    },

    /* ---------- Statement-of-Inquiry / outdated terminology ---------- */
    {
      id: 'TERM-OUTDATED-SAA',
      area: 'terminology',
      dimension: 'mypAlignment',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(service as action|service-as-action|service learning hours|saa)\b/i.test(t),
      label: 'Outdated term: "Service as Action"',
      note: 'In the Enhanced MYP the term is **Community Engagement**.',
      suggestion: 'Replace with "Community Engagement"; reframe action FROM "for the community" TO "with the community".'
    },
    {
      id: 'TERM-OUTDATED-KEY-CONCEPT',
      area: 'terminology',
      dimension: 'mypAlignment',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(key concept|related concept|key and related concepts)\b/i.test(t),
      label: 'Outdated term: "Key/Related Concept"',
      note: 'In the Enhanced MYP these are merged into a single list of **Specified Concepts** per subject group.',
      suggestion: 'Choose one (or more) Specified Concept from your subject list. The two-tier system is retired.'
    },
    {
      id: 'TERM-OUTDATED-SOI',
      area: 'terminology',
      dimension: 'mypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\b(statement of inquiry|soi formula)\b/i.test(t),
      label: 'Refers to the old Statement of Inquiry',
      note: 'The Statement of Inquiry has been replaced by an **Inquiry Statement OR an Inquiry Question**, with no required elements.',
      suggestion: 'Rewrite as a single provocative question — drop the KC+RC+GC formula.'
    },
    {
      id: 'TERM-OUTDATED-FCD',
      area: 'terminology',
      dimension: 'mypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\b(factual,? conceptual,? (and )?debatable|factual\/conceptual\/debatable)\b/i.test(t),
      label: 'Outdated classification: Factual/Conceptual/Debatable',
      note: 'Guiding questions no longer need to be classified F/C/D in the Enhanced MYP.',
      suggestion: 'Use free-form guiding questions; let the type emerge from the line of inquiry.'
    },
    {
      id: 'TERM-OUTDATED-IMPLICIT-EXPLICIT',
      area: 'terminology',
      dimension: 'mypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /\b(implicit atl|explicit atl|implicit and explicit)\b/i.test(t),
      label: 'Outdated terms: implicit / explicit ATL',
      note: 'The Enhanced MYP gives teacher agency over when and how ATL is taught — the implicit/explicit distinction has been retired.',
      suggestion: 'Simply say: "In this unit, students will practise [skill] by [task]."'
    },
    {
      id: 'TERM-OUTDATED-IN-ORDER-TO',
      area: 'terminology',
      dimension: 'mypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t) => /^in order to .* students (must|will)\b/i.test(t),
      label: 'Old ATL formula ("In order to… students must…")',
      note: 'This formula is no longer required.',
      suggestion: 'Plain prose works: "Students will practise organising evidence (Research) as they investigate…"'
    },

    /* ---------- Community Engagement rules ---------- */
    {
      id: 'CE-FOR-NOT-WITH',
      area: 'communityEngagement',
      dimension: 'partnership',
      severity: 'high',
      kind: 'flag',
      detect: (t) => /\b(for the community|for our community|do for them|help them|give to them|gift to)\b/i.test(t),
      label: '"For the community" framing',
      note: 'The Enhanced MYP shifts from service TO the community to action WITH the community.',
      suggestion: 'Reframe: who is the partner? What did you decide together? Use verbs like "co-design", "partner with", "consult", "collaborate with".'
    },
    {
      id: 'CE-WITH-PARTNERSHIP',
      area: 'communityEngagement',
      dimension: 'partnership',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(with the community|with a community|alongside|partner with|partnered|co-design|co-designed|co-create|collaborate with|consult|dialogue|in conversation with|together with)\b/i.test(t),
      label: 'Uses partnership language',
      note: 'Language like "with", "alongside", "co-design", "partner with" reflects the Enhanced MYP shift to action WITH the community.'
    },
    {
      id: 'CE-CHARITY-FRAMING',
      area: 'communityEngagement',
      dimension: 'partnership',
      severity: 'med',
      kind: 'flag',
      detect: (t) => /\b(donate|donation|charity|less fortunate|raise money for|fundraise for|gave them|provided them)\b/i.test(t),
      label: 'Charity / one-way framing',
      note: 'Donations and fundraisers can be valuable, but on their own they don\'t meet Community Engagement\'s expectation of dialogue and reflection.',
      suggestion: 'Pair the action with relationship: meet, listen, learn from, then plan together.'
    },
    {
      id: 'CE-FORM-NAMED',
      area: 'communityEngagement',
      dimension: 'form',
      severity: 'low',
      kind: 'positive',
      detect: (t) => /\b(advocacy|action research|social entrepreneurship|participation|community.building|community building|campaign|interview|policy proposal|petition)\b/i.test(t),
      label: 'Names a recognisable form of engagement',
      note: 'The five forms — Advocacy, Action Research, Social Entrepreneurship, Participation, Community-building — give the engagement structure.'
    },
    {
      id: 'CE-NO-ACTION-VERB',
      area: 'communityEngagement',
      dimension: 'form',
      severity: 'med',
      kind: 'flag',
      detect: (t) => t.trim().length > 0 && !/\b(interview|meet|partner|co-design|design|investigate|research|campaign|advocate|consult|build|create|present|host|run|organise|organize|launch|publish|teach|workshop|exhibit|propose)\b/i.test(t),
      label: 'No concrete action verb',
      note: 'The description is missing a verb that names what students will actually do with their partner.',
      suggestion: 'Add a verb: interview, co-design, partner, advocate, host, launch, publish, exhibit, propose, build, investigate…'
    },
    {
      id: 'CE-NO-PARTNER-NAMED',
      area: 'communityEngagement',
      dimension: 'specificity',
      severity: 'low',
      kind: 'flag',
      detect: (t) => t.trim().length > 0 && !/\b(local|council|hospital|library|farmer|charity|organisation|organization|school|elder|elders|family|families|business|shop|owner|club|team|volunteer|partner|department|ministry|community member|expert|practitioner|alumni)\b/i.test(t),
      label: 'No specific partner named',
      note: '"The community" is too generic — students learn most when the partner is concrete.',
      suggestion: 'Name a partner: e.g., the local library, the council\'s waste team, a parent who works in healthcare, a year-12 alumna, a refugee-support charity.'
    },

    /* ---------- Concept usage rules (for the concept-usage check) ---------- */
    {
      id: 'CONCEPT-IN-TASK',
      area: 'conceptUsage',
      dimension: 'conceptDepth',
      severity: 'low',
      kind: 'positive',
      detect: (t, ctx) => {
        if (!ctx || !ctx.concept) return false;
        const stem = stripPlural(ctx.concept);
        if (!stem) return false;
        const safe = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('\\b' + safe + '(s|es|ies)?\\b', 'i');
        return re.test(t);
      },
      label: 'Concept appears in the task',
      note: 'The summative task explicitly engages the chosen concept — not decorative, functional.'
    },
    {
      id: 'CONCEPT-NOT-IN-TASK',
      area: 'conceptUsage',
      dimension: 'conceptDepth',
      severity: 'high',
      kind: 'flag',
      detect: (t, ctx) => {
        if (!ctx || !ctx.concept) return false;
        const stem = stripPlural(ctx.concept);
        if (!stem) return false;
        const safe = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('\\b' + safe + '(s|es|ies)?\\b', 'i');
        return !re.test(t);
      },
      label: 'Concept is not visible in the task',
      note: (ctx) => 'If "' + (ctx && ctx.concept ? ctx.concept : 'the concept') + '" never appears in the task, the rubric won\'t reward it and students won\'t learn it.',
      suggestion: 'Re-write the task so it explicitly requires students to think about the concept (e.g., "...explain the **pattern**…", "...evaluate the **system**…").'
    },
    {
      id: 'CONCEPT-LOW-LEVEL-VERB',
      area: 'conceptUsage',
      dimension: 'conceptDepth',
      severity: 'med',
      kind: 'flag',
      detect: (t) => {
        const head = (t || '').toLowerCase().replace(/^\s*(students will|the students will|the student will|the student|they will|learners will)\s+/i, '').trim();
        return /^(define|state|list|name|identify|recall|recite|label|memorise|memorize)\b/.test(head);
      },
      label: 'Task verb is recall-level',
      note: 'Verbs like "define", "list", "state" reward memory, not conceptual thinking.',
      suggestion: 'Lift the verb: analyse, evaluate, justify, design, investigate, model, explain how/why.'
    },
    {
      id: 'CONCEPT-NOT-RECOGNISED',
      area: 'conceptUsage',
      dimension: 'mypAlignment',
      severity: 'low',
      kind: 'flag',
      detect: (t, ctx) => false, // handled in evaluator with subject lookup
      label: 'Concept not in your subject\'s sample list',
      note: 'This concept is not on the sample Specified Concepts list for your subject — which is fine if it\'s a school-added concept. Just confirm it is documented in your school\'s curriculum overview.'
    }
  ];

  /* ============================================================
     2. EXAMPLES — 40+ inquiry questions across 8 subject groups
     All examples are clearly marked as either:
       - sourced  (lifted from a published source)
       - derived  (constructed for this site to illustrate the model)
     ============================================================ */
  const examples = [
    // Sciences
    { subject: 'Sciences', concept: 'evidence', lens: 'global', q: 'Two scientists run the same experiment and reach opposite conclusions. How is that possible — and who do we believe?', source: 'derived' },
    { subject: 'Sciences', concept: 'systems', lens: 'local', q: 'When does a healthy ecosystem stop being healthy — and who notices first?', source: 'derived' },
    { subject: 'Sciences', concept: 'scale', lens: 'global', q: 'If the climate changed slowly for 100 years, would anyone alive notice it happening?', source: 'derived' },
    { subject: 'Sciences', concept: 'models', lens: 'global', q: 'Why does life on Earth use the same four DNA bases when so many alternatives are chemically possible?', source: 'derived' },
    { subject: 'Sciences', concept: 'change', lens: 'individual', q: 'Why do our bodies treat a small daily harm differently from a single large one?', source: 'derived' },
    { subject: 'Sciences', concept: 'energy', lens: 'local', q: 'Why does the same house feel cold to one person and warm to another in the same room?', source: 'derived' },

    // Mathematics
    { subject: 'Mathematics', concept: 'representation', lens: 'global', q: 'Why does every culture in history invent a number system, and why do they all look different?', source: 'sourced (LearnLattice)' },
    { subject: 'Mathematics', concept: 'relationships', lens: 'individual', q: 'If something changes at a constant rate, can you always predict the future? When does the straight-line model stop working?', source: 'sourced (LearnLattice)' },
    { subject: 'Mathematics', concept: 'validity', lens: 'global', q: 'Two politicians use the same data to argue opposite conclusions. How is that possible — and how do you know who is telling the truth?', source: 'sourced (LearnLattice)' },
    { subject: 'Mathematics', concept: 'quantity', lens: 'individual', q: 'When is being 95% confident not confident enough?', source: 'derived' },
    { subject: 'Mathematics', concept: 'form', lens: 'global', q: 'Can a perfect circle exist in the real world — or only in our heads?', source: 'derived' },
    { subject: 'Mathematics', concept: 'pattern', lens: 'global', q: 'Why are some patterns in nature impossible to write as a formula — and what does that say about maths itself?', source: 'derived' },

    // Arts
    { subject: 'Arts', concept: 'audience', lens: 'individual', q: 'Why does the same song make one person cry and another shrug?', source: 'derived' },
    { subject: 'Arts', concept: 'intention', lens: 'global', q: 'When does copying become creating?', source: 'derived' },
    { subject: 'Arts', concept: 'audience', lens: 'individual', q: 'Can art be art if no one ever sees it?', source: 'derived' },
    { subject: 'Arts', concept: 'expression', lens: 'global', q: 'Why have humans drawn on cave walls for 40,000 years — and why does it still feel urgent today?', source: 'derived' },
    { subject: 'Arts', concept: 'identity', lens: 'local', q: 'Whose face belongs on the stage in our community — and who decides?', source: 'derived' },
    { subject: 'Arts', concept: 'composition', lens: 'individual', q: 'Does an artist need a message — or is the feeling enough?', source: 'derived' },

    // Language & Literature
    { subject: 'Language & Literature', concept: 'power', lens: 'global', q: 'Why do the books that get banned often become the books we remember?', source: 'derived' },
    { subject: 'Language & Literature', concept: 'voice', lens: 'global', q: 'Can a translated poem still be the same poem?', source: 'derived' },
    { subject: 'Language & Literature', concept: 'perspective', lens: 'individual', q: 'When you read a 200-year-old novel, who is really telling the story — the author, the narrator, or you?', source: 'derived' },
    { subject: 'Language & Literature', concept: 'purpose', lens: 'global', q: 'Why do villains in stories sometimes feel more honest than the heroes?', source: 'derived' },
    { subject: 'Language & Literature', concept: 'structure', lens: 'individual', q: 'When does silence say more than words on the page?', source: 'derived' },
    { subject: 'Language & Literature', concept: 'audience', lens: 'local', q: 'Why does the same news story sound different in three different newspapers from the same city?', source: 'derived' },

    // Language Acquisition
    { subject: 'Language Acquisition', concept: 'culture', lens: 'individual', q: 'Why is it sometimes easier to say a hard thing in your second language?', source: 'derived' },
    { subject: 'Language Acquisition', concept: 'message', lens: 'individual', q: 'When does an accent stop being an accent and become part of who you are?', source: 'derived' },
    { subject: 'Language Acquisition', concept: 'meaning', lens: 'individual', q: 'Can you really say "I love you" in a language you didn\'t grow up in?', source: 'derived' },
    { subject: 'Language Acquisition', concept: 'culture', lens: 'global', q: 'Why do some jokes only work in their original language?', source: 'derived' },
    { subject: 'Language Acquisition', concept: 'register', lens: 'local', q: 'What does a polite request sound like in your target language — and why is it different from a polite request in your first language?', source: 'derived' },

    // Individuals & Societies
    { subject: 'Individuals & Societies', concept: 'equity', lens: 'global', q: 'Why does every civilisation invent its own version of fairness?', source: 'derived' },
    { subject: 'Individuals & Societies', concept: 'place', lens: 'individual', q: 'When does a city become "yours"?', source: 'derived' },
    { subject: 'Individuals & Societies', concept: 'power', lens: 'global', q: 'Who decides what counts as "history" — and who gets left out?', source: 'derived' },
    { subject: 'Individuals & Societies', concept: 'place', lens: 'global', q: 'If the borders we draw on maps are imaginary, why do they cause real wars?', source: 'derived' },
    { subject: 'Individuals & Societies', concept: 'causality', lens: 'local', q: 'When does economic growth start to hurt the people it was meant to help?', source: 'derived' },
    { subject: 'Individuals & Societies', concept: 'equity', lens: 'local', q: 'How do we know our laws are just — and what should we do when they are not?', source: 'derived' },

    // Physical & Health Education
    { subject: 'Physical & Health Ed', concept: 'performance', lens: 'individual', q: 'Why do we keep playing games we know we will lose?', source: 'derived' },
    { subject: 'Physical & Health Ed', concept: 'balance', lens: 'individual', q: 'When does training stop helping the body and start hurting it?', source: 'derived' },
    { subject: 'Physical & Health Ed', concept: 'performance', lens: 'individual', q: 'How can two athletes follow the same plan and end up at completely different fitness levels?', source: 'derived' },
    { subject: 'Physical & Health Ed', concept: 'well-being', lens: 'global', q: 'Why is movement medicine for the mind?', source: 'derived' },
    { subject: 'Physical & Health Ed', concept: 'identity', lens: 'local', q: 'When does the idea of being "healthy" stop being healthy?', source: 'derived' },

    // Design
    { subject: 'Design', concept: 'user', lens: 'individual', q: 'Why is the back of a TV remote the part most users hate — and who decided to design it that way?', source: 'derived' },
    { subject: 'Design', concept: 'sustainability', lens: 'global', q: 'When does the word "sustainable" on a product label start to lie?', source: 'derived' },
    { subject: 'Design', concept: 'iteration', lens: 'global', q: 'Why is the second version of almost anything better than the first?', source: 'derived' },
    { subject: 'Design', concept: 'user', lens: 'global', q: 'Can you design something for everyone — or are you always designing against someone?', source: 'derived' },
    { subject: 'Design', concept: 'function', lens: 'local', q: 'If a chair is beautiful but nobody can sit on it, is it still a chair?', source: 'derived' }
  ];

  /* ============================================================
     3. TRANSFORMERS — patterns that rewrite an SOI into an IQ
     Each transformer:
       label, match (regex with capture groups), build (function → string)
     ============================================================ */
  const transformers = [
    {
      label: 'X reflects / shows / reveals Y → Why does Y depend on X?',
      match: /^(.+?)\s+(reflects?|shows?|reveals?|demonstrates?)\s+(.+)$/i,
      build: (m) => `Why does ${m[3].replace(/\.$/, '')} depend on ${m[1]}?`
    },
    {
      label: 'X allows / enables Y → What would change if X could not Y?',
      match: /^(.+?)\s+(allows?|enables?|lets?|permits?)\s+(.+)$/i,
      build: (m) => `What would change if ${m[1]} could no longer ${m[3].replace(/\.$/, '')}?`
    },
    {
      label: 'X is / are Y → When is X not Y?',
      match: /^(.+?)\s+(is|are)\s+(.+)$/i,
      build: (m) => `When is ${m[1]} not ${m[3].replace(/\.$/, '')}?`
    },
    {
      label: 'X creates / produces Y → Who decides when X creates Y?',
      match: /^(.+?)\s+(creates?|produces?|generates?|makes?)\s+(.+)$/i,
      build: (m) => `Who decides whether ${m[1]} should ${m[2].replace(/s$/, '')} ${m[3].replace(/\.$/, '')}?`
    },
    {
      label: 'X impacts / affects Y → To what extent does X really change Y?',
      match: /^(.+?)\s+(impacts?|affects?|influences?|shapes?)\s+(.+)$/i,
      build: (m) => `To what extent does ${m[1]} really ${m[2].replace(/s$/, '')} ${m[3].replace(/\.$/, '')}?`
    },
    {
      label: 'Generic noun phrase → Two people study X and reach opposite conclusions',
      match: /^([A-Z][^.]+)\.?$/,
      build: (m) => `Two people study ${m[1].toLowerCase()} and reach opposite conclusions. How is that possible?`
    },
    {
      label: 'Generic noun phrase → If X disappeared tomorrow…',
      match: /^([A-Z][^.]+)\.?$/,
      build: (m) => `If ${m[1].toLowerCase()} disappeared tomorrow, what would break first?`
    },
    {
      label: 'Generic noun phrase → Why does every culture invent its own X?',
      match: /^([A-Z][^.]+)\.?$/,
      build: (m) => `Why does every culture in history invent its own version of ${m[1].toLowerCase()}?`
    },
    {
      label: 'Generic noun phrase → When does X stop working?',
      match: /^([A-Z][^.]+)\.?$/,
      build: (m) => `When does ${m[1].toLowerCase()} stop working — and who pays the price?`
    },
    {
      label: 'Generic noun phrase → Whose X gets to count?',
      match: /^([A-Z][^.]+)\.?$/,
      build: (m) => `Whose ${m[1].toLowerCase()} gets to count — and who decides?`
    }
  ];

  /* ============================================================
     4. CONCEPTS — sample Specified Concept lists per subject group
     (illustrative — schools may adapt / extend)
     ============================================================ */
  const concepts = {
    'Sciences':              ['models','evidence','systems','change','energy','scale','cause','patterns','interaction','consequence'],
    'Mathematics':           ['pattern','representation','relationships','quantity','validity','generalisation','form','space','model','equivalence'],
    'Arts':                  ['expression','audience','identity','aesthetics','composition','intention','interpretation','presentation','style','innovation'],
    'Language & Literature': ['perspective','voice','context','structure','purpose','audience','meaning','genre','representation','power'],
    'Language Acquisition':  ['meaning','audience','register','culture','message','purpose','function','context','convention','accent'],
    'Individuals & Societies':['power','causality','equity','time','place','systems','perspective','identity','interconnectedness','change'],
    'Design':                ['function','form','user','sustainability','iteration','communication','innovation','adaptation','collaboration','markets'],
    'Physical & Health Ed':  ['movement','well-being','balance','performance','identity','interaction','choice','perspective','adaptation','systems']
  };

  /* ============================================================
     5. TERMINOLOGY — outdated → enhanced mapping (for the picker)
     ============================================================ */
  const terminology = [
    { old: 'Service as Action',     new: 'Community Engagement' },
    { old: 'Key Concept',           new: 'Specified Concept' },
    { old: 'Related Concept',       new: 'Specified Concept (one list per subject)' },
    { old: 'Statement of Inquiry',  new: 'Inquiry Statement or Inquiry Question' },
    { old: 'Factual / Conceptual / Debatable', new: 'Free-form guiding questions' },
    { old: 'Implicit / Explicit ATL', new: 'ATL with teacher agency (when & how)' },
    { old: 'Service learning outcomes (7)', new: 'Community Engagement objectives (4)' },
    { old: 'Direct / Indirect service', new: 'Five forms of engagement (Advocacy, Action Research, Social Entrepreneurship, Participation, Community-building)' }
  ];

  /* ============================================================
     6. COMMUNITY ENGAGEMENT — partnership verbs (with vs for)
     ============================================================ */
  const ceFraming = {
    withVerbs: ['partner with','co-design','co-create','collaborate with','consult','interview','meet with','dialogue','listen to','learn from','build alongside','present to','exhibit with'],
    forVerbs:  ['donate to','give to','help them','do for them','provide for','raise money for','fundraise for','clean up for'],
    forms:     ['Advocacy','Action Research','Social Entrepreneurship','Participation','Community-building']
  };

  /* ============================================================
     7. ATL — verb hints per category (used to flag task/ATL mismatch)
     ============================================================ */
  const atlAlignment = {
    'Thinking':        ['analyse','evaluate','justify','compare','contrast','synthesise','transfer','apply','model','predict','infer'],
    'Communication':   ['present','explain','discuss','debate','write','articulate','convey','clarify','listen','feedback'],
    'Social':          ['collaborate','negotiate','share','co-design','resolve','co-create','partner','team'],
    'Self-management': ['plan','organise','schedule','reflect','persist','manage','prioritise','review','set goals'],
    'Research':        ['investigate','find','source','cite','evaluate sources','cross-reference','collect','observe','survey','sample','organise data']
  };

  /* ============================================================
     8. DIMENSION WEIGHTS — how rules roll up
     Each rule contributes to a dimension; scoring is in evaluator.js
     ============================================================ */
  const dimensions = {
    provocation:        { label: 'Provocation',         weight: 1.4 },
    openEndedness:      { label: 'Open-endedness',      weight: 1.3 },
    antiGoogleability:  { label: 'Anti-Googleability',  weight: 1.5 },
    specificity:        { label: 'Specificity',         weight: 1.2 },
    conceptDepth:       { label: 'Concept depth',       weight: 1.3 },
    mypAlignment:       { label: 'MYP alignment',       weight: 1.0 },
    partnership:        { label: 'Partnership',         weight: 1.5 },
    form:               { label: 'Form & action',       weight: 1.2 }
  };

  /* ============================================================
     Public API
     ============================================================ */
  return {
    rules,
    examples,
    transformers,
    concepts,
    terminology,
    ceFraming,
    atlAlignment,
    dimensions,
    helpers: { containsAny, startsWithAny, stripPlural }
  };
})();
