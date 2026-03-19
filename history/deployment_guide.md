# HƯỚNG DẪN DEPLOY QUA CLOUDFLARE TUNNEL (BUZZIFY)

Cloudflare Tunnel giúp bạn biến máy tính cá nhân thành máy chủ (server) và truy cập được từ bất cứ đâu qua tên miền riêng mà không cần mở port router (Port Forwarding), rất an toàn và ổn định.

---

## 1. CÀI ĐẶT CLOUDFLARED
Bạn cần tải công cụ `cloudflared` để làm "cầu nối":
- Tải bản Windows (.exe) tại: [Cloudflare Downloads](https://github.com/cloudflare/cloudflared/releases)
- Hoặc cài qua Powershell (Admin): `winget install cloudflare.cloudflared`

## 2. CÁCH 1: TRUY CẬP NHANH (TESTING)
Nếu bạn chỉ mún xem nhanh qua internet (không cần setup tên miền):
1. Chạy **Backend** (`dotnet run`) và **Frontend** (`npm run dev`).
2. Mở terminal mới và gõ: 
   `cloudflared tunnel --url https://localhost:5173`
3. Cloudflare sẽ trả về một link `.trycloudflare.com`. Khi bạn truy cập link này, nó sẽ tự động gọi vào Frontend port 5173 của bạn. 
   - *Lưu ý: Vì bạn đã có Vite Proxy trỏ đến port 5090, nên API sẽ tự động chạy qua link này luôn!*

---

## 3. CÁCH 2: DEPLOY VĨNH VIỄN VỚI TÊN MIỀN (DASHBOARD)
Đây là cách "xịn" nhất, bạn setup 1 lần qua trang web Cloudflare:

### Bước 1: Tạo Tunnel trên Cloudflare Dashboard
1. Truy cập [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Chọn **Networks** -> **Tunnels** -> **Create a tunnel**.
3. Đặt tên (vd: `buzzify-home-pc`) -> **Save**.
4. Chọn **Windows** và copy đoạn mã lệnh (vd: `cloudflared service install eyJ...`). 
5. Mở Terminal (Admin) trên máy bạn, dán mã đó vào và chạy. (Lệnh này cài Cloudflare thành 1 Service chạy ngầm, mở máy là tự chạy).

### Bước 2: Cấu hình Public Hostname (Đường dẫn truy cập)
Trong tab **Public Hostname** (trong Tunnel vừa tạo), chọn **Add a public hostname**:
- **Subdomain**: `buzzify` (hoặc tùy ý)
- **Domain**: Chon tên miền của bạn (vd: `yourdomain.com`)
- **Service Type**: `HTTPS`
- **URL**: `localhost:5173`
- **HTTP Settings** (Rất quan trọng): 
    - Bật **No TLS Verify** (vì bạn đang dùng `basicSsl` của Vite, nếu không bật sẽ bị lỗi 502).

### Bước 3: Cấu hình cho API (Backend)
Vì Frontend đã có Proxy `/api` trỏ vào `localhost:5090`, bạn **KHÔNG CẦN** tạo thêm hostname cho Backend nếu bạn chạy cả 2 trên cùng 1 máy. Cứ truy cập vào Subdomain Frontend là API sẽ tự theo sau.

---

## 4. LƯU Ý QUAN TRỌNG KHI DEPLOY
1. **Dữ liệu Database**: Vì bạn dùng máy nhà, nên Database SQL Server cứ để nguyên, Backend sẽ kết nối bình thường.
2. **File .env**: Khi chạy Tunnel qua port 5173, `VITE_API_URL` trong `.env` phải **ĐỂ TRỐNG** (như tôi vừa sửa) để nó luôn gọi qua Proxy `/api`.
3. **CORS**: File `Program.cs` tôi đã cấu hình cho phép cả `localhost` và `https`. Khi bạn có tên miền riêng (vd: `buzzify.yourdomain.com`), hãy bổ sung link đó vào `WithOrigins` trong `Program.cs` nếu bị chặn CORS.

**Tóm lại**: Bạn chỉ cần chạy `npm run dev` + `dotnet run` và setup 1 cái Tunnel duy nhất trỏ vào `https://localhost:5173` (Frontend) là xong!
