// Content for the /good-first-issues/:language landing pages. Each entry is written
// for its own ecosystem so the pages stand on their own, not as one template with a
// swapped name. Shared with the prerender plugin: keep it free of `@/` imports.

export interface LanguagePage {
  slug: string
  /** Must match a key of LANGUAGE_COLORS, since it is passed to GitHub's language: qualifier. */
  language: string
  intro: string
  /** Typical first contributions in this ecosystem. */
  tasks: string[]
  /** Commands a newcomer usually runs before opening a pull request. */
  setup: string
  setupNote: string
  /** Well-known repositories, linked to their ContribHub project pages. */
  projects: string[]
}

export const LANGUAGE_PAGES: LanguagePage[] = [
  {
    slug: 'javascript',
    language: 'JavaScript',
    intro:
      'JavaScript has more open-source repositories on GitHub than almost any other language, which means more good first issues to choose from: front-end libraries, Node.js tools, browser extensions and documentation sites all need help. Many JavaScript projects label small, well-scoped tasks so newcomers can learn the codebase one fix at a time.',
    tasks: [
      'Fix a small UI bug or an accessibility issue such as a missing label',
      'Add a test case for an edge case reported in an issue',
      'Update outdated examples in a README or documentation site',
      'Replace a deprecated API call or dependency',
    ],
    setup: 'npm install\nnpm test\nnpm run lint',
    setupNote: 'Check package.json for the project’s own script names. Some projects use pnpm or yarn instead of npm.',
    projects: ['freeCodeCamp/freeCodeCamp', 'nodejs/node', 'mdn/content'],
  },
  {
    slug: 'typescript',
    language: 'TypeScript',
    intro:
      'TypeScript projects are a good place to start because the type checker catches many mistakes before a maintainer ever sees your pull request. Beginner issues often involve tightening types, fixing editor-facing bugs or improving error messages, work that teaches you how a large codebase fits together.',
    tasks: [
      'Replace an `any` with a precise type',
      'Fix a type error reported by users on a newer TypeScript version',
      'Improve an error message or a code comment',
      'Add a missing unit test for a utility function',
    ],
    setup: 'npm install\nnpx tsc --noEmit\nnpm test',
    setupNote: 'Running the type checker before you push saves a review round. Most projects run it in CI as well.',
    projects: ['microsoft/vscode', 'excalidraw/excalidraw', 'microsoft/TypeScript'],
  },
  {
    slug: 'python',
    language: 'Python',
    intro:
      'Python’s readable syntax makes it one of the friendliest languages for a first open-source contribution. Data science libraries, web frameworks, automation tools and home-automation integrations all tag good first issues, and many have detailed contributor guides that walk you through setting up a development environment.',
    tasks: [
      'Fix a documentation example that no longer runs',
      'Add type hints to an untyped module',
      'Write a regression test for a reported bug',
      'Improve a confusing exception message',
    ],
    setup: 'python -m venv .venv\nsource .venv/bin/activate\npip install -e ".[dev]"\npytest',
    setupNote: 'On Windows, activate with .venv\\Scripts\\activate. Many projects also run ruff or black for formatting.',
    projects: ['pandas-dev/pandas', 'scikit-learn/scikit-learn', 'home-assistant/core'],
  },
  {
    slug: 'java',
    language: 'Java',
    intro:
      'Java powers enterprise backends, Android apps and developer tools, and its open-source projects tend to have strong conventions and thorough test suites. That structure helps newcomers: good first issues in Java projects usually come with a clear expected behaviour and a test you can run to prove your fix.',
    tasks: [
      'Fix a bug with a failing JUnit test attached',
      'Refactor duplicated code into a shared method',
      'Improve Javadoc for a public API',
      'Update a dependency and fix the resulting compile errors',
    ],
    setup: './gradlew build\n# or, for Maven projects:\nmvn verify',
    setupNote: 'Use the wrapper script (gradlew or mvnw) checked into the repository so your build matches CI.',
    projects: ['JabRef/jabref', 'spring-projects/spring-boot', 'apache/kafka'],
  },
  {
    slug: 'go',
    language: 'Go',
    intro:
      'Go’s small language surface and built-in tooling (formatting, testing and vetting all ship with the compiler) mean you spend less time on setup and more on the actual fix. Cloud-native infrastructure such as container tools, CLIs and monitoring systems is largely written in Go, and those projects regularly label beginner-friendly issues.',
    tasks: [
      'Add a missing test for an exported function',
      'Improve a CLI flag’s help text or error output',
      'Fix a linter warning reported by go vet',
      'Document an exported type or package',
    ],
    setup: 'go build ./...\ngo test ./...\ngo vet ./...',
    setupNote: 'Run gofmt (or goimports) before committing. Go projects expect standard formatting.',
    projects: ['cli/cli', 'kubernetes/kubernetes', 'prometheus/prometheus'],
  },
  {
    slug: 'rust',
    language: 'Rust',
    intro:
      'The Rust community is known for mentoring newcomers. Many projects label easy issues and name a mentor who will help you through your first pull request. The compiler’s detailed error messages make learning by contributing realistic, and tools such as cargo, rustfmt and clippy keep every project’s workflow familiar.',
    tasks: [
      'Fix a clippy lint or a compiler warning',
      'Improve a diagnostic or error message',
      'Add a doc test to a public function',
      'Write a test that reproduces a reported bug',
    ],
    setup: 'cargo build\ncargo test\ncargo clippy\ncargo fmt',
    setupNote: 'Some large projects, such as the Rust compiler, have their own build tool. Read CONTRIBUTING first.',
    projects: ['rust-lang/rust', 'rust-lang/rust-clippy', 'tokio-rs/tokio'],
  },
  {
    slug: 'cpp',
    language: 'C++',
    intro:
      'C++ projects such as game engines, computer-vision libraries and browsers can look intimidating, but their good first issues are often self-contained: a small rendering bug, a missing bounds check or a documentation gap. Contributing here teaches build systems, memory management and performance work that few other languages expose so directly.',
    tasks: [
      'Fix a compiler warning on a newer toolchain',
      'Add a bounds or null check flagged in an issue',
      'Fix a small editor or UI bug in an application',
      'Improve build instructions for your platform',
    ],
    setup: 'cmake -S . -B build\ncmake --build build\nctest --test-dir build',
    setupNote: 'Not every project uses CMake. Godot, for example, builds with SCons. Follow the project’s build docs.',
    projects: ['godotengine/godot', 'opencv/opencv', 'microsoft/terminal'],
  },
  {
    slug: 'csharp',
    language: 'C#',
    intro:
      'Since .NET became open source and cross-platform, much of the C# ecosystem is developed in public on GitHub, including the runtime itself. Beginner issues range from small API improvements to test coverage and documentation, and the dotnet CLI gives every project the same build-and-test workflow.',
    tasks: [
      'Add a unit test for an uncovered code path',
      'Fix an analyzer warning or nullable reference warning',
      'Improve XML documentation on a public API',
      'Fix a small bug in a cross-platform code path',
    ],
    setup: 'dotnet restore\ndotnet build\ndotnet test',
    setupNote: 'Check global.json for the required SDK version before building.',
    projects: ['dotnet/runtime', 'PowerShell/PowerShell', 'files-community/Files'],
  },
  {
    slug: 'php',
    language: 'PHP',
    intro:
      'PHP still runs a large share of the web, and its open-source frameworks and self-hosted apps welcome new contributors. Good first issues in PHP projects are often about validation, small feature gaps or tests, and Composer plus PHPUnit give most projects a consistent setup.',
    tasks: [
      'Add a missing validation rule or error message',
      'Write a PHPUnit test for a reported bug',
      'Fix a deprecation warning on a newer PHP version',
      'Improve translations or user-facing strings',
    ],
    setup: 'composer install\nvendor/bin/phpunit',
    setupNote: 'Many projects also run a code-style fixer (such as PHP-CS-Fixer or Pint) in CI.',
    projects: ['laravel/framework', 'nextcloud/server', 'phpmyadmin/phpmyadmin'],
  },
  {
    slug: 'ruby',
    language: 'Ruby',
    intro:
      'Ruby’s community places a strong emphasis on readable code and friendly code review, which makes it a comfortable place for a first pull request. From web frameworks to package managers and linters, Ruby projects have mature test suites, so a good first issue usually comes with a clear way to check your fix.',
    tasks: [
      'Fix a bug and add a spec that covers it',
      'Add or correct a cop or rule in a linter',
      'Improve documentation for a method or configuration option',
      'Clean up a deprecation warning',
    ],
    setup: 'bundle install\nbundle exec rake test\n# or: bundle exec rspec',
    setupNote: 'Use the Ruby version from .ruby-version, with a version manager such as rbenv or asdf.',
    projects: ['rails/rails', 'rubocop/rubocop', 'Homebrew/brew'],
  },
  {
    slug: 'kotlin',
    language: 'Kotlin',
    intro:
      'Kotlin is the preferred language for Android development and is increasingly used on the server and in multiplatform libraries. Its open-source projects, from networking libraries to static-analysis tools, often tag beginner issues around new rules, documentation and tests, all built with Gradle.',
    tasks: [
      'Add a new rule or check to a static-analysis tool',
      'Write a test for a reported edge case',
      'Improve KDoc on a public API',
      'Fix a small Android UI bug',
    ],
    setup: './gradlew build\n./gradlew test',
    setupNote: 'Open the project in Android Studio or IntelliJ IDEA to get Gradle sync and code navigation.',
    projects: ['detekt/detekt', 'square/okhttp', 'Kotlin/kotlinx.coroutines'],
  },
  {
    slug: 'swift',
    language: 'Swift',
    intro:
      'Swift is open source, and so is a growing ecosystem of server frameworks, networking libraries and developer tools around it. Contributing to Swift projects teaches modern language features such as concurrency and value types, and many repositories, including the Swift compiler itself, label good first issues.',
    tasks: [
      'Fix a compiler or runtime diagnostic message',
      'Add a test for a reported crash or edge case',
      'Improve DocC documentation for a public API',
      'Update code for a newer Swift concurrency model',
    ],
    setup: 'swift build\nswift test',
    setupNote: 'App projects may need Xcode on macOS. Swift Package Manager projects also build on Linux.',
    projects: ['swiftlang/swift', 'Alamofire/Alamofire', 'vapor/vapor'],
  },
]

export function findLanguagePage(slug: string | undefined): LanguagePage | undefined {
  return LANGUAGE_PAGES.find((page) => page.slug === slug)
}
