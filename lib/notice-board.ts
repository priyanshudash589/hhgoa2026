export const NOTICE_MAX_WORDS = 50;

export type Notice = {
  id: string;
  text: string;
  linkLabel: string | null;
  linkUrl: string | null;
  createdAt: string;
};

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// A bare domain/path typed without a scheme (e.g. "wa.me/123", "instagram.com/hhgoa")
// would otherwise render as a broken relative link. Leave already-schemed URLs
// (http:, https:, mailto:, tel:, …) and intentional in-site paths ("/terms") alone.
export function normalizeNoticeUrl(raw: string): string {
  if (raw.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  return `https://${raw}`;
}

export function validateNoticeInput(input: {
  text: unknown;
  linkLabel: unknown;
  linkUrl: unknown;
}): { ok: true; value: { text: string; linkLabel: string | null; linkUrl: string | null } } | { ok: false; error: string } {
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const linkLabelRaw = typeof input.linkLabel === "string" ? input.linkLabel.trim() : "";
  const linkUrlRaw = typeof input.linkUrl === "string" ? input.linkUrl.trim() : "";

  if (!text) {
    return { ok: false, error: "Notice text is required." };
  }
  if (countWords(text) > NOTICE_MAX_WORDS) {
    return { ok: false, error: `Notice text must be ${NOTICE_MAX_WORDS} words or fewer.` };
  }

  // A URL with no label still needs something clickable to show; a label with
  // no URL has nothing to link to and is just dropped — neither case should
  // block the notice from publishing.
  const linkUrl = linkUrlRaw ? normalizeNoticeUrl(linkUrlRaw) : null;
  const linkLabel = linkUrl ? linkLabelRaw || "Learn more" : null;

  return {
    ok: true,
    value: { text, linkLabel, linkUrl },
  };
}
