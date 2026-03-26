# NGỮ CẢNH DỰ ÁN & QUY TẮC CHO AI (BUZZIFY - WEB NÂNG CAO)

Tài liệu này lưu trữ các quy tắc, cấu trúc hệ thống và lịch sử sửa lỗi của dự án Buzzify để đảm bảo tính nhất quán.

## 1. QUY TẮC KIÊN QUYẾT (CRITICAL RULES)
- **NGÔN NGỮ**: Luôn giao tiếp, giải thích và viết tất cả tài liệu (bao gồm kế hoạch triển khai - implementation plan, danh sách nhiệm vụ - task list, và mọi phản hồi khác) hoàn toàn bằng **Tiếng Việt**.
- **QUẢN LÝ TIẾN TRÌNH**: **PHẢI TẮT** backend và frontend (terminal processes) ngay sau khi test xong hoặc kết thúc phiên làm việc.
- **BẢO MẬT**: Không ghi cứng API Keys/Secrets. Sử dụng `.env` (Frontend) và `appsettings.Local.json` (Backend).
- **VITE PROXY**: Luôn dùng đường dẫn tương đối (e.g., `/api/v1/...`) và để trống `VITE_API_URL` trong `.env` để tận dụng Vite Proxy, tránh lỗi Mixed Content (HTTPS/HTTP) và CORS.
- **SCROLL (Lenis)**: Sử dụng `data-lenis-prevent` cho Modal/Search Dropdown/Scrollable areas.
- **BROWSER TESTING**: Tuyệt đối **KHÔNG** sử dụng công cụ trình duyệt (browser tool) để test. Người dùng sẽ tự thực hiện việc kiểm tra trên trình duyệt.

## 2. CẤU TRÚC HỆ THỐNG (ARCHITECTURE)

### 2.1. Backend (ASP.NET Core 9.0)
- **Cấu trúc**: Clean Architecture (API, Application, Core, Infrastructure).
- **Mapping**: Sử dụng DTOs để kiểm soát dữ liệu trả về (Lu ý casing PascalCase từ C# -> camelCase JSON).

### 2.2. Frontend (React 19 + Vite)
- **Styling**: Tailwind CSS v4.
- **Context**: `MusicContext` quản lý toàn bộ trạng thái bài hát, hàng chờ (queue) và nguồn phát (sourceInfo).

- **Trang Dashboard Nghệ sĩ (Artist Dashboard)**:
    - **Tổng quan (Overview)**: Biểu đồ `recharts` theo dõi lượt nghe, các chỉ số Heart, Play, real-time listeners và biến động follower.
    - **Quản lý Nhạc (Music Management)**: Giao diện bảng quản lý bài hát, tích hợp Modal Upload (Audio/Image). Đã hoàn thiện logic **Đăng/Sửa/Xóa/Ẩn bài hát** (khi ẩn sẽ không hiển thị trên Web chính), xem chi tiết nhạc và hệ thống **Bộ lọc** tìm kiếm.
    - [x] **Quản lý Album cho Artist**: Hiển thị danh sách Album dưới dạng lưới, đã hoàn thiện chức năng **Thêm/Sửa/Xóa** album và xem danh sách bài hát bên trong album.
- [x] **Hệ thống Admin Dashboard (Mới)**:
    - **Tổng quan**: Thống kê số lượng User, Artist, Song và lượt Stream thực tế từ Database.
    - **Quản lý Người dùng**: Xem danh sách, tìm kiếm, thay đổi vai trò (admin/artist/user) và xóa tài khoản.
    - **Quản lý Nghệ sĩ**: Theo dõi trạng thái xác minh và quản lý hồ sơ nghệ sĩ.
    - **Quản lý Album & Nhạc**: Tìm kiếm nâng cao theo tên Album, Artist hoặc Bài hát. Hỗ trợ xem nhanh danh sách nhạc trong Album.
    - **Giao diện**: Đồng bộ phong cách Light Mode với Artist Dashboard, sử dụng tông màu Indigo (Tím xanh) sang trọng.

- **Lỗi build Backend**: Fix lỗi khởi động do thiếu cột `follower_count` trong bảng `artists` (đã bổ sung logic tự động cập nhật Schema trong `DataSeeder.cs`).
- **Lỗi Frontend**: Sửa lỗi sai đường dẫn import CSS trong `AdminLayout.jsx` gây treo ứng dụng (Trang trắng).

- [x] **Phân tách tài khoản Admin/Artist**: Chuẩn hóa tài khoản `admin@buzzify.com` và `charlieputh@buzzify.com` với mật khẩu cố định.
- [ ] **Logic Lưu Playlist**: Hiện thực hóa API lưu dữ liệu playlist mới (đã có UI nhưng chưa có logic lưu hoàn chỉnh).
- [ ] **Lyrics Karaoke**: Tiếp tục tinh chỉnh độ mượt của hiệu ứng đổ màu.

## 6. THÔNG TIN COMMIT (GITHUB)
- **Tiêu đề (Commit Title)**: `feat: hoàn thiện Admin Dashboard và chuẩn hóa phân tách tài khoản Admin/Artist`
- **Chi tiết (Commit Body)**: 
    - Xây dựng module Admin Dashboard (User, Artist, Album Management) với tông màu Indigo.
    - Sửa lỗi DataSeeder: Tự động cập nhật Schema (follower_count) và đồng bộ mật khẩu tài khoản hệ thống.
    - Nâng cấp logic tìm kiếm AlbumRepository hỗ trợ tìm đa cấp.
    - Fix các lỗi import CSS và build error liên quan đến Entity.

---
## 7. TÀI KHOẢN ĐĂNG NHẬP (TEST ACCOUNTS)
- **Tài khoản ADMIN hệ thống**: 
  - Tên đăng nhập (Email): `admin@buzzify.com`
  - Mật khẩu: `Admin123!`
  - Vai trò: `admin`.

- **Tài khoản NGHỆ SĨ (Charlie Puth)**: 
  - Tên đăng nhập (Email): `charlieputh@buzzify.com`
  - Mật khẩu: `Artist123!`
  - Vai trò: `artist`.
  - Redirect: Tự động điều hướng đến Dashboard `/artist`.

- **Tài khoản Artist tự động sinh khác**: 
  - Tên đăng nhập (Email): Tên nghệ sĩ không dấu `@buzzify.com`.
  - Mật khẩu mặc định: `Artist123!`
  - Vai trò: `artist`.

*Cập nhật lần cuối: 27/03/2026 - Hoàn thiện Admin Dashboard & Phân tách tài khoản.*
