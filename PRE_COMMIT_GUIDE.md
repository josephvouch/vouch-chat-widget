# Pre-commit Hooks Guide

This project uses pre-commit hooks to ensure code quality before commits are made.

## What Gets Checked

### On Every Commit (Pre-commit Hook)

The pre-commit hook runs **4 checks** in sequence:

1. **📝 Lint & Format Staged Files** (`lint-staged`)
   - Runs ESLint with auto-fix on `.ts`, `.tsx`, `.vue` files
   - Runs Prettier to format all staged files
   - Only checks files you're actually committing (fast!)

2. **🔍 Type Checking** (`vue-tsc --noEmit`)
   - Validates TypeScript types across the entire project
   - Catches type errors before they reach CI/CD

3. **🧪 Run All Tests** (`vitest run`)
   - Runs all 105 unit tests
   - Fast execution (~2 seconds)
   - Ensures no existing functionality is broken

4. **🐛 Check for Debug Code**
   - Blocks commits containing `debugger` statements
   - Blocks commits with `.only` in test files (`it.only`, `describe.only`, `test.only`)
   - Prevents accidentally committed debugging code

### On Commit Message (Commit-msg Hook)

The commit-msg hook validates that your commit message follows the **Conventional Commits** format.

**Valid formats:**

```
feat: add user authentication
fix: resolve socket connection issue
test: add tests for message handler
refactor: simplify chatbot store logic
docs: update README with setup instructions
```

**Allowed types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style/formatting changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding/updating tests
- `build` - Build system changes
- `ci` - CI/CD configuration
- `chore` - Other changes
- `revert` - Revert previous commit

## Useful Commands

### Manual Pre-commit Check

Run all pre-commit checks manually without committing:

```bash
pnpm run precommit
```

### Individual Checks

```bash
# Lint only (with auto-fix)
pnpm run lint:fix

# Format only
pnpm run format

# Type check only
pnpm run type-check

# Tests only
pnpm test

# Format check (without modifying files)
pnpm run format:check
```

### Bypass Hooks (Use with Caution!)

If you absolutely need to skip the pre-commit checks:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** Only use `--no-verify` in emergencies. The checks exist to maintain code quality.

## What If Checks Fail?

### Lint/Format Failures

If linting or formatting fails, the hook will auto-fix most issues. Just:

1. Review the changes
2. Stage the auto-fixed files: `git add .`
3. Commit again

### Type Check Failures

Fix the TypeScript errors shown in the output, then commit again.

### Test Failures

Fix the failing tests before committing. Run `pnpm test:watch` to develop fixes interactively.

### Debug Code Detected

Remove `debugger` statements or `.only` from test files, then commit again.

### Commit Message Failures

Rewrite your commit message following the conventional commits format. Examples:

```bash
# ❌ Bad
git commit -m "updated stuff"

# ✅ Good
git commit -m "feat: add socket reconnection logic"
```

## First-Time Setup

After cloning the repository, run:

```bash
pnpm install
```

This will:

1. Install all dependencies
2. Set up Husky git hooks automatically (via `prepare` script)
3. Configure the pre-commit and commit-msg hooks

## Troubleshooting

### Hooks not running?

1. Ensure you ran `pnpm install` after cloning
2. Check that `.husky/pre-commit` and `.husky/commit-msg` are executable:
   ```bash
   chmod +x .husky/pre-commit .husky/commit-msg
   ```

### Hooks running but failing unexpectedly?

1. Run the checks manually to see detailed output:
   ```bash
   pnpm run precommit
   ```
2. Check that all dependencies are installed:
   ```bash
   pnpm install
   ```

### Need to disable hooks temporarily?

Use the `--no-verify` flag, but **only for emergencies**:

```bash
git commit --no-verify -m "emergency fix"
```

## Benefits

✅ **Catch errors early** - Before they reach CI/CD or production
✅ **Consistent code style** - Automatic formatting across the team
✅ **Type safety** - No more "works on my machine" type errors
✅ **Prevent regressions** - All tests must pass before commit
✅ **Clean git history** - Conventional commit messages for better changelogs
✅ **No debugging code** - Automatic detection of `debugger` and `.only` statements

## Performance

The entire pre-commit process takes approximately **3-5 seconds**:

- Lint-staged: ~500ms (only staged files)
- Type check: ~1-2s
- Tests: ~2s (all 105 tests)
- Debug checks: <100ms

This is fast enough to not disrupt your workflow! 🚀
