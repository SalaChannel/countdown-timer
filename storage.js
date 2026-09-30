// localStorage 読み書き（全て try/catch）とデータ正規化

export const STORAGE_KEY = 'countdown:v1';
export const SLOT_COUNT = 3;
export const MAX_LABEL = 20;

const emptySlot = () => ({ label: '', target: null });

/** 1枠分を正規化 */
function normalizeSlot(item) {
  if (!item || typeof item !== 'object') return emptySlot();
  const label = typeof item.label === 'string' ? item.label.slice(0, MAX_LABEL) : '';
  let target = null;
  if (typeof item.target === 'string' && !Number.isNaN(new Date(item.target).getTime())) {
    target = item.target;
  }
  return { label, target };
}

/** 任意の値 → 3枠配列。壊れた/要素数不一致は未設定3枠 */
export function normalizeTimers(data) {
  if (!Array.isArray(data) || data.length !== SLOT_COUNT) {
    return Array.from({ length: SLOT_COUNT }, emptySlot);
  }
  return data.map(normalizeSlot);
}

/** JSON文字列 → 3枠配列。壊れたJSONは未設定3枠 */
export function parseTimers(json) {
  try {
    return normalizeTimers(JSON.parse(json));
  } catch {
    return normalizeTimers(null);
  }
}

/** 読み込み（失敗しても必ず3枠を返す） */
export function loadTimers(storage) {
  try {
    return parseTimers(storage.getItem(STORAGE_KEY));
  } catch {
    return normalizeTimers(null);
  }
}

/** 保存。成功なら true、失敗なら false */
export function saveTimers(storage, timers) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeTimers(timers)));
    return true;
  } catch {
    return false;
  }
}
