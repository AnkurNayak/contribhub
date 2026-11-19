// Contribution guide content shared by the page and the prerender plugin.

export const GUIDE_COMMANDS: [string, string][] = [
  ['git status', 'See changed and staged files'],
  ['git switch -c <branch>', 'Create and move to a new branch'],
  ['git add <file>', 'Stage a change for the next commit'],
  ['git commit -m "message"', 'Save staged changes as a commit'],
  ['git push -u origin <branch>', 'Publish your branch to your fork'],
  ['git fetch upstream', 'Download the latest from the original repo'],
  ['git rebase upstream/main', 'Replay your work on top of the latest code'],
  ['git log --oneline', 'View recent history in short form'],
]

export const GUIDE_PRACTICES = [
  'Read CONTRIBUTING and the code of conduct before you start.',
  'Comment on an issue and wait for a go-ahead before large changes.',
  'Keep each pull request focused on a single problem.',
  'Run the project’s tests and linter locally before pushing.',
  'Write commit messages that explain why, not just what.',
  'Link the issue in your pull request, e.g. “Fixes #123”.',
  'Treat review feedback as collaboration. Maintainers are often volunteers.',
  'Be patient, then send a polite follow-up after a week or two of silence.',
]

/** Plain-text summary of each step, used for the prerendered HTML. */
export const GUIDE_STEPS: [string, string][] = [
  ['Find a project', 'Start with something you already use or a language you’re learning. Check that it’s alive: recent commits, maintainers replying to issues, and a clear README. Issues labelled “good first issue” are picked by maintainers as a way in.'],
  ['Fork the repository', 'A fork is your own copy on GitHub, where you have permission to push. On the project’s page, select Fork, then Create fork, or run gh repo fork owner/project --clone.'],
  ['Clone your fork', 'Download your fork with git clone, then add the original repository as a remote named upstream so you can pull in new changes later.'],
  ['Create a branch', 'Keep each change on its own branch, so your default branch stays clean and you can work on several things at once: git switch -c fix/typo-in-readme upstream/main.'],
  ['Make your changes', 'Follow the project’s setup instructions and match its code style. Make small commits, run the tests, then push the branch to your fork.'],
  ['Open a pull request', 'On GitHub, choose Compare & pull request. Say what changed and why, link the issue, and add screenshots for visual changes. Push more commits to the same branch to respond to review.'],
]

export const GUIDE_FAQ: [string, string][] = [
  [
    'What is a good first issue?',
    'A good first issue is a GitHub issue that a project’s maintainers have labelled as suitable for newcomers. It is usually small, well described and does not need deep knowledge of the codebase, so it is a practical way to make your first open-source contribution.',
  ],
  [
    'Do I need to be an expert programmer to contribute to open source?',
    'No. Many contributions are documentation fixes, tests, translations or small bug fixes. Pick an issue that matches what you already know, read the project’s CONTRIBUTING file, and ask questions on the issue if something is unclear.',
  ],
  [
    'How do I find beginner-friendly open-source projects?',
    'Look for active projects (recent commits and maintainers who reply to issues) that label issues with “good first issue” or “help wanted”. ContribHub searches all public GitHub repositories for these labels and lets you filter by programming language.',
  ],
  [
    'Should I ask before working on an issue?',
    'Yes. Leave a short comment saying you would like to work on it and wait for a maintainer to confirm. This avoids two people solving the same problem and lets maintainers point you in the right direction.',
  ],
  [
    'What if my pull request is not reviewed?',
    'Maintainers are often volunteers. Wait a week or two, then leave one polite follow-up comment. In the meantime, make sure your tests pass and your pull request description explains the change.',
  ],
]
