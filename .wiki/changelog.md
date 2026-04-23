# Wiki Changelog

## 2026-04-23 — Cập nhật Header Logo Pattern

- `frontend.md`: Thêm section **Header Logo Pattern** mô tả:
  - Tất cả page dùng `<Link to="/home">` thay `<div>` cho logo ShopVN
  - CSS bắt buộc: `text-decoration: none; cursor: pointer`
  - Bảng mapping page → logo class → header element
  - Hướng dẫn khi thêm page mới
- `frontend.md`: Thêm prefix `.pf-*` vào CSS Conventions (ProfilePage)

## 2026-04-22 — Khởi tạo wiki

- Tạo wiki đầy đủ cho project ShopVN
- `index.md`: Master index + hướng dẫn sử dụng
- `overview.md`: Tech stack, cấu trúc, env vars, quy ước chung
- `backend.md`: Tất cả API routes, models, middleware, controller patterns
- `frontend.md`: Pages, API layer, state management, i18n, CSS conventions
- `automation.md`: Playwright config, fixtures, page objects, test patterns
- Thêm auto-update script `scripts/update-wiki.js`
- Thêm GitHub Action `.github/workflows/update-wiki.yml`
