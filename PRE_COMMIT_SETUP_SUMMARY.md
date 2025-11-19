# Pre-commit Setup Summary

## ✅ What Was Installed

### Dependencies Added

- **husky** (^9.1.7) - Git hooks manager
- **lint-staged** (^16.2.6) - Run linters on staged files only
- **@commitlint/cli** (^20.1.0) - Commit message linter
- **@commitlint/config-conventional** (^20.0.0) - Conventional commits rules

## 📁 Files Created

### 1. `.husky/pre-commit`

**Runs on every commit** - 4 checks in sequence:

- ✅ Lint & format staged files (via lint-staged)
- ✅ Type check entire project (vue-tsc --noEmit)
- ✅ Run all tests (105 tests in ~2s)
- ✅ Check for debugger and .only statements

### 2. `.husky/commit-msg`

**Validates commit messages** - Ensures conventional commits format:

- Valid: `feat: add new feature`
- Invalid: `updated stuff`

### 3. `.lintstagedrc.json`

**Configuration for lint-staged:**

```json
{
  "*.{ts,tsx,vue}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

### 4. `commitlint.config.js`

**Conventional commits configuration:**

- Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Max header length: 100 characters
- Enforces lowercase subjects

### 5. `PRE_COMMIT_GUIDE.md`

**Comprehensive documentation** for developers on:

- What gets checked
- How to use the hooks
- Troubleshooting
- Best practices

## 🔧 Package.json Scripts Added

```json
"type-check": "vue-tsc --noEmit",
"test:coverage": "vitest run --coverage",
"lint:fix": "eslint . --ext .ts,.vue --fix",
"format:check": "prettier --check .",
"precommit": "lint-staged && pnpm type-check && pnpm test",
"prepare": "husky"
```

## 🚀 How It Works

### On Every Commit

```
git add .
git commit -m "feat: add user authentication"
```

**Automatically runs:**

1. 📝 ESLint + Prettier on staged files
2. 🔍 TypeScript type checking
3. 🧪 All 105 unit tests
4. 🐛 Check for debugger/test.only
5. ✉️ Validate commit message

**Total time:** ~3-5 seconds

### If Checks Fail

The commit is **blocked** and you'll see:

- Detailed error messages
- Which check failed
- How to fix it

### To Bypass (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

## 📊 What Gets Checked

| Check         | Tool       | Speed  | Scope             |
| ------------- | ---------- | ------ | ----------------- |
| Linting       | ESLint     | Fast   | Staged files only |
| Formatting    | Prettier   | Fast   | Staged files only |
| Type checking | vue-tsc    | ~1-2s  | Entire project    |
| Tests         | Vitest     | ~2s    | All 105 tests     |
| Debug code    | grep       | <100ms | Staged files only |
| Commit msg    | commitlint | <50ms  | Commit message    |

## 🎯 Commit Message Format

**Structure:**

```
<type>: <subject>

[optional body]

[optional footer]
```

**Examples:**

```bash
# ✅ Good
feat: add socket reconnection logic
fix: resolve memory leak in message handler
test: add comprehensive tests for chatbot store
docs: update README with pre-commit guide
refactor: simplify message normalization logic

# ❌ Bad
updated stuff
fix bug
WIP
feat: THIS IS ALL CAPS
```

## 🔧 Manual Testing

Run all checks manually without committing:

```bash
pnpm run precommit
```

Run individual checks:

```bash
pnpm run lint:fix        # Lint with auto-fix
pnpm run format          # Format all files
pnpm run type-check      # Type checking only
pnpm test                # Tests only
```

## 🏃 Performance

**Pre-commit execution time breakdown:**

- Lint-staged: ~500ms (only staged files)
- Type checking: ~1-2s (entire project)
- Tests: ~2s (all 105 tests)
- Debug checks: <100ms
- Commit msg: <50ms

**Total: 3-5 seconds** ⚡

This is fast enough to not disrupt development workflow!

## 📚 Documentation

- **[PRE_COMMIT_GUIDE.md](./PRE_COMMIT_GUIDE.md)** - Full user guide
- **[README.md](./README.md)** - Updated with pre-commit info

## ✨ Benefits

✅ **Catch errors early** - Before CI/CD or code review
✅ **Consistent code style** - Automatic formatting
✅ **Type safety** - No type errors slip through
✅ **Prevent regressions** - All tests must pass
✅ **Clean git history** - Conventional commits for changelogs
✅ **No debugging code** - Automatic detection
✅ **Fast execution** - Only 3-5 seconds per commit

## 🎓 First-Time Setup for Team Members

After cloning the repository:

```bash
pnpm install
```

That's it! Husky will automatically install the git hooks via the `prepare` script.

## 🐛 Troubleshooting

**Hooks not running?**

```bash
# Ensure hooks are executable
chmod +x .husky/pre-commit .husky/commit-msg

# Reinstall husky
pnpm run prepare
```

**Need to skip temporarily?**

```bash
# Only for emergencies!
git commit --no-verify -m "emergency: critical production fix"
```

## 📝 Notes

- Pre-commit checks run **client-side** only
- They do NOT replace CI/CD checks
- They catch issues **before** pushing to remote
- Team members can bypass with `--no-verify` (discouraged)
- All checks are fast enough for smooth workflow

---

**Status:** ✅ Fully configured and ready to use!
