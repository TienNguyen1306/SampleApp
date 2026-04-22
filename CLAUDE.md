# ShopVN — Claude Code Instructions

## LLM Wiki

Project có wiki tại `.wiki/` — đọc trước khi gen code:

- `.wiki/index.md` — index tổng quan, đọc file này đầu tiên
- `.wiki/overview.md` — tech stack, env vars, error codes, conventions
- `.wiki/backend.md` — tất cả API routes, models, middleware
- `.wiki/frontend.md` — pages, API layer, state, i18n, CSS classes
- `.wiki/automation.md` — Playwright config, fixtures, page objects

### Quy tắc bắt buộc: Sau khi sửa code, update wiki tương ứng

| Nếu bạn sửa file trong... | Thì update wiki page... |
|--------------------------|------------------------|
| `backend/routes/` | `.wiki/backend.md` — phần "API Routes" |
| `backend/controllers/` | `.wiki/backend.md` — phần "Controllers" |
| `backend/models/` | `.wiki/backend.md` — phần "Models" |
| `backend/middleware/` | `.wiki/backend.md` — phần "Middleware" |
| `frontend/pages/` | `.wiki/frontend.md` — phần "Pages" |
| `frontend/api/` | `.wiki/frontend.md` — phần "API Layer" |
| `frontend/context/` | `.wiki/frontend.md` — phần "State Management" |
| `frontend/i18n/` | `.wiki/frontend.md` — phần "i18n" |
| `frontend/App.jsx` | `.wiki/frontend.md` — phần "React Router" |
| `automation/playwright.config.ts` | `.wiki/automation.md` — phần "Playwright Config" |
| `automation/fixtures/` | `.wiki/automation.md` — phần "Fixtures" |
| `automation/pages/` | `.wiki/automation.md` — phần "Page Objects" |
| `automation/tests/` | `.wiki/automation.md` — phần "Cấu trúc tests" |
| `.env.example` hoặc env vars | `.wiki/overview.md` — phần "Environment Variables" |
| Route mới trong App.jsx | `.wiki/frontend.md` — phần "React Router" |

**Cách update wiki**: Sửa trực tiếp nội dung markdown, giữ nguyên cấu trúc và style. Chỉ update phần liên quan, không rewrite toàn bộ file. Sau đó thêm entry vào `.wiki/changelog.md`.

**Không cần script hay API key** — Claude Code tự update wiki như một phần của workflow gen code.

## Tech Stack nhanh

- **Backend**: Node.js ESM + Express 5 + MongoDB (mongoose). Port 3001.
- **Frontend**: React 19 + React Router 7 + Vite 7. Port 5173.
- **Auth**: JWT 7 ngày, lưu ở `sessionStorage`. Header: `Authorization: Bearer <token>`.
- **Admin API**: Thêm header `X-App-Key: <APP_SECRET>` cho `/api/users/*`.
- **Testing**: Playwright — `workers: 2`, `retries: 1`. Chạy: `cd automation && npx playwright test --project=ui-chromium --project=api`.

## Conventions

- **Error response**: `{ errorCode: 'SCREAMING_SNAKE_CASE', message: '...' }`
- **Controllers**: async functions, không try/catch (Express 5 auto-catch). Throw `err` với `err.status` + `err.errorCode`.
- **Backend**: ESM (`import/export`), không `require()`.
- **CSS**: prefix theo page (`au-*` = AdminUsers, `orders-*` = OrdersPage).
- **i18n keys**: `<pageName>.<elementName>` (e.g. `orders.title`).
- **Playwright route mock**: dùng pathname predicate `(url: URL) => url.pathname === '/api/...'`, không dùng full URL.
- **Serial mode**: thêm `test.describe.configure({ mode: 'serial' })` nếu tests trong describe dùng shared `beforeAll` state.
