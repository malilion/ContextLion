# Contributing to ContextLion

Thank you for your interest in contributing to ContextLion!

## Development Workflow

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x

### Setup

```bash
git clone https://github.com/malilion/ContextLion.git
cd ContextLion
pnpm install
```

### Commands

```bash
# Start development server with hot module reload
pnpm dev

# Type check
pnpm compile

# Run linter
pnpm lint

# Format code
pnpm format

# Run unit tests
pnpm test

# Run Playwright E2E tests
pnpm test:e2e

# Build production bundles
pnpm build          # Chrome MV3
pnpm build:firefox  # Firefox MV3
```

## Commit Guidelines

We adhere to Conventional Commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation updates
- `refactor:` code restructuring without feature change
- `test:` adding or updating tests
- `chore:` maintenance tasks, dependency updates
- `ci:` continuous integration changes

## Good First Issues

If you're looking for where to start:

1. Add custom extractor heuristic rules for specific documentation platforms (Notion, Substack, Dev.to).
2. Expand CJK / multilingual token estimator test fixtures for Japanese and Korean texts.
3. Enhance table and LaTeX code block rendering options.
