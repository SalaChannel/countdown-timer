// カウントダウン計算・表示用の純粋関数（DOM非依存）

const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;
const SECOND = 1000;

/** 残りミリ秒 → {days, hours, minutes, seconds, finished}。未設定(null等)は null */
export function splitRemaining(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }
  const total = Math.floor(ms / SECOND) * SECOND;
  return {
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / HOUR),
    minutes: Math.floor((total % HOUR) / MINUTE),
    seconds: Math.floor((total % MINUTE) / SECOND),
    finished: false,
  };
}

/** 目標(ISO文字列|null)と現在時刻(ms)から残りミリ秒。不正/未設定は null */
export function remainingMs(target, nowMs) {
  if (!target) return null;
  const t = new Date(target).getTime();
  if (Number.isNaN(t)) return null;
  return t - nowMs;
}

const pad = (n) => String(n).padStart(2, '0');

/** 「3日 04:05:06」形式 */
export function formatRemaining(r) {
  return `${r.days}日 ${pad(r.hours)}:${pad(r.minutes)}:${pad(r.seconds)}`;
}

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

/** 「10/3(土) 18:00」形式（端末のローカル時刻） */
export function formatTarget(target) {
  const d = new Date(target);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO文字列 → datetime-local の値（例 2026-10-03T18:00） */
export function toInputValue(target) {
  const d = new Date(target);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local の値 → ISO文字列。空/不正は null */
export function fromInputValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
