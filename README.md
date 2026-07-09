# API_FE

Frontend React cho nền tảng quản lý dự án API, thiết kế database, kiểm thử API, tạo mock server, viết tài liệu API và làm việc với AI assistant ChatDMP. Dự án hiện chạy độc lập ở phía client, phần lớn dữ liệu được mock bằng `localStorage`. File này mô tả chi tiết chức năng để phục vụ việc thiết kế database/backend thật.

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
- i18next/react-i18next

## Cài Đặt Và Chạy

```bash
npm install
npm run dev
```

Trên PowerShell Windows nếu `npm` bị chặn bởi Execution Policy:

```bash
npm.cmd run dev
```

Build production:

```bash
npm run build
```

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

## Kiến Trúc Tổng Quan

Ứng dụng được chia theo các nhóm chính:

- `src/pages/Auth`: đăng nhập, đăng ký, OTP, quên mật khẩu, đặt lại mật khẩu.
- `src/pages/HomePage`: landing page, header, footer, pricing.
- `src/pages/Projects`: danh sách và thao tác dự án cá nhân.
- `src/pages/Editor`: ChatDMP workspace và database designer.
- `src/pages/ApiTester`: công cụ gửi request API.
- `src/pages/Dashboard`: layout dashboard, profile, settings, history, collections, environments, docs, mock server, admin.
- `src/pages/Payment`: mock payment flow cho nâng cấp gói.
- `src/services`: tầng service, hiện chủ yếu đọc/ghi `localStorage`.
- `src/utils`: helper chung cho storage và activity log.

Các service quan trọng:

- `authService.js`: user, session, login/register/OTP/reset password.
- `projectService.js`: dự án cá nhân.
- `workspaceService.js`: workspace, conversation, message.
- `databaseService.js`: schema database, table, column, SQL preview.
- `collectionService.js`: API collection, folder, request.
- `environmentService.js`: environment và biến môi trường.
- `documentationService.js`: tài liệu API sinh từ collection.
- `mockServerService.js`: mock endpoint.
- `testService.js`: API testing helper và request history.
- `profileService.js`: profile, subscription, usage.
- `paymentService.js`: lịch sử thanh toán và tính doanh thu.
- `adminService.js`: dữ liệu dashboard admin, user management, revenue.

## Routes Chính

- `/`: landing page.
- `/auth`: đăng nhập/đăng ký/OTP/quên mật khẩu.
- `/pricing`: bảng giá.
- `/payment`: trang thanh toán mock.
- `/payment/success`: thanh toán thành công.
- `/payment/failed`: thanh toán thất bại.
- `/reset-password`: đặt lại mật khẩu.
- `/dashboard`: danh sách dự án của tôi.
- `/workspace`: ChatDMP workspace.
- `/database`: thiết kế database.
- `/test-api`: kiểm thử API.
- `/collections`: quản lý API collection.
- `/environments`: quản lý environment variables.
- `/documentation`: quản lý tài liệu API.
- `/mock-server`: quản lý mock endpoint.
- `/history`: lịch sử hoạt động.
- `/profile`: hồ sơ cá nhân.
- `/profile/edit`: chỉnh sửa hồ sơ.
- `/settings`: cài đặt tài khoản, ngôn ngữ, API key, subscription.
- `/admin/overview`: tổng quan admin.
- `/admin/users`: quản lý người dùng.
- `/admin/revenue`: quản lý doanh thu.

## Phân Quyền

Ứng dụng có 2 nhóm người dùng:

- `USER`: truy cập dashboard cá nhân, project, workspace, database, API tester, collections, environments, docs, mock server, profile, payment.
- `ADMIN`: có toàn bộ quyền user và thêm quyền truy cập dashboard admin, quản lý người dùng, doanh thu.

Route private được bảo vệ bằng `ProtectedRoute`. Backend thật nên xác thực bằng access token/JWT và kiểm tra role ở server.

## Mô Tả Chi Tiết Chức Năng

### 1. Authentication

Chức năng:

- Đăng nhập bằng email hoặc username.
- Đăng ký tài khoản mới.
- Xác thực OTP sau đăng ký.
- Gửi lại OTP.
- Quên mật khẩu.
- Đặt lại mật khẩu.
- Đăng xuất.
- Lưu phiên đăng nhập hiện tại.
- Phân biệt user/admin.
- Tự đồng bộ session nếu admin cập nhật thông tin user đang đăng nhập.

Dữ liệu hiện tại:

- `api_fe_users`: danh sách user mock.
- `api_fe_auth`: session hiện tại gồm user và token.
- `api_fe_user`: thông tin user hiện tại.
- `token`: token mock.
- `userRole`: role mock.
- `api_fe_pending_otp`: OTP chờ xác thực.
- `api_fe_reset_email`: email đang reset password.

Bảng database gợi ý:

- `users`
- `user_sessions`
- `otp_verifications`
- `password_reset_tokens`
- `roles` hoặc enum role

Trường quan trọng cho `users`:

- `id`
- `username`
- `name`
- `email`
- `password_hash`
- `role`
- `plan_id`
- `status`
- `phone`
- `avatar_url`
- `created_at`
- `updated_at`
- `last_login_at`

### 2. Project Management

Chức năng:

- Xem danh sách dự án.
- Tìm kiếm dự án theo tên, mô tả, loại.
- Tạo dự án mới.
- Import project local ở mức UI mock.
- Đổi tên dự án.
- Nhân bản dự án.
- Xóa dự án.
- Mở dự án và đặt `active_project_id`.
- Thống kê số API, số bảng database, số chat AI theo từng project.

Dữ liệu hiện tại:

- `api_fe_projects`: danh sách project chính.
- `my_dashboard_projects`: key legacy để tương thích màn cũ.
- `api_fe_active_project_id`: project đang mở.

Bảng database gợi ý:

- `projects`
- `project_members`
- `project_tags`

Trường quan trọng cho `projects`:

- `id`
- `owner_id`
- `name`
- `description`
- `type`
- `status`
- `color`
- `created_at`
- `updated_at`

Quan hệ:

- Một user sở hữu nhiều project.
- Một project có nhiều member nếu sau này có workspace/team.
- Một project có nhiều collection, environment, database schema, conversation, mock endpoint, documentation.

### 3. ChatDMP Workspace

Chức năng:

- Tạo workspace theo project.
- Quản lý danh sách project trong sidebar workspace.
- Tạo chat mới.
- Xem lịch sử chat.
- Ghim, đổi tên, archive, xóa project/chat ở UI workspace.
- Gửi prompt đến AI mock.
- AI trả lời theo mode: chat thường, sinh code, sinh API, debug lỗi, thiết kế database, viết tài liệu API.
- Từ phản hồi AI có thể chuyển API request sang API Tester hoặc schema sang Database Designer.
- Quản lý biến môi trường đơn giản trong workspace.
- Xuất cấu hình project workspace.

Dữ liệu hiện tại:

- `api_fe_workspaces`: cấu hình workspace theo project.
- `api_fe_ai_conversations`: danh sách conversation.
- `api_fe_ai_messages`: message theo conversation.
- `ai_projects_v2`: key legacy của workspace.
- `ai_projects`: key legacy cũ hơn.
- `api_fe_pending_api_test_request`: request AI gợi ý chờ đưa sang API tester.
- `api_fe_pending_database_schema`: schema AI gợi ý chờ đưa sang database designer.

Bảng database gợi ý:

- `workspaces`
- `ai_conversations`
- `ai_messages`
- `ai_message_metadata`

Trường quan trọng cho `ai_conversations`:

- `id`
- `project_id`
- `title`
- `mode`
- `is_pinned`
- `is_archived`
- `created_at`
- `updated_at`

Trường quan trọng cho `ai_messages`:

- `id`
- `conversation_id`
- `role`
- `content`
- `metadata_json`
- `created_at`

### 4. Database Designer

Chức năng:

- Xem schema database theo project.
- Chọn loại database như PostgreSQL/MySQL/SQL Server ở service.
- Tạo bảng mới.
- Đổi tên bảng.
- Xóa bảng.
- Thêm cột.
- Sửa cột.
- Xóa cột.
- Thiết lập kiểu dữ liệu, primary key, nullable, unique, default value.
- Sinh SQL preview.
- Sửa SQL bằng Monaco Editor và parse ngược về visual editor ở mức cơ bản.
- Copy SQL.
- Export SQL.
- Nhận schema do AI sinh từ ChatDMP.

Dữ liệu hiện tại:

- `api_fe_database_schemas`: schema theo `projectId`.
- `api_fe_pending_database_schema`: schema chờ import từ AI.

Bảng database gợi ý:

- `database_schemas`
- `database_tables`
- `database_columns`
- `database_relationships` nếu cần foreign key.
- `database_indexes` nếu cần quản lý index.

Trường quan trọng cho `database_schemas`:

- `id`
- `project_id`
- `db_type`
- `created_at`
- `updated_at`

Trường quan trọng cho `database_tables`:

- `id`
- `schema_id`
- `name`
- `row_count`
- `position_x`
- `position_y`
- `created_at`
- `updated_at`

Trường quan trọng cho `database_columns`:

- `id`
- `table_id`
- `name`
- `data_type`
- `length`
- `is_primary_key`
- `is_nullable`
- `is_unique`
- `default_value`
- `ordinal_position`
- `created_at`
- `updated_at`

Gợi ý mở rộng:

- Thêm `foreign_key_table_id`, `foreign_key_column_id` hoặc bảng riêng `database_relationships`.
- Thêm bảng versioning nếu cần lưu lịch sử thay đổi schema.

### 5. API Tester

Chức năng:

- Chọn method HTTP: GET, POST, PUT, PATCH, DELETE.
- Nhập URL.
- Nhập headers.
- Nhập body.
- Thay thế biến môi trường dạng `{{key}}`.
- Gửi request bằng `fetch`.
- Hiển thị status, status text, thời gian, dung lượng, response headers, response body.
- Lưu lịch sử request.
- Ghi activity log.

Dữ liệu hiện tại:

- `api_fe_api_test_history`: lịch sử request ở service mới.
- `ai_projects`: key legacy có `apiHistory`.
- `api_fe_pending_api_test_request`: request chờ import từ AI.

Bảng database gợi ý:

- `api_test_requests`
- `api_test_histories`
- `api_test_headers`
- `api_test_responses`

Trường quan trọng cho `api_test_histories`:

- `id`
- `project_id`
- `user_id`
- `method`
- `url`
- `request_headers_json`
- `request_body`
- `response_status`
- `response_status_text`
- `response_headers_json`
- `response_body`
- `duration_ms`
- `response_size_bytes`
- `created_at`

### 6. API Collections

Chức năng:

- Xem collection theo project.
- Tạo collection.
- Sửa collection.
- Xóa collection.
- Tạo folder trong collection.
- Sửa folder.
- Xóa folder.
- Lưu request vào collection hoặc folder.
- Sửa request.
- Xóa request.
- Nhân bản request.
- Export collection JSON.
- Import collection JSON.

Dữ liệu hiện tại:

- `api_fe_collections`: collection, folder và request.

Bảng database gợi ý:

- `api_collections`
- `api_folders`
- `api_requests`
- `api_request_headers`
- `api_request_params`

Trường quan trọng cho `api_requests`:

- `id`
- `collection_id`
- `folder_id`
- `name`
- `method`
- `url`
- `description`
- `headers_json`
- `params_json`
- `body`
- `body_type`
- `response_example`
- `created_at`
- `updated_at`

### 7. Environments

Chức năng:

- Xem danh sách environment theo project.
- Tự tạo environment mặc định `Local` nếu project chưa có.
- Tạo environment mới.
- Cập nhật environment.
- Xóa environment.
- Chọn active environment.
- Thêm biến.
- Sửa biến.
- Xóa biến.
- Resolve biến dạng `{{baseUrl}}`, `{{token}}`.
- Hỗ trợ biến secret ở UI.

Dữ liệu hiện tại:

- `api_fe_environments`: danh sách environment.
- `api_fe_active_environment`: map projectId -> environmentId.

Bảng database gợi ý:

- `environments`
- `environment_variables`
- `active_environments`

Trường quan trọng cho `environment_variables`:

- `id`
- `environment_id`
- `key`
- `initial_value`
- `current_value`
- `type`
- `is_enabled`
- `is_secret`
- `created_at`
- `updated_at`

### 8. Documentation

Chức năng:

- Xem tài liệu API theo project.
- Sinh tài liệu từ collections.
- Lưu tài liệu.
- Sửa endpoint documentation.
- Export Markdown.
- Export HTML.
- Mỗi endpoint có method, url, mô tả, headers, params, body example, response example, error example.

Dữ liệu hiện tại:

- `api_fe_documentation`: docs theo project.

Bảng database gợi ý:

- `api_documentations`
- `api_documentation_endpoints`

Trường quan trọng cho `api_documentation_endpoints`:

- `id`
- `documentation_id`
- `method`
- `url`
- `description`
- `headers_json`
- `params_json`
- `body_example`
- `response_example`
- `error_example`
- `ordinal_position`
- `created_at`
- `updated_at`

### 9. Mock Server

Chức năng:

- Xem mock endpoint theo project.
- Tạo mock endpoint.
- Sửa mock endpoint.
- Xóa mock endpoint.
- Validate path bắt đầu bằng `/`.
- Validate method.
- Validate status code 100-599.
- Cấu hình response headers.
- Cấu hình response body.
- Cấu hình delay.
- Bật/tắt endpoint.
- Sinh mock response mẫu.
- Export mock endpoints JSON.

Dữ liệu hiện tại:

- `api_fe_mock_endpoints`: danh sách mock endpoint.

Bảng database gợi ý:

- `mock_endpoints`
- `mock_endpoint_headers`

Trường quan trọng cho `mock_endpoints`:

- `id`
- `project_id`
- `method`
- `path`
- `status_code`
- `delay_ms`
- `response_headers_json`
- `response_body`
- `is_enabled`
- `created_at`
- `updated_at`

### 10. Activity History

Chức năng:

- Ghi lại hoạt động đăng nhập, đăng ký, OTP, project, database, API tester, ChatDMP, payment, profile.
- Xem lịch sử theo nhóm module.
- Lọc theo module/status/keyword ở service.
- Ẩn/xóa từng activity.
- Xóa toàn bộ activity.
- Giới hạn 200 activity gần nhất.
- Bắn event `activityLogged` để UI cập nhật.

Dữ liệu hiện tại:

- `api_fe_activity_history`: key chính.
- `activity_history`: key legacy.

Bảng database gợi ý:

- `activity_logs`

Trường quan trọng:

- `id`
- `user_id`
- `project_id`
- `module`
- `category`
- `action`
- `description`
- `status`
- `metadata_json`
- `created_at`

### 11. Profile And Settings

Chức năng profile:

- Xem thông tin hồ sơ.
- Chỉnh sửa tên, email, phone, avatar.
- Đổi mật khẩu.
- Xem subscription hiện tại.
- Xem usage stats.
- Mời thành viên ở UI profile mock.

Chức năng settings:

- Đổi ngôn ngữ `vi/en`.
- Cài đặt notification.
- Cài đặt privacy.
- Quản lý API keys mock.
- Xem/cập nhật subscription.
- Xem lịch sử thanh toán.
- Hủy/gia hạn subscription mock.

Dữ liệu hiện tại:

- `api_fe_language`
- `api_fe_settings_notifs`
- `api_fe_settings_privacy`
- `api_fe_settings_apikeys`
- `api_fe_subscription`
- `api_fe_subscription_{userId}`
- `api_fe_selected_plan`

Bảng database gợi ý:

- `user_profiles`
- `user_settings`
- `api_keys`
- `subscriptions`
- `subscription_plans`
- `usage_stats` hoặc bảng event theo từng loại usage.

Trường quan trọng cho `api_keys`:

- `id`
- `user_id`
- `name`
- `key_hash`
- `prefix`
- `status`
- `last_used_at`
- `created_at`
- `revoked_at`

### 12. Payment And Subscription

Chức năng:

- Chọn gói Free/Pro/Ultra.
- Tạo payment mock.
- Sinh order code.
- Hiển thị thông tin chuyển khoản mock.
- Đếm ngược thời gian hết hạn payment.
- Copy nội dung chuyển khoản.
- Xác nhận đã thanh toán ở UI mock.
- Hủy payment.
- Payment success kích hoạt subscription.
- Payment failed clear payment hiện tại.
- Lưu lịch sử giao dịch.
- Admin xem doanh thu.
- Tính doanh thu từ transaction `PAID`/`SUCCESS`.
- Tự gia hạn subscription mock nếu hết hạn và status ACTIVE.

Dữ liệu hiện tại:

- `api_fe_current_payment`
- `api_fe_current_payment_{userId}`
- `api_fe_payment_history`
- `api_fe_subscription`
- `api_fe_subscription_{userId}`

Bảng database gợi ý:

- `subscription_plans`
- `subscriptions`
- `payments`
- `payment_events`
- `invoices` nếu cần hóa đơn.

Trường quan trọng cho `payments`:

- `id`
- `user_id`
- `subscription_id`
- `order_code`
- `provider`
- `bank_name`
- `account_name`
- `account_number`
- `transfer_content`
- `plan_id`
- `plan_name`
- `cycle`
- `amount`
- `currency`
- `status`
- `created_at`
- `expired_at`
- `paid_at`
- `cancelled_at`
- `failed_at`

Trường quan trọng cho `subscriptions`:

- `id`
- `user_id`
- `plan_id`
- `plan_name`
- `price`
- `cycle`
- `status`
- `started_at`
- `activated_at`
- `expired_at`
- `payment_order_code`
- `created_at`
- `updated_at`

### 13. Admin

Chức năng admin overview:

- Tổng số users.
- Tổng số projects.
- Doanh thu trong 24h gần nhất.
- Số giao dịch paid.
- Số API calls.
- Số AI conversations.
- Server load mock theo số project.
- Recent transactions.

Chức năng user management:

- Xem danh sách user.
- Tìm kiếm user.
- Lọc theo role/status.
- Sắp xếp.
- Phân trang.
- Cập nhật status.
- Cập nhật role.
- Cập nhật thông tin admin user.
- Reset password user.
- Xóa user.
- Không cho tự đổi role chính mình.
- Không cho xóa chính mình.
- Không cho xóa admin.

Chức năng revenue management:

- Xem tổng doanh thu.
- Xem transaction.
- Lọc/thống kê doanh thu.
- Export/download ở UI.

Bảng database gợi ý:

- Dùng lại `users`, `projects`, `payments`, `subscriptions`, `activity_logs`.
- Có thể thêm `admin_audit_logs` để lưu thao tác nhạy cảm của admin.

## LocalStorage Keys Hiện Có

Các key này đang đóng vai trò như database mock:

- `api_fe_auth`
- `token`
- `api_fe_token`
- `api_fe_user`
- `api_fe_users`
- `userRole`
- `api_fe_pending_otp`
- `api_fe_reset_email`
- `api_fe_projects`
- `my_dashboard_projects`
- `api_fe_active_project_id`
- `api_fe_workspaces`
- `api_fe_ai_conversations`
- `api_fe_ai_messages`
- `ai_projects_v2`
- `ai_projects`
- `api_fe_database_schemas`
- `api_fe_pending_database_schema`
- `api_fe_pending_api_test_request`
- `api_fe_collections`
- `api_fe_environments`
- `api_fe_active_environment`
- `api_fe_documentation`
- `api_fe_mock_endpoints`
- `api_fe_api_test_history`
- `api_fe_activity_history`
- `activity_history`
- `api_fe_language`
- `api_fe_settings_notifs`
- `api_fe_settings_privacy`
- `api_fe_settings_apikeys`
- `api_fe_subscription`
- `api_fe_subscription_{userId}`
- `api_fe_selected_plan`
- `api_fe_current_payment`
- `api_fe_current_payment_{userId}`
- `api_fe_payment_history`
- `api_fe_last_build_id`

## Database Schema Tổng Quan Đề Xuất

Nhóm user/auth:

- `users`
- `roles`
- `user_sessions`
- `otp_verifications`
- `password_reset_tokens`
- `user_settings`
- `api_keys`

Nhóm project/workspace:

- `projects`
- `project_members`
- `project_tags`
- `workspaces`
- `ai_conversations`
- `ai_messages`

Nhóm API tooling:

- `api_collections`
- `api_folders`
- `api_requests`
- `api_request_headers`
- `api_request_params`
- `api_test_histories`
- `environments`
- `environment_variables`
- `active_environments`
- `api_documentations`
- `api_documentation_endpoints`
- `mock_endpoints`

Nhóm database designer:

- `database_schemas`
- `database_tables`
- `database_columns`
- `database_relationships`
- `database_indexes`

Nhóm billing/admin/log:

- `subscription_plans`
- `subscriptions`
- `payments`
- `payment_events`
- `activity_logs`
- `admin_audit_logs`

## Quan Hệ Chính Giữa Các Bảng

- `users.id` -> `projects.owner_id`
- `users.id` -> `project_members.user_id`
- `projects.id` -> `project_members.project_id`
- `projects.id` -> `workspaces.project_id`
- `projects.id` -> `ai_conversations.project_id`
- `ai_conversations.id` -> `ai_messages.conversation_id`
- `projects.id` -> `database_schemas.project_id`
- `database_schemas.id` -> `database_tables.schema_id`
- `database_tables.id` -> `database_columns.table_id`
- `projects.id` -> `api_collections.project_id`
- `api_collections.id` -> `api_folders.collection_id`
- `api_collections.id` -> `api_requests.collection_id`
- `api_folders.id` -> `api_requests.folder_id`
- `projects.id` -> `environments.project_id`
- `environments.id` -> `environment_variables.environment_id`
- `projects.id` -> `api_documentations.project_id`
- `api_documentations.id` -> `api_documentation_endpoints.documentation_id`
- `projects.id` -> `mock_endpoints.project_id`
- `users.id` -> `subscriptions.user_id`
- `subscription_plans.id` -> `subscriptions.plan_id`
- `users.id` -> `payments.user_id`
- `subscriptions.id` -> `payments.subscription_id`
- `users.id` -> `activity_logs.user_id`
- `projects.id` -> `activity_logs.project_id`

## Gợi Ý API Backend

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/duplicate`

Workspace/AI:

- `GET /api/projects/:projectId/workspace`
- `PATCH /api/projects/:projectId/workspace`
- `GET /api/projects/:projectId/conversations`
- `POST /api/projects/:projectId/conversations`
- `PATCH /api/conversations/:id`
- `DELETE /api/conversations/:id`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `POST /api/ai/chat`
- `POST /api/ai/generate-schema`
- `POST /api/ai/generate-documentation`

Database designer:

- `GET /api/projects/:projectId/database-schema`
- `PUT /api/projects/:projectId/database-schema`
- `POST /api/projects/:projectId/database-schema/tables`
- `PATCH /api/database/tables/:tableId`
- `DELETE /api/database/tables/:tableId`
- `POST /api/database/tables/:tableId/columns`
- `PATCH /api/database/columns/:columnId`
- `DELETE /api/database/columns/:columnId`
- `GET /api/projects/:projectId/database-schema/sql`

API tooling:

- `GET /api/projects/:projectId/collections`
- `POST /api/projects/:projectId/collections`
- `PATCH /api/collections/:id`
- `DELETE /api/collections/:id`
- `POST /api/collections/:id/folders`
- `POST /api/collections/:id/requests`
- `PATCH /api/requests/:id`
- `DELETE /api/requests/:id`
- `GET /api/projects/:projectId/environments`
- `POST /api/projects/:projectId/environments`
- `PATCH /api/environments/:id`
- `DELETE /api/environments/:id`
- `POST /api/environments/:id/variables`
- `PATCH /api/environment-variables/:id`
- `DELETE /api/environment-variables/:id`
- `POST /api/api-tester/send`
- `GET /api/projects/:projectId/api-test-history`

Docs/mock:

- `GET /api/projects/:projectId/documentation`
- `PUT /api/projects/:projectId/documentation`
- `POST /api/projects/:projectId/documentation/generate`
- `GET /api/projects/:projectId/documentation/export.md`
- `GET /api/projects/:projectId/mock-endpoints`
- `POST /api/projects/:projectId/mock-endpoints`
- `PATCH /api/mock-endpoints/:id`
- `DELETE /api/mock-endpoints/:id`

Billing/admin:

- `GET /api/plans`
- `GET /api/subscription`
- `POST /api/payments`
- `GET /api/payments/current`
- `POST /api/payments/:orderCode/confirm`
- `POST /api/payments/:orderCode/cancel`
- `GET /api/payment-history`
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/role`
- `POST /api/admin/users/:id/reset-password`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/revenue`

## Ghi Chú Khi Chuyển Sang Backend Thật

- Không lưu password plain text. Dùng `password_hash`.
- Không tin role từ frontend. Backend phải kiểm tra JWT/session.
- Token nên có access token ngắn hạn và refresh token.
- Các field JSON như headers/body/metadata có thể lưu dạng `jsonb` nếu dùng PostgreSQL.
- Các bảng theo project nên có `project_id` và index theo `project_id`.
- Các bảng log/history nên có index theo `user_id`, `project_id`, `created_at`.
- Các thao tác admin nên ghi `admin_audit_logs`.
- Cần migration để chuyển dữ liệu localStorage sang database nếu muốn giữ dữ liệu mock hiện tại.
- Nên chuẩn hóa legacy keys `ai_projects`, `ai_projects_v2`, `my_dashboard_projects` thành bảng chính thức để tránh trùng dữ liệu.

