# Git Commit Convention — DevTracker Backend

This project follows the **Conventional Commits** specification.  
Every commit message must be structured as:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

---

## Commit Types

| Type       | When to use                                                                 |
|------------|-----------------------------------------------------------------------------|
| `feat`     | A new feature (new endpoint, new model field, new middleware, etc.)          |
| `fix`      | A bug fix (broken query, wrong status code, auth bypass, etc.)              |
| `chore`    | Build process, tooling, dependencies — no production code change            |
| `docs`     | Documentation only changes (README, inline comments, API docs)              |
| `style`    | Formatting, whitespace, missing semicolons — no logic change                |
| `refactor` | Code restructure that neither fixes a bug nor adds a feature                |
| `perf`     | Performance improvement (query optimisation, caching, indexing)              |
| `test`     | Adding or updating tests                                                    |
| `ci`       | CI/CD configuration changes (Vercel, GitHub Actions, Docker, etc.)          |
| `revert`   | Reverting a previous commit                                                 |
| `build`    | Changes that affect the build system or external dependencies               |
| `security` | Security-related fixes (patching vulnerabilities, updating auth logic)      |

---

## Scope (Required for non-trivial changes)

The scope provides context about **what part** of the codebase was changed.  
Use lowercase, single-word (or hyphenated) identifiers.

### Backend Scopes

| Scope              | Covers                                                      |
|--------------------|-------------------------------------------------------------|
| `auth`             | Auth controller, auth middleware, JWT logic, User model      |
| `projects`         | Project controller, routes, and model                        |
| `study-materials`  | Study material controller, routes, model, file upload        |
| `achievements`     | Achievement controller, routes, and model                    |
| `middleware`       | Shared middleware (errorHandler, validate, rate-limit)        |
| `models`           | Database schemas and model updates                           |
| `routes`           | Route definitions and organisation                           |
| `config`           | Config files (db.js, env, vercel.json)                       |
| `utils`            | Utility helpers (ApiError, asyncHandler)                     |
| `api`              | The serverless entry point (api/index.js)                    |
| `deps`             | Dependency additions, removals, or updates                   |
| `cors`             | CORS configuration                                           |
| `db`               | Database connection, indexing, migrations                     |

---

## Summary Rules

- Use **imperative mood**: `"add user validation"` not `"added user validation"`
- Start with a **lowercase** letter
- **No period** at the end
- **Max 72 characters** for the subject line
- Be specific enough that someone can understand the change without reading the code

---

## Body (Optional)

Use the body to explain **what** and **why**, not how.

- Separate from subject with a **blank line**
- Wrap lines at **72 characters**
- Use bullet points for multiple changes

---

## Footer (Optional)

Use footers for:

- **Breaking changes**: start with `BREAKING CHANGE:` followed by a description
- **Issue references**: `Closes #123`, `Fixes #456`, `Refs #789`

---

## Examples

### Simple one-liner
```
feat(auth): add register endpoint with password hashing
```

### Feature with body
```
feat(projects): add step completion toggle endpoint

Added PATCH /api/projects/:id/steps/:stepId to allow users to
toggle or update individual steps within a project.
```

### Bug fix
```
fix(auth): return 401 instead of 500 for expired tokens

The JWT verification was throwing an unhandled error for expired
tokens. Now caught explicitly and returns proper 401 response.
```

### Breaking change
```
refactor(api): restructure route prefixes

BREAKING CHANGE: all API routes are now prefixed with /api/
instead of being at the root. Frontend must update the base URL.
```

### Chore (no scope needed)
```
chore: upgrade mongoose to v8.9.5 and update peer deps
```

### Security fix
```
security(auth): add rate limiting to login endpoint

Prevent brute-force attacks by limiting login attempts to
5 per minute per IP address.
```

### Reverting a commit
```
revert: feat(study-materials): add file upload endpoint

Reverts commit a1b2c3d. The upload handler caused memory
issues in the serverless environment.
```

---

## Branch Naming Convention

Pair your commits with consistent branch names:

```
<type>/<short-description>
```

### Branch Examples

| Branch                              | Purpose                                 |
|-------------------------------------|-----------------------------------------|
| `feat/user-authentication`          | New auth feature (login/register)       |
| `feat/project-crud`                 | Full project CRUD endpoints             |
| `feat/file-upload`                  | Study material file upload              |
| `fix/token-expiry-handling`         | Fix JWT expiry error                    |
| `fix/cors-preflight`               | Fix CORS issues                         |
| `refactor/controller-cleanup`       | Refactor controller logic               |
| `chore/upgrade-dependencies`        | Dependency updates                      |
| `docs/api-documentation`            | README or API doc updates               |
| `hotfix/auth-bypass`                | Urgent production security fix          |
| `security/rate-limiting`            | Security improvement                    |
| `test/project-endpoints`            | Adding tests for project routes         |
| `ci/vercel-deployment`              | Deployment config changes               |

### Protected Branches

| Branch   | Rules                                                             |
|----------|-------------------------------------------------------------------|
| `main`   | Production-ready code. **No direct pushes.** Merge via PR only.   |
| `dev`    | Integration branch. Feature branches merge here first.            |

### Branching Workflow

```
main ← (PR) ← dev ← (PR) ← feat/your-feature
                   ← (PR) ← fix/your-fix
                   ← (PR) ← refactor/your-refactor
```

1. Create a feature branch from `dev`
2. Work on the feature, commit with conventional commits
3. Open a PR to `dev` when ready
4. After code review and testing, merge to `dev`
5. Periodically, `dev` is merged to `main` for releases

### Hotfix Workflow

```
main ← (PR) ← hotfix/critical-bug
```

- Hotfixes branch directly from `main`
- After fix, merge to both `main` and `dev`

---

## Quick Reference Card

```
feat       → new feature / endpoint
fix        → bug fix
chore      → tooling / deps (no production code)
docs       → documentation
style      → formatting only
refactor   → restructure (no behavior change)
perf       → performance
test       → tests
ci         → CI/CD config
revert     → undo a commit
build      → build system changes
security   → security fixes
```

---

## Validation (Optional Setup)

To enforce this convention automatically, install **commitlint**:

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli husky
npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

This will reject any commit that does not follow the convention above.

---

*Reference: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)*
