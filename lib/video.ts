const DIRECT_VIDEO_RE = /\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i;

export type LessonVideo =
  | { kind: "file"; src: string }
  | { kind: "embed"; src: string };

function youtubeVideoId(url: URL): string {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") {
    return "";
  }
  if (url.pathname === "/watch") return url.searchParams.get("v") || "";
  const parts = url.pathname.split("/").filter(Boolean);
  if (["embed", "shorts", "live"].includes(parts[0])) return parts[1] || "";
  return "";
}

export function lessonVideo(url: string): LessonVideo | null {
  const value = url.trim();
  if (!value) return null;
  if (DIRECT_VIDEO_RE.test(value)) return { kind: "file", src: value };

  try {
    const parsed = new URL(value);
    const id = youtubeVideoId(parsed);
    if (id) {
      return {
        kind: "embed",
        src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
      };
    }
  } catch {
    return { kind: "embed", src: value };
  }

  return { kind: "embed", src: value };
}
