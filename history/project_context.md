# NGỮ CẢNH DỰ ÁN & QUY TẮC CHO AI (BUZZIFY - WEB NÂNG CAO)

Tài liệu này lưu trữ các quy tắc và thông tin quan trọng nhất của dự án Buzzify để đảm bảo tính nhất quán qua các phiên làm việc.

## 1. QUY TẮC BẮT BUỘC (AI RULES)
- **NGÔN NGỮ**: Luôn giao tiếp và giải thích bằng **Tiếng Việt**.
- **KHÔNG CHẠY NGẦM**: Không tự ý chạy `npm run dev` hoặc `dotnet run`.
- **BẢO MẬT**: Tuyệt đối không ghi cứng mã khóa (API Keys, Secrets) vào code. Luôn sử dụng `.env` cho frontend và `appsettings.Local.json` cho backend.
- **SMOOTH SCROLL**: Dự án dùng `Lenis`. Bất kỳ vùng nội dung nào có `overflow` riêng phải thêm thuộc tính **`data-lenis-prevent`** để scroll chuột hoạt động.

## 2. CẤU TRÚC DỰ ÁN & TECH STACK
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Context API.
- **Backend**: ASP.NET Core 8.0 (Clean Architecture).
- **Database**: SQL Server (EF Core).
- **Security**: JWT Authentication, hỗ trợ đăng nhập Google/Facebook qua bên thứ ba.

## 3. CÁC QUY ƯỚC UI/UX QUAN TRỌNG (ĐÃ CHỐT)

### 3.1. Music Player & Modal
- **Màu sắc chủ đạo**: Màu xanh thương hiệu (Buzzify Blue) là **`#0F5E8F`** (ACCENT). Sử dụng cho các nút Play, thanh tiến trình, và hiệu ứng sóng nhạc (music columns).
- **Tương tác Modal**: 
    - Modal bài hát có hiệu ứng trượt lên/xuống (slide animation).
    - Thanh Player Bar bên dưới luôn nằm đè lên trên Modal (z-index cao hơn) và giữ nguyên vị trí khi modal mở.
    - Ảnh bìa trong modal được căn chỉnh ngang hàng với danh sách hàng chờ (Play Queue).
- **Hiệu ứng Hover**: Ảnh bài hát trong danh sách hàng chờ (History/Next Up) phải hiện icon Play khi hover.

### 3.2. Quản lý Playlist & Dữ liệu
- **Lọc Playlist**: Playlist "Bài hát yêu thích" (Liked Songs) được tách riêng vào mục "Yêu thích" hoặc Library. Nó PHẢI bị lọc bỏ khỏi danh sách "Custom mixes" trên trang chủ và danh sách "Playlist của tôi" ở sidebar để tránh trùng lặp.
- **Dữ liệu thực**: Mọi dữ liệu (Nghệ sĩ, Album, Playlist, Bài hát) phải lấy từ Database, không dùng dữ liệu giả.

## 4. QUY TRÌNH THIẾT LẬP BẢO MẬT (NEW)
1. **Frontend**: Các mã khóa Google/Facebook nằm trong tệp `.env`. Truy cập qua `import.meta.env`.
2. **Backend**: Các thông tin như Connection String, Jwt Key, Email Password nằm trong tệp `appsettings.Local.json`. Tệp này không được đẩy lên Git (đã cấu hình trong `.gitignore`).
3. **README.md**: Tệp hướng dẫn cài đặt nằm ở thư mục gốc để hướng dẫn người dùng mới cấu hình dự án.

## 5. CÁC LỖI ĐÃ FIX & LƯU Ý
- **Scroll Fix**: Đã sửa lỗi không cuộn được chuột trong modal bằng `data-lenis-prevent`.
- **Logic Queue**: Fix lỗi mất playlist khi click chọn bài hát bất kỳ trong History hoặc Next Up. Hiện tại, khi click vào bài hát trong queue, nó sẽ phát ngay trong ngữ cảnh của danh sách đó.
- **Z-Index**: Đảm bảo MusicPlayerBar luôn ở trên cùng để người dùng luôn có thể điều khiển nhạc.

---
*Cập nhật lần cuối: 18/03/2026 - Phiên làm việc hoàn thiện UI Player & Bảo mật.*
