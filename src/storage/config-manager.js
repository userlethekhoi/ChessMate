import { DEFAULT_CONFIG } from '../utils/constants.js';
const listeners = new Set();
let memoryConfig = { ...DEFAULT_CONFIG };
export async function getConfig() { const storage = globalThis.chrome?.storage?.local; if (!storage) return { ...memoryConfig }; const result = await storage.get(DEFAULT_CONFIG); memoryConfig = { ...DEFAULT_CONFIG, ...result }; return { ...memoryConfig }; }
export async function setConfig(partial) { const next = { ...(await getConfig()), ...partial }; memoryConfig = next; const storage = globalThis.chrome?.storage?.local; if (storage) await storage.set(next); listeners.forEach(fn => fn(next)); return next; }
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
globalThis.chrome?.storage?.onChanged?.addListener((changes, area) => { if (area !== 'local') return; const update = {}; for (const [k, v] of Object.entries(changes)) update[k] = v.newValue; listeners.forEach(fn => fn(update)); });
