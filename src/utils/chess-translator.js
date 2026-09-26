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
  let promotion = uci[4]?.toLowerCase();

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

  // 2. Phong cấp (Promotion) - Xem xét kĩ các trường hợp Phong Hậu, Phong Mã, Phong Xe, Phong Tượng
  if (!promotion && pieceType === 'p') {
    if ((fromSq[1] === '7' && toSq[1] === '8') || (fromSq[1] === '2' && toSq[1] === '1')) {
      promotion = 'q';
    }
  }

  if (promotion) {
    const promoMap = {
      q: { name: 'Hậu', symbol: '👑', desc: 'Tối ưu hóa sức mạnh áp đảo để dồn ép và kết liễu ván đấu nhanh nhất.' },
      n: { name: 'Mã', symbol: '♞', desc: 'Độc chiêu Underpromotion! Tận dụng bước nhảy chữ L tạo đòn bắt đôi (Fork) hoặc chiếu bất ngờ, đồng thời tránh bẫy Pat hòa cờ.' },
      r: { name: 'Xe', symbol: '♜', desc: 'Kỹ thuật Underpromotion! Tránh bẫy Pat (Stalemate hòa cờ nếu phong Hậu) và duy trì thế thắng ép góc tuyệt đối.' },
      b: { name: 'Tượng', symbol: '♝', desc: 'Kỹ thuật Underpromotion tinh tế! Tránh hòa cờ và kiểm soát đường chéo chiến lược để bóp nghẹt đối thủ.' }
    };
    const promoInfo = promoMap[promotion] || promoMap.q;

    if (targetPiece) {
      const targetName = PIECE_NAMES_VI[targetPiece.toLowerCase()] || 'quân đối phương';
      return {
        title: `${pieceName} ở ô ${fromUpper} ăn ${targetName} tại ô ${toUpper} ➔ Phong ${promoInfo.name} ${promoInfo.symbol}`,
        short: `${fromUpper}x${toUpper}=${promotion.toUpperCase()}`,
        piece: pieceName,
        promotion,
        promoName: promoInfo.name,
        promoSymbol: promoInfo.symbol,
        desc: `Tiêu diệt ${targetName} đối phương tại ${toUpper} và phong ${promoInfo.name}. ${promoInfo.desc}`
      };
    }

    return {
      title: `${pieceName} ở ô ${fromUpper} tiến lên ô ${toUpper} ➔ Phong ${promoInfo.name} ${promoInfo.symbol}`,
      short: `${fromUpper}->${toUpper}=${promotion.toUpperCase()}`,
      piece: pieceName,
      promotion,
      promoName: promoInfo.name,
      promoSymbol: promoInfo.symbol,
      desc: `Tiến Tốt xuống hàng cuối và phong cấp thành ${promoInfo.name}. ${promoInfo.desc}`
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
 * Returns structured evaluation parts to prevent text clipping/overflow
 */
export function formatEvaluationParts(evaluation) {
  if (evaluation == null) {
    return { numeric: '...', desc: 'Đang phân tích', full: 'Đang tính toán...' };
  }
  if (typeof evaluation === 'string' && evaluation.startsWith('#')) {
    const mateNum = parseInt(evaluation.replace('#', ''), 10);
    const sign = mateNum >= 0 ? '+' : '-';
    const mateLabel = isNaN(mateNum) ? '#M' : `M${Math.abs(mateNum)}`;
    const sideWin = (isNaN(mateNum) || mateNum >= 0) ? 'Trắng' : 'Đen';
    return {
      numeric: `${sign}${mateLabel}`,
      desc: `${sideWin} có đòn chiếu hết`,
      full: `[CHIẾU HẾT] ${sideWin} chiếu hết trong ${Math.abs(mateNum || 1)} nước`
    };
  }
  if (isNaN(evaluation)) {
    return { numeric: '...', desc: 'Đang phân tích', full: 'Đang tính toán...' };
  }
  if (evaluation >= 900) {
    return { numeric: '+#M', desc: 'Trắng có đòn chiếu hết', full: '[CHIẾU HẾT] Trắng có đòn dứt điểm' };
  }
  if (evaluation <= -900) {
    return { numeric: '-#M', desc: 'Đen có đòn chiếu hết', full: '[CHIẾU HẾT] Đen có đòn dứt điểm' };
  }
  const score = Number(evaluation);
  const sign = score > 0 ? '+' : '';
  const numStr = `${sign}${score.toFixed(1)}`;
  if (Math.abs(score) < 0.25) {
    return { numeric: numStr, desc: 'Thế trận cân bằng', full: `Cân bằng (${numStr})` };
  }
  if (score > 0) {
    const level = score > 3 ? 'áp đảo' : score > 1.5 ? 'lớn' : 'nhẹ';
    return { numeric: numStr, desc: `Trắng ưu thế ${level}`, full: `Trắng ưu thế ${level} (+${score.toFixed(2)})` };
  }
  const absScore = Math.abs(score);
  const level = absScore > 3 ? 'áp đảo' : absScore > 1.5 ? 'lớn' : 'nhẹ';
  return { numeric: numStr, desc: `Đen ưu thế ${level}`, full: `Đen ưu thế ${level} (${score.toFixed(2)})` };
}

/**
 * Formats evaluation score into readable, icon-free Vietnamese text
 */
export function formatEvaluationVi(evaluation) {
  return formatEvaluationParts(evaluation).full;
}
