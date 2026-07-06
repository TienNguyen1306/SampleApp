# Wiki Changelog

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
