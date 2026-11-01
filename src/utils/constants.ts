export const PROJECT_REPO_URL = import.meta.env?.VITE_PROJECT_REPO_URL || 'https://github.com/AnkurNayak/contribhub'

/** Language name → GitHub linguist color. Also the list offered in filters. */
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  R: '#198CE7',
  Zig: '#ec915c',
}

export const LANGUAGES = Object.keys(LANGUAGE_COLORS)

export const POPULAR_TOPICS = [
  'react',
  'machine-learning',
  'cli',
  'devops',
  'web',
  'api',
  'database',
  'game',
  'mobile',
  'security',
  'hacktoberfest',
  'documentation',
]

export const STAR_OPTIONS = [
  { value: 0, label: 'Any stars' },
  { value: 100, label: '100+ stars' },
  { value: 1000, label: '1k+ stars' },
  { value: 10000, label: '10k+ stars' },
  { value: 50000, label: '50k+ stars' },
]

/** `query` is one label qualifier value; comma-separated values mean OR on GitHub. */
export const ISSUE_LABELS = [
  { id: 'good-first-issue', name: 'Good first issue', query: '"good first issue"' },
  { id: 'help-wanted', name: 'Help wanted', query: '"help wanted"' },
  { id: 'documentation', name: 'Documentation', query: 'documentation,docs' },
  { id: 'bug', name: 'Bug', query: 'bug' },
  { id: 'feature', name: 'Feature request', query: 'enhancement,feature,"feature request"' },
] as const

export const PER_PAGE_OPTIONS = [12, 24, 48]

/** GitHub's search API never returns more than this many results for a query. */
export const SEARCH_RESULT_CAP = 1000
