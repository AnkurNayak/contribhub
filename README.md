# ContribHub

Find your next open-source contribution. ContribHub helps developers discover GitHub projects and beginner-friendly issues, using live data from the public GitHub API. There's no backend and no sign-up.

## Features

- **Explore Projects:** search repositories and filter by language, stars and topic, sorted by stars or recent updates.
- **Find Issues:** browse open issues by label (good first issue, help wanted, documentation, bug, feature request), language, repository and recency.
- **Project pages:** README preview, open and good first issues, latest commits, and contribution steps tailored to each repository.
- **Trending:** fast-rising new repositories over daily, weekly and monthly windows, with the method explained in the app.
- **Bookmarks:** save projects and issues, search them and organize them into collections. They're stored in your browser, with JSON export and import.
- **Global search:** press `Ctrl/Cmd + K` to find projects, issues, languages and exact `owner/repo` names.
- **Contribution Guide:** the fork, branch and pull request workflow, step by step.
- Light and dark themes, a responsive layout, keyboard navigation and graceful rate-limit handling.

## Getting started

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/AnkurNayak/contribhub.git
cd contribhub
npm install
npm run dev
```

Then open http://localhost:5173.

| Command             | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the development server    |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run preview`   | Serve the production build      |
| `npm run lint`      | Run ESLint                      |
| `npm test`          | Run unit tests                  |

### Configuration

Copy `.env.example` to `.env` to customize the build. Both settings are optional:

- `VITE_PROJECT_REPO_URL`: where the GitHub icon in the top bar links. Set this to your repository.
- `VITE_BASE`: base path, needed only for GitHub Pages project sites (for example `/contribhub/`).

## GitHub API limits

| Access              | Search requests | Other requests |
| ------------------- | --------------- | -------------- |
| Anonymous (default) | 10 per minute   | 60 per hour    |
| With a free token   | 30 per minute   | 5,000 per hour |

Limits apply per IP address or per token. ContribHub debounces input, caches responses and shares requests between widgets. If you hit a limit, the app shows a countdown instead of failing.

To raise your limits, create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with public-repository read-only access and paste it into **Settings**. The token is stored in your browser's local storage and sent only to `api.github.com`, so avoid saving one on a shared computer.

### Known limitations

- **Trending is an estimate.** GitHub has no trending API, so ContribHub ranks recently created repositories by stars per day. Established projects having a good week won't appear.
- **Issue language can be missing.** Issue search results don't include a language, so it's looked up per repository and cached. To protect your request budget, lookups stop when the remaining budget runs low, and the language tag is hidden.
- **Search stops at 1,000 results.** This is a limit of the GitHub search API.
- **Open-issue counts on repositories include pull requests.** GitHub reports them as one number.

## Deployment

The app builds to static files, so any free static host works. Client-side routes need a fallback to `index.html`:

- **Vercel:** import the repository. `vercel.json` is included.
- **Netlify / Cloudflare Pages:** use build command `npm run build` and output directory `dist`. `public/_redirects` is included.
- **GitHub Pages:** build with `VITE_BASE=/your-repo-name/` and copy `dist/index.html` to `dist/404.html`.

## Project structure

```text
src/
  components/
    common/     Shared pieces: states, pagination, code blocks, Markdown
    dashboard/  Stat tiles, landing-page preview, shared queries
    issues/     Issue cards, list and filters
    layout/     App shell, sidebar, top bar, global search
    projects/   Repository cards, filters and detail tabs
    ui/         shadcn/ui-style primitives built on Radix
  context/      Theme, preferences and bookmarks
  hooks/        Data fetching and small utilities
  pages/        One lazily loaded component per route
  services/     GitHub API client and rate-limit tracking
  types/        Shared TypeScript types
  utils/        Query builders, formatting, constants
```

## Tech stack

React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, shadcn/ui conventions with Radix primitives, and Lucide icons.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
