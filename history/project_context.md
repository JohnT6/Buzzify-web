# NGỮ CẢNH DỰ ÁN & QUY TẮC CHO AI (BUZZIFY - WEB NÂNG CAO)

Tài liệu này lưu trữ các quy tắc, cấu trúc hệ thống và lịch sử sửa lỗi của dự án Buzzify để đảm bảo tính nhất quán.

## 1. QUY TẮC KIÊN QUYẾT (CRITICAL RULES)
- **NGÔN NGỮ**: Luôn giao tiếp và giải thích bằng **Tiếng Việt**.
- **QUẢN LÝ TIẾN TRÌNH**: **PHẢI TẮT** backend và frontend (terminal processes) ngay sau khi test xong hoặc kết thúc phiên làm việc. Không để chạy ngầm lãng phí tài nguyên.
- **BẢO MẬT**: Không ghi cứng API Keys/Secrets. Sử dụng `.env` (Frontend) và `appsettings.Local.json` (Backend).
- **SCROLL (Lenis)**: Sử dụng `data-lenis-prevent` cho Modal/Scrollable areas. Ngăn chặn sự kiện cuộn lan ra ngoài.

## 2. CẤU TRÚC HỆ THỐNG (ARCHITECTURE)

### 2.1. Backend (ASP.NET Core 9.0)
- **Cấu trúc**: Clean Architecture.
    - **Buzzify.API**: Controllers, Middlewares (xử lý Request/Response).
    - **Buzzify.Application**: Interfaces, DTOs, Services (xử lý Logic nghiệp vụ).
    - **Buzzify.Core**: Entities (Thực thể DB), Interfaces Repository.
    - **Buzzify.Infrastructure**: DbContext, Migrations, Repositories implementation.
- **Dữ liệu**: SQL Server với quan hệ chặt chẽ giữa Artist -> Album -> Song.

### 2.2. Frontend (React 19 + Vite)
- **Styling**: Tailwind CSS v4, Vanilla CSS cho các hiệu ứng đặc biệt.
- **Cấu trúc**:
    - `src/pages`: Các trang chính (Home, Album, Artist, Profile, Explore).
    - `src/layouts`: Bố cục chung (MusicLayout).
    - `src/services`: Giao tiếp API qua `axios_customize` (tự động bóc tách `res.data`).
    - `src/components`: Các thành phần tái sử dụng (MusicPlayer, Common ImgFallback).
    - `src/context`: Quản lý trạng thái toàn cục (MusicContext - Player, Like status).

## 3. CÁC PHẦN MỚI HOÀN THÀNH (RECENT UPDATES)
- **Nâng cấp UI (Premium Look)**:
    - **AlbumView**: Header với ảnh nền blur, bảng bài hát tối giản, chuyên nghiệp.
    - **ArtistView**: Banner anh hùng (Hero), danh sách Top Tracks và Albums theo grid.
    - **ProfileView**: Giao diện người dùng với banner rộng, avatar vòng tròn, trạng thái trống (empty state).
    - **ExploreView**: Các thẻ Featured nằm ngang và các chip thể loại (Genres).
- **Chức năng**:
    - Tích hợp API thực tế cho trang Nghệ sĩ (Lấy thông tin, bài hát, album của nghệ sĩ).
    - Đồng bộ hóa điều hướng: Nhấn vào tên nghệ sĩ ở bất cứ đâu đều dẫn về trang Artist chi tiết.
    - Thành phần `ImgFallback`: Tự động xử lý ảnh lỗi và hiển thị icon thay thế trên toàn hệ thống.
    - Trang Home: "Phát hành mới nhất" giờ đây hiển thị **Album** thay vì bài hát lẻ.

## 4. CÁC LỖI ĐÃ FIX (BUG FIXES)
- **Lỗi "Không tìm thấy Album"**: Do bóc tách dữ liệu dư thừa `.then(res => res.data)` trong khi axios interceptor đã làm việc này.
- **Lỗi điều hướng**: Fix `ReferenceError: navigate is not defined` tại `UserMenu`, `BannerSlider` và các thẻ Card.
- **Lỗi Dữ liệu Nghệ sĩ**: Chuyển từ dữ liệu mẫu (mock) sang API thực tế. Tạo mới `ArtistsController` công khai.
- **Lỗi Like**: Fix truyền tham số sai (truyền ID thay vì Object) trong hàm `toggleLike` tại `ArtistView`.
- **Lỗi Build**: Xóa bỏ các thẻ div dư thừa và import thiếu các icon Lucide.

## 5. VIỆC CẦN LÀM & LỖI ĐANG XỬ LÝ
- [ ] **Lọc theo ArtistId**: Cần tối ưu hóa hiệu suất truy vấn ở Backend cho các danh sách lớn.
- [ ] **Lyrics Karaoke**: Tiếp tục tinh chỉnh độ mượt của hiệu ứng đổ màu (Deep Sync).
- [ ] **Chỉnh sửa Hồ sơ**: Tính năng upload ảnh đại diện và đổi tên chưa hoàn thiện.
- [ ] **Tìm kiếm nâng cao**: Cần tích hợp tìm kiếm theo cả Album và Artist thay vì chỉ Song.

## 6. THÔNG TIN COMMIT (GITHUB)
- **Tiêu đề (Commit Title)**: `feat: nâng cấp giao diện (Album, Artist, Profile, Explore) và sửa lỗi điều hướng/dữ liệu`
- **Chi tiết (Commit Body)**: 
    - Thiết kế lại trang Album, Artist, Profile và Explore với phong cách cao cấp.
    - Tạo API công khai cho Nghệ sĩ và hỗ trợ lọc theo `artistId` cho bài hát/album.
    - Sửa lỗi "Không tìm thấy album" và các lỗi ReferenceError (`navigate`).
    - Chuẩn hóa việc hiển thị hình ảnh với thành phần `ImgFallback` dùng chung.

---
*Cập nhật lần cuối: 19/03/2026 - Hoàn tất đợt nâng cấp UI & Data Integration.*
