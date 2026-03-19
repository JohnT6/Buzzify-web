# NGỮ CẢNH DỰ ÁN & QUY TẮC CHO AI (BUZZIFY - WEB NÂNG CAO)

Tài liệu này lưu trữ các quy tắc, cấu trúc hệ thống và lịch sử sửa lỗi của dự án Buzzify để đảm bảo tính nhất quán.

## 1. QUY TẮC KIÊN QUYẾT (CRITICAL RULES)
- **NGÔN NGỮ**: Luôn giao tiếp và giải thích bằng **Tiếng Việt**.
- **QUẢN LÝ TIẾN TRÌNH**: **PHẢI TẮT** backend và frontend (terminal processes) ngay sau khi test xong hoặc kết thúc phiên làm việc.
- **BẢO MẬT**: Không ghi cứng API Keys/Secrets. Sử dụng `.env` (Frontend) và `appsettings.Local.json` (Backend).
- **VITE PROXY**: Luôn dùng đường dẫn tương đối (e.g., `/api/v1/...`) và để trống `VITE_API_URL` trong `.env` để tận dụng Vite Proxy, tránh lỗi Mixed Content (HTTPS/HTTP) và CORS.
- **SCROLL (Lenis)**: Sử dụng `data-lenis-prevent` cho Modal/Search Dropdown/Scrollable areas.

## 2. CẤU TRÚC HỆ THỐNG (ARCHITECTURE)

### 2.1. Backend (ASP.NET Core 9.0)
- **Cấu trúc**: Clean Architecture (API, Application, Core, Infrastructure).
- **Mapping**: Sử dụng DTOs để kiểm soát dữ liệu trả về (Lu ý casing PascalCase từ C# -> camelCase JSON).

### 2.2. Frontend (React 19 + Vite)
- **Styling**: Tailwind CSS v4.
- **Context**: `MusicContext` quản lý toàn bộ trạng thái bài hát, hàng chờ (queue) và nguồn phát (sourceInfo).

## 3. CÁC PHẦN MỚI HOÀN THÀNH (RECENT UPDATES)
- **Tìm kiếm thông minh (Enhanced Search)**:
    - Tách biệt kết quả "Nghệ sĩ" (Artist) và "Hồ sơ cá nhân" (Profile) để điều hướng chính xác.
    - Tìm kiếm nhanh qua Dropdown với khả năng cuộn độc lập.
    - Trang kết quả tìm kiếm đầy đủ (SearchView) với các Tab phân loại (Tracks, Albums, Playlists, Profiles).
- **Trình phát nhạc (Player Improvement)**:
    - Hiển thị nguồn phát "Playing from: Tìm kiếm" khi phát từ kết quả tìm kiếm.
    - Đồng bộ hóa dữ liệu `tieuDe`, `tenNgheSi` từ Backend DTO.

## 4. CÁC LỖI ĐÃ FIX (BUG FIXES)
- **Lỗi cuộn Dropdown**: Thêm `data-lenis-prevent` để ngăn Lenis Scroll của trang chính chặn thao tác cuộn trong kết quả tìm kiếm.
- **Lỗi Playback (NotSupportedError)**: Do thiếu thuộc tính `Url` trong `SearchResultDto` ở Backend. Đã bổ sung `Url` vào mapping của `SearchService`.
- **Lỗi Mixed Content/CORS**: Do Frontend chạy HTTPS nhưng gọi trực tiếp vào HTTP Backend. Đã chuyển sang dùng Vite Proxy bằng cách để trống `VITE_API_URL`.
- **Lỗi Casing Dữ liệu**: Hỗ trợ fallback casing (`song.tieuDe || song.TieuDe`) để đảm bảo hiển thị dữ liệu ngay cả khi JSON serialization gặp vấn đề.

## 5. VIỆC CẦN LÀM & LỖI ĐANG XỬ LÝ
- [ ] **Tối ưu hóa hình ảnh**: Nén ảnh `public/images` để tăng tốc độ tải trang.
- [ ] **Lyrics Karaoke**: Tiếp tục tinh chỉnh độ mượt của hiệu ứng đổ màu.
- [ ] **Chỉnh sửa Hồ sơ**: Tính năng upload ảnh đại diện chưa hoàn thiện.

## 6. THÔNG TIN COMMIT (GITHUB)
- **Tiêu đề (Commit Title)**: `feat: hoàn thiện chức năng tìm kiếm, sửa lỗi phát nhạc và cấu hình Vite Proxy`
- **Chi tiết (Commit Body)**: 
    - Phân tách Nghệ sĩ/Hồ sơ trong tìm kiếm và fix scroll dropdown.
    - Sửa lỗi NotSupportedError bằng cách bổ sung thuộc tính Url vào Search DTO.
    - Đồng bộ kết nối qua Vite Proxy để xử lý lỗi HTTPS/HTTP Mixed Content.
    - Đơn giản hóa thông tin nguồn phát (sourceInfo) cho tìm kiếm.

---
*Cập nhật lần cuối: 20/03/2026 - Hoàn tất tính năng Tìm kiếm & Playback Stability.*
