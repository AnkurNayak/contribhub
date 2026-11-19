// Site-wide SEO values. Imported by the app and by the build-time prerender plugin,
// so this file must stay free of `@/` aliases and `import.meta.env`.

export const SITE_URL = 'https://contribhub.online'
export const SITE_NAME = 'ContribHub'
export const SITE_TITLE = 'ContribHub: Find Good First Issues & Open-Source Projects for Beginners'
export const SITE_DESCRIPTION =
  'Find good first issues and beginner-friendly open-source projects on GitHub. Filter issues by language and label, follow a step-by-step guide, and make your first contribution. Free, no sign-up.'
export const OG_IMAGE = `${SITE_URL}/og-image.png`
export const OG_IMAGE_ALT = 'ContribHub: Your next open-source contribution starts here.'
export const REPO_URL = 'https://github.com/AnkurNayak/contribhub'

/** Page titles get the brand appended; the home page uses SITE_TITLE as-is. */
export function fullTitle(title: string): string {
  return title ? `${title} · ${SITE_NAME}` : SITE_TITLE
}

export function absoluteUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}
