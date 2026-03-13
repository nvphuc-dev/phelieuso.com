# RWM Frontend — Next.js 16

Phần frontend của hệ thống **RWM (Recycling Warehouse Management)** — giao diện web quản lý kho ve chai/phế liệu.  
Được xây dựng bằng **Next.js 16 App Router** với TypeScript, kết nối với Laravel API backend.

---

## Mục lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc frontend](#kiến-trúc-frontend)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt môi trường dev](#cài-đặt-môi-trường-dev)
- [Biến môi trường](#biến-môi-trường)
- [Luồng phát triển](#luồng-phát-triển)
- [Deploy lên Shared Hosting](#deploy-lên-shared-hosting)

---

## Công nghệ sử dụng

| Thành phần | Phiên bản | Mục đích |
|---|---|---|
| Next.js | 16.x | Framework React (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 4.x | Utility-first CSS |
| TanStack Query | 5.x | Server state, caching, async data |
| Axios | 1.x | HTTP client, interceptors |
| Lucide React | 0.5x | Icon library |
| clsx | 2.x | Conditional className utility |

---

## Kiến trúc frontend

### Luồng xác thực

```
User nhập email/password
    │
    ▼
POST /api/auth/login
    │
    ◄── { token, user }
    │
localStorage.setItem('token', ...)
localStorage.setItem('user', JSON.stringify(user))
    │
    ▼
Axios interceptor tự động gắn:
  Authorization: Bearer {token}
vào mọi request tiếp theo
```

### Luồng hiển thị dữ liệu

```
Page Component
    │ useQuery(queryKey, queryFn)
    ▼
TanStack Query (cache layer)
    │ nếu cache miss hoặc stale
    ▼
Axios → GET /api/resource
    │
    ▼
Dữ liệu render ra UI (loading / error / success state)
```

### Phân quyền (client-side)

```
DashboardLayout (wrapper)
    │ đọc user từ localStorage
    │ gọi canAccess(user, pathname)
    ▼
lib/permissions.ts
    │ so sánh role với ROLE_ALLOWED_PATHS
    ▼
Cho phép render    hoặc    Redirect về defaultHomePath(role)
```

---

## Cấu trúc thư mục

```
frontend/src/
├── app/
│   ├── layout.tsx              # Root layout (font, metadata, QueryProvider)
│   ├── globals.css             # Global styles, print styles, mobile fixes
│   ├── page.tsx                # Redirect → /dashboard
│   ├── login/                  # Trang đăng nhập
│   ├── register/               # Trang đăng ký tenant
│   └── (dashboard)/            # Route group — bọc DashboardLayout
│       ├── layout.tsx
│       ├── dashboard/          # Trang tổng quan
│       ├── purchases/          # Đơn mua vào
│       │   ├── page.tsx        # Danh sách
│       │   ├── new/page.tsx    # Tạo mới
│       │   └── [id]/page.tsx   # Chi tiết
│       ├── sales/              # Đơn bán ra (cấu trúc tương tự purchases)
│       ├── customers/          # Khách hàng
│       │   ├── page.tsx
│       │   ├── bonus/page.tsx  # Thưởng cuối năm
│       │   └── [id]/stats/     # Thống kê doanh thu
│       ├── materials/          # Vật liệu
│       ├── inventory/          # Tồn kho
│       ├── reports/            # Báo cáo
│       ├── users/              # Nhân viên
│       │   ├── page.tsx
│       │   └── [id]/
│       │       ├── page.tsx    # Hồ sơ cá nhân
│       │       └── salary/     # Quản lý lương
│       └── guide/              # Hướng dẫn sử dụng
│
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx # Layout chính, guard phân quyền
│   │   ├── Sidebar.tsx         # Thanh điều hướng trái
│   │   ├── TopBar.tsx          # Header cố định
│   │   └── MobileBottomNav.tsx # Nav mobile phía dưới
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Card.tsx
│       ├── SearchableSelect.tsx # Dropdown có tìm kiếm (không dấu)
│       ├── ConfirmModal.tsx     # Modal xác nhận thay browser confirm()
│       └── PrintLayout.tsx     # Layout dành cho in
│
├── services/                   # Giao tiếp API (1 file / resource)
│   ├── auth.service.ts
│   ├── customer.service.ts
│   ├── material.service.ts
│   ├── purchase.service.ts
│   ├── sales.service.ts
│   ├── inventory.service.ts    # Bao gồm reportService
│   └── user.service.ts         # Bao gồm salaryService
│
├── lib/
│   ├── axios.ts                # Axios instance + interceptors
│   ├── auth.ts                 # getToken, getUser, setAuth, clearAuth
│   ├── permissions.ts          # canAccess(), defaultHomePath()
│   ├── query-client.tsx        # TanStack Query provider
│   └── text.ts                 # normalize(), includesNorm(), extractApiError()
│
└── types/
    └── index.ts                # TypeScript interfaces (User, Customer, Order...)
```

---

## Cài đặt môi trường dev

### Yêu cầu
- Node.js **18.x** hoặc **20.x** (LTS)
- npm 9+ hoặc yarn

### Các bước

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env.local
cp .env.local.example .env.local
# (hoặc tạo mới, xem phần Biến môi trường)

# 3. Khởi động dev server
npm run dev
```

Truy cập: http://localhost:3000

**Test trên điện thoại qua IP LAN:**
```bash
# Next.js mặc định bind 0.0.0.0 khi dev — không cần flag thêm
# Truy cập từ điện thoại: http://192.168.1.3:3000
```

---

## Biến môi trường

Tạo file `.env.local` tại thư mục `frontend/`:

```ini
# URL API backend Laravel
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Khi test mobile qua IP LAN:**
```ini
NEXT_PUBLIC_API_URL=http://192.168.1.3:8000/api
```

**Khi production:**
```ini
NEXT_PUBLIC_API_URL=https://api.domain.com/api
```

> ⚠️ Biến `NEXT_PUBLIC_*` được **nhúng vào bundle lúc build** — cần rebuild nếu thay đổi.

---

## Luồng phát triển

### Thêm trang mới

```
1. Tạo file page.tsx trong app/(dashboard)/ten-trang/
2. Thêm href vào Sidebar.tsx (navItems hoặc adminItems)
3. Thêm path vào lib/permissions.ts (ROLE_ALLOWED_PATHS)
4. Tạo service function trong services/xxx.service.ts
5. Thêm TypeScript interface vào types/index.ts nếu cần
```

### Thêm API call mới

```typescript
// services/xxx.service.ts
export const xxxService = {
  getAll: () => api.get('/xxx').then(r => r.data),
  getById: (id: number) => api.get(`/xxx/${id}`).then(r => r.data),
  create: (data: CreateXxxInput) => api.post('/xxx', data).then(r => r.data),
  update: (id: number, data: Partial<Xxx>) => api.put(`/xxx/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/xxx/${id}`),
};
```

### Sử dụng trong component

```typescript
// Đọc dữ liệu
const { data, isLoading } = useQuery({
  queryKey: ['xxx'],
  queryFn: xxxService.getAll,
});

// Ghi dữ liệu + refresh cache
const qc = useQueryClient();
const mutation = useMutation({
  mutationFn: xxxService.create,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['xxx'] }),
});
```

### Xử lý lỗi API

```typescript
import { extractApiError } from '@/lib/text';

const mutation = useMutation({
  mutationFn: xxxService.create,
  onError: (err) => setError(extractApiError(err)),
  // extractApiError tự parse lỗi 422 validation từ Laravel
});
```

### Quy tắc quan trọng

- **Không dùng `localStorage` trong Server Component** — dùng `useEffect` để đọc sau khi mount.
- **Hydration mismatch**: state phụ thuộc browser (date, localStorage) phải khởi tạo trong `useEffect`.
- **`'use client'`** bắt buộc cho mọi component có `useState`, `useEffect`, event handlers.
- **Tìm kiếm không dấu**: dùng `includesNorm()` từ `lib/text.ts` thay vì `.includes()`.

---

## Deploy lên Shared Hosting

> **Vấn đề cốt lõi:** Next.js là Node.js application — **shared hosting truyền thống (cPanel) không hỗ trợ chạy Node.js server liên tục**.

### Lựa chọn 1 — Vercel (Khuyến nghị, miễn phí)

Vercel là nền tảng chính thức của Next.js, miễn phí cho dự án nhỏ.

```bash
# 1. Cài Vercel CLI
npm install -g vercel

# 2. Đăng nhập
vercel login

# 3. Deploy từ thư mục frontend
cd frontend
vercel

# Vercel sẽ hỏi:
# - Link to existing project? No
# - Project name: rwm-frontend
# - Directory: ./  (hoặc chọn đúng folder)

# 4. Thiết lập biến môi trường trên Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://api.domain.com/api
```

**Lợi ích:** HTTPS tự động, CDN toàn cầu, CI/CD tích hợp với GitHub.

---

### Lựa chọn 2 — Static Export (cho shared hosting thuần)

Phù hợp nếu hosting **chỉ hỗ trợ file tĩnh** (HTML/CSS/JS).

> ⚠️ **Giới hạn:** Dynamic routes (`/purchases/[id]`) cần `generateStaticParams`.  
> Các tính năng cần Server Components hoặc API Routes của Next.js sẽ không hoạt động.  
> App này dùng hoàn toàn Client Components nên khả thi — nhưng cần cấu hình thêm.

**Bước 1:** Cập nhật `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  devIndicators: false,
};
```

**Bước 2:** Thêm `generateStaticParams` vào các dynamic route pages:
```typescript
// app/(dashboard)/purchases/[id]/page.tsx
export function generateStaticParams() {
  return []; // empty = không pre-render, dùng client-side navigation
}
export const dynamicParams = true;
```

**Bước 3:** Build:
```bash
npm run build
# Tạo ra thư mục /out
```

**Bước 4:** Upload thư mục `out/` lên `public_html/` của hosting.

**Bước 5:** Tạo file `.htaccess` trong `public_html/` để xử lý SPA routing:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

---

### Lựa chọn 3 — Shared Hosting có Node.js

Một số hosting hiện đại (Hostinger Business, A2 Hosting) hỗ trợ Node.js.

```bash
# 1. Build production
npm run build

# 2. Upload toàn bộ thư mục frontend (trừ node_modules)

# 3. Cài dependencies trên server qua SSH
npm install --omit=dev

# 4. Chạy app (cần Node.js process manager)
# Dùng PM2 nếu hosting hỗ trợ:
pm2 start npm --name "rwm-frontend" -- start
pm2 save

# 5. Cấu hình Node.js app trong cPanel:
# Application URL: app.domain.com
# Application Root: /home/username/rwm-frontend
# Application Startup File: node_modules/.bin/next  (hoặc server.js)
# Start Command: npm start
```

---

### Tổng kết lựa chọn deploy

| Phương án | Độ khó | Chi phí | Phù hợp |
|---|---|---|---|
| **Vercel** (Option 1) | ⭐ Dễ | Miễn phí | ✅ Khuyến nghị |
| **Static Export** (Option 2) | ⭐⭐ Trung bình | Theo hosting | ✅ Nếu bắt buộc shared hosting |
| **Node.js Hosting** (Option 3) | ⭐⭐⭐ Khó hơn | Tùy gói | ✅ Nếu hosting hỗ trợ |

> 💡 **Gợi ý triển khai thực tế:**  
> - **Backend (Laravel API)**: Shared hosting (cPanel) — PHP 8.2+  
> - **Frontend (Next.js)**: Vercel miễn phí  
> - Cấu hình CORS backend cho phép domain Vercel (`*.vercel.app` hoặc domain thật)

---

## Scripts

```bash
npm run dev      # Dev server với Turbopack (hot reload)
npm run build    # Build production
npm run start    # Chạy production build (cần npm run build trước)
npm run lint     # Kiểm tra lỗi ESLint
```

---

## Tài khoản test:
```
Owner:
User: myvan@gmail.com
PW: 12345678

Manager:
User: thanhphong@gmail.com
PW: 12345678

employee:
User: chiphuong@gmail.com
PW: 12345678
```
