/** Returns 'YYYY-MM-DD' in Eastern Time */
export const getTodayEST = (): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
};

/** Returns current minutes-since-midnight in Eastern Time */
export const getESTMinutes = (): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === 'hour')!.value, 10);
  const m = parseInt(parts.find(p => p.type === 'minute')!.value, 10);
  return h * 60 + m;
};

/** True if today (EST) is Saturday or Sunday */
export const isWeekendEST = (): boolean => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parseInt(parts.find(p => p.type === 'year')!.value, 10);
  const mo = parseInt(parts.find(p => p.type === 'month')!.value, 10) - 1;
  const d = parseInt(parts.find(p => p.type === 'day')!.value, 10);
  const dow = new Date(y, mo, d).getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 6;
};

/** 0=New Moon … 4=Full Moon … 7=Waning Crescent */
export const getMoonPhaseIndex = (): number => {
  const knownNew = new Date('2000-01-06T18:14:00Z').getTime();
  const lunarCycle = 29.530588853 * 24 * 60 * 60 * 1000;
  const elapsed = (Date.now() - knownNew) % lunarCycle;
  const phase = elapsed / lunarCycle; // 0–1
  return Math.floor(phase * 8) % 8;
};

export const MOON_PHASE_NAMES = [
  'NEW MOON', 'WAXING CRESCENT', 'FIRST QUARTER', 'WAXING GIBBOUS',
  'FULL MOON', 'WANING GIBBOUS', 'LAST QUARTER', 'WANING CRESCENT',
];
