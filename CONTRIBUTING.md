# Contributing to ContribHub

Thanks for helping out! New contributors are welcome, and this project exists to make a first contribution easier.

## Set up

1. Fork the repository and clone your fork.
2. Run `npm install`, then `npm run dev`.
3. Create a branch: `git switch -c fix/short-description`.

If you hit GitHub API limits while developing, add a token in the app's **Settings** page.

## Before opening a pull request

Run these and make sure they all pass:

```bash
npm run lint
npm test
npm run build
```

Then check your change by hand in both light and dark themes, and at a mobile width.

## Guidelines

- **Keep pull requests focused.** One problem per pull request. For larger changes, open an issue first so we can agree on the approach.
- **Keep API logic out of components.** Requests belong in `src/services/github.ts`, and React Query hooks belong in `src/hooks/useGitHub.ts`.
- **Respect the rate limit.** Anonymous users get 10 searches a minute. Reuse existing queries where you can, and debounce anything driven by typing.
- **Never present sample data as live.** Label anything that isn't real GitHub data.
- **Handle every state.** Data-driven UI needs loading, empty and error states.
- **Keep it accessible.** Use semantic HTML, make everything work with a keyboard, and label icon-only buttons.
- **Use design tokens.** Use the theme colors from `src/index.css` rather than hard-coded colors, so both themes keep working.

## Reporting bugs

Open an issue with the steps to reproduce it, what you expected, what happened, and your browser. Screenshots help with visual problems.

## Conduct

Be kind and assume good intent. Harassment or disrespect of any kind isn't acceptable.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
