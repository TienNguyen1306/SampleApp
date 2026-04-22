# ShopVN — LLM Wiki Index

> **Dành cho AI code generation**: Đọc file này trước để biết nên đọc trang nào. Mỗi trang wiki chứa đủ context để gen code chính xác mà không cần đọc hết source.

## Trang wiki

| File | Nội dung |
|------|---------|
| [overview.md](./overview.md) | Tech stack, cấu trúc thư mục, env vars, setup, quy ước chung |
| [backend.md](./backend.md) | Tất cả API routes, models, middleware, controllers, error codes |
| [frontend.md](./frontend.md) | Pages, API layer, state management, routing, i18n, CSS conventions |
| [automation.md](./automation.md) | Playwright config, fixtures, page objects, test patterns, cách thêm test |
| [changelog.md](./changelog.md) | Lịch sử update wiki |

## Dùng wiki như thế nào

**Khi gen code mới:**
1. Đọc `overview.md` để nắm cấu trúc + quy ước
2. Đọc page liên quan (`backend.md` nếu thêm API, `frontend.md` nếu thêm UI, `automation.md` nếu thêm test)
3. Không cần đọc source files — wiki chứa đủ thông tin

**Khi fix bug:**
1. Tìm endpoint/component liên quan trong wiki
2. Kiểm tra error codes và patterns trong `overview.md`
3. Đọc source file cụ thể chỉ khi cần implementation detail

**Sau khi update code:**
- Script `scripts/update-wiki.js` tự động update wiki tương ứng
- Hoặc GitHub Action `.github/workflows/update-wiki.yml` chạy khi push

## Project Summary

**ShopVN** là demo e-commerce app bán hàng (tiếng Việt/Anh), dùng:
- **Backend**: Node.js + Express 5 + MongoDB (in-memory for dev)
- **Frontend**: React 19 + React Router 7 + Vite 7
- **Testing**: Playwright (E2E + API tests, TypeScript)
- **Auth**: JWT (7 ngày) + bcrypt, lưu ở `sessionStorage`
- **Branch chính**: `feature/order-history-paging-filter` — thêm paginate, search, filter, delete-all cho order history

## File quan trọng nhất

```
server.js                          # Entry point backend
backend/app.js                     # Express setup + middleware chain
backend/config.js                  # Env vars
vite.config.js                     # Vite config + API proxy
frontend/App.jsx                   # React Router + CartProvider
automation/playwright.config.ts    # Playwright setup
automation/global-setup.ts         # Vite warmup trước khi test
```
