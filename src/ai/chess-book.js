/**
 * ChessMate Opening Book and Tactical Masterclass Library
 */

export const OPENINGS = [
  {
    name: 'Khai cuộc Tây Ban Nha (Ruy Lopez)',
    moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'],
    eco: 'C60-C99',
    description: 'Một trong những khai cuộc cổ điển và uy lực nhất. Tượng b5 gây áp lực trực tiếp lên Mã c6 đang bảo vệ tốt trung tâm e5.',
    strategy: 'Kiểm soát ô d4, chuẩn bị d2-d4 để mở toang trung tâm và nhập thành bảo vệ Vua.'
  },
  {
    name: 'Khai cuộc Ý (Italian Game)',
    moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'],
    eco: 'C50-C59',
    description: 'Khai cuộc giàu tính chiến thuật và phổ biến bậc nhất. Tượng c4 nhắm thẳng vào điểm yếu f7 của Đen.',
    strategy: 'Tập trung hỏa lực vào ô f7, phát triển quân nhanh và kiểm soát các ô d5, e4.'
  },
  {
    name: 'Phòng thủ Sicilia (Sicilian Defense)',
    moves: ['e2e4', 'c7c5'],
    eco: 'B20-B99',
    description: 'Vũ khí phản công sắc bén nhất của Đen chống lại 1. e4. Đen tạo ra thế trận bất đối xứng để tranh giành trung tâm.',
    strategy: 'Đen kiểm soát cột nửa mở c, đổi tốt c5 lấy tốt trung tâm d4 của Trắng để có cặp tốt trung tâm mạnh hơn.'
  },
  {
    name: 'Phòng thủ Pháp (French Defense)',
    moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5'],
    eco: 'C00-C19',
    description: 'Thế trận phòng thủ kiên cố với chuỗi tốt d5-e6. Đen nhắm vào việc công phá chuỗi tốt trung tâm của Trắng bằng c7-c5.',
    strategy: 'Đen tấn công gốc chuỗi tốt của Trắng ở d4, Trắng đẩy e5 để kìm hãm không gian cánh Vua của Đen.'
  },
  {
    name: 'Phòng thủ Caro-Kann',
    moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5'],
    eco: 'B10-B19',
    description: 'Hệ thống phòng thủ vững như bàn thạch. Khác với French Defense, Tượng ô trắng của Đen không bị giam sau chuỗi tốt.',
    strategy: 'Đen chuẩn bị d5 kiên cố, đưa Tượng f5/g4 ra ngoài trước khi đẩy e6.'
  },
  {
    name: 'Gambit Hậu (Queen\'s Gambit)',
    moves: ['d2d4', 'd7d5', 'c2c4'],
    eco: 'D06-D69',
    description: 'Khai cuộc đỉnh cao của các Đại kiện tướng. Trắng sẵn sàng thí tốt cánh c4 để đổi lấy sự kiểm soát tuyệt đối ở trung tâm.',
    strategy: 'Nếu Đen ăn c4 (Accepted), Trắng chiếm e4 và dễ dàng bắt lại tốt c4. Nếu Đen giữ d5 (Declined), Trắng gia tăng sức ép.'
  },
  {
    name: 'Hệ thống London (London System)',
    moves: ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'c1f4'],
    eco: 'D02',
    description: 'Hệ thống chắc chắn, linh hoạt, phù hợp cho mọi cấp độ. Tượng f4 ra ngoài trước khi thiết lập tam giác tốt c3-d4-e3.',
    strategy: 'Xây dựng cấu trúc phòng ngự kiên cố, đặt Mã vững chãi ở e5 và tấn công cánh Vua khi cơ hội mở ra.'
  },
  {
    name: 'Phòng thủ Ấn Độ Vua (King\'s Indian Defense)',
    moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6'],
    eco: 'E60-E99',
    description: 'Lối chơi phản công rực lửa của Garry Kasparov và Bobby Fischer. Đen nhường trung tâm ban đầu để dồn toàn lực công phá cánh Vua.',
    strategy: 'Fianchetto Tượng lên g7, nhập thành, sau đó đẩy e7-e5 hoặc c7-c5 để bẻ gãy trung tâm của Trắng.'
  },
  {
    name: 'Khai cuộc Anh (English Opening)',
    moves: ['c2c4'],
    eco: 'A10-A39',
    description: 'Khai cuộc mang tính chiến lược vị trí cao. Trắng kiểm soát ô trung tâm d5 từ sườn cánh c.',
    strategy: 'Trì hoãn việc đẩy tốt trung tâm, fianchetto Tượng g2 kiểm soát đường chéo dài a8-h1.'
  },
  {
    name: 'Phòng thủ Scandinavian',
    moves: ['e2e4', 'd7d5'],
    eco: 'B01',
    description: 'Đột kích trung tâm ngay từ nước đầu tiên, thách thức tốt e4 của Trắng.',
    strategy: 'Nếu Trắng exd5, Đen ăn lại bằng Hậu (Qxd5) rồi lui về d6/a5 an toàn, nhanh chóng phát triển quân.'
  }
];

export const TACTICAL_LESSONS = [
  {
    id: 'fork',
    title: 'Đòn Chĩa Đôi (Fork)',
    tag: 'Tấn Công Kép',
    desc: 'Một quân cờ tấn công cùng lúc hai hoặc nhiều quân đối phương (đặc biệt là Vua + Hậu/Xe).',
    detail: 'Hiệp sĩ (Mã) và Tốt là hai quân tạo đòn chĩa bất ngờ và nguy hiểm nhất vì đường đi đặc thù không thể bị chặn.',
    tips: 'Luôn chú ý các ô nhảy của Mã vào ô c7/c2 (chĩa Vua và Xe) hoặc f7/f2.'
  },
  {
    id: 'pin',
    title: 'Đòn Ghim Quân (Pin)',
    tag: 'Khống Chế',
    desc: 'Làm tê liệt quân đối phương bằng cách ghim nó vào một quân có giá trị cao hơn phía sau.',
    detail: 'Ghim tuyệt đối: Quân bị ghim trước Vua không được phép di chuyển (phạm luật). Ghim tương đối: Quân bị ghim trước Hậu hoặc Xe di chuyển sẽ làm mất quân lớn phía sau.',
    tips: 'Tượng, Xe và Hậu là 3 quân duy nhất có thể thực hiện đòn ghim trên đường thẳng và đường chéo.'
  },
  {
    id: 'skewer',
    title: 'Đòn Xiên (Skewer)',
    tag: 'Đột Kích Hàng Dọc',
    desc: 'Tấn công quân lớn hơn ở phía trước buộc nó phải chạy, để lộ quân phòng thủ yếu hơn ở phía sau.',
    detail: 'Ngược lại với đòn Ghim: Quân đứng trước có giá trị cao hơn (như Vua hoặc Hậu). Khi Vua bị chiếu phải né, quân đứng sau sẽ bị tiêu diệt.',
    tips: 'Rất hay xuất hiện trong tàn cuộc Xe khi Vua đối thủ đứng cùng hàng ngang/dọc với Xe của họ.'
  },
  {
    id: 'discovered_attack',
    title: 'Đòn Chiếu Mở (Discovered Attack)',
    tag: 'Đòn Đột Kích',
    desc: 'Di chuyển một quân để mở đường cho quân tầm xa phía sau chiếu Vua hoặc tấn công mục tiêu hiểm hóc.',
    detail: 'Quân di chuyển có thể đi đến bất kỳ đâu (thậm chí thí mạng hoặc ăn không quân khác) vì đối thủ bắt buộc phải đối phó với đòn chiếu từ quân phía sau.',
    tips: 'Nếu quân di chuyển cũng đồng thời chiếu Vua, đó là đòn "Chiếu Kép" (Double Check) - đối thủ chỉ có thể chạy Vua!'
  },
  {
    id: 'deflection',
    title: 'Đòn Đánh Lạc Hướng (Deflection)',
    tag: 'Phá Vỡ Phòng Thủ',
    desc: 'Ép buộc hoặc dụ dỗ quân phòng thủ then chốt của đối phương rời bỏ vị trí bảo vệ.',
    detail: 'Thí quân nhẹ hoặc chiếu bắt buộc để lôi kéo Hậu/Xe/Vua đối phương rời xa ô trọng yếu, mở đường cho đòn kết liễu.',
    tips: 'Tìm quân đang làm nhiệm vụ "duy nhất bảo vệ một mục tiêu sống còn" và tìm cách đuổi hoặc thí quân tiêu diệt nó.'
  },
  {
    id: 'back_rank_mate',
    title: 'Đòn Chiếu Hết Hàng Đáy (Back-Rank Mate)',
    tag: 'Chiếu Bí',
    desc: 'Xe hoặc Hậu thâm nhập vào hàng 8 (hoặc hàng 1) chiếu Vua khi các tốt phía trước chặn mất đường thoát.',
    detail: 'Khi đối thủ nhập thành mà chưa mở "cửa sổ" (đẩy tốt h6/g6 hoặc h3/g3), Vua sẽ bị nhốt chặt sau bức tường tốt của chính mình.',
    tips: 'Luôn chủ động mở một lỗ thông hơi (Luft) cho Vua bằng nước h3/h6 khi thế trận có nguy cơ bị tấn công hàng đáy.'
  },
  {
    id: 'smothered_mate',
    title: 'Đòn Chiếu Bí Nghẹt Thở (Smothered Mate)',
    tag: 'Chiến Thuật',
    desc: 'Vua đối phương bị bao vây tứ phía bởi chính quân mình ở góc bàn cờ và bị Mã chiếu bí không lối thoát.',
    detail: 'Đòn phối hợp kinh điển thường bắt đầu bằng việc thí Hậu vào ô g8/g1 ép Xe đối phương phải ăn vào, bịt kín ô thoát cuối cùng của Vua.',
    tips: 'Đòn này chỉ có thể thực hiện bởi quân Mã (quân cờ duy nhất có thể nhảy qua đầu quân khác).'
  },
  {
    id: 'perpetual_defense',
    title: 'Chiếu Vĩnh Cửu & Hòa Thế Bí (Fortress & Stalemate)',
    tag: 'Phòng Thủ Cầu Hòa',
    desc: 'Kỹ năng sinh tồn khi bị lép vế: Chiếu lặp lại không ngừng hoặc tạo thế Vua không có nước đi hợp lệ.',
    detail: 'Khi đang thua chất hoặc bị dồn ép nghẹt thở, hãy tìm mọi cách thí hết các quân còn lại để Vua rơi vào thế Bức Bí (Stalemate = Hòa cờ ngay lập tức) hoặc dùng Hậu/Xe chiếu liên tục 3 lần lặp lại.',
    tips: 'Đừng vội đầu hàng! Trong cờ vua, một trận hòa từ thế cờ thua chất là chiến thắng ngoạn mục của tư duy phòng thủ!'
  }
];

/**
 * Matches played moves against opening book
 */
export function identifyOpening(moveList) {
  if (!Array.isArray(moveList) || moveList.length === 0) return null;

  let bestMatch = null;
  let maxMatched = 0;

  for (const op of OPENINGS) {
    let matched = 0;
    for (let i = 0; i < op.moves.length && i < moveList.length; i++) {
      if (op.moves[i].toLowerCase() === moveList[i].toLowerCase()) {
        matched++;
      } else {
        break;
      }
    }
    if (matched > 0 && matched === op.moves.length && matched > maxMatched) {
      maxMatched = matched;
      bestMatch = op;
    }
  }

  // If no full match, check partial prefix
  if (!bestMatch) {
    for (const op of OPENINGS) {
      if (moveList[0] && op.moves[0].toLowerCase() === moveList[0].toLowerCase()) {
        return {
          ...op,
          partial: true,
          name: `${op.name} (Khởi đầu)`
        };
      }
    }
  }

  return bestMatch;
}
