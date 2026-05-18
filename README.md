# API_FE

Frontend React cho nền tảng quản lý dự án API, thiết kế cơ sở dữ liệu, kiểm thử API và làm việc với không gian ChatDMP. Dự án hiện chạy độc lập ở phía client, dùng dữ liệu mock và `localStorage` cho các luồng đăng nhập, dự án, lịch sử hoạt động và cấu hình workspace.

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

- Landing page giới thiệu sản phẩm và trang pricing.
- Đăng nhập, đăng ký, xác thực OTP và quên/đặt lại mật khẩu ở mức giao diện mock.
- Dashboard cho người dùng với sidebar responsive.
- Quản lý dự án cá nhân bằng dữ liệu lưu trong `localStorage`.
- Workspace ChatDMP để quản lý project, chat, biến môi trường và cài đặt project.
- Thiết kế cơ sở dữ liệu với bảng, cột, khóa và SQL preview.
- Công cụ kiểm thử API hỗ trợ method, headers, body, biến môi trường và hiển thị response.
- Lịch sử hoạt động local cho các thao tác chính.
- Giao diện admin gồm tổng quan hệ thống, quản lý người dùng và doanh thu.

## Cấu Trúc Thư Mục

```text
src/
  App.jsx                    # Khai báo routes chính
  main.jsx                   # Entry point React
  index.css                  # Tailwind và global styles
  assets/                    # Ảnh và asset tĩnh
  contexts/                  # Context placeholders
  services/                  # Service placeholders cho API/backend
  utils/
    activityLogger.js        # Lưu và đọc lịch sử hoạt động từ localStorage
  pages/
    Auth/                    # Login, Register, OTP, Forgot/Reset password
    Dashboard/               # Dashboard layout và các màn hình nội bộ
    HomePage/                # Landing page, header, footer, pricing
    ApiTester/               # Placeholder
    Editor/                  # Placeholder
    Projects/                # Placeholder
```

## Routes Chính

- `/` - Landing page
- `/auth` - Đăng nhập / đăng ký
- `/pricing` - Bảng giá
- `/reset-password` - Đặt lại mật khẩu
- `/dashboard` - Dự án của tôi
- `/workspace` - ChatDMP workspace
- `/database` - Thiết kế cơ sở dữ liệu
- `/history` - Lịch sử hoạt động
- `/profile` - Hồ sơ
- `/profile/edit` - Chỉnh sửa hồ sơ
- `/test-api` - Kiểm thử API
- `/admin/overview` - Tổng quan admin
- `/admin/users` - Quản lý người dùng
- `/admin/revenue` - Quản lý doanh thu

## Tài Khoản Mock

```text
Admin:
  username: admin
  email: admin@example.com
  password: 123456

User:
  username: user
  email: user@example.com
  password: 123456
```

## Cài Đặt Và Chạy

```bash
npm install
npm run dev
```

Trên PowerShell Windows, nếu `npm` bị chặn bởi Execution Policy, có thể dùng:

```bash
npm.cmd run dev
```

## Build

```bash
npm run build
```

Hoặc trên PowerShell:

```bash
npm.cmd run build
```

## Kiểm Tra Lint

```bash
npm run lint
```

Lưu ý: tại thời điểm hiện tại lint còn một số lỗi chưa xử lý, chủ yếu là unused imports/vars và một số cảnh báo luật React hooks trong các page dashboard.

## Ghi Chú Phát Triển

- Dự án chưa kết nối backend thật.
- Các file trong `src/services/` và một số context hiện vẫn là placeholder.
- Nhiều dữ liệu đang được lưu trong trình duyệt bằng `localStorage`.
- Khi tích hợp backend, nên bắt đầu từ các service: `api.js`, `authService.js`, `projectService.js`, `testService.js`, `aiService.js`.
