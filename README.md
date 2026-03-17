# Buzzify - Nền tảng Stream Nhạc trực tuyến Chuyên nghiệp

Buzzify là một ứng dụng nghe nhạc trực tuyến được thiết kế hiện đại, mô phỏng các tính năng cao cấp của Spotify và Tidal. Dự án sử dụng mô hình Client-Server với Frontend là React và Backend là ASP.NET Core theo kiến trúc Clean Architecture.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend (Modern & Interactive UI)
- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Animation**: [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform) cho các hiệu ứng chuyển cảnh mượt mà.
- **Visual Effects**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) cho các thành phần 3D sinh động.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) cho giao diện tùy biến cực nhanh.
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/) tạo trải nghiệm cuộn thượng hạng.
- **Icons**: [Lucide React](https://lucide.dev/) mang lại bộ icon tối giản và hiện đại.
- **State Management**: React Context API & Hooks.

### Backend (Scalable & Secure)
- **Framework**: [ASP.NET Core 8.0 Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- **Architecture**: **Clean Architecture** (Api, Application, Core, Infrastructure) giúp dễ dàng bảo trì và mở rộng.
- **Database**: [SQL Server](https://www.microsoft.com/en-us/sql-server/) quản lý dữ liệu quan hệ.
- **ORM**: [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) (Code First/Database First).
- **Authentication**: JWT (JSON Web Token), hỗ trợ OAuth2 với Google & Facebook.
- **Security**: BCrypt hashing, Rate Limiting (chống DDoS), Environment Variables.

---

## 🏗️ Kiến trúc Cơ sở dữ liệu (Database Schema)

Dự án sử dụng sơ đồ quan hệ chặt chẽ để quản lý kho nhạc khổng lồ:

| Bảng | Chức năng |
| :--- | :--- |
| **profiles** | Lưu thông tin người dùng (Email, mật khẩu, vai trò, avatar). |
| **artists** | Thông tin nghệ sĩ (Tên, tiểu sử, ảnh đại diện). |
| **songs** | Danh sách bài hát (URL file, tiêu đề, lượt nghe, lời bài hát). |
| **albums** | Các album nhạc thuộc về nghệ sĩ. |
| **playlists** | Danh sách phát cá nhân hoặc được hệ thống đề xuất. |
| **the_loai** | Danh mục thể loại nhạc (Pop, Rock, EDM...). |
| **lich_su_nghe**| Ghi lại vết nghe nhạc của người dùng để đề xuất. |

### Các mối quan hệ chính:
- **Nghệ sĩ - Album - Bài hát**: 1 Nghệ sĩ có nhiều Album, 1 Album có nhiều Bài hát.
- **Nghiệp vụ Playlist**: Mối quan hệ N-N giữa `songs` và `playlists` thông qua bảng trung gian `bai_hat_trong_playlist`.
- **Thể loại**: Một bài hát/album có thể thuộc nhiều thể loại (N-N).
- **Tương tác**: Người dùng có thể theo dõi (Follow) nghệ sĩ và lưu (Save) album/playlist.

---

## 📡 Các API Endpoints chính

Hệ thống cung cấp bộ RESTful API đầy đủ cho Frontend:

- **Authentication (`/api/v1/auth`)**:
  - `POST /login`: Đăng nhập truyền thống.
  - `POST /register`: Tạo tài khoản mới + Gửi OTP.
  - `POST /google-login`: Đăng nhập nhanh qua Google.
  - `POST /facebook-login`: Đăng nhập qua Facebook.
- **Music (`/api/v1/songs`)**:
  - `GET /`: Lấy danh sách bài hát (có phân trang/lọc).
  - `GET /{id}`: Chi tiết bài hát và stream file audio.
- **Playlists (`/api/v1/playlists`)**:
  - `GET /me`: Lấy danh sách phát của tôi.
  - `POST /add-song`: Thêm bài hát vào playlist.

---

## 🚀 Hướng dẫn cài đặt & Khởi động

### 1. Phía Backend (ASP.NET Core)
1. Cài đặt **SQL Server** và khởi tạo Database từ tệp Script hoặc Migration.
2. Cấu hình chuỗi kết nối trong `appsettings.Local.json` (Tránh sửa trực tiếp `appsettings.json` để bảo mật).
3. Mở Terminal tại `backend/Buzzify.API` và chạy:
   ```bash
   dotnet restore
   dotnet run
   ```

### 2. Phía Frontend (React)
1. Đảm bảo đã cài đặt **Node.js** (v18+).
2. Tạo tệp `.env` tại thư mục gốc frontend và điền các mã khóa cần thiết:
   ```env
   VITE_API_URL=https://localhost:7119
   VITE_GOOGLE_CLIENT_ID=your_id
   VITE_FACEBOOK_APP_ID=your_id
   ```
3. Chạy lệnh cài đặt và khởi động:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔒 Ghi chú Bảo mật
Mọi thông tin nhạy cảm đã được tách ra khỏi mã nguồn chính thức. Khi chia sẻ dự án, hãy đảm bảo **không push** các tệp sau lên Git:
- `backend/Buzzify.API/appsettings.Local.json`
- `frontend/.env`

---
© 2026 **Buzzify Team** - Mang âm nhạc đến mọi nơi.
