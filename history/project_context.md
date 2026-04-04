# NGỮ CẢNH DỰ ÁN & QUY TẮC CHO AI (BUZZIFY - WEB NÂNG CAO)

Tài liệu này lưu trữ các quy tắc, cấu trúc hệ thống và lịch sử sửa lỗi của dự án Buzzify để đảm bảo tính nhất quán.

## 1. QUY TẮC KIÊN QUYẾT (CRITICAL RULES)
- **NGÔN NGỮ**: Luôn giao tiếp, giải thích và viết tất cả tài liệu (bao gồm kế hoạch triển khai - implementation plan, danh sách nhiệm vụ - task list, và báo cáo hoàn thành - walkthrough) hoàn toàn bằng **Tiếng Việt**. Đây là quy tắc kiên quyết và bắt buộc cho mọi phản hồi.
- **QUẢN LÝ TIẾN TRÌNH**: **PHẢI TẮT** backend và frontend (terminal processes) ngay sau khi test xong hoặc kết thúc phiên làm việc.
- **BẢO MẬT**: Không ghi cứng API Keys/Secrets. Sử dụng `.env` (Frontend) và `appsettings.Local.json` (Backend).
- **VITE PROXY**: Luôn dùng đường dẫn tương đối (e.g., `/api/v1/...`) và để trống `VITE_API_URL` trong `.env` để tận dụng Vite Proxy, tránh lỗi Mixed Content (HTTPS/HTTP) và CORS.
- **SCROLL (Lenis)**: Sử dụng `data-lenis-prevent` cho Modal/Search Dropdown/Scrollable areas.
- **BROWSER TESTING**: Tuyệt đối **KHÔNG** sử dụng công cụ trình duyệt (browser tool) để test. Người dùng sẽ tự thực hiện việc kiểm tra trên trình duyệt.

## 2. CẤU TRÚC HỆ THỐNG (ARCHITECTURE)

### 2.1. Backend (ASP.NET Core 9.0)
- **Cấu trúc**: Clean Architecture (API, Application, Core, Infrastructure).
- **Mapping**: Sử dụng DTOs để kiểm soát dữ liệu trả về (Lu ý casing PascalCase từ C# -> camelCase JSON).
- **Database Schema (Tự động cập nhật)**:
    - `Songs`: Bổ sung `scheduled_publish_date` (Đặt lịch), `is_muted` (Vi phạm bản quyền/Chặn phát).
    - `Albums`: Bổ sung `scheduled_publish_date`.
    - `Artists`: Bổ sung `follower_count`, `is_verified`, `bio`, `cover_image`.
    - `Playlists`: Bổ sung `is_system` (Playlist hệ thống), `is_featured` (Nổi bật).
    - `Profiles`: Bổ sung `is_locked` (Khóa tài khoản).
- **Dịch vụ mới**: Hệ thống **Thể loại (Genres)** tích hợp `TheLoaiService` và `GenresController`.

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
- [x] **Logic Lưu Playlist**: Đã hoàn thiện UI và chuẩn bị API lưu dữ liệu (IsSystem, IsFeatured cho Admin).
- [x] **DateTimePicker Tùy chỉnh**: Linh hoạt chọn Ngày -> Giờ, hỗ trợ nhập thủ công, giao diện hiện đại.
- [x] **Nâng cấp Quản lý Playlist (Admin)**: Đã hoàn thiện UI Editorial, gán Thể loại và Quản lý bài hát.
- [x] **Sửa lỗi Tạo Playlist (Admin)**: Đã xử lý lỗi 500 (DbUpdateException) bằng cách hỗ trợ URL ảnh bìa trực tiếp, tránh vi phạm ràng buộc dữ liệu.
- [x] **Phòng Jam Thực tế (SignalR)**: Đã áp dụng cơ chế bù trừ độ trễ (Latency Compensation) dựa vào timestamp và Time Extrapolation để tối ưu hóa hiệu ứng Karaoke đạt 60 FPS.
- [x] **Tối ưu Đồng bộ Jam (Smooth Drift Correction)**: Thay thế hoàn toàn thuật toán seek đột ngột bằng hệ thống đồng bộ thông minh trong `MusicContext.jsx` (hàm `ReceiveSyncState`):
    - **Heartbeat phân loại 2 loại**: `FullSync` (có `queue` → khi join hoặc chuyển bài) và `Heartbeat` (chỉ có `pos` → kiểm tra drift định kỳ).
    - **FullSync**: Gọi đầy đủ React state setter (`setCurrentSong`, `setQueue`...) và seek audio về vị trí đúng của Host (có bù trễ mạng `delay = (Date.now() - timestamp) / 1000`).
    - **Heartbeat (10 giây/lần)**: Tuyệt đối **KHÔNG gọi bất kỳ React state setter nào** để tránh re-render. Chỉ can thiệp trực tiếp vào `audioRef.current` ở mức thấp nhất:
        - Drift < 2 giây → **bỏ qua hoàn toàn**, để audio tự chạy.
        - Drift > 2 giây → seek ngay lập tức (trường hợp mất gói/tab ngủ đông).
    - **Kết quả**: Người nghe không còn cảm nhận tiếng "khựng" mỗi 4 giây.
- [x] **Pre-loading bài tiếp theo**: Khi bài hát còn ~30 giây là hết, hệ thống tự động tải trước bài tiếp theo vào `preloadRef` (Audio element ẩn, `volume=0`). Khi `playSong` được gọi, kiểm tra xem `preloadRef.src` có khớp không → nếu có, dùng luôn buffer đã tải, giúp chuyển bài gần như tức thì kể cả với mạng chậm.
- [x] **Điều hướng Di động (BottomNav)**: Bổ sung thanh điều hướng dưới cùng (Home, Explore, Library) tối ưu cho trải nghiệm mobile.


## 5. LỊCH SỬ SỬA LỖI & CẬP NHẬT (CHANGELOG)

- **04/04/2026** (Hoàn thiện Admin Playlist, Hệ thống Thể loại & SignalR Hubs):
    - **Tính năng & Chỉnh sửa (Hoàn thành)**:
        - **Quản lý Playlist Admin (Nâng cao)**: Tách riêng `Admin/PlaylistsController`, hỗ trợ tạo/sửa/xóa playlist hệ thống, gán trạng thái `Featured` và quản lý danh sách bài hát trực tiếp.
        - **Hệ thống Thể loại (Genres)**: Triển khai API lấy danh sách thể loại nhạc (`api/v1/genres`) phục vụ bộ lọc và phân loại.
        - **Admin Song Management**: Thêm tính năng `ToggleMute` (chặn phát) và `ToggleHide` (ẩn bài hát) cho quản trị viên.
        - **Tối ưu SignalR Hubs**: Tách biệt logic Hubs (`JamHub`) giúp mã nguồn backend sạch sẽ và dễ bảo trì.
        - **Mobile UX**: Triển khai `BottomNav.jsx` cho giao diện di động.
        - **Cập nhật Database Script**: Đồng bộ `Buzzify.sql` với schema mới nhất.
        - **Modal Jam Session**: Thêm `AddSongToJamModal` (đề xuất nhạc) và `ConfirmJamActionModal` (xác nhận khi rời phòng).
    - **Sửa lỗi (Đã xử lý)**:
        - Xử lý triệt để lỗi 500 khi upload playlist không có ảnh hoặc vi phạm ràng buộc dữ liệu.
        - Chuẩn hóa logic Seeder cho tài khoản Admin và Artist (`admin@buzzify.com`).

- **01/04/2026** (Tối ưu hóa Đồng bộ Jam Session, Responsive Mobile & UI Player):
    - **Tính năng & Chỉnh sửa (Hoàn thành)**:
        - **Hàng Chờ Đề Xuất (Suggest Queue)**: Khách (Guest) tham gia Jam có thể tìm kiếm và đề xuất bài hát. Host sẽ duyệt hoặc từ chối thông qua nút chuyên dụng ở JamPanel.
        - **Giao diện Modal Tìm Kiếm Jam**: Bổ sung icon `[✓]` và vô hiệu hóa nút thêm đối với nhạc đã có trong queue.
        - **Avatar & Role cho JamPanel**: Hiển thị hình đại diện (Avatar) sắc nét kèm theo đánh dấu "Trưởng Nhóm/Thành viên".
        - **Tự động hóa UX Jam Session**: Tự khởi tạo Jam ngay khi người dùng bấm "Nghe cùng nhau".
        - **Thuật toán Smooth Drift Correction**: Thay thế Heartbeat 4 giây gây giật bằng hệ thống 2 lớp: FullSync (khi join/đổi bài) và Heartbeat 10 giây (chỉ can thiệp khi drift > 2s). Không gọi React state trong Heartbeat nên không gây re-render.
        - **Pre-loading bài tiếp theo**: Tải bài kế tiếp vào Audio element ẩn trước 30 giây để chuyển bài tức thì.
        - **Tối ưu Mobile Music Player**:
            - **Song Modal (Expanded)**: Tích hợp bộ điều khiển đầy đủ (Progress, Shuffle, Prev, Play, Next, Repeat) và nút **Buzzify Jam** trực tiếp vào Modal.
            - **Logic Ẩn Bar**: Tự động ẩn thanh Player Bar mini trên di động khi Modal đang mở (`isExpanded`) để giải phóng không gian và tránh rối mắt.
            - **Layout**: Nút thu nhỏ (ChevronDown) đặt ở trên cùng, ẩn lyrics/nghệ sĩ ở các tab phụ để tối ưu diện tích hiển thị.
        - **Jam Panel Mobile**: Full-width, scroll lock nền, tích hợp Header thương hiệu.
        - **ExploreView**: Tích hợp Search thông minh.
    - **Sửa lỗi (Đã xử lý)**:
        - Sửa lỗi bị chặn quyền Guest, spam Toast, lỗi API 500 Playlist Admin và lỗi thiếu import `ChevronDown`.

- **31/03/2026** (Cập nhật trọng tâm: Hệ thống Jam Realtime & Fix UI Lớp phủ):
    - **Tính năng (Hoàn thành)**:
        - **Realtime Sync (Hear Together)**: Thay thế kiến trúc cục bộ bằng SignalR.
        - **Cơ chế phòng (Rooms)**: Sinh mã phòng ngẫu nhiên và quản lý bằng `ConcurrentDictionary`.
        - **QR Code & Invite Link**: Tích hợp QR và copy URL phòng.
        - **Phân quyền Khách (Guest Permissions)**: Host có quyền khóa/mở quyền điều khiển của Khách.
    - **Sửa lỗi UI (Hoàn thành)**:
        - Khắc phục lỗi "lớp đen mờ" ở Home và sửa animation trượt ngang cho Jam Panel.

- **29/03/2026**:
    - **Tính năng (Hoàn thành)**:
        - Hoàn thiện `DateTimePicker` và nâng cấp Playlist Admin (Spotify Editorial style).
    - **Sửa lỗi (Hoàn thành)**:
        - Fix lỗi Modal hiển thị sai vị trí (fixed overlay).

---
## 6. TÀI KHOẢN ĐĂNG NHẬP (TEST ACCOUNTS)
- **Tài khoản ADMIN hệ thống**: 
  - Email: `admin@buzzify.com` / Mật khẩu: `Admin123!`
- **Tài khoản NGHỆ SĨ (Charlie Puth)**: 
  - Email: `charlieputh@buzzify.com` / Mật khẩu: `Artist123!`

### ⚠️ Nhiệm Vụ Tồn Đọng (BUGS)
- **Lifecycle Jam**: Host thoát web đột ngột cần xử lý Kick Guest mượt hơn (hiện tại Guest bị treo trong phòng ảo).

*Cập nhật lần cuối: 04/04/2026 - Hoàn thiện Admin, Genre System & Project Documentation.*
