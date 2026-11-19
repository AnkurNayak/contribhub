// Single source of truth for indexable routes: page titles and descriptions (used by
// the app at runtime), plus the static HTML, structured data, sitemap and llms.txt
// entries that the prerender plugin writes at build time.
import { GUIDE_FAQ, GUIDE_PRACTICES, GUIDE_STEPS } from './guide.ts'
import { LANGUAGE_PAGES, type LanguagePage } from './languages.ts'
import { absoluteUrl, OG_IMAGE, REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site.ts'

export interface PageMeta {
  title: string
  description: string
}

export const PAGE_META = {
  home: { title: '', description: SITE_DESCRIPTION },
  issues: {
    title: 'Good First Issues on GitHub, Updated Live',
    description:
      'Browse open good first issues and help wanted issues from public GitHub repositories, updated live. Filter by programming language, label and repository to find your first contribution.',
  },
  explore: {
    title: 'Explore Open-Source Projects to Contribute To',
    description:
      'Search open-source projects on GitHub to contribute to. Filter repositories by language, stars and topic, and see beginner-friendly issues for each project.',
  },
  trending: {
    title: 'Trending GitHub Repositories Today, This Week and This Month',
    description:
      'See new GitHub repositories gaining stars fastest today, this week and this month, ranked by stars per day and filterable by programming language.',
  },
  guide: {
    title: 'How to Contribute to Open Source: A Beginner’s Guide',
    description:
      'A step-by-step beginner guide to contributing to open source: find a project, fork, clone, create a branch, open your first pull request, plus common Git commands and good practices.',
  },
  languages: {
    title: 'Good First Issues by Programming Language',
    description:
      'Find good first issues for beginners in JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#, PHP, Ruby, Kotlin and Swift: live, unassigned issues from public GitHub repositories.',
  },
} satisfies Record<string, PageMeta>

export function languageMeta(page: LanguagePage): PageMeta {
  return {
    title: `${page.language} Good First Issues for Beginners`,
    description: `Find open, unassigned good first issues in ${page.language} projects on GitHub, updated live. Typical beginner tasks, setup commands and popular ${page.language} repositories to contribute to.`,
  }
}

// ---------------------------------------------------------------------------
// Build-time data

export interface PrerenderRoute extends PageMeta {
  path: string
  /** Output file inside dist/, e.g. "issues.html". */
  file: string
  noindex?: boolean
  inSitemap?: boolean
  priority?: number
  changefreq?: 'hourly' | 'daily' | 'weekly' | 'monthly'
  jsonLd?: object[]
  /** Crawlable HTML placed in #root until the app mounts. */
  body?: string
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const e = escapeHtml

function breadcrumbs(items: [string, string][]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}

function webPage(type: string, path: string, meta: PageMeta, extra: object = {}): object {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: meta.title || SITE_NAME,
    description: meta.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...extra,
  }
}

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: [REPO_URL],
}

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: 'Contrib Hub',
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
}

const WEB_APPLICATION = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  image: OG_IMAGE,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@id': `${SITE_URL}/#organization` },
}

function shell(content: string): string {
  return `<div style="max-width:960px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif;line-height:1.6">${content}</div>`
}

function list(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
}

const languageLinks = list(
  LANGUAGE_PAGES.map((p) => `<a href="/good-first-issues/${p.slug}">${e(p.language)} good first issues</a>`),
)

const mainLinks = list([
  '<a href="/issues">Find good first issues</a>',
  '<a href="/explore">Explore open-source projects</a>',
  '<a href="/trending">Trending GitHub repositories</a>',
  '<a href="/good-first-issues">Good first issues by language</a>',
  '<a href="/guide">How to contribute to open source</a>',
])

function faqHtml(): string {
  return GUIDE_FAQ.map(([q, a]) => `<h3>${e(q)}</h3><p>${e(a)}</p>`).join('')
}

function languageRoute(page: LanguagePage): PrerenderRoute {
  const meta = languageMeta(page)
  const path = `/good-first-issues/${page.slug}`
  return {
    ...meta,
    path,
    file: `good-first-issues/${page.slug}.html`,
    inSitemap: true,
    priority: 0.8,
    changefreq: 'daily',
    jsonLd: [
      webPage('CollectionPage', path, meta, { about: { '@type': 'ComputerLanguage', name: page.language } }),
      breadcrumbs([
        ['Home', '/'],
        ['Good first issues', '/good-first-issues'],
        [page.language, path],
      ]),
    ],
    body: shell(
      `<h1>${e(page.language)} good first issues</h1>` +
        `<p>${e(page.intro)}</p>` +
        `<h2>Typical first ${e(page.language)} contributions</h2>${list(page.tasks.map(e))}` +
        `<h2>Set up a ${e(page.language)} project</h2><pre><code>${e(page.setup)}</code></pre><p>${e(page.setupNote)}</p>` +
        `<h2>Popular ${e(page.language)} projects</h2>` +
        list(page.projects.map((r) => `<a href="/projects/${r}">${e(r)}</a>`)) +
        `<p><a href="/issues?language=${encodeURIComponent(page.language)}">Filter all ${e(page.language)} issues</a> · <a href="/guide">How to make your first pull request</a></p>` +
        `<h2>Good first issues in other languages</h2>${languageLinks}`,
    ),
  }
}

export function prerenderRoutes(): PrerenderRoute[] {
  return [
    {
      ...PAGE_META.home,
      path: '/',
      file: 'index.html',
      inSitemap: true,
      priority: 1,
      changefreq: 'daily',
      jsonLd: [WEBSITE, ORGANIZATION, WEB_APPLICATION],
      body: shell(
        '<h1>Find good first issues and open-source projects for beginners</h1>' +
          '<p>Your next open-source contribution starts here. ContribHub helps developers discover beginner-friendly GitHub projects, find good first issues that match their skills, and make their first pull request. Free, with no sign-up.</p>' +
          mainLinks +
          `<h2>Good first issues by language</h2>${languageLinks}`,
      ),
    },
    {
      ...PAGE_META.issues,
      path: '/issues',
      file: 'issues.html',
      inSitemap: true,
      priority: 0.9,
      changefreq: 'hourly',
      jsonLd: [webPage('CollectionPage', '/issues', PAGE_META.issues), breadcrumbs([['Home', '/'], ['Find issues', '/issues']])],
      body: shell(
        '<h1>Find good first issues on GitHub</h1>' +
          '<p>Open issues from public GitHub repositories, starting with issues labelled “good first issue”. Combine labels such as help wanted, documentation and bug, filter by programming language or repository, and show only unassigned or recently updated issues.</p>' +
          `<h2>Good first issues by language</h2>${languageLinks}` +
          '<p>New to contributing? Read <a href="/guide">how to contribute to open source</a>.</p>',
      ),
    },
    {
      ...PAGE_META.languages,
      path: '/good-first-issues',
      file: 'good-first-issues.html',
      inSitemap: true,
      priority: 0.9,
      changefreq: 'daily',
      jsonLd: [
        webPage('CollectionPage', '/good-first-issues', PAGE_META.languages),
        breadcrumbs([['Home', '/'], ['Good first issues', '/good-first-issues']]),
      ],
      body: shell(
        '<h1>Good first issues by programming language</h1>' +
          '<p>Pick the language you know best and see open, unassigned GitHub issues that maintainers have labelled as good first issues. Each page lists typical beginner tasks, setup commands and popular projects for that ecosystem.</p>' +
          languageLinks,
      ),
    },
    ...LANGUAGE_PAGES.map(languageRoute),
    {
      ...PAGE_META.explore,
      path: '/explore',
      file: 'explore.html',
      inSitemap: true,
      priority: 0.8,
      changefreq: 'daily',
      jsonLd: [webPage('CollectionPage', '/explore', PAGE_META.explore), breadcrumbs([['Home', '/'], ['Explore projects', '/explore']])],
      body: shell(
        '<h1>Explore open-source projects</h1>' +
          '<p>Search public GitHub repositories and narrow them down by language, popularity and topic. Each project page shows its README, recent activity, open good first issues and how to start contributing.</p>' +
          mainLinks,
      ),
    },
    {
      ...PAGE_META.trending,
      path: '/trending',
      file: 'trending.html',
      inSitemap: true,
      priority: 0.7,
      changefreq: 'daily',
      jsonLd: [webPage('CollectionPage', '/trending', PAGE_META.trending), breadcrumbs([['Home', '/'], ['Trending', '/trending']])],
      body: shell(
        '<h1>Trending GitHub repositories</h1>' +
          '<p>New repositories gaining stars fastest, ranked by stars per day. Switch between daily, weekly and monthly windows and filter by programming language.</p>' +
          mainLinks,
      ),
    },
    {
      ...PAGE_META.guide,
      path: '/guide',
      file: 'guide.html',
      inSitemap: true,
      priority: 0.9,
      changefreq: 'monthly',
      jsonLd: [
        webPage('WebPage', '/guide', PAGE_META.guide, {
          mainEntity: {
            '@type': 'TechArticle',
            headline: PAGE_META.guide.title,
            description: PAGE_META.guide.description,
            proficiencyLevel: 'Beginner',
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            image: OG_IMAGE,
          },
        }),
        breadcrumbs([['Home', '/'], ['Contribution guide', '/guide']]),
      ],
      body: shell(
        '<h1>How to contribute to open source</h1>' +
          '<p>From “where do I start?” to your first merged pull request, in six steps. Open-source software has source code anyone can read, use and improve under the terms of its license. Contributions aren’t only code: documentation, bug reports, tests, translations and design all count.</p>' +
          GUIDE_STEPS.map(([title, text], i) => `<h2>${i + 1}. ${e(title)}</h2><p>${e(text)}</p>`).join('') +
          `<h2>Good practices</h2>${list(GUIDE_PRACTICES.map(e))}` +
          `<h2>Frequently asked questions</h2>${faqHtml()}` +
          '<p><a href="/issues">Browse good first issues</a></p>',
      ),
    },
    // App-only pages: prerendered so the noindex is in the raw HTML, never in the sitemap.
    ...(
      [
        ['/overview', 'Overview'],
        ['/bookmarks', 'My Bookmarks'],
        ['/settings', 'Settings'],
        ['/search', 'Search'],
      ] as const
    ).map(([path, title]) => ({
      path,
      file: `${path.slice(1)}.html`,
      title,
      description: SITE_DESCRIPTION,
      noindex: true,
    })),
  ]
}

/** Project pages linked from the language pages: listed in the sitemap, rendered client-side. */
export function featuredProjectPaths(): string[] {
  return [...new Set(LANGUAGE_PAGES.flatMap((p) => p.projects))].map((repo) => `/projects/${repo}`)
}
