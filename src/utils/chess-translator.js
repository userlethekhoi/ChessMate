const PIECE_NAMES_VI = {
  p: 'Tốt',
  n: 'Mã',
  b: 'Tượng',
  r: 'Xe',
  q: 'Hậu',
  k: 'Vua'
};

/**
 * Parses placement from FEN into an 8x8 matrix
 */
export function fenToBoard(fen) {
  const placement = String(fen || '').trim().split(/\s+/)[0];
  const rows = placement.split('/');
  if (rows.length !== 8) return null;

  const board = [];
  for (const row of rows) {
    const boardRow = [];
    for (const char of row) {
      if (/^[1-8]$/.test(char)) {
        for (let i = 0; i < parseInt(char, 10); i++) {
          boardRow.push(null);
        }
      } else {
        boardRow.push(char);
      }
    }
    if (boardRow.length !== 8) return null;
    board.push(boardRow);
  }
  return board;
}

/**
 * Converts algebraic coordinate (e.g. 'e4') to matrix indices { row, col }
 */
export function squareToIndices(square) {
  if (!square || square.length < 2) return null;
  const col = 'abcdefgh'.indexOf(square[0].toLowerCase());
  const rank = parseInt(square[1], 10);
  if (col < 0 || col > 7 || rank < 1 || rank > 8) return null;
  const row = 8 - rank;
  return { row, col };
}

/**
 * Translates a UCI move into a descriptive, natural Vietnamese instruction.
 * Icon-free, clean typography output.
 */
export function translateMoveToVietnamese(uci, fen = null) {
  if (!uci || uci.length < 4) return { title: uci || 'Chưa có nước đi', desc: '', piece: '' };

  const fromSq = uci.slice(0, 2).toLowerCase();
  const toSq = uci.slice(2, 4).toLowerCase();
  const promotion = uci[4]?.toLowerCase();

  const fromUpper = fromSq.toUpperCase();
  const toUpper = toSq.toUpperCase();

  const board = fen ? fenToBoard(fen) : null;
  let movedPiece = null;
  let targetPiece = null;

  if (board) {
    const fromIdx = squareToIndices(fromSq);
    const toIdx = squareToIndices(toSq);
    if (fromIdx) movedPiece = board[fromIdx.row][fromIdx.col];
    if (toIdx) targetPiece = board[toIdx.row][toIdx.col];
  }

  const pieceType = movedPiece ? movedPiece.toLowerCase() : null;
  const pieceName = pieceType ? (PIECE_NAMES_VI[pieceType] || 'Quân cờ') : 'Quân cờ';

  // 1. Nhập thành (Castling)
  if (pieceType === 'k') {
    if (fromSq === 'e1' && toSq === 'g1') {
      return {
        title: 'Nhập thành gần (O-O)',
        short: 'O-O (Cánh Vua)',
        piece: 'Vua',
        desc: 'Đưa Vua Trắng vào vị trí an toàn và kích hoạt Xe h1 ra trung tâm'
      };
    }
    if (fromSq === 'e1' && toSq === 'c1') {
      return {
        title: 'Nhập thành xa (O-O-O)',
        short: 'O-O-O (Cánh Hậu)',
        piece: 'Vua',
        desc: 'Bảo vệ Vua Trắng và chuyển Xe a1 tham chiến mạnh mẽ'
      };
    }
    if (fromSq === 'e8' && toSq === 'g8') {
      return {
        title: 'Nhập thành gần (O-O)',
        short: 'O-O (Cánh Vua)',
        piece: 'Vua',
        desc: 'Đưa Vua Đen vào vị trí phòng thủ vững vàng'
      };
    }
    if (fromSq === 'e8' && toSq === 'c8') {
      return {
        title: 'Nhập thành xa (O-O-O)',
        short: 'O-O-O (Cánh Hậu)',
        piece: 'Vua',
        desc: 'Đưa Vua Đen sang cánh Hậu và mở đường phản công'
      };
    }
  }

  // 2. Phong cấp (Promotion)
  if (promotion) {
    const promoNames = { q: 'Hậu', r: 'Xe', b: 'Tượng', n: 'Mã' };
    const promoName = promoNames[promotion] || 'Hậu';
    return {
      title: `${pieceName} ở ô ${fromUpper} tiến lên ${toUpper} (Phong ${promoName})`,
      short: `${pieceName} ${fromUpper} -> ${toUpper}=${promotion.toUpperCase()}`,
      piece: pieceName,
      desc: `Tiến Tốt xuống hàng cuối và phong cấp thành ${promoName} uy lực`
    };
  }

  // 3. Ăn quân (Capture)
  if (targetPiece) {
    const targetType = targetPiece.toLowerCase();
    const targetName = PIECE_NAMES_VI[targetType] || 'quân đối phương';
    return {
      title: `${pieceName} ở ô ${fromUpper} ăn ${targetName} tại ô ${toUpper}`,
      short: `${pieceName} ${fromUpper} x ${toUpper}`,
      piece: pieceName,
      desc: `Tiêu diệt ${targetName} đối phương tại ${toUpper}, chiếm lĩnh vị trí chiến lược`
    };
  }

  // 4. Di chuyển thông thường
  let verb = 'di chuyển đến';
  let reasoning = `Kiểm soát ô ${toUpper} và gia tăng ảnh hưởng`;

  if (pieceType === 'p') {
    verb = 'tiến lên';
    reasoning = `Củng cố trung tâm và mở rộng không gian cho các quân nhẹ`;
  } else if (pieceType === 'n') {
    verb = 'nhảy đến';
    reasoning = `Đưa Mã vào tiền đồn mạnh mẽ, uy hiếp các vị trí trọng yếu`;
  } else if (pieceType === 'b') {
    verb = 'di chuyển qua';
    reasoning = `Chiếm giữ đường chéo kiểm soát cánh và ghim quân đối thủ`;
  } else if (pieceType === 'r') {
    verb = 'chuyển sang';
    reasoning = `Chiếm cột mở và sẵn sàng phối hợp dồn ép hàng ngang`;
  } else if (pieceType === 'q') {
    verb = 'tiến ra';
    reasoning = `Tung Hậu vào vị trí uy lực, sẵn sàng mở đòn phối hợp`;
  } else if (pieceType === 'k') {
    verb = 'bước sang';
    reasoning = `Cải thiện vị trí Vua và tránh nguy hiểm`;
  }

  return {
    title: `${pieceName} ở ô ${fromUpper} ${verb} ${toUpper}`,
    short: `${pieceName} ${fromUpper} -> ${toUpper}`,
    piece: pieceName,
    desc: reasoning
  };
}

/**
 * Formats evaluation score into readable, icon-free Vietnamese text
 */
export function formatEvaluationVi(evaluation) {
  if (evaluation == null || isNaN(evaluation)) return 'Đang tính toán...';
  if (evaluation >= 900) {
    return '[CHIẾU HẾT] Trắng có đòn dứt điểm';
  }
  if (evaluation <= -900) {
    return '[CHIẾU HẾT] Đen có đòn dứt điểm';
  }
  const score = Number(evaluation);
  if (Math.abs(score) < 0.25) {
    return `Cân bằng (${score >= 0 ? '+' : ''}${score.toFixed(1)})`;
  }
  if (score > 0) {
    const level = score > 3 ? 'áp đảo' : score > 1.5 ? 'lớn' : 'nhẹ';
    return `Trắng ưu thế ${level} (+${score.toFixed(2)})`;
  }
  const absScore = Math.abs(score);
  const level = absScore > 3 ? 'áp đảo' : absScore > 1.5 ? 'lớn' : 'nhẹ';
  return `Đen ưu thế ${level} (${score.toFixed(2)})`;
}
