# API_FE

Frontend React cho nền tảng quản lý dự án API, thiết kế cơ sở dữ liệu, kiểm thử API, workspace ChatDMP và thanh toán gói dịch vụ mock. Dự án hiện chạy độc lập phía client, dùng service layer kết hợp mock data và `localStorage` để mô phỏng các flow chính trước khi tích hợp backend thật.

## Công Nghệ

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- Framer Motion
- React Hot Toast
- Monaco Editor
- React Syntax Highlighter

## Tính Năng Chính

- Landing page và Pricing page.
- Auth flow: đăng nhập, đăng ký, xác thực OTP, quên mật khẩu, đặt lại mật khẩu.
- Protected routes cho dashboard/profile/workspace và admin routes.
- Dashboard quản lý project cá nhân: load, tìm kiếm, tạo, mở workspace, xóa project.
- Workspace ChatDMP: quản lý project, chat, biến môi trường và cài đặt project bằng mock/localStorage.
- Database Designer: tạo/xóa/đổi tên bảng, thêm/xóa/sửa cột, sinh SQL preview realtime.
- API Tester: chọn method, nhập URL, headers, body, resolve environment variables, gửi request bằng `fetch` qua service, xem response và lưu history.
- History: đọc/xóa activity log từ localStorage qua activity service.
- Profile: đọc user hiện tại, cập nhật hồ sơ, đổi mật khẩu, cập nhật subscription mock.
- Admin: overview, user management và revenue management đọc dữ liệu từ service/mock localStorage.
- Payment Sepay mock: tạo giao dịch, QR mock, countdown, copy thông tin chuyển khoản, paid/cancel/expired flow, success/failed pages và payment history.

## Kiến Trúc Hiện Tại

```text
src/
  App.jsx                         # Routes, lazy loading, protected route grouping
  main.jsx                        # React entry point
  index.css                       # Tailwind/global styles
  components/
    ProtectedRoute.jsx            # Bảo vệ route user/admin
  services/
    api.js                        # API client nền, đọc VITE_API_BASE_URL
    authService.js                # Auth mock/API-ready
    projectService.js             # Project mock/API-ready
    workspaceService.js           # Workspace/chat/env/settings mock
    databaseService.js            # Database schema CRUD và SQL preview
    testService.js                # API tester request/history/env resolve
    profileService.js             # Profile/password/subscription mock
    adminService.js               # Admin stats/users/revenue mock
    activityService.js            # Activity wrapper
    aiService.js                  # Mock AI response
  utils/
    activityLogger.js             # Local activity storage
  pages/
    Auth/                         # Login, Register, OTP, Forgot/Reset password
    Dashboard/                    # Dashboard layout, projects, workspace, DB, API tester, admin, profile
    HomePage/                     # Landing, pricing, header, footer
    Payment/                      # Sepay mock payment module
```

Payment giữ service riêng trong `src/pages/Payment/paymentService.js` theo yêu cầu module thanh toán. Không có `src/services/paymentService.js`.

## Routes

- `/` - Landing page
- `/auth` - Đăng nhập / đăng ký / OTP / quên mật khẩu
- `/pricing` - Bảng giá
- `/payment` - Thanh toán Sepay mock
- `/payment/success` - Thanh toán thành công
- `/payment/failed` - Thanh toán chưa hoàn tất
- `/reset-password` - Đặt lại mật khẩu
- `/dashboard` - Dự án của tôi
- `/workspace` - ChatDMP workspace
- `/database` - Database Designer
- `/test-api` - API Tester
- `/history` - Lịch sử hoạt động
- `/profile` - Hồ sơ người dùng
- `/profile/edit` - Chỉnh sửa hồ sơ
- `/admin/overview` - Admin overview
- `/admin/users` - Admin users
- `/admin/revenue` - Admin revenue

## Tài Khoản Mock

```text
Admin:
  username: admin
  email: admin@example.com
  password: 123456
  role: ADMIN

User:
  username: user
  email: user@example.com
  password: 123456
  role: USER
```

OTP mock khi đăng ký: `123456`.

## LocalStorage Keys Chính

- `token`
- `userRole`
- `api_fe_user`
- `api_fe_users`
- `api_fe_projects`
- `api_fe_workspaces`
- `api_fe_database_schemas`
- `api_fe_api_test_history`
- `api_fe_subscription`
- `api_fe_current_payment`
- `api_fe_payment_history`
- `activity_history`
- `ai_projects_v2`

Một số key legacy vẫn được đọc để giữ tương thích dữ liệu cũ, ví dụ `my_dashboard_projects` và `ai_projects`.

## Cài Đặt

```bash
npm install
```

## Chạy Development

```bash
npm run dev
```

Trên PowerShell Windows có thể dùng:

```bash
npm.cmd run dev
```

Mặc định script dev đang mở trình duyệt bằng Edge:

```json
"dev": "set BROWSER=msedge&&vite --open"
```

## Build Và Lint

```bash
npm run build
npm run lint
```

Trên PowerShell Windows:

```bash
npm.cmd run build
npm.cmd run lint
```

Trạng thái gần nhất:

- `npm run lint`: pass.
- `npm run build`: pass.
- `npm run dev -- --host 127.0.0.1 --port 5173`: Vite khởi động thành công.

Build có thể cảnh báo chunk lớn do Monaco Editor và React Syntax Highlighter. Đây là cảnh báo tối ưu bundle, không phải lỗi build.

## Flow Test Nhanh

1. Auth:
   - Login admin bằng `admin@example.com / 123456` và kiểm tra vào được `/admin/overview`.
   - Login user bằng `user@example.com / 123456` và kiểm tra vào được `/dashboard`.
   - Login sai phải hiển thị lỗi.
   - Register user mới, nhập OTP `123456`, sau đó login.
   - Forgot password tạo yêu cầu reset, Reset password cập nhật mật khẩu mock.

2. Route protection:
   - Chưa login vào `/dashboard` phải bị chuyển về `/auth`.
   - User thường vào `/admin/overview` phải bị chuyển về `/dashboard`.
   - Admin vào được các route `/admin/*`.

3. Projects:
   - Vào `/dashboard`.
   - Tạo project mới.
   - Search project.
   - Mở project sang `/workspace`.
   - Xóa project và kiểm tra UI cập nhật.

4. Database:
   - Vào `/database`.
   - Tạo bảng mới.
   - Đổi tên bảng.
   - Thêm cột.
   - Đổi type cột.
   - Xóa cột/bảng.
   - Kiểm tra SQL preview đổi realtime.

5. API Tester:
   - Vào `/test-api`.
   - Nhập URL hợp lệ.
   - Chọn method.
   - Thêm headers/body nếu cần.
   - Gửi request, xem status/duration/body.
   - Kiểm tra history request.
   - Dùng biến dạng `{{baseUrl}}` nếu workspace đã có environment variable.

6. Payment:
   - Vào `/pricing`.
   - Chọn Pro hoặc Ultra để vào `/payment`.
   - Copy số tài khoản, số tiền, nội dung chuyển khoản.
   - Bấm "Tôi đã thanh toán" để sang `/payment/success`.
   - Bấm hủy hoặc để hết hạn để sang `/payment/failed`.
   - Admin revenue đọc dữ liệu từ `api_fe_payment_history`.

## Tích Hợp Backend Sau Này

File nền để đổi sang backend thật:

- `src/services/api.js`
- `src/services/authService.js`
- `src/services/projectService.js`
- `src/services/workspaceService.js`
- `src/services/databaseService.js`
- `src/services/testService.js`
- `src/services/profileService.js`
- `src/services/adminService.js`
- `src/services/aiService.js`

Biến môi trường gợi ý:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Endpoint backend gợi ý:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/verify-otp`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /users/me`
- `PUT /users/me`
- `GET /projects`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `GET /workspaces/:id`
- `POST /workspaces/:id/conversations`
- `POST /conversations/:id/messages`
- `GET /database-schemas/:projectId`
- `PUT /database-schemas/:projectId`
- `POST /api-tests/send`
- `GET /admin/users`
- `GET /admin/revenue`

Payment Sepay thật cần backend xử lý tạo đơn, xác minh trạng thái và webhook. Frontend không xử lý webhook và không lưu secret key.

## Ghi Chú Phát Triển

- Dự án chưa kết nối backend thật.
- Service hiện tại trả Promise và dùng mock/localStorage để dễ đổi sang API thật.
- Component không nên gọi `localStorage` hoặc `fetch` trực tiếp cho business flow mới; ưu tiên gọi service.
- Khi thêm module mới, giữ pattern: component quản lý UI/state, service quản lý data/mock/API boundary.
