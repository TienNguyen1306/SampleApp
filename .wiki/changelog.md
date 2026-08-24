# Wiki Changelog

## 2026-08-24 — Render + Vercel deployment

- `render.yaml`: Thêm Render Blueprint cho Express API, kèm biến môi trường production cần cấu hình.
- `vercel.json`: Thêm cấu hình Vercel static build và SPA fallback cho React Router.
- `frontend/api/client.js`, `frontend/api/*.js`, `frontend/context/CartContext.jsx`: Dùng `VITE_API_URL` để frontend Vercel gọi API Render; rỗng vẫn dùng Vite proxy trong local development.
- `backend/app.js`, `backend/config.js`: CORS nhận các production origin từ `FRONTEND_URL`.
- `.env.example`, `overview.md`: Bổ sung hướng dẫn `FRONTEND_URL` và `VITE_API_URL`.

## 2026-07-06 — Swagger API documentation

- `backend/app.js`, `backend/routes/*.js`: Dịch phần text human-readable trong Swagger JSDoc (`summary`, `description`, field descriptions) sang tiếng Anh; giữ nguyên structure OpenAPI/YAML

- `backend/swagger.js` (mới): OpenAPI 3.0 config qua `swagger-jsdoc` — security schemes `bearerAuth` + `appKeyAuth`, schemas dùng chung (User, Product, Order, OrderItem, CartItem, Error, Pagination)
- `backend/routes/*.js`: Thêm JSDoc `@swagger` annotation cho tất cả endpoint hiện có (auth, products, orders, cart, users, profile)
- `backend/app.js`: Mount `GET /api-docs` (Swagger UI) + `GET /api-docs.json` (raw spec), thêm `@swagger` annotation cho health check; bật ở mọi môi trường
- `package.json`: Thêm dependency `swagger-jsdoc`, `swagger-ui-express`
- `backend.md`: Thêm mục "API Documentation / Swagger"; `overview.md`: cập nhật cấu trúc thư mục

## 2026-07-06 — Azure full-stack deployment

- `backend/app.js`: Thêm `express.static('dist')` và SPA fallback (`GET *`) sau tất cả API routes để serve built frontend trên production
- `.github/workflows/main_shopvndemo.yml`: Thêm `NODE_ENV=production` cho build step và `startup-command: node server.js` cho deploy step

## 2026-04-22 — Khởi tạo wiki

- Tạo wiki đầy đủ cho project ShopVN
- `index.md`: Master index + hướng dẫn sử dụng
- `overview.md`: Tech stack, cấu trúc, env vars, quy ước chung
- `backend.md`: Tất cả API routes, models, middleware, controller patterns
- `frontend.md`: Pages, API layer, state management, i18n, CSS conventions
- `automation.md`: Playwright config, fixtures, page objects, test patterns
- Thêm auto-update script `scripts/update-wiki.js`
- Thêm GitHub Action `.github/workflows/update-wiki.yml`
