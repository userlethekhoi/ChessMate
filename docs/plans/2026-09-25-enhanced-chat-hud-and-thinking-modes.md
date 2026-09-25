# Kế Hoạch Triển Khai: ChessMate Agent Nâng Cấp Toàn Diện

> **Mục tiêu:** Cung cấp trải nghiệm trợ lý cờ vua thông minh dạng Cửa sổ Chat HUD in-page không che bàn cờ, diễn giải nước đi bằng tiếng Việt trực quan (chỉ rõ quân cờ & ô di chuyển), tích hợp các chế độ tư duy (Thinking Modes: Chiếu hết nhanh nhất / Phòng thủ sinh tồn & Cầu hòa / Tấn công / Cân bằng), tra cứu khai cuộc & bài học chiến thuật kinh điển, và tách biệt hoàn toàn cài đặt API Key trong Popup.

---

## 1. Kiến Trúc Giải Pháp

1. **Natural Language Move Translator (`src/utils/chess-translator.js`)**:
   - Biên dịch nước đi UCI (ví dụ `c4c5`, `e1g1`, `e7e8q`) kết hợp với FEN vị trí hiện tại thành câu tiếng Việt chuẩn xác:
     - Tên quân: Vua (K), Hậu (Q), Xe (R), Tượng (B), Mã (N), Tốt (P).
     - Định dạng: `Tượng (c4) ➔ c5`, `Mã (f3) ⚔️ ăn Tốt (e5)`, `Nhập thành gần O-O`, `Tốt (e7) ➔ e8 (Phong Hậu)`.
     - Nhận diện trạng thái chiếu / chiếu hết: `⚡ Chiếu Vua!`, `🏆 Chiếu hết đối thủ!`.
     - Sinh tóm tắt ý đồ chiến thuật (Tactical reasoning).

2. **Hệ Thống Chế Độ Tư Duy (Thinking Modes) (`src/engine/thinking-modes.js` & `src/engine/engine-manager.js`)**:
   - `mate_hunt`: Săn lùng đường chiếu hết nhanh nhất (Tăng depth, ưu tiên mate lines, dồn ép vua đối phương).
   - `solid_defense`: Phòng thủ thông minh & tìm đường hòa khi bị ép thế (Tránh bẫy, đơn giản hóa thế trận, tìm stalemate hoặc 3-fold repetition).
   - `aggressive`: Tấn công vũ bão, phá vỡ cấu trúc tốt đối phương.
   - `balanced`: Đánh chuẩn mực theo nguyên tắc kiện tướng quốc tế.

3. **Cửa Sổ Chat HUD In-Game (`src/content/chat-hud.js`)**:
   - Giao diện dạng cửa sổ chat nổi phong cách Dark Glassmorphism, có thể kéo thả (drag & drop), không che khuất bất kỳ ô cờ nào trên bàn cờ.
   - Thanh tiêu đề có nút `—` (Thu nhỏ thành Bubble nổi) và `✕` (Tắt hẳn).
   - Tab 💬 **AI Gợi Ý & Phân Tích**: Hiển thị quân cờ + ô đi rõ ràng bằng tiếng Việt, điểm Eval Bar, nút "Giải thích chiến thuật sâu".
   - Tab 🎯 **Chế Độ Chơi (Thinking Modes)**: Chuyển đổi nhanh giữa Chiếu hết / Phòng thủ / Tấn công / Cân bằng ngay trong trận.
   - Tab 📖 **Khai Cuộc & Bài Học Cờ Vua**: Tự động nhận diện khai cuộc trận đấu và cung cấp thư viện các đòn chiến thuật kinh điển (Chĩa đôi, Ghim quân, Xiên, Chiếu mở...).
   - Bàn cờ sạch sẽ 100%: Dời toàn bộ badge che góc bàn cờ sang HUD; mũi tên gợi ý mảnh nét và tùy chỉnh bật/tắt để không che quân.

4. **Khai Cuộc & Thư Viện Chiến Thuật (`src/ai/chess-book.js`)**:
   - Cơ sở dữ liệu các khai cuộc phổ biến (Sicilian, Ruy Lopez, French, Caro-Kann, Queen's Gambit, Italian, London System, v.v.).
   - Bộ sưu tập bài học các đòn phối hợp chiến thuật cờ vua cho người chơi luyện tập và nâng cao trình độ.

5. **Nâng Cấp Popup & Quản Lý Cấu Hình (`src/popup/popup.*`, `src/storage/config-manager.js`)**:
   - Tách biệt riêng biệt mục Cài đặt AI Key (OpenAI / Gemini) với nút lưu & nút kiểm tra kết nối API Key độc lập, có thông báo trạng thái riêng.
   - Không bị nhầm lẫn hay dính liền với nút Lưu cấu hình Stockfish và nút Test Engine.
   - Tùy chỉnh bật/tắt HUD, chế độ Thinking Mode mặc định.

---

## 2. Các Bước Triển Khai Chi Tiết

- [x] **Bước 1**: Tạo module dịch nước đi cờ vua sang tiếng Việt tự nhiên (`src/utils/chess-translator.js`) + Unit tests.
- [ ] **Bước 2**: Xây dựng thư viện khai cuộc & chiến thuật cờ vua (`src/ai/chess-book.js`).
- [ ] **Bước 3**: Cập nhật Thinking Modes & Engine Manager hỗ trợ mục tiêu chiếu hết / phòng thủ cầu hòa (`src/engine/thinking-modes.js`, `src/engine/engine-manager.js`).
- [ ] **Bước 4**: Xây dựng Floating In-Page Chat HUD Window (`src/content/chat-hud.js`) với nút thu nhỏ `—` và đóng `✕`, tabs gợi ý, chế độ và bài học.
- [ ] **Bước 5**: Tinh chỉnh `src/content/overlay.js` và `src/content/content.js` để bàn cờ không bị che khuất và kết nối nhịp nhàng với Chat HUD.
- [ ] **Bước 6**: Cải tiến giao diện Popup (`src/popup/popup.html`, `src/popup/popup.js`, `src/popup/popup.css`) tách biệt độc lập phần API Key.
- [ ] **Bước 7**: Kiểm tra toàn bộ tests, build và xác nhận extension đóng gói hoàn hảo.
