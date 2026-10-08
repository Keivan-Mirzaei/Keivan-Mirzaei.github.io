import { soundChoice, validSound } from './sounds.mjs';
export const STORAGE_KEY = 'almost-obvious:gadgets:v1';
export const defaults = { examMinutes: 60, focusMinutes: 25, breakMinutes: 5, rules: '', awake: false, chime: false, chimeSound: 'soft', examInBar: false, pomodoroInBar: true, soundInBar: true, examReminder: true, examWarningMinutes: 5, source: 'brown', volume: 25 };
const number = (value, low, high, fallback) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high ? value : fallback;
export function readPreferences(value = {}) {
  return { examMinutes: number(value.examMinutes, 1, 1440, 60), focusMinutes: number(value.focusMinutes, 1, 180, 25), breakMinutes: number(value.breakMinutes, 1, 60, 5), rules: typeof value.rules === 'string' ? value.rules.slice(0, 20000) : '', awake: value.awake === true, chime: value.chime === true, chimeSound: ['soft', 'two-tone', 'bell'].includes(value.chimeSound) ? value.chimeSound : 'soft', examInBar: value.examInBar === true, pomodoroInBar: typeof value.pomodoroInBar === 'boolean' ? value.pomodoroInBar : true, examReminder: typeof value.examReminder === 'boolean' ? value.examReminder : true, examWarningMinutes: number(value.examWarningMinutes, 1, 120, 5), soundInBar: typeof value.soundInBar === 'boolean' ? value.soundInBar : true, source: soundChoice(value.source), volume: number(value.volume, 0, 100, 25) };
}
export function timerInBar(timer) { return !!timer && (timer.kind === 'exam' ? timer.config.examInBar === true : timer.config.pomodoroInBar !== false); }
export function remaining(timer, now = Date.now()) {
  if (!timer) return 0;
  return Math.max(0, timer.status === 'running' ? timer.deadline - now : timer.remaining);
}
export function reconcile(timer, now = Date.now()) {
  return timer?.status === 'running' && remaining(timer, now) === 0 ? { ...timer, status: 'complete', remaining: 0, deadline: null } : timer;
}
export function createTimer(kind, preferences, now = Date.now(), phase = 'focus', round = 1) {
  const config = readPreferences(preferences);
  const duration = (kind === 'exam' ? config.examMinutes : phase === 'focus' ? config.focusMinutes : config.breakMinutes) * 60000;
  return { kind, phase: kind === 'exam' ? 'exam' : phase, round, status: 'running', duration, remaining: duration, deadline: now + duration, config };
}
export function pauseTimer(timer, now = Date.now()) {
  const current = reconcile(timer, now);
  return current?.status === 'running' ? { ...current, status: 'paused', remaining: remaining(current, now), deadline: null } : current;
}
export function resumeTimer(timer, now = Date.now()) {
  return timer?.status === 'paused' ? { ...timer, status: 'running', deadline: now + timer.remaining } : timer;
}
export function nextPhase(timer, now = Date.now()) {
  if (timer?.kind !== 'pomodoro' || timer.status !== 'complete') return timer;
  return createTimer('pomodoro', timer.config, now, timer.phase === 'focus' ? 'break' : 'focus', timer.round + (timer.phase === 'break' ? 1 : 0));
}
export function readState(serialized, now = Date.now()) {
  const fallback = { version: 1, timer: null, sound: null, preferences: { ...defaults } };
  try {
    const value = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    if (!value || value.version !== 1) return fallback;
    const preferences = readPreferences(value.preferences);
    let timer = null;
    const t = value.timer;
    if (t && ['exam', 'pomodoro'].includes(t.kind) && ['running', 'paused', 'complete'].includes(t.status)
      && Number.isFinite(t.duration) && t.duration >= 60000 && t.duration <= 86400000
      && Number.isFinite(t.remaining) && t.remaining >= 0 && t.remaining <= t.duration
      && Number.isInteger(t.round) && t.round >= 1 && t.round <= 100000
      && (t.kind === 'exam' ? t.phase === 'exam' : ['focus', 'break'].includes(t.phase))
      && (t.status !== 'running' || Number.isFinite(t.deadline) && t.deadline <= now + t.duration)
      && (t.status !== 'complete' || t.remaining === 0)) {
      timer = reconcile({ kind: t.kind, phase: t.phase, round: t.round, status: t.status, duration: t.duration, remaining: t.remaining, deadline: t.status === 'running' ? t.deadline : null, config: readPreferences(t.config), alarmOwner: typeof t.alarmOwner === 'string' ? t.alarmOwner.slice(0, 100) : '' }, now);
    }
    const sound = value.sound && validSound(value.sound.source) ? {
      source: value.sound.source, volume: number(value.sound.volume, 0, 100, 25), playing: value.sound.playing === true,
      owner: typeof value.sound.owner === 'string' ? value.sound.owner.slice(0, 100) : ''
    } : null;
    return { version: 1, timer, sound, preferences };
  } catch { return fallback; }
}
export function formatTime(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds / 60) % 60;
  return `${hours ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
export function formatExamTime(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(seconds / 3600), parts = [Math.floor(seconds / 60) % 60, seconds % 60];
  if (hours) parts.unshift(hours);
  return parts.map(value => String(value).padStart(2, '0')).join(':');
}
export function examTone(timer, milliseconds = remaining(timer)) {
  if (timer?.kind !== 'exam' || !timer.config.examReminder) return 'normal';
  if (timer.status === 'complete' || milliseconds <= 0) return 'complete';
  return milliseconds <= timer.config.examWarningMinutes * 60000 ? 'warning' : 'normal';
}
export function timerLabel(timer) { return timer?.kind === 'exam' ? 'Exam' : timer?.phase === 'break' ? 'Break' : 'Focus'; }
// Keep TeX atomic across lines and outside Markdown emphasis. HTML remains text.
const mathPattern = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<![\\$])\$(?!\$)(?:\\.|[^$\\\n])+?(?<!\\)\$(?!\$)/g;
export function hasRulesMath(source) { return !!String(source).match(mathPattern); }
export function rulesMarkup(source) {
  const escape = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const formulas = [];
  let text = String(source).slice(0, 20000), marker = '\uE000';
  while (text.includes(marker)) marker += '\uE001';
  text = text.replace(mathPattern, formula => `${marker}${formulas.push(formula.startsWith('$') && !formula.startsWith('$$') ? `\\(${formula.slice(1, -1)}\\)` : formula) - 1}${marker}`);
  const tokens = new RegExp(`${marker}(\\d+)${marker}`, 'g');
  const inline = text => escape(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(tokens, (_, index) => escape(formulas[Number(index)]));
  let list = false, html = '';
  for (const line of text.split('\n')) {
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
    if (bullet) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(bullet[1])}</li>`; continue; }
    if (list) { html += '</ul>'; list = false; }
    const heading = /^#{1,3}\s+(.+)$/.exec(line);
    if (heading) html += `<h2>${inline(heading[1])}</h2>`;
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  return html + (list ? '</ul>' : '');
}
