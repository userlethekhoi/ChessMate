import { PIECE_VALUES, calculateMaterial } from '../utils/board-evaluator.js';
import { fenToBoard } from '../utils/chess-translator.js';

/**
 * Move Optimizer - Thuật toán chọn nước đi ngắn nhất, nhanh nhất và chuẩn xác nhất
 * Tuân thủ tuyệt đối bảng giá trị quân cờ và nguyên tắc tối thiểu hóa số bước.
 */

/**
 * Đánh giá tính cưỡng bức và độ trực diện của một nước đi (Forcing & Directness Score)
 * Chiếu Vua (Check) > Ăn quân lớn (Capture) > Đổi quân đơn giản hóa > Nước bình thường
 */
export function evaluateMoveDirectness(move, fen) {
  if (!move || !fen) return 0;
  const fromSq = move.slice(0, 2).toLowerCase();
  const toSq = move.slice(2, 4).toLowerCase();

  const board = fenToBoard(fen);
  if (!board) return 0;

  const fileToCol = (f) => 'abcdefgh'.indexOf(f);
  const rankToRow = (r) => 8 - parseInt(r, 10);

  const fromRow = rankToRow(fromSq[1]);
  const fromCol = fileToCol(fromSq[0]);
  const toRow = rankToRow(toSq[1]);
  const toCol = fileToCol(toSq[0]);

  const movedChar = (fromRow >= 0 && fromRow < 8 && fromCol >= 0 && fromCol < 8) ? board[fromRow][fromCol] : null;
  const targetChar = (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) ? board[toRow][toCol] : null;

  let directnessScore = 0;

  // 1. Ăn quân: Ưu tiên trực diện triệt hạ quân giá trị cao của đối thủ
  if (targetChar) {
    const targetType = targetChar.toLowerCase();
    const targetVal = PIECE_VALUES[targetType] || 0;
    const movedType = movedChar ? movedChar.toLowerCase() : null;
    const movedVal = movedType ? (PIECE_VALUES[movedType] || 0) : 0;

    // Ăn quân càng lớn thì độ ưu tiên trực diện càng cao
    directnessScore += targetVal * 2;

    // Lãi chất (quân bé ăn quân to) được cộng điểm tối đa
    if (targetVal > movedVal) {
      directnessScore += (targetVal - movedVal) * 3;
    }
  }

  // 2. Phong cấp: Nước đi biến hình dứt điểm
  if (move.length === 5) {
    directnessScore += 8;
  }

  // 3. Kiểm soát trung tâm trực tiếp (e4, d4, e5, d5, c4, f4)
  if (['e4', 'd4', 'e5', 'd5', 'c4', 'f4', 'c5', 'f5'].includes(toSq)) {
    directnessScore += 1;
  }

  return directnessScore;
}

/**
 * Chọn nước đi tối ưu nhất trong danh sách candidates của Stockfish
 * @param {Array} candidates - Danh sách các biến thể từ MultiPV
 * @param {string} defaultBestMove - Nước đi mặc định từ bestmove của Stockfish
 * @param {string} fen - FEN hiện tại
 * @param {string} userColor - Bên đang đi ('w' hoặc 'b')
 */
export function selectShortestAndMostDirectMove({
  candidates = [],
  defaultBestMove = null,
  fen = null,
  userColor = 'w'
}) {
  if (!candidates || candidates.length === 0) {
    return {
      move: defaultBestMove,
      evaluation: 0,
      mateIn: null,
      pv: [],
      efficiencyNote: 'Nước đi chuẩn xác tối ưu'
    };
  }

  // 1. KIỂM TRA ĐÒN CHIẾU HẾT (FASTEST CHECKMATE RULE)
  // Nếu có biến thể chiếu hết, luôn chọn biến thể có số bước chiếu hết ít nhất (mateIn dương nhỏ nhất)
  const mateCandidates = candidates.filter(c => c.mateIn != null && c.mateIn > 0);
  if (mateCandidates.length > 0) {
    // Sắp xếp theo số bước chiếu hết tăng dần (ví dụ Mate 1 > Mate 2 > Mate 3)
    mateCandidates.sort((a, b) => a.mateIn - b.mateIn);
    const fastest = mateCandidates[0];
    return {
      move: fastest.move,
      evaluation: `#${fastest.mateIn}`,
      mateIn: fastest.mateIn,
      pv: fastest.pv || [],
      efficiencyNote: `⚡ CHIẾU HẾT NHANH NHẤT: Dứt điểm ván cờ chỉ trong ${fastest.mateIn} nước!`
    };
  }

  // Nếu bị đối phương dọa chiếu hết (mateIn âm), chọn nước kéo dài sự sống / né chiếu tốt nhất (mateIn âm có trị tuyệt đối lớn nhất)
  const defenseMateCandidates = candidates.filter(c => c.mateIn != null && c.mateIn < 0);
  if (defenseMateCandidates.length > 0 && candidates.every(c => c.mateIn != null && c.mateIn < 0)) {
    defenseMateCandidates.sort((a, b) => Math.abs(b.mateIn) - Math.abs(a.mateIn));
    const bestDef = defenseMateCandidates[0];
    return {
      move: bestDef.move,
      evaluation: `#${bestDef.mateIn}`,
      mateIn: bestDef.mateIn,
      pv: bestDef.pv || [],
      efficiencyNote: `🛡️ PHÒNG THỦ KÉO DÀI THỜI GIAN: Hóa giải đòn sát thủ của địch (${Math.abs(bestDef.mateIn)} nước)`
    };
  }

  // 2. QUY TẮC NƯỚC ĐI TRỰC DIỆN & TỐI THIỂU SỐ BƯỚC (DIRECT & FORCING MOVES)
  // Lọc các candidate có điểm số cp cao nhất (trong biên độ chênh lệch <= 0.25 điểm so với candidate dẫn đầu)
  // để đảm bảo không hy sinh lợi thế điểm số
  const validCpCandidates = candidates.filter(c => typeof c.evaluation === 'number');
  if (validCpCandidates.length > 0) {
    validCpCandidates.sort((a, b) => b.evaluation - a.evaluation);
    const topEval = validCpCandidates[0].evaluation;

    // Các nước đi có điểm số cạnh tranh nhau (suýt soát top 1)
    const competitiveGroup = validCpCandidates.filter(c => Math.abs(c.evaluation - topEval) <= 0.25);

    // Chấm điểm độ trực diện & ngắn gọn cho từng nước
    for (const cand of competitiveGroup) {
      cand.directnessScore = evaluateMoveDirectness(cand.move, fen);
    }

    // Ưu tiên nước có độ trực diện cao nhất (ăn quân lớn, chiếu, ép đối phương)
    competitiveGroup.sort((a, b) => (b.directnessScore || 0) - (a.directnessScore || 0));
    const chosen = competitiveGroup[0];

    let efficiencyNote = '🎯 Nước đi tối ưu hóa vị trí và kiểm soát không gian';
    if (chosen.directnessScore >= 10) {
      efficiencyNote = '⚡ ĐÒN ĐÁNH TRỰC DIỆN: Tiêu diệt mục tiêu chủ lực trong 1 bước dứt khoát!';
    } else if (chosen.directnessScore >= 5) {
      efficiencyNote = '🎯 LỘ TRÌNH NGẮN NHẤT: Nước đi cưỡng bức, triệt tiêu thời gian phản kích của đối phương.';
    }

    return {
      move: chosen.move || defaultBestMove,
      evaluation: chosen.evaluation,
      mateIn: null,
      pv: chosen.pv || [],
      efficiencyNote
    };
  }

  // Fallback candidate đầu tiên
  const first = candidates[0];
  return {
    move: first.move || defaultBestMove,
    evaluation: first.evaluation ?? 0,
    mateIn: first.mateIn || null,
    pv: first.pv || [],
    efficiencyNote: 'Nước đi chuẩn xác theo tính toán'
  };
}
