import DOMPurify, { Config } from 'dompurify';

const defaultConfig: Config = {
  USE_PROFILES: { html: true },
};

export function sanitizeHtml(html: string, config: Config = defaultConfig): string {
  // Guard untuk SSR / non-DOM
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, config) as string;
}

export default sanitizeHtml;