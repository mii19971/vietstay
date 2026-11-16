# VietStay

Ứng dụng tìm kiếm và đặt phòng khách sạn cho **Android, iOS và Web** từ một codebase React duy nhất
(Expo SDK 58 + React Native + React Native Web + Expo Router, TypeScript).

## Chạy ứng dụng

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
- **Chuyến đi**: đơn sắp tới / đã qua / đã hủy, xem chi tiết, hủy đơn.
- **Yêu thích** và **Tài khoản** (lưu thông tin để điền sẵn khi đặt).
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
  components/          # UI dùng chung (HotelCard, SearchForm, DateRangePicker, ...)
  services/api.ts      # Lớp API — hiện là dữ liệu giả lập
  data/                # Dữ liệu mẫu khách sạn, thành phố
  store/AppStore.tsx   # State toàn cục: đơn đặt, yêu thích, hồ sơ
  utils/               # Ngày tháng, định dạng tiền, tiêu chí tìm kiếm
```

## Kết nối backend thật

Hiện tại dữ liệu khách sạn là dữ liệu mẫu trong `src/data/hotels.ts`, còn đơn đặt phòng được lưu trên
thiết bị (AsyncStorage / localStorage). Mọi màn hình chỉ gọi các hàm trong `src/services/api.ts`
(`searchHotels`, `getHotel`, `getRoomOffers`, `createBooking`, `cancelBooking`, ...), nên khi có backend
chỉ cần thay phần thân các hàm đó bằng lời gọi `fetch` tới server. Phần thanh toán hiện chỉ ghi nhận
phương thức, chưa tích hợp cổng thanh toán.
