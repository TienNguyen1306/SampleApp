# ShopVN — Claude Instructions

## Project Structure

```
SampleApp/
├── backend/          # Express 5 + Mongoose 9 API server
├── frontend/         # React 19 + Vite SPA
├── automation/       # Playwright test suite
│   ├── pages/        # Page Object Models
│   ├── fixtures/     # Playwright fixtures
│   ├── tests/
│   │   ├── api/      # API tests (no browser)
│   │   └── ui/       # UI tests (browser)
│   └── data/         # Test data
├── .env              # Dev secrets (gitignored) — copy from .env.example
└── .env.example      # Template with dev-safe default values
```

## Running the App

```bash
# 1. Create .env (if not exists)
cp .env.example .env

# 2. Install deps
npm install
cd automation && npm install && cd ..

# 3. Start backend (uses in-memory MongoDB by default)
NODE_ENV=test node --env-file=.env server.js

# 4. Start frontend
npm run dev -- --port 5173
```

## Running Tests

```bash
cd automation

# API tests only
APP_SECRET=shopvn-dev-app-secret NODE_ENV=test npx playwright test --project=api --workers=2

# UI tests only (Chromium)
APP_SECRET=shopvn-dev-app-secret NODE_ENV=test npx playwright test --project=ui-chromium --workers=2

# All tests
APP_SECRET=shopvn-dev-app-secret NODE_ENV=test npx playwright test --workers=2
```

> ⚠️ Backend **must** be started with `NODE_ENV=test` to disable rate limiting during tests.

## API Response Shapes (non-obvious ones)

| Endpoint | Response shape |
|---|---|
| `GET /api/cart` | `Array` (items directly, NOT `{ items: [...] }`) |
| `GET /api/users` | `{ users: [...], total, page, limit }` |
| `GET /api/products` | `Array` |
| `GET /api/orders` | `Array` |
| `GET /api/auth/me` | `{ id, username, name, role, avatar }` |
| `GET /api/profile` | `{ id, username, name, role, avatar }` |

> ✅ **Before writing GET validation in API tests**, always read the corresponding `get-*.spec.ts` file first to verify the exact response structure.

## Automation — Coding Rules

### UI Tests
- **All interactions and assertions must go through Page Object methods** — no direct Playwright calls in test files
- ❌ `expect(page).toHaveURL(...)` in test → ✅ `loginPage.assertOnHomePage()`
- ❌ `page.locator('.btn').click()` in test → ✅ `homePage.clickOrders()`
- ❌ `expect(locator).toBeVisible()` in test → ✅ `checkoutPage.assertFormVisible()`
- ❌ `new HomePage(page)` inline in test → put in fixture or use existing PO from fixture
- Mock/route setup (`page.route(...)`) can stay in test files — it's test setup, not user action

### API Tests
- Every **positive** POST / PUT / PATCH / DELETE test must include a **GET validation step** after the mutation to confirm the change was actually persisted
- Exception: negative tests (4xx responses) do not need GET validation

### Page Objects
- Add assertion methods (`assertXxx()`) for every new locator that tests need to verify
- Action methods should not contain assertions — keep them separate
- Use `expect` from `@playwright/test` inside PO methods (import it)

## Tech Stack Notes

- **Express 5** — async error handling without `next(err)`, just `throw`
- **Mongoose 9** — pre-save hooks: `async function()` without calling `next()`
- **Rate limiting** — bypassed when `NODE_ENV=test` (max 1000 req/window)
- **NoSQL sanitizer** — custom middleware (express-mongo-sanitize incompatible with Express 5)
- **APP_SECRET** — backend uses `APP_SECRET`, frontend uses `VITE_APP_SECRET` (must match)
- **MongoDB** — leave `MONGODB_URI` empty or `'local'` to use in-memory (dev/test)

## Environment Variables

| Var | Used by | Notes |
|---|---|---|
| `JWT_SECRET` | backend | Sign JWT tokens |
| `APP_SECRET` | backend | Validate `X-App-Key` header on internal APIs |
| `VITE_APP_SECRET` | frontend | Must equal `APP_SECRET` |
| `STRIPE_SECRET_KEY` | backend | Leave as placeholder for mock mode |
| `PORT` | backend | Default 3001 |
| `MONGODB_URI` | backend | Empty = in-memory |
| `NODE_ENV` | backend + tests | Set to `test` when running automation |

## Git Workflow

- Feature branches: `feature/xxx`
- Refactor branches: `refactor/xxx`
- Fix branches: `fix/xxx`
- Improvement branches: `improve/xxx`
- Always run full test suite before merging to `main`
