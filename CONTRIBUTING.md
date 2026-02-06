# Contributing to CareBow

Thank you for your interest in contributing to CareBow! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Xcode 15+ (for iOS development)
- Android Studio (for Android development)
- PostgreSQL 15+ (for backend)

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/carebowapp.git
   cd carebowapp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   cp apps/api/.env.example apps/api/.env
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start development servers**
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

- `feature/` - New features (e.g., `feature/add-video-call`)
- `fix/` - Bug fixes (e.g., `fix/login-crash`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-flow`)
- `docs/` - Documentation updates (e.g., `docs/api-endpoints`)
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Linting and Formatting

```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm typecheck
```

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following our coding standards
3. **Write or update tests** for your changes
4. **Ensure all tests pass** locally
5. **Update documentation** if needed
6. **Submit a pull request** using our PR template

### PR Requirements

- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Documentation updated (if applicable)
- [ ] Changelog updated (for user-facing changes)

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use proper typing or `unknown`
- Export types from dedicated type files

### React Native

- Use functional components with hooks
- Follow the existing component structure
- Use the design system tokens from `src/theme/`
- Keep components small and focused

### State Management

- Use Zustand for global state
- Keep stores focused and modular
- Use React Query for server state

### File Organization

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── hooks/          # Custom React hooks
├── store/          # Zustand stores
├── services/       # API and external services
├── lib/            # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── theme/          # Design tokens
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Examples

```
feat(auth): add biometric login support
fix(booking): resolve date picker timezone issue
docs(api): update authentication endpoint docs
refactor(store): migrate to Zustand v5
```

## Questions?

Feel free to open an issue for any questions or concerns. We're here to help!

---

Thank you for contributing to CareBow!
