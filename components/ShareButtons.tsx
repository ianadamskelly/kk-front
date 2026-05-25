"use client";

import { useState } from "react";
import {
  FacebookIcon,
  LinkIcon,
  LinkedInIcon,
  TwitterIcon,
  CheckIcon,
} from "./icons/BrandIcons";

// ShareButtons renders four icon-only circular buttons (X, Facebook,
// LinkedIn, copy-link) with hover-to-brand tint. Aria-labels keep them
// accessible; the copy button briefly swaps to a checkmark on success.
const btnClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/65 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const openShare = (target: "x" | "facebook" | "linkedin") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const endpoints: Record<typeof target, string> = {
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(
      endpoints[target],
      "_blank",
      "noopener,noreferrer,width=600,height=520",
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied; fail quietly.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-ink/45">
        Share
      </span>
      <button
        type="button"
        onClick={() => openShare("x")}
        aria-label="Share on X (Twitter)"
        title="Share on X"
        className={btnClass}
      >
        <TwitterIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openShare("facebook")}
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className={btnClass}
      >
        <FacebookIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openShare("linkedin")}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className={btnClass}
      >
        <LinkedInIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
        className={`${btnClass} ${
          copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : ""
        }`}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
