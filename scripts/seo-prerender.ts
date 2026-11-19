// Vite plugin: after the client build, writes one HTML file per indexable route with
// its own <head> (title, description, canonical, Open Graph, JSON-LD, robots) and
// crawlable body text, plus 404.html, an app shell for dynamic routes, sitemap.xml,
// robots.txt and llms.txt. Crawlers that don't run JavaScript (and social previews)
// then see a distinct page per URL instead of one shared index.html.
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { LANGUAGE_PAGES } from '../src/seo/languages.ts'
import { escapeHtml, featuredProjectPaths, PAGE_META, prerenderRoutes, type PrerenderRoute } from '../src/seo/routes.ts'
import { absoluteUrl, fullTitle, OG_IMAGE, OG_IMAGE_ALT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../src/seo/site.ts'

const HEAD_PATTERN = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/
const ROOT_PATTERN = /<div id="root"><\/div>/

interface HeadOptions {
  title: string
  description: string
  /** Absent for the 404 page and the shell used by dynamic routes. */
  canonicalPath?: string
  noindex?: boolean
  jsonLd?: object[]
}

function renderHead({ title, description, canonicalPath, noindex, jsonLd = [] }: HeadOptions): string {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const url = canonicalPath ? absoluteUrl(canonicalPath) : undefined
  const lines = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}" />`,
    url && `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_US" />`,
    url && `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(OG_IMAGE_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(OG_IMAGE_ALT)}" />`,
    ...jsonLd.map(
      (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`,
    ),
  ]
  return lines.filter(Boolean).join('\n    ')
}

function renderPage(template: string, head: HeadOptions, body = ''): string {
  if (!HEAD_PATTERN.test(template) || !ROOT_PATTERN.test(template)) {
    throw new Error('seo-prerender: index.html is missing the <!-- seo:start/end --> markers or <div id="root"></div>')
  }
  return template.replace(HEAD_PATTERN, renderHead(head)).replace(ROOT_PATTERN, `<div id="root">${body}</div>`)
}

function sitemap(routes: PrerenderRoute[], lastmod: string): string {
  const entries = [
    ...routes
      .filter((r) => r.inSitemap && !r.noindex)
      .map((r) => ({ loc: absoluteUrl(r.path), priority: r.priority ?? 0.5, changefreq: r.changefreq ?? 'weekly' })),
    ...featuredProjectPaths().map((p) => ({ loc: absoluteUrl(p), priority: 0.6, changefreq: 'daily' as const })),
  ]
  const urls = entries
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeHtml(u.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robots(): string {
  return [
    '# Search engines and AI assistants are welcome to crawl ContribHub.',
    'User-agent: *',
    // Not disallowing /search, /settings etc.: they carry noindex in their HTML, and a
    // Disallow would stop crawlers from ever seeing it.
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}

function llmsTxt(): string {
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'ContribHub is a free web app that searches public GitHub repositories for beginner-friendly issues (labelled “good first issue” or “help wanted”) and open-source projects. Data comes live from the GitHub public API; no account is needed.',
    '',
    '## Main pages',
    '',
    `- [Find good first issues](${SITE_URL}/issues): ${PAGE_META.issues.description}`,
    `- [Good first issues by language](${SITE_URL}/good-first-issues): ${PAGE_META.languages.description}`,
    `- [Explore open-source projects](${SITE_URL}/explore): ${PAGE_META.explore.description}`,
    `- [Trending GitHub repositories](${SITE_URL}/trending): ${PAGE_META.trending.description}`,
    `- [How to contribute to open source](${SITE_URL}/guide): ${PAGE_META.guide.description}`,
    '',
    '## Good first issues by language',
    '',
    ...LANGUAGE_PAGES.map((p) => `- [${p.language} good first issues](${SITE_URL}/good-first-issues/${p.slug})`),
    '',
  ].join('\n')
}

export function seoPrerender(): Plugin {
  let outDir = 'dist'
  return {
    name: 'contribhub-seo-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const routes = prerenderRoutes()
      const write = (file: string, content: string) => {
        const target = path.join(outDir, file)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, content)
      }

      for (const route of routes) {
        write(
          route.file,
          renderPage(
            template,
            {
              title: fullTitle(route.title),
              description: route.description,
              canonicalPath: route.noindex ? undefined : route.path,
              noindex: route.noindex,
              jsonLd: route.jsonLd,
            },
            route.body,
          ),
        )
      }

      // Served by the host with a real 404 status; the app then shows its Not Found page.
      write('404.html', renderPage(template, { title: fullTitle('Page not found'), description: SITE_DESCRIPTION, noindex: true }))
      // Rewrite target for /projects/:owner/:repo. No canonical here: the app sets the
      // page's own canonical, and a conflicting raw-HTML canonical would confuse Google.
      write('_shell.html', renderPage(template, { title: fullTitle(''), description: SITE_DESCRIPTION }))

      write('sitemap.xml', sitemap(routes, new Date().toISOString().slice(0, 10)))
      write('robots.txt', robots())
      write('llms.txt', llmsTxt())
    },
  }
}
