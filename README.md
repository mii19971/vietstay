# VietStay

Ứng dụng tìm kiếm và đặt phòng khách sạn cho **Android, iOS và Web** từ một codebase React duy nhất
(Expo SDK 58 + React Native + React Native Web + Expo Router, TypeScript).

## Chạy ứng dụng

App lấy dữ liệu từ **VietStay API** (.NET, thư mục `../vietstayapi`) — hãy chạy API trước.
Khai báo địa chỉ API bằng cách sao chép `.env.example` thành `.env.local` và sửa `EXPO_PUBLIC_API_URL`:

| Chạy app trên | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web / iOS simulator (cùng máy với API) | `http://localhost:5045` (mặc định nếu không khai báo) |
| Android emulator | `http://10.0.2.2:5045` (mặc định trên Android) |
| Điện thoại thật qua Expo Go | `http://<IP-LAN-máy-chạy-API>:5045` — API phải lắng nghe trên IP đó và mở firewall |

Cổng `5045` là profile `http` của API; nếu chạy API bằng IIS Express trong Visual Studio thì dùng cổng IIS Express
(xem `Properties/launchSettings.json`). Sau khi sửa `.env.local`, tải lại app.
Gọi API từ trình duyệt cần origin của app nằm trong `Cors:Origins` của API (mặc định có `http://localhost:8081`).

```bash
npm install
npm run web       # mở trên trình duyệt
npm run android   # Android emulator hoặc app Expo Go
npm run ios       # iOS simulator (cần macOS) hoặc app Expo Go trên iPhone
npm start         # quét QR bằng Expo Go để chạy trên điện thoại thật
```

Build:

```bash
npm run build:web                       # xuất web tĩnh ra thư mục dist/
npx eas-cli@latest build -p android     # build APK/AAB trên cloud
npx eas-cli@latest build -p ios         # build IPA trên cloud (không cần máy Mac)
npm run typecheck
```

## Tính năng

- **Khám phá**: form tìm kiếm (điểm đến, chọn ngày bằng lịch, số khách/phòng), điểm đến phổ biến, khách sạn nổi bật.
- **Tìm kiếm**: tìm không dấu ("da nang" → Đà Nẵng), chỉ hiện khách sạn còn phòng phù hợp số khách,
  sắp xếp (đề xuất/giá/đánh giá), bộ lọc giá tối đa, hạng sao, điểm đánh giá, tiện nghi.
- **Chi tiết khách sạn**: thư viện ảnh, tiện nghi, danh sách loại phòng với giá theo số đêm, số phòng còn lại, đánh giá.
- **Đặt phòng**: thông tin liên hệ (có kiểm tra hợp lệ), yêu cầu đặc biệt, phương thức thanh toán, chi tiết giá + thuế.
- **Tài khoản**: đăng ký / đăng nhập (JWT), sửa họ tên & số điện thoại, đăng xuất. Token lưu trong
  Keychain/Keystore (expo-secure-store) trên điện thoại, localStorage trên web.
- **Đặt phòng, Chuyến đi, Yêu thích** cần đăng nhập và được lưu trên server theo tài khoản:
  đơn sắp tới / đã qua / đã hủy, xem chi tiết, hủy đơn; khách sạn yêu thích đồng bộ giữa các thiết bị.
- Giao diện đáp ứng: 1 cột trên điện thoại, 2–3 cột trên tablet/web.

## Cấu trúc

```
src/
  app/                 # Màn hình (Expo Router, mỗi file là một route)
    (tabs)/            #   Khám phá, Yêu thích, Chuyến đi, Tài khoản
    search.tsx         #   Kết quả tìm kiếm
    hotel/[id].tsx     #   Chi tiết khách sạn
    checkout.tsx       #   Xác nhận đặt phòng
    booking/[id].tsx   #   Chi tiết / xác nhận đơn
    login.tsx, register.tsx  # Đăng nhập / đăng ký (modal)
  components/          # UI dùng chung (HotelCard, SearchForm, DateRangePicker, ...)
  config.ts            # Địa chỉ API (EXPO_PUBLIC_API_URL)
  services/
    api.ts             # Các hàm gọi API (khách sạn, tài khoản, đặt phòng)
    http.ts            # fetch + token + chuyển lỗi ProblemDetails thành ApiError
    tokenStore.ts      # Lưu token (SecureStore / localStorage)
  hooks/useApi.ts      # Tải dữ liệu với trạng thái loading / lỗi / thử lại
  store/AppStore.tsx   # State toàn cục: phiên đăng nhập, đơn đặt, yêu thích
  utils/               # Ngày tháng, định dạng tiền, tiêu chí tìm kiếm
```

Phần thanh toán hiện chỉ ghi nhận phương thức khách chọn, chưa tích hợp cổng thanh toán.
