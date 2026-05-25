// estimateReadTime takes raw HTML (or plain text) and returns a tidy
// "5 min read" style label. 220 wpm is the common middle-of-the-road
// figure for English long-form. Anything under a minute is shown as
// "1 min read" rather than "0 min read".

export function estimateReadTime(input: string): string {
  if (!input) return "1 min read";
  // Strip tags + collapse whitespace so embedded HTML doesn't inflate
  // the word count.
  const plain = input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return "1 min read";
  const words = plain.split(" ").length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}
