# Requirements Document
# Hệ Thống Quản Lý Nhân Sự & Tính Lương (HR & Payroll Management System)

## Introduction

Hệ thống Quản lý Nhân sự & Tính lương (HR & Payroll Management System) là một ứng dụng web Enterprise/B2B được thiết kế để tự động hóa các quy trình quản lý nhân sự, chấm công và tính lương trong doanh nghiệp. Hệ thống hỗ trợ quan hệ dữ liệu phức tạp (1-nhiều, nhiều-nhiều), cung cấp giao diện song ngữ (Tiếng Việt / English), và phân quyền người dùng đa cấp (Admin, HR Manager, Employee).

Các tính năng cốt lõi bao gồm: quản lý nhân viên theo phòng ban và chức vụ, chấm công, tính lương tự động theo công thức chuẩn, báo cáo lương, tìm kiếm và lọc nâng cao.

---

## Glossary

- **HR_System**: Hệ thống Quản lý Nhân sự & Tính lương (toàn bộ ứng dụng web).
- **Auth_Service**: Mô-đun xác thực và phân quyền người dùng.
- **Employee_Manager**: Mô-đun quản lý hồ sơ nhân viên.
- **Department_Manager**: Mô-đun quản lý phòng ban.
- **Position_Manager**: Mô-đun quản lý chức vụ.
- **Attendance_Manager**: Mô-đun chấm công và theo dõi ngày làm việc.
- **Payroll_Engine**: Mô-đun tính toán và xử lý bảng lương.
- **Report_Generator**: Mô-đun xuất báo cáo lương.
- **Search_Filter**: Mô-đun tìm kiếm và lọc nhân viên nâng cao.
- **Admin**: Người dùng có quyền cao nhất — quản lý toàn bộ hệ thống, tài khoản, phân quyền.
- **HR_Manager**: Người dùng cấp HR — quản lý nhân viên, chấm công, bảng lương, báo cáo.
- **Employee**: Người dùng thông thường — xem thông tin cá nhân, phiếu lương của bản thân.
- **Nhân_Viên**: Một cá nhân được đăng ký trong hệ thống, thuộc một phòng ban và có một chức vụ.
- **Phòng_Ban**: Đơn vị tổ chức trong doanh nghiệp (ví dụ: Kỹ thuật, Kinh doanh, Kế toán).
- **Chức_Vụ**: Vị trí công việc của nhân viên trong phòng ban (ví dụ: Nhân viên, Trưởng phòng).
- **Lương_Cơ_Bản**: Mức lương cố định hàng tháng được thỏa thuận trong hợp đồng.
- **Ngày_Công_Chuẩn**: Số ngày làm việc tiêu chuẩn trong tháng (mặc định: 26 ngày).
- **Ngày_Công_Thực_Tế**: Số ngày nhân viên thực sự chấm công có mặt trong tháng.
- **Phụ_Cấp**: Khoản tiền bổ sung (phụ cấp ăn trưa, đi lại, điện thoại, v.v.).
- **Phạt**: Khoản trừ lương do vi phạm nội quy (đi muộn, nghỉ không phép, v.v.).
- **Lương_Thực_Nhận**: Lương thực tế nhận được, tính theo công thức:
  `Lương_Thực_Nhận = (Lương_Cơ_Bản / Ngày_Công_Chuẩn) × Ngày_Công_Thực_Tế + Phụ_Cấp - Phạt`
- **Trạng_Thái_Nhân_Viên**: Một trong ba trạng thái: `Thử_Việc`, `Chính_Thức`, `Đã_Nghỉ_Việc`.
- **Kỳ_Lương**: Chu kỳ tính lương, thường là một tháng dương lịch.
- **Bảng_Lương**: Danh sách tổng hợp Lương_Thực_Nhận của tất cả nhân viên trong một Kỳ_Lương.
- **JWT_Token**: Mã xác thực JSON Web Token dùng để duy trì phiên đăng nhập.
- **I18n**: Hệ thống đa ngôn ngữ (Internationalization) — hỗ trợ Tiếng Việt và English.

---

## Requirements

### Requirement 1: Xác Thực & Quản Lý Tài Khoản (Authentication & Account Management)

**User Story:** Với tư cách là người dùng hệ thống, tôi muốn đăng nhập bằng tài khoản của mình để có thể truy cập các tính năng phù hợp với vai trò được phân công.

#### Acceptance Criteria

1. WHEN người dùng gửi thông tin đăng nhập hợp lệ (email và mật khẩu), THE Auth_Service SHALL xác thực thông tin và trả về JWT_Token có thời hạn 8 giờ.
2. WHEN người dùng gửi thông tin đăng nhập không hợp lệ (sai email hoặc mật khẩu), THE Auth_Service SHALL trả về thông báo lỗi mô tả nguyên nhân và không tiết lộ thông tin bảo mật nhạy cảm.
3. WHEN JWT_Token hết hạn hoặc không hợp lệ, THE Auth_Service SHALL từ chối yêu cầu truy cập và trả về mã lỗi 401.
4. WHEN người dùng đăng xuất, THE Auth_Service SHALL vô hiệu hóa JWT_Token hiện tại trong vòng 1 giây.
5. THE Auth_Service SHALL lưu trữ mật khẩu người dùng dưới dạng mã băm (hash) bằng thuật toán bcrypt với cost factor tối thiểu 10; mật khẩu plaintext SHALL NOT được lưu trữ.
6. WHEN HR_Manager tạo tài khoản mới, THE Auth_Service SHALL gán vai trò (Admin, HR_Manager, hoặc Employee) và gửi email kích hoạt đến địa chỉ email được đăng ký trong vòng 2 phút; IF hệ thống email không gửi được trong vòng 2 phút, THEN THE Auth_Service SHALL hủy việc tạo tài khoản và trả về thông báo lỗi.
7. IF tài khoản bị khóa sau 5 lần đăng nhập sai liên tiếp, THEN THE Auth_Service SHALL từ chối cấp JWT_Token và yêu cầu Admin hoặc HR_Manager mở khóa tài khoản trước khi cho phép đăng nhập tiếp theo; tài khoản bị khóa SHALL NOT nhận JWT_Token dù thông tin đăng nhập có đúng hay không.
8. WHERE tính năng đổi mật khẩu được sử dụng, THE Auth_Service SHALL yêu cầu người dùng nhập mật khẩu cũ hợp lệ và mật khẩu mới có độ dài tối thiểu 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ số, và một ký tự đặc biệt.

### Requirement 2: Phân Quyền Người Dùng (Role-Based Access Control)

**User Story:** Với tư cách là Admin, tôi muốn kiểm soát quyền truy cập của từng vai trò để bảo vệ dữ liệu nhạy cảm và đảm bảo mỗi người chỉ thấy những gì họ được phép.

#### Acceptance Criteria

1. THE HR_System SHALL phân quyền theo ba vai trò cố định: Admin, HR_Manager, và Employee; mỗi tài khoản SHALL được gán đúng một vai trò.
2. WHILE người dùng có vai trò Admin đang đăng nhập, THE HR_System SHALL cho phép truy cập toàn bộ chức năng bao gồm quản lý tài khoản, cấu hình hệ thống, và xem mọi dữ liệu.
3. WHILE người dùng có vai trò HR_Manager đang đăng nhập, THE HR_System SHALL cho phép thực hiện CRUD nhân viên, quản lý chấm công, tính lương, và xuất báo cáo; HR_Manager SHALL NOT được phép truy cập quản lý tài khoản hệ thống.
4. WHILE người dùng có vai trò Employee đang đăng nhập, THE HR_System SHALL giới hạn quyền truy cập chỉ vào hồ sơ cá nhân và phiếu lương của chính người dùng đó.
5. WHEN một yêu cầu truy cập tài nguyên không thuộc quyền của vai trò hiện tại được gửi đến, THE Auth_Service SHALL từ chối yêu cầu và trả về mã lỗi 403 kèm thông báo mô tả.
6. THE Auth_Service SHALL kiểm tra quyền truy cập tại tầng API (server-side) cho mọi yêu cầu; việc ẩn/hiện menu phía client SHALL được coi là bổ sung UX, không phải cơ chế bảo mật.
7. WHEN người dùng chưa đăng nhập gửi yêu cầu truy cập bất kỳ dữ liệu nhân viên nào, THE Auth_Service SHALL từ chối yêu cầu và trả về mã lỗi 401.

### Requirement 3: Quản Lý Phòng Ban & Chức Vụ (Department & Position Management)

**User Story:** Với tư cách là HR_Manager, tôi muốn quản lý phòng ban và chức vụ để tổ chức cơ cấu nhân sự doanh nghiệp một cách có hệ thống.

#### Acceptance Criteria

1. THE Department_Manager SHALL cho phép Admin và HR_Manager tạo, xem, cập nhật, và xóa Phòng_Ban với các thuộc tính: mã phòng ban (duy nhất), tên phòng ban, mô tả, và trạng thái hoạt động.
2. THE Position_Manager SHALL cho phép Admin và HR_Manager tạo, xem, cập nhật, và xóa Chức_Vụ với các thuộc tính: mã chức vụ (duy nhất), tên chức vụ, mô tả, và mức lương cơ bản tham chiếu.
3. WHEN HR_Manager xóa một Phòng_Ban đang có Nhân_Viên thuộc về, THE Department_Manager SHALL từ chối thao tác xóa và trả về danh sách nhân viên đang thuộc phòng ban đó.
4. WHEN HR_Manager xóa một Chức_Vụ đang được gán cho Nhân_Viên, THE Position_Manager SHALL từ chối thao tác xóa và trả về danh sách nhân viên đang giữ chức vụ đó.
5. THE Department_Manager SHALL duy trì mối quan hệ một-nhiều: một Phòng_Ban có thể chứa nhiều Nhân_Viên, và một Nhân_Viên thuộc đúng một Phòng_Ban tại một thời điểm.
6. THE Position_Manager SHALL duy trì mối quan hệ một-nhiều: một Chức_Vụ có thể được giữ bởi nhiều Nhân_Viên, và một Nhân_Viên giữ đúng một Chức_Vụ tại một thời điểm.

### Requirement 4: Quản Lý Nhân Viên (Employee Management)

**User Story:** Với tư cách là HR_Manager, tôi muốn thực hiện đầy đủ CRUD hồ sơ nhân viên, gắn nhân viên vào phòng ban và chức vụ, để duy trì cơ sở dữ liệu nhân sự chính xác và cập nhật.

#### Acceptance Criteria

1. THE Employee_Manager SHALL cho phép Admin và HR_Manager tạo hồ sơ Nhân_Viên mới với các trường bắt buộc: họ tên đầy đủ, ngày sinh, giới tính, số CCCD/CMND (duy nhất), số điện thoại, email công ty (duy nhất), Phòng_Ban, Chức_Vụ, ngày bắt đầu làm việc, Lương_Cơ_Bản, và Trạng_Thái_Nhân_Viên.
2. THE Employee_Manager SHALL cho phép Admin và HR_Manager xem, cập nhật, và vô hiệu hóa hồ sơ Nhân_Viên; thao tác xóa vĩnh viễn SHALL NOT được phép để bảo toàn lịch sử lương.
3. WHEN HR_Manager cập nhật Phòng_Ban hoặc Chức_Vụ của Nhân_Viên, THE Employee_Manager SHALL ghi lại lịch sử thay đổi bao gồm: ngày thay đổi, giá trị cũ, giá trị mới, và tên người thực hiện thay đổi.
4. WHEN HR_Manager thay đổi Trạng_Thái_Nhân_Viên sang `Đã_Nghỉ_Việc`, THE Employee_Manager SHALL ghi nhận ngày nghỉ việc và ngăn không cho nhân viên đó được tạo bản ghi chấm công mới sau ngày nghỉ việc.
5. THE Employee_Manager SHALL cho phép Admin và HR_Manager tải lên ảnh đại diện nhân viên với định dạng JPG hoặc PNG, kích thước tối đa 5MB; chức năng tải ảnh SHALL hoạt động độc lập với thao tác tạo hồ sơ nhân viên mới.
6. IF email công ty hoặc số CCCD/CMND đã tồn tại trong hệ thống, THEN THE Employee_Manager SHALL từ chối tạo hồ sơ và trả về thông báo lỗi chỉ rõ trường bị trùng.
7. WHERE tính năng lịch sử thay đổi được truy cập, THE Employee_Manager SHALL hiển thị toàn bộ lịch sử thay đổi chức vụ và phòng ban của Nhân_Viên theo thứ tự thời gian giảm dần.

### Requirement 5: Quản Lý Chấm Công (Attendance Management)

**User Story:** Với tư cách là HR_Manager, tôi muốn ghi nhận và quản lý dữ liệu chấm công hàng ngày của nhân viên để làm cơ sở tính lương chính xác theo số ngày công thực tế.

#### Acceptance Criteria

1. THE Attendance_Manager SHALL cho phép Admin và HR_Manager tạo, xem, cập nhật, và xóa bản ghi chấm công của Nhân_Viên, mỗi bản ghi bao gồm: mã nhân viên, ngày chấm công, giờ vào, giờ ra, và loại ngày công (Có_Mặt, Nghỉ_Phép, Nghỉ_Lễ, Nghỉ_Không_Phép).
2. WHEN HR_Manager tạo bản ghi chấm công cho một ngày đã có bản ghi của cùng Nhân_Viên, THE Attendance_Manager SHALL từ chối yêu cầu dựa trên kết quả kiểm tra xung đột ngày và trả về thông báo chỉ rõ ngày bị trùng; việc phát hiện xung đột ngày công là điều kiện đủ để từ chối.
3. WHEN HR_Manager truy vấn chấm công theo tháng của một Nhân_Viên, THE Attendance_Manager SHALL trả về tổng số ngày công theo từng loại (Có_Mặt, Nghỉ_Phép, Nghỉ_Lễ, Nghỉ_Không_Phép) và tổng Ngày_Công_Thực_Tế trong vòng 500 mili-giây.
4. WHILE Nhân_Viên có Trạng_Thái_Nhân_Viên là `Đã_Nghỉ_Việc`, THE Attendance_Manager SHALL từ chối mọi yêu cầu tạo bản ghi chấm công mới cho Nhân_Viên đó.
5. THE Attendance_Manager SHALL cho phép HR_Manager nhập chấm công hàng loạt từ file Excel/CSV với định dạng chuẩn; IF file chứa dữ liệu không hợp lệ, THEN THE Attendance_Manager SHALL báo cáo danh sách dòng lỗi cụ thể mà không hủy toàn bộ lô nhập.
6. THE Attendance_Manager SHALL tính Ngày_Công_Thực_Tế bằng tổng số bản ghi có loại ngày công là `Có_Mặt` và `Nghỉ_Phép` trong một Kỳ_Lương.

### Requirement 6: Quản Lý Phụ Cấp & Phạt (Allowances & Deductions Management)

**User Story:** Với tư cách là HR_Manager, tôi muốn quản lý các khoản phụ cấp và phạt của từng nhân viên theo từng kỳ lương để đảm bảo bảng lương phản ánh đúng thực tế.

#### Acceptance Criteria

1. THE Payroll_Engine SHALL cho phép Admin và HR_Manager tạo và quản lý các loại phụ cấp với tên (ví dụ: Phụ cấp ăn trưa, Phụ cấp đi lại) và giá trị mặc định; mỗi Nhân_Viên có thể có nhiều loại phụ cấp trong một Kỳ_Lương (quan hệ nhiều-nhiều).
2. THE Payroll_Engine SHALL cho phép Admin và HR_Manager tạo và quản lý các loại phạt với tên (ví dụ: Đi muộn, Nghỉ không phép) và mức phạt; mỗi Nhân_Viên có thể có nhiều khoản phạt trong một Kỳ_Lương.
3. WHEN HR_Manager gán phụ cấp hoặc phạt cho Nhân_Viên trong một Kỳ_Lương, THE Payroll_Engine SHALL tự động cập nhật giá trị tổng Phụ_Cấp và tổng Phạt tương ứng trong bản ghi lương của Kỳ_Lương đó.
4. THE Payroll_Engine SHALL tổng hợp tổng Phụ_Cấp bằng cách cộng tất cả giá trị phụ cấp được gán cho Nhân_Viên trong Kỳ_Lương; tương tự, tổng Phạt là tổng tất cả khoản phạt.

### Requirement 7: Tính Lương (Payroll Calculation)

**User Story:** Với tư cách là HR_Manager, tôi muốn hệ thống tự động tính Lương_Thực_Nhận cho từng nhân viên theo công thức chuẩn để loại bỏ sai sót thủ công và tiết kiệm thời gian.

#### Acceptance Criteria

1. THE Payroll_Engine SHALL tính Lương_Thực_Nhận theo công thức: `Lương_Thực_Nhận = (Lương_Cơ_Bản / Ngày_Công_Chuẩn) × Ngày_Công_Thực_Tế + Phụ_Cấp - Phạt`; trong đó Ngày_Công_Chuẩn mặc định là 26 nếu không được cấu hình khác.
2. WHEN HR_Manager khởi tạo tính lương cho một Kỳ_Lương, THE Payroll_Engine SHALL tính Lương_Thực_Nhận cho tất cả Nhân_Viên có Trạng_Thái_Nhân_Viên là `Thử_Việc` hoặc `Chính_Thức` trong Kỳ_Lương đó, sử dụng stored procedure tại tầng database.
3. THE Payroll_Engine SHALL làm tròn kết quả Lương_Thực_Nhận đến đơn vị nghìn đồng (VND) gần nhất theo quy tắc làm tròn toán học tiêu chuẩn.
4. IF Lương_Thực_Nhận sau khi tính toán cho kết quả âm, THEN THE Payroll_Engine SHALL ghi nhận giá trị bằng 0 và gắn cờ cảnh báo `SALARY_NEGATIVE_FLAG` cho HR_Manager xem xét thủ công.
5. WHEN HR_Manager thay đổi Lương_Cơ_Bản của Nhân_Viên trong tháng hiện tại, THE Payroll_Engine SHALL áp dụng Lương_Cơ_Bản mới cho Kỳ_Lương tiếp theo; Kỳ_Lương đã được chốt SHALL NOT bị thay đổi tự động.
6. THE Payroll_Engine SHALL ghi lại nhật ký tính lương bao gồm: thời điểm tính, người thực hiện, Kỳ_Lương, số lượng nhân viên được tính, và tổng quỹ lương của Kỳ_Lương đó.
7. WHEN HR_Manager chốt bảng lương (Kỳ_Lương được đánh dấu `Đã_Chốt`), THE Payroll_Engine SHALL ngăn mọi thay đổi đối với dữ liệu chấm công và phụ cấp/phạt thuộc Kỳ_Lương đó.

### Requirement 8: Tìm Kiếm & Lọc Nâng Cao (Advanced Search & Filter)

**User Story:** Với tư cách là HR_Manager, tôi muốn tìm kiếm và lọc nhân viên theo nhiều tiêu chí kết hợp để nhanh chóng tìm thấy thông tin cần thiết trong danh sách nhân sự lớn.

#### Acceptance Criteria

1. THE Search_Filter SHALL cho phép Admin và HR_Manager tìm kiếm Nhân_Viên theo họ tên (tìm kiếm toàn văn, không phân biệt hoa/thường, hỗ trợ tìm theo từng phần của tên).
2. THE Search_Filter SHALL cho phép Admin và HR_Manager lọc danh sách Nhân_Viên theo một hoặc nhiều tiêu chí kết hợp: Phòng_Ban, Chức_Vụ, và Trạng_Thái_Nhân_Viên.
3. WHEN HR_Manager áp dụng bộ lọc, THE Search_Filter SHALL trả về kết quả phù hợp trong vòng 1 giây đối với danh sách lên đến 10.000 nhân viên, sử dụng kỹ thuật phân trang (pagination) với 20 kết quả mỗi trang theo mặc định.
4. THE Search_Filter SHALL cho phép HR_Manager sắp xếp kết quả tìm kiếm theo: họ tên (A-Z / Z-A), ngày bắt đầu làm việc (cũ nhất / mới nhất), và Lương_Cơ_Bản (thấp nhất / cao nhất).
5. WHERE tính năng xuất kết quả tìm kiếm được sử dụng, THE Search_Filter SHALL cho phép HR_Manager xuất danh sách kết quả hiện tại ra định dạng Excel (.xlsx).

### Requirement 9: Báo Cáo Lương (Payroll Report)

**User Story:** Với tư cách là HR_Manager, tôi muốn xuất bảng lương theo tháng và theo phòng ban để nộp cho kế toán và lưu trữ hồ sơ doanh nghiệp.

#### Acceptance Criteria

1. THE Report_Generator SHALL cho phép Admin và HR_Manager xuất Bảng_Lương của một Kỳ_Lương cụ thể, bao gồm các cột: STT, Mã NV, Họ Tên, Phòng Ban, Chức Vụ, Lương Cơ Bản, Ngày Công Chuẩn, Ngày Công Thực Tế, Phụ Cấp, Phạt, và Lương Thực Nhận.
2. THE Report_Generator SHALL cho phép lọc Bảng_Lương theo Phòng_Ban để xuất bảng lương riêng cho từng đơn vị.
3. WHEN HR_Manager yêu cầu xuất báo cáo, THE Report_Generator SHALL tạo và trả về file Excel (.xlsx) hoặc PDF theo lựa chọn của người dùng trong vòng 10 giây đối với Bảng_Lương có đến 500 nhân viên, kể cả khi Bảng_Lương có 0 nhân viên; WHEN Bảng_Lương có hơn 500 nhân viên, THE Report_Generator SHALL tiếp tục xử lý mà không đảm bảo giới hạn thời gian 10 giây.
4. THE Report_Generator SHALL bao gồm dòng tổng hợp ở cuối Bảng_Lương thể hiện: tổng số nhân viên, tổng quỹ lương, tổng phụ cấp, và tổng khoản phạt.
5. WHERE tính năng so sánh lương được sử dụng, THE Report_Generator SHALL cho phép Admin và HR_Manager so sánh Bảng_Lương của hai Kỳ_Lương liên tiếp, hiển thị mức chênh lệch theo giá trị tuyệt đối và phần trăm cho từng Nhân_Viên.
6. WHEN HR_Manager xem phiếu lương cá nhân, THE Report_Generator SHALL cho phép Employee xem và tải về phiếu lương PDF của chính mình cho các Kỳ_Lương đã được chốt.

### Requirement 10: Đa Ngôn Ngữ (Internationalization)

**User Story:** Với tư cách là người dùng, tôi muốn có thể chuyển đổi ngôn ngữ giao diện giữa Tiếng Việt và English để sử dụng hệ thống theo ngôn ngữ quen thuộc của mình.

#### Acceptance Criteria

1. THE HR_System SHALL hỗ trợ hai ngôn ngữ giao diện: Tiếng Việt (`vi`) và English (`en`); ngôn ngữ mặc định khi đăng nhập lần đầu là Tiếng Việt.
2. WHEN người dùng thay đổi ngôn ngữ giao diện, THE HR_System SHALL áp dụng ngôn ngữ mới ngay lập tức cho toàn bộ nội dung giao diện mà không yêu cầu tải lại trang, bất kể sự khác biệt về hướng văn bản hoặc font chữ cần tải.
3. THE HR_System SHALL lưu lựa chọn ngôn ngữ của người dùng vào tài khoản; WHEN người dùng đăng nhập lại, THE HR_System SHALL khôi phục ngôn ngữ đã lưu trước đó.
4. THE HR_System SHALL dịch tất cả thông báo lỗi, nhãn form, menu điều hướng, và tiêu đề bảng sang ngôn ngữ được chọn; dữ liệu nghiệp vụ (tên nhân viên, phòng ban) SHALL được hiển thị nguyên gốc như đã nhập.

### Requirement 11: Thiết Kế Cơ Sở Dữ Liệu & Query Phức Tạp (Database Design & Complex Queries)

**User Story:** Với tư cách là nhà phát triển hệ thống, tôi muốn cơ sở dữ liệu được thiết kế với ràng buộc khóa ngoại rõ ràng và hỗ trợ stored procedure để đảm bảo tính toàn vẹn dữ liệu và hiệu năng xử lý lương.

#### Acceptance Criteria

1. THE HR_System SHALL triển khai cơ sở dữ liệu quan hệ với tối thiểu các bảng: `users`, `employees`, `departments`, `positions`, `attendance_records`, `salary_periods`, `payroll_records`, `allowance_types`, `deduction_types`, `employee_allowances`, `employee_deductions`, và `employee_history`; mỗi bảng SHALL có khóa chính (PRIMARY KEY) và các khóa ngoại (FOREIGN KEY) phù hợp.
2. THE HR_System SHALL triển khai stored procedure `sp_calculate_payroll` nhận đầu vào là `salary_period_id` và thực hiện tính Lương_Thực_Nhận cho tất cả nhân viên thuộc Kỳ_Lương đó trong một transaction duy nhất; IF bất kỳ bước tính toán nào thất bại, THEN stored procedure SHALL rollback toàn bộ transaction.
3. THE HR_System SHALL sử dụng JOIN nhiều bảng (tối thiểu 4 bảng) khi truy vấn danh sách nhân viên với thông tin phòng ban, chức vụ, và dữ liệu lương gần nhất.
4. THE HR_System SHALL tạo index trên các cột thường xuyên được dùng để lọc và sắp xếp: `employee_id`, `department_id`, `position_id`, `salary_period_id`, `attendance_date`, và `status` để đảm bảo hiệu năng truy vấn.
5. THE HR_System SHALL triển khai ràng buộc toàn vẹn tham chiếu (referential integrity) tại tầng database; IF một thao tác vi phạm ràng buộc khóa ngoại, THEN database SHALL từ chối thao tác và trả về lỗi constraint violation.

### Requirement 12: Dashboard & Tổng Quan Hệ Thống (Dashboard & System Overview)

**User Story:** Với tư cách là Admin hoặc HR_Manager, tôi muốn xem tổng quan nhanh về tình trạng nhân sự và lương để nắm bắt được tình hình doanh nghiệp ngay khi đăng nhập.

#### Acceptance Criteria

1. WHEN Admin hoặc HR_Manager đăng nhập thành công, THE HR_System SHALL hiển thị Dashboard với các chỉ số tổng quan: tổng số nhân viên đang hoạt động, số nhân viên đang thử việc, số nhân viên đã nghỉ việc trong tháng hiện tại, và tổng quỹ lương của Kỳ_Lương gần nhất.
2. THE HR_System SHALL hiển thị biểu đồ phân bổ nhân viên theo Phòng_Ban và biểu đồ xu hướng tổng quỹ lương theo 6 Kỳ_Lương gần nhất.
3. THE HR_System SHALL cập nhật dữ liệu Dashboard khi người dùng tải lại trang; dữ liệu hiển thị SHALL phản ánh trạng thái thực tế trong cơ sở dữ liệu tại thời điểm tải.
4. WHILE người dùng có vai trò Employee đang đăng nhập, THE HR_System SHALL hiển thị Dashboard cá nhân với: thông tin hồ sơ, số ngày công tháng hiện tại, và Lương_Thực_Nhận của Kỳ_Lương gần nhất đã chốt.

---

## Phụ Lục: Sơ Đồ Quan Hệ Thực Thể (Entity Relationship Overview)

```
departments (1) ──── (N) employees (N) ──── (1) positions
                          │
                    (1)   │   (1)
                          │
              attendance_records (N per month)
                          │
                    salary_periods (1) ──── (N) payroll_records
                                                      │
                                          employee_allowances (N)
                                          employee_deductions (N)
                                          employee_history   (N)
```

**Quan hệ nhiều-nhiều:**
- `employees` ↔ `allowance_types` (qua bảng `employee_allowances` với cột `salary_period_id`)
- `employees` ↔ `deduction_types` (qua bảng `employee_deductions` với cột `salary_period_id`)
