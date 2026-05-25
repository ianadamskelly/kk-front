import FaqIllustration from "./FaqIllustration";

// FaqSection is the standard "questions on the right, art on the left"
// FAQ block. Built on the native <details>/<summary> primitives — fully
// keyboard accessible with no JS required.
//
// Pass any array of { question, answer } pairs to reuse this on other
// pages (services, membership, etc.).

interface Item {
  question: string;
  answer: string;
}

interface Props {
  eyebrow?: string;
  title?: string;
  items: Item[];
}

export default function FaqSection({
  eyebrow,
  title = "FAQ",
  items,
}: Props) {
  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-4">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Illustration */}
        <div className="order-2 lg:order-1">
          <FaqIllustration className="mx-auto h-auto w-full max-w-md" />
        </div>

        {/* Q&A column */}
        <div className="order-1 lg:order-2">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {title}
          </h2>

          <div className="mt-8 space-y-3">
            {items.map((item, i) => (
              <FaqItem
                key={i}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// FaqItem renders one collapsible pill. Closed state matches the mockup
// (orange pill with white + indicator); open state reveals the answer in
// a softer cream panel below, with the + rotating to ×.
function FaqItem({ question, answer }: Item) {
  return (
    <details className="group overflow-hidden rounded-2xl bg-brand-400 text-white transition-colors open:bg-brand-500">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold leading-snug sm:px-6 sm:py-5 sm:text-lg [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl font-light transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-white/15 bg-brand-500 px-5 py-4 text-sm leading-relaxed text-white/90 sm:px-6 sm:py-5">
        {answer}
      </div>
    </details>
  );
}
