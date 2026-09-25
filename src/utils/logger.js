const PREFIX = '[ChessMate]';
export const logger = { info: (...a) => console.info(PREFIX, ...a), warn: (...a) => console.warn(PREFIX, ...a), error: (...a) => console.error(PREFIX, ...a) };
