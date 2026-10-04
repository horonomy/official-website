/** Only generated canonical identity, never request queries, hashes or referrers. */
export function publicPageUrl(): string {
  const fallback = 'https://horonom.com/';
  try {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) return fallback;
    const url = new URL(canonical.href);
    if (url.origin !== 'https://horonom.com' || url.username || url.password) return fallback;
    return url.origin + url.pathname;
  } catch { return fallback; }
}

/** CTA telemetry identifies a public destination, not emails or repository names. */
export function publicDestination(raw: string): string {
  try {
    const url = new URL(raw, 'https://horonom.com');
    return url.protocol === 'https:' ? url.origin : '';
  } catch { return ''; }
}
