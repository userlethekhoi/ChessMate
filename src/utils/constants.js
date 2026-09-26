export const BOARD_SELECTORS = [
  'wc-chess-board',
  'chess-board',
  '#board-single',
  '.board',
  '#chess_com_tactics_board'
];

export const fileToCol = (file) => {
  if (typeof file === 'number') return file;
  return 'abcdefgh'.indexOf(String(file).toLowerCase()) + 1;
};

export const SQUARE_SELECTORS = (rank, file) => {
  const col = fileToCol(file);
  const r = Number(rank);
  const letter = typeof file === 'string' && isNaN(Number(file)) ? file.toLowerCase() : 'abcdefgh'[col - 1] || 'a';
  return [
    `.square-${col}${r}`,       // chess.com numeric: square-54 (file5 rank4)
    `.square-0${col}0${r}`,     // padded numeric: square-0504
    `.square-${letter}${r}`,   // alpha-rank: square-e4
    `.square-${r}${letter}`    // rank-alpha fallback: square-4e
  ];
};

export const DEFAULT_CONFIG = Object.freeze({
  enabled: true,
  autoPlay: false,
  thinkingMode: 'mate_hunt', // 'mate_hunt', 'solid_defense', 'aggressive', 'balanced'
  skillLevel: 20,
  depth: 16,
  movetime: 1600,
  delayMin: 800,
  delayMax: 2500,
  useLLM: false,
  llmProvider: 'gemini',
  llmApiKey: '',
  llmEndpoint: '',
  llmModel: '',
  showOverlay: true,
  showArrows: true,
  showHud: true,
  hudMinimized: false
});

