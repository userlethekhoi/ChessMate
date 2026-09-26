const PREFIX = '[ChessMate]';
export const logger = {
  info: (...a) => console.info(PREFIX, ...a),
  warn: (...a) => console.info(PREFIX, '[WARN]', ...a),
  error: (...a) => console.error(PREFIX, ...a)
};
