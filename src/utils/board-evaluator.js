import { fenToBoard } from './chess-translator.js';

/**
 * Bảng giá trị quân cờ tiêu chuẩn quốc tế (Standard Chess Piece Values)
 */
export const PIECE_VALUES = {
  p: 1,   // Tốt: 1 điểm (linh hồn cờ vua, tiềm năng phong cấp)
  n: 3,   // Mã: 3 điểm (quân nhẹ, cơ động nhảy vượt vật cản, đòn chĩa đôi Fork)
  b: 3.2, // Tượng: 3.2 điểm (quân nhẹ, hỏa lực đường chéo tầm xa)
  r: 5,   // Xe: 5 điểm (quân nặng, chiếm cột mở và hàng ngang)
  q: 9,   // Hậu: 9 điểm (quân hỏa lực mạnh nhất bàn cờ)
  k: 0    // Vua: Vô giá (mục tiêu tối thượng, mất Vua là thua)
};

export const PIECE_FULL_NAMES = {
  p: 'Tốt',
  n: 'Mã',
  b: 'Tượng',
  r: 'Xe',
  q: 'Hậu',
  k: 'Vua'
};

/**
 * Tính toán tổng lực lượng và chênh lệch quân số từ FEN
 */
export function calculateMaterial(fen) {
  if (!fen) return null;
  const placement = fen.split(' ')[0];
  
  const whitePieces = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const blackPieces = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  let whiteScore = 0;
  let blackScore = 0;

  for (const char of placement) {
    if (char === '/' || /^[1-8]$/.test(char)) continue;
    const isWhite = char === char.toUpperCase();
    const type = char.toLowerCase();
    const val = PIECE_VALUES[type] || 0;

    if (isWhite) {
      if (whitePieces[type] !== undefined) whitePieces[type]++;
      whiteScore += val;
    } else {
      if (blackPieces[type] !== undefined) blackPieces[type]++;
      blackScore += val;
    }
  }

  // Làm tròn 1 chữ số thập phân
  whiteScore = Math.round(whiteScore * 10) / 10;
  blackScore = Math.round(blackScore * 10) / 10;
  const diff = Math.round((whiteScore - blackScore) * 10) / 10;

  let advantage = 'equal';
  let diffText = 'Cân bằng lực lượng';
  if (diff > 0.5) {
    advantage = 'w';
    diffText = `Trắng hơn +${diff} điểm`;
  } else if (diff < -0.5) {
    advantage = 'b';
    diffText = `Đen hơn +${Math.abs(diff)} điểm`;
  }

  return {
    whiteScore,
    blackScore,
    diff,
    whitePieces,
    blackPieces,
    advantage,
    diffText
  };
}

/**
 * Đánh giá bản chất nước đi: Ăn quân hời, Đổi quân, Thí quân, hay Phòng thủ
 */
export function evaluateMoveStrategy({ fen, uci, evaluation, userColor = 'w' }) {
  if (!fen || !uci || uci.length < 4) return null;

  const fromSq = uci.slice(0, 2).toLowerCase();
  const toSq = uci.slice(2, 4).toLowerCase();
  const promotion = uci[4]?.toLowerCase();

  const board = fenToBoard(fen);
  if (!board) return null;

  // Lấy toạ độ hàng/cột
  const fileToCol = (f) => 'abcdefgh'.indexOf(f);
  const rankToRow = (r) => 8 - parseInt(r, 10);

  const fromCol = fileToCol(fromSq[0]);
  const fromRow = rankToRow(fromSq[1]);
  const toCol = fileToCol(toSq[0]);
  const toRow = rankToRow(toSq[1]);

  const movedChar = (fromRow >= 0 && fromRow < 8 && fromCol >= 0 && fromCol < 8) ? board[fromRow][fromCol] : null;
  const targetChar = (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) ? board[toRow][toCol] : null;

  const movedType = movedChar ? movedChar.toLowerCase() : null;
  const targetType = targetChar ? targetChar.toLowerCase() : null;

  const movedVal = movedType ? (PIECE_VALUES[movedType] || 0) : 0;
  const targetVal = targetType ? (PIECE_VALUES[targetType] || 0) : 0;

  const material = calculateMaterial(fen);
  const isMyTurn = (fen.split(' ')[1] || 'w') === userColor;
  const myMaterialLead = userColor === 'w' ? (material?.diff || 0) : -(material?.diff || 0);

  const evalNum = typeof evaluation === 'number' ? evaluation : parseFloat(evaluation) || 0;
  const isCheckmateThreat = String(evaluation).includes('#') || Math.abs(evalNum) >= 900;

  // 1. Phân loại ĂN QUÂN CÓ LỢI (Favorable Material Gain)
  if (targetType) {
    const gain = targetVal - movedVal;
    if (gain > 0.5) {
      // Dùng quân bé ăn quân to (VD: Tốt ăn Mã/Tượng/Xe/Hậu, Tượng/Mã ăn Xe/Hậu)
      return {
        type: 'material_gain',
        badge: 'ĂN CHẤT LỜI QUÂN',
        color: '#22c55e',
        tag: `Lời +${Math.round(gain * 10) / 10}đ`,
        movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
        targetName: PIECE_FULL_NAMES[targetType] || 'Quân',
        movedVal,
        targetVal,
        advice: `Dùng ${PIECE_FULL_NAMES[movedType]} (${movedVal}đ) tiêu diệt ${PIECE_FULL_NAMES[targetType]} (${targetVal}đ) đối phương! Nước cờ lãi chất cực lớn, gia tăng cách biệt lực lượng rõ rệt.`
      };
    }

    // 2. Phân loại ĐỔI QUÂN NGANG BẰNG (Equal Trade: Hậu đổi Hậu, Xe đổi Xe,...)
    if (Math.abs(gain) <= 0.5) {
      if (myMaterialLead > 1.5 || (userColor === 'w' ? evalNum > 2 : evalNum < -2)) {
        // Đang hơn quân -> ĐỔI ĐỂ THẮNG
        return {
          type: 'trade_simplify',
          badge: 'ĐỔI QUÂN ĐỂ THẮNG DỄ (SIMPLIFY)',
          color: '#38bdf8',
          tag: 'Đơn giản hoá thế cờ',
          movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
          targetName: PIECE_FULL_NAMES[targetType] || 'Quân',
          movedVal,
          targetVal,
          advice: `Bạn đang dẫn trước lực lượng! Quy tắc Đại Kiện tướng: Đổi ${PIECE_FULL_NAMES[movedType]} lấy ${PIECE_FULL_NAMES[targetType]} để triệt tiêu mọi khả năng phản công của đối thủ, đưa thẳng về tàn cuộc thắng chắc.`
        };
      } else if (myMaterialLead < -1.5 || (userColor === 'w' ? evalNum < -2 : evalNum > 2)) {
        // Đang thua quân -> CẨN TRỌNG KHI ĐỔI
        return {
          type: 'trade_caution',
          badge: 'ĐỔI QUÂN ÉP BUỘC',
          color: '#f59e0b',
          tag: 'Hóa giải áp lực',
          movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
          targetName: PIECE_FULL_NAMES[targetType] || 'Quân',
          movedVal,
          targetVal,
          advice: `Bạn đang kém quân hơn đối thủ. Nước đổi quân này là giải pháp bắt buộc để dập tắt đợt tấn công nguy hiểm của đối phương, tìm cơ hội cầu hòa.`
        };
      } else {
        // Thế cờ cân bằng
        return {
          type: 'trade_equal',
          badge: 'ĐỔI QUÂN CÂN BẰNG',
          color: '#a855f7',
          tag: 'Đổi quân sòng phẳng',
          movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
          targetName: PIECE_FULL_NAMES[targetType] || 'Quân',
          movedVal,
          targetVal,
          advice: `Đổi ${PIECE_FULL_NAMES[movedType]} lấy ${PIECE_FULL_NAMES[targetType]} ngang giá (${movedVal}đ = ${targetVal}đ), duy trì thế trận cân bằng và giành quyền kiểm soát ô chiến lược.`
        };
      }
    }
  }

  // 3. Phân loại THÍ QUÂN CHIẾN THUẬT (Tactical Sacrifice)
  // Khi di chuyển quân lớn vào vị trí chịu rủi ro nhưng Engine đánh giá ưu thế áp đảo / chiếu hết
  if (isCheckmateThreat || (userColor === 'w' ? evalNum >= 4.0 : evalNum <= -4.0)) {
    if (movedVal >= 3 && !targetType) {
      return {
        type: 'tactical_sacrifice',
        badge: 'THÍ QUÂN CHIẾN THUẬT (SACRIFICE)',
        color: '#ef4444',
        tag: 'Đột phá dứt điểm',
        movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
        movedVal,
        advice: `Nước cờ thí ${PIECE_FULL_NAMES[movedType]} (${movedVal}đ) táo bạo của Kiện tướng! Bỏ quân để xé toang hàng phòng ngự đối phương, mở đường dứt điểm chiếu hết không thể cản phá.`
      };
    }
  }

  // 4. Phân loại PHÒNG THỦ & BẢO TOÀN LỰC LƯỢNG (Solid Defense)
  if (movedVal >= 3 && (fromSq.startsWith('e') || fromSq.startsWith('d') || fromSq.startsWith('f'))) {
    if (userColor === 'w' ? evalNum < 0 : evalNum > 0) {
      return {
        type: 'defense',
        badge: 'PHÒNG THỦ BẢO TOÀN LỰC LƯỢNG',
        color: '#eab308',
        tag: 'Gia cố an toàn',
        movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
        movedVal,
        advice: `Điều động ${PIECE_FULL_NAMES[movedType]} về vị trí an toàn, che chắn cánh Vua và bịt kín các đường tấn công nguy hiểm của đối thủ.`
      };
    }
  }

  // 5. Mặc định: KIỂM SOÁT THẾ TRẬN (Positional)
  return {
    type: 'positional',
    badge: 'PHÁT TRIỂN & KIỂM SOÁT KHÔNG GIAN',
    color: '#10b981',
    tag: 'Tối ưu vị trí',
    movedName: PIECE_FULL_NAMES[movedType] || 'Quân',
    movedVal,
    advice: `Điều động ${PIECE_FULL_NAMES[movedType]} chiếm lĩnh ô chiến lược ${toSq.toUpperCase()}, tăng cường tầm kiểm soát trung tâm và hỗ trợ các quân đồng đội.`
  };
}
