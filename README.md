# ChessMate Core - Trợ Thủ Phân Tích Cờ Vua

[![Download Extension ZIP](https://img.shields.io/badge/TẢI_VỀ_NGAY-chessmate--agent.zip-brightgreen?style=for-the-badge&logo=googlechrome)](https://github.com/userlethekhoi/Extension-Chess.Com/raw/main/chessmate-agent.zip)
[![Release Version](https://img.shields.io/badge/Phiên_bản-v0.1.0-blue?style=for-the-badge)](https://github.com/userlethekhoi/Extension-Chess.Com/releases)

> ⚡ **Link tải trực tiếp cho Máy tính & Điện thoại**: [👉 Bấm vào đây để tải `chessmate-agent.zip`](https://github.com/userlethekhoi/Extension-Chess.Com/raw/main/chessmate-agent.zip)
>
> 📱 **Hỗ trợ Điện thoại (Mobile)**: Cài đặt trực tiếp trên **Orion Browser** (iOS/iPhone) hoặc **Kiwi Browser / Lemur Browser** (Android).

---

## 1. Tính Năng Chính

- Giao diện Nordic Industrial Precision: Thiết kế tối giản, loại bỏ icon rườm rà, tập trung vào độ chính xác và khả năng đọc nhanh.
- Cửa sổ trợ thủ in-game (Chat HUD): Hiển thị trực tiếp trên trang Chess.com, hỗ trợ kéo thả tự do, có nút thu nhỏ [-] và nút tắt [X], hoàn toàn không che khuất khu vực 64 ô cờ.
- Hướng dẫn nước đi bằng tiếng Việt tự nhiên: Thay vì mã kỹ thuật khó hiểu (e2e4, c4c5), hệ thống chỉ rõ tên quân cờ và ô di chuyển (ví dụ: "Tượng ở ô C4 di chuyển qua C5", "Mã ở ô F3 ăn Tốt tại ô E5", "Nhập thành gần O-O").
- Bốn chế độ tư duy chiến thuật:
  + Săn Chiếu Hết (Mate Hunter): Tìm kiếm đòn chiếu bí nhanh nhất và dồn ép Vua đối phương.
  + Phòng Thủ & Cầu Hòa (Iron Defense): Phòng ngự kiên cố khi bị lép vế, triệt tiêu đòn đánh và tìm đường cầu hòa (stalemate, lặp lại 3 lần).
  + Tấn Công Dồn Ép (Aggressive Attack): Mở cánh, phá vỡ cấu trúc tốt đối thủ.
  + Kiện Tướng Cân Bằng (Balanced): Lối đánh chuẩn mực theo nguyên tắc quốc tế.
- Khai cuộc và bài học chiến thuật: Tự động nhận diện các khai cuộc phổ biến (Ruy Lopez, Italian Game, Sicilian, Queen's Gambit, London System...) và cung cấp cẩm nang 8 đòn phối hợp chiến thuật mẫu.
- Công cụ chẩn đoán toàn diện (Test All): Kiểm tra tuần tự hoạt động của Stockfish WebAssembly, Service Worker ngầm, kết nối tab Chess.com và khóa API.
- Tích hợp AI giải thích chuyên sâu (Tùy chọn): Hỗ trợ kết nối Google Gemini hoặc OpenAI để giải thích thế cờ chi tiết bằng lời văn.

---

## 2. Hướng Dẫn Cài Đặt Vào Google Chrome

### Bước 1: Chuẩn bị mã nguồn và đóng gói

Nếu bạn tải mã nguồn từ GitHub hoặc chỉnh sửa mã nguồn:

```bash
# Cài đặt các gói phụ thuộc
npm install

# Kiểm tra đơn vị (Unit Tests)
npm test

# Đóng gói bản phát hành
npm run build
```

Sau khi chạy lệnh trên, toàn bộ bản cài đặt tiện ích sẽ nằm gọn trong thư mục `dist`.

### Bước 2: Nạp tiện ích vào trình duyệt Chrome

1. Mở trình duyệt Google Chrome hoặc trình duyệt nhân Chromium (Brave, Edge, Cốc Cốc).
2. Truy cập vào địa chỉ: `chrome://extensions`
3. Bật công tắc Developer mode (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
4. Bấm vào nút Load unpacked (Tải tiện ích đã giải nén) ở góc trên bên trái.
5. Chọn đúng thư mục `dist` trong thư mục dự án (Ví dụ: `c:\Chess.Com\dist`).
6. Tiện ích "ChessMate Agent" sẽ xuất hiện trong danh sách và sẵn sàng sử dụng.

---

## 3. Hướng Dẫn Sử Dụng Chi Tiết

### 3.1. Cấu hình ban đầu qua Menu Tiện Ích (Popup)

Bấm vào biểu tượng mảnh ghép tiện ích trên thanh công cụ của Chrome, sau đó chọn ChessMate để mở menu cài đặt:

1. Bật/Tắt Trợ thủ: Gạt công tắc ở góc trên bên phải để kích hoạt hoặc tạm dừng tiện ích.
2. Mục 1 - Cấu hình chế độ tư duy:
   - Mục tiêu chiến thuật: Chọn 1 trong 4 chế độ (Săn Chiếu Hết, Phòng Thủ & Cầu Hòa, Tấn Công Dồn Ép, Kiện Tướng Cân Bằng).
   - Phương thức vận hành:
     + Chỉ gợi ý: Vẽ mũi tên chỉ nước đi và thông báo trên cửa sổ Chat HUD.
     + Tự động đánh: Tự động thực hiện nước cờ trên bàn cờ với đường chuột cong tự nhiên và độ trễ ngẫu nhiên mô phỏng người thật.
   - Độ sâu (Depth): Điều chỉnh độ sâu tính toán của Stockfish (khuyến nghị từ 15 đến 18).
   - Cấp độ (Skill Level): Mức độ tinh nhuệ của động cơ (0 đến 20).
   - Tùy chọn hiển thị: Tích chọn bật/tắt hiển thị Cửa sổ HUD hoặc Mũi tên gợi ý.
   - Bấm nút "Lưu Cấu Hình Game" để áp dụng ngay.
3. Mục 2 - Chẩn đoán hệ thống:
   - Bấm nút "CHẠY KIỂM TRA TOÀN BỘ (TEST ALL)".
   - Hệ thống sẽ chạy kiểm tra tự động và hiển thị kết quả từng bước trên console màn hình (Stockfish Engine, Service Worker, Tab cờ và API).
4. Mục 3 - Cấu hình API bổ trợ (Tùy chọn):
   - Chọn nhà cung cấp: Google Gemini (khuyến nghị, miễn phí) hoặc OpenAI.
   - Nhập khóa API Key: Khóa API được lưu cục bộ an toàn trên máy bạn. Bạn có thể lấy khóa miễn phí tại aistudio.google.com.
   - Bấm nút "Lưu API Key" và bấm "Kiểm Tra API" để xác nhận khóa hoạt động.

### 3.2. Sử dụng trên bàn cờ Chess.com

1. Truy cập vào trang web `chess.com` và bắt đầu một ván đấu (Chơi với Bot, Luyện tập, Phân tích thế cờ hoặc Giải câu đố cờ thế).
2. Cửa sổ Chat HUD sẽ tự động xuất hiện ở góc dưới bên phải màn hình:
   - Di chuyển cửa sổ: Bấm giữ chuột vào thanh tiêu đề của cửa sổ để kéo thả đến vị trí bất kỳ sao cho tiện quan sát nhất.
   - Thu nhỏ cửa sổ: Bấm nút `[-]` ở góc trên cửa sổ. Tiện ích sẽ thu gọn thành một nút bấm nhỏ ở góc màn hình. Bấm vào nút này để mở lại.
   - Tắt cửa sổ: Bấm nút `[X]` để đóng. Nếu muốn mở lại, hãy mở popup tiện ích và bấm nút "Mở Cửa Sổ HUD".
3. Đọc hướng dẫn nước cờ (Tab NƯỚC ĐI):
   - Khi đến lượt bạn đi, hệ thống sẽ tự động quét trạng thái bàn cờ, gọi Stockfish và hiển thị nước đi tốt nhất bằng tiếng Việt.
   - Xem lý do chiến thuật đi kèm dưới nước đi để hiểu tại sao nên đi nước cờ đó.
   - Bấm nút "PHÂN TÍCH CHIẾN THUẬT SÂU" để nhận lời giải thích thế trận chi tiết từ AI.
4. Tra cứu chế độ và khai cuộc:
   - Chuyển sang Tab TƯ DUY: Cho phép bạn đổi mục tiêu chiến thuật (ví dụ: chuyển gấp sang Phòng Thủ khi bị đối thủ dồn ép) ngay trong ván đấu mà không cần mở lại popup.
   - Chuyển sang Tab KHAI CUỘC: Tra cứu tên khai cuộc đang diễn ra và học các đòn phối hợp chiến thuật cờ vua kinh điển.

---

## 4. Cấu Trúc Dự Án

```
Chess.Com/
├── dist/                         # Bản đóng gói chạy trên Chrome
├── src/
│   ├── ai/
│   │   ├── chess-book.js         # Thư viện khai cuộc & bài học chiến thuật
│   │   ├── llm-client.js         # Kết nối API Google Gemini và OpenAI
│   │   └── prompts.js            # Mẫu prompt phân tích thế cờ
│   ├── background/
│   │   └── service-worker.js     # Service Worker nền tảng Manifest V3
│   ├── content/
│   │   ├── board-extractor.js    # Trích xuất FEN từ bàn cờ Chess.com
│   │   ├── board-observer.js     # Lắng nghe biến động bàn cờ qua MutationObserver
│   │   ├── chat-hud.js           # Cửa sổ trợ thủ in-game
│   │   ├── content.js            # Content script điều phối chính
│   │   ├── human-simulator.js    # Giả lập đường chuột Bezier và độ trễ ngẫu nhiên
│   │   ├── move-executor.js      # Thực hiện kéo thả nước cờ tự động
│   │   └── overlay.js            # Vẽ mũi tên gợi ý trong suốt
│   ├── engine/
│   │   ├── engine-manager.js     # Quản lý giao tiếp UCI với Stockfish
│   │   ├── stockfish.js          # File nạp Stockfish WebAssembly
│   │   ├── stockfish.wasm        # Binary lõi Stockfish 19
│   │   └── thinking-modes.js     # Cấu hình 4 chế độ tư duy
│   ├── offscreen/
│   │   ├── offscreen.html        # Trang Offscreen chạy Worker trong Manifest V3
│   │   └── offscreen.js          # Khởi chạy Worker Stockfish
│   ├── popup/
│   │   ├── popup.html            # Giao diện menu cài đặt tiện ích
│   │   ├── popup.css             # Định dạng giao diện Nordic Industrial Precision
│   │   └── popup.js              # Logic cài đặt và module Test All
│   ├── storage/
│   │   └── config-manager.js     # Đồng bộ cấu hình qua chrome.storage.local
│   └── utils/
│       ├── chess-translator.js   # Dịch mã UCI sang tiếng Việt tự nhiên
│       ├── chess-utils.js        # Tiện ích chuyển đổi FEN, tọa độ bàn cờ
│       ├── constants.js          # Cấu hình mặc định và selector
│       └── logger.js             # Tiện ích ghi log
├── tests/                        # Bộ kiểm thử tự động (Unit Tests)
├── DESIGN.md                     # Tài liệu đặc tả hệ thống thiết kế
├── manifest.json                 # Cấu hình Manifest V3 extension
├── package.json                  # Thông tin gói và kịch bản npm
└── vite.config.js                # Cấu hình đóng gói Vite và CRXJS
```

---

## 5. Nguyên Tắc Fair Play và An Toàn

Tiện ích này được phát triển cho mục đích học tập, phân tích thế trận, nghiên cứu chiến thuật và thi đấu với Bot/Máy tính hoặc luyện tập nội bộ. Người dùng không nên sử dụng tiện ích trong các trận đấu xếp hạng trực tuyến với người chơi thật trên Chess.com nhằm tránh vi phạm chính sách Fair Play và điều khoản dịch vụ của nền tảng.
