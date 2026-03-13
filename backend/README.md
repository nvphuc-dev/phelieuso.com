# RWM Backend — Laravel 12 API

Phần backend của hệ thống **RWM (Recycling Warehouse Management)** — quản lý kho ve chai/phế liệu.  
Cung cấp REST API cho frontend Next.js, áp dụng kiến trúc **Multi-tenant SaaS** (shared database, `tenant_id`).

---

## Mục lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt môi trường dev](#cài-đặt-môi-trường-dev)
- [Biến môi trường](#biến-môi-trường)
- [Database & Migration](#database--migration)
- [Luồng phát triển](#luồng-phát-triển)
- [Deploy lên Shared Hosting](#deploy-lên-shared-hosting)

---

## Công nghệ sử dụng

| Thành phần | Phiên bản | Mục đích |
|---|---|---|
| PHP | 8.2+ | Ngôn ngữ chính |
| Laravel | 12.x | Framework backend |
| Laravel Sanctum | 4.x | Xác thực token-based (stateless API) |
| MySQL | 8.0+ | Cơ sở dữ liệu |
| Composer | 2.x | Quản lý dependency PHP |

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────┐
│              Multi-Tenant SaaS              │
│                                             │
│  Tenant A (kho 1)   Tenant B (kho 2)  ...  │
│       │                    │               │
│       └────────┬───────────┘               │
│                ▼                            │
│        Shared Database (MySQL)              │
│        tenant_id phân biệt dữ liệu          │
└─────────────────────────────────────────────┘
```

**Luồng xác thực:**
```
Client → POST /api/auth/login
       ← { token, user }
Client → GET /api/purchases   (Header: Authorization: Bearer {token})
       ← data (chỉ trả dữ liệu của tenant đó)
```

**Phân quyền (Role-Based Access Control):**
- `owner` — toàn quyền
- `manager` — quản lý dữ liệu, không thể thay đổi trạng thái tài khoản
- `employee` — chỉ xem và tạo đơn mua vào

---

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/   # API controllers
│   │   ├── Middleware/        # CheckRole, TenantScope
│   │   └── Requests/Api/      # Form validation (StoreXxxRequest)
│   ├── Models/                # Eloquent models
│   └── Services/              # Business logic (PurchaseService, SalesService, InventoryService)
├── database/
│   ├── migrations/            # Schema definitions
│   └── seeders/
├── routes/
│   └── api.php                # Tất cả API routes
├── config/
│   └── cors.php               # CORS configuration
└── .env                       # Biến môi trường (không commit)
```

**Quy ước đặt tên:**
- Controller: `{Resource}Controller` — chỉ xử lý HTTP, gọi Service
- Service: `{Resource}Service` — chứa business logic
- Request: `Store{Resource}Request`, `Update{Resource}Request`
- Resource: `{Resource}Resource` — transform model thành JSON response

---

## Cài đặt môi trường dev

### Yêu cầu
- PHP 8.2+ (với extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `fileinfo`)
- Composer 2.x
- MySQL 8.0+

### Các bước

```bash
# 1. Cài dependencies
composer install

# 2. Tạo file .env
cp .env.example .env

# 3. Sinh APP_KEY
php artisan key:generate

# 4. Cấu hình .env (xem phần Biến môi trường bên dưới)

# 5. Tạo database trên MySQL, sau đó chạy migration
php artisan migrate

# 6. Khởi động server dev
php artisan serve --host=0.0.0.0 --port=8000
```

> **Lưu ý:** `--host=0.0.0.0` cho phép truy cập từ thiết bị khác trong mạng LAN (test mobile).

---

## Biến môi trường

Tạo file `.env` từ `.env.example` và điền các giá trị:

```ini
APP_NAME="RWM - Recycling Warehouse Management"
APP_ENV=local           # production khi deploy
APP_KEY=                # tự sinh bằng php artisan key:generate
APP_DEBUG=true          # false khi production
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rwm_db
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=file
CACHE_STORE=file

# CORS — domain của frontend
SANCTUM_STATEFUL_DOMAINS=localhost:3000
FRONTEND_URL=http://localhost:3000

# Lưu trữ file (avatar)
FILESYSTEM_DISK=public
```

**Khi test trên điện thoại qua IP LAN** (ví dụ IP: `192.168.1.3`):
```ini
SANCTUM_STATEFUL_DOMAINS=localhost:3000,192.168.1.3:3000
FRONTEND_URL=http://192.168.1.3:3000
```

---

## Database & Migration

### Các bảng chính

```
tenants              — Thông tin kho (multi-tenant)
users                — Người dùng (owner/manager/employee), có tenant_id
customers            — Khách hàng (người bán/mua), có tenant_id
materials            — Vật liệu/phế liệu, có tenant_id
purchase_orders      — Đơn mua vào header
purchase_items       — Chi tiết đơn mua (vật liệu, cân nặng, giá)
sales_orders         — Đơn bán ra header
sales_items          — Chi tiết đơn bán
inventory            — Tồn kho hiện tại theo vật liệu
inventory_logs       — Lịch sử thay đổi tồn kho (audit trail)
user_salaries        — Bảng lương tháng nhân viên
```

### Lệnh thường dùng

```bash
# Chạy migration mới
php artisan migrate

# Reset và chạy lại toàn bộ (xóa data)
php artisan migrate:fresh

# Xem trạng thái migration
php artisan migrate:status

# Tạo migration mới
php artisan make:migration add_field_to_table_name
```

### Quy tắc Multi-tenant
Mọi bảng dữ liệu đều có cột `tenant_id`. Middleware `TenantScope` tự động lọc theo `tenant_id` của user đang đăng nhập — **không cần lọc thủ công trong controller**.

---

## Luồng phát triển

### Thêm một tính năng mới

```
1. Tạo Migration     → php artisan make:migration
2. Tạo Model         → php artisan make:model ModelName
3. Tạo FormRequest   → php artisan make:request Api/StoreXxxRequest
4. Tạo Service       → tạo thủ công app/Services/XxxService.php
5. Tạo Controller    → php artisan make:controller Api/XxxController
6. Tạo Resource      → php artisan make:resource Api/XxxResource
7. Đăng ký Route     → routes/api.php
```

### Quy trình xử lý Request

```
HTTP Request
    │
    ▼
routes/api.php          — định tuyến + middleware (auth, role, tenant)
    │
    ▼
FormRequest             — validate dữ liệu đầu vào
    │
    ▼
Controller              — nhận request, gọi service, trả response
    │
    ▼
Service                 — business logic, transaction, gọi repository/model
    │
    ▼
Model/Eloquent          — tương tác database
    │
    ▼
API Resource            — transform model → JSON response
    │
    ▼
HTTP Response (JSON)
```

### Git workflow (khuyến nghị)

```bash
# Tạo branch cho feature mới
git checkout -b feature/ten-tinh-nang

# Commit
git add .
git commit -m "feat: mô tả ngắn gọn"

# Merge vào main
git checkout main
git merge feature/ten-tinh-nang
```

---

## Deploy lên Shared Hosting

> **Yêu cầu Shared Hosting:**
> - PHP **8.2+** (kiểm tra trong cPanel → PHP Selector)
> - MySQL 5.7+ / 8.0
> - Có thể trỏ Document Root vào subfolder (hoặc dùng subdomain)
> - SSH access (khuyến nghị) hoặc File Manager

### Bước 1 — Chuẩn bị file trên máy local

```bash
# Cài dependencies production (bỏ dev packages)
composer install --optimize-autoloader --no-dev

# Tạo file .env.production (copy từ .env, điền thông tin thật)
```

### Bước 2 — Upload lên hosting

**Cấu trúc upload:**
```
/home/username/                  ← root account
├── public_html/                 ← document root mặc định (KHÔNG để code ở đây)
│   └── (để trống hoặc redirect)
└── rwm-api/                     ← upload toàn bộ thư mục backend vào đây
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/                  ← đây mới là web root thật
    ├── routes/
    ├── storage/
    ├── vendor/
    └── .env
```

**Cách trỏ web root về `public/` (chọn 1 trong 2):**

**Option A — Subdomain (khuyến nghị):**
1. Tạo subdomain `api.domain.com` trong cPanel
2. Trỏ Document Root của subdomain đó vào `/home/username/rwm-api/public`

**Option B — Symlink trong `public_html`:**
```bash
# SSH vào hosting
ln -s /home/username/rwm-api/public /home/username/public_html/api
```

### Bước 3 — Cấu hình `.env` production

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.domain.com

DB_HOST=localhost
DB_DATABASE=username_rwm_db    # tên DB tạo trong cPanel
DB_USERNAME=username_dbuser
DB_PASSWORD=matkhau_db

FILESYSTEM_DISK=public
FRONTEND_URL=https://app.domain.com

# Nếu dùng HTTPS, thêm:
SESSION_SECURE_COOKIE=true
```

### Bước 4 — Thiết lập sau upload

```bash
# Qua SSH:

# Phân quyền thư mục
chmod -R 755 /home/username/rwm-api
chmod -R 775 /home/username/rwm-api/storage
chmod -R 775 /home/username/rwm-api/bootstrap/cache

# Tạo symlink storage
php artisan storage:link

# Chạy migration
php artisan migrate --force

# Tối ưu cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Bước 5 — Kiểm tra `.htaccess`

File `public/.htaccess` của Laravel đã có sẵn. Đảm bảo hosting **bật mod_rewrite**:
```
# Kiểm tra trong cPanel → Apache Handlers hoặc liên hệ hosting support
```

### Lưu ý quan trọng khi dùng Shared Hosting

> ⚠️ **Không upload thư mục `vendor/` bằng FTP** — rất chậm (hàng nghìn file).  
> Nên dùng SSH và chạy `composer install` trực tiếp trên server.

> ⚠️ **Không commit file `.env`** vào git. Upload riêng lên server.

> ⚠️ Shared hosting thường **giới hạn RAM/CPU** — nếu app chậm, xem xét nâng lên VPS.

> ⚠️ **HTTPS bắt buộc** cho production — cài SSL miễn phí qua cPanel → Let's Encrypt.

---

## API Endpoints tóm tắt

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký tenant mới |
| POST | `/api/auth/login` | Public | Đăng nhập |
| POST | `/api/auth/logout` | Auth | Đăng xuất |
| GET | `/api/purchases` | Auth | Danh sách đơn mua |
| POST | `/api/purchases` | Auth | Tạo đơn mua |
| POST | `/api/purchases/{id}/cancel` | Auth | Huỷ đơn mua |
| GET/POST | `/api/sales` | Owner/Manager | Đơn bán |
| GET/POST | `/api/customers` | Auth | Khách hàng |
| GET/POST | `/api/materials` | Auth | Vật liệu |
| GET | `/api/inventory` | Owner/Manager | Tồn kho |
| GET | `/api/reports/dashboard` | Owner/Manager | Báo cáo tổng hợp |
| GET | `/api/reports/customer-revenue` | Owner/Manager | Doanh thu khách hàng |
| GET/PUT | `/api/users/{id}/salaries/{month}` | Owner/Manager | Lương tháng |
