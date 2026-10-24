import assert from 'node:assert/strict';
import test from 'node:test';
import { defaults, createTimer, remaining, pauseTimer, resumeTimer, reconcile, nextPhase, readState, readPreferences, rulesMarkup, formatTime, formatExamTime, examTone, timerInBar, STORAGE_KEY } from '../assets/js/gadgets/model.mjs';
import { dailyFocus, localDay } from '../assets/js/gadgets/focus-log.mjs';
import { createAudioPlayer } from '../assets/js/gadgets/audio.mjs';
import { createGadgetService } from '../assets/js/gadgets/service.mjs';
import { sounds } from '../assets/js/gadgets/sounds.mjs';

test('deadlines catch up after suspension while paused time remains frozen', () => {
  const timer = createTimer('exam', { ...defaults, examMinutes: 2 }, 1000);
  assert.equal(remaining(timer, 61000), 60000);
  const paused = pauseTimer(timer, 61000);
  assert.equal(remaining(paused, 999999), 60000);
  const resumed = resumeTimer(paused, 800000);
  assert.equal(resumed.deadline, 860000);
  assert.equal(remaining(resumed, 830000), 30000);
  assert.equal(reconcile(resumed, 860000).status, 'complete');
  assert.equal(pauseTimer(timer, 121000).status, 'complete');
});

test('the exam display hides hours below one hour while preserving ceiling-rounded seconds', () => {
  assert.equal(formatExamTime(3600000), '01:00:00');
  assert.equal(formatExamTime(3599000), '59:59');
  assert.equal(formatExamTime(1001), '00:02');
  assert.equal(formatExamTime(0), '00:00');
  assert.equal(formatExamTime(-1000), '00:00');
  assert.equal(formatExamTime(86400000), '24:00:00');
});

test('exam reminders follow the saved threshold, survive pause and suspension, and can be disabled', () => {
  const timer = createTimer('exam', defaults, 1000);
  assert.equal(examTone(null), 'normal');
  assert.equal(examTone(timer, 300001), 'normal');
  assert.equal(examTone(timer, 300000), 'warning');
  assert.equal(examTone(timer, 60000), 'warning');
  assert.equal(examTone(reconcile(timer, 3601000)), 'complete');
  assert.equal(examTone(pauseTimer(timer, 3361000)), 'warning');
  assert.equal(examTone(readState({ version: 1, timer, preferences: defaults }, 3361000).timer, 240000), 'warning');
  timer.config.examWarningMinutes = 10;
  assert.equal(examTone(timer, 600000), 'warning');
  timer.config.examReminder = false;
  assert.equal(examTone(timer, 60000), 'normal');
  assert.equal(examTone(reconcile(timer, 3601000)), 'normal');
  assert.equal(examTone(createTimer('pomodoro', defaults), 60000), 'normal');
});

test('exam timers opt out of the top bar by default; saved explicit choices and Pomodoro remain visible', () => {
  const exam = createTimer('exam', defaults, 1000);
  assert.equal(timerInBar(exam), false); assert.equal(timerInBar(null), false);
  assert.equal(timerInBar(createTimer('pomodoro', defaults, 1000)), true);
  const saved = { version: 1, timer: exam, preferences: defaults };
  assert.equal(timerInBar(readState(saved, 1000).timer), false);
  saved.timer.config = { ...exam.config, examInBar: true };
  assert.equal(timerInBar(readState(saved, 1000).timer), true);
  saved.timer.config.examInBar = 'true';
  assert.equal(timerInBar(readState(saved, 1000).timer), false);
});

test('Pomodoro top-bar visibility defaults on for older saved sessions and preserves an explicit opt-out', () => {
  const timer = createTimer('pomodoro', defaults, 1000);
  delete timer.config.pomodoroInBar;
  const saved = { version: 1, timer, preferences: {} };
  assert.equal(readState(saved, 1000).preferences.pomodoroInBar, true);
  assert.equal(timerInBar(readState(saved, 1000).timer), true);
  saved.timer.config.pomodoroInBar = false;
  saved.preferences.pomodoroInBar = false;
  assert.equal(timerInBar(readState(saved, 1000).timer), false);
  assert.equal(readState(saved, 1000).preferences.pomodoroInBar, false);
  saved.timer.config.pomodoroInBar = 'false';
  assert.equal(timerInBar(readState(saved, 1000).timer), true);
});

test('Pomodoro waits at completion rather than skipping elapsed phases', () => {
  const timer = createTimer('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 2 }, 1000);
  const complete = reconcile(timer, 999999);
  assert.equal(complete.phase, 'focus'); assert.equal(complete.round, 1);
  const rest = nextPhase(complete, 1000000);
  assert.equal(rest.phase, 'break'); assert.equal(rest.deadline, 1120000); assert.equal(rest.round, 1);
  const focus = nextPhase(reconcile(rest, 1120000), 1300000);
  assert.equal(focus.phase, 'focus'); assert.equal(focus.round, 2);
  assert.equal(nextPhase(focus, 1300100), focus);
});

test('every fourth Pomodoro round uses the saved long break and the next cycle returns to short breaks', () => {
  let now = 1000, timer = createTimer('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 2, longBreakMinutes: 20 }, now);
  for (let round = 1; round <= 8; round++) {
    assert.equal(timer.phase, 'focus'); assert.equal(timer.round, round);
    now = timer.deadline;
    timer = nextPhase(reconcile(timer, now), now);
    assert.equal(timer.phase, 'break'); assert.equal(timer.round, round);
    assert.equal(timer.duration, (round % 4 === 0 ? 20 : 2) * 60000);
    now = timer.deadline;
    timer = nextPhase(reconcile(timer, now), now);
  }
  assert.equal(timer.round, 9); assert.equal(timer.phase, 'focus');
});

test('older Pomodoro sessions keep their current deadline and restore a valid long-break default', () => {
  const timer = createTimer('pomodoro', defaults, 1000, 'break', 4);
  timer.duration = timer.remaining = 300000; timer.deadline = 301000;
  delete timer.config.longBreakMinutes;
  for (const longBreakMinutes of [undefined, -1, 0, 61, '20']) {
    const restored = readState({ version: 1, timer, preferences: { longBreakMinutes } }, 1000);
    assert.equal(restored.preferences.longBreakMinutes, 15);
    assert.equal(restored.timer.config.longBreakMinutes, 15);
    assert.equal(restored.timer.duration, 300000); assert.equal(restored.timer.deadline, 301000);
  }
});

test('saved state restores elapsed and paused timers and rejects corrupt state', () => {
  const running = createTimer('exam', defaults, 1000);
  const saved = { version: 1, timer: running, preferences: defaults, sound: { source: 'brown', volume: 25, playing: true, owner: 'other' } };
  assert.equal(remaining(readState(JSON.stringify(saved), 301000).timer, 301000), 3300000);
  assert.equal(readState(saved, 4000000).timer.status, 'complete');
  saved.timer = pauseTimer(running, 2000);
  assert.equal(readState(saved, 4000000).timer.status, 'paused');
  for (const patch of [{ status: 'nonsense' }, { duration: Infinity }, { remaining: -1 }, { deadline: 999999999, status: 'running' }, { kind: 'bogus' }, { phase: 'focus' }]) {
    assert.equal(readState({ ...saved, timer: { ...running, ...patch } }, 1000).timer, null);
  }
  assert.equal(readState('{broken').timer, null);
  assert.equal(readState({ version: 2 }).timer, null);
});

test('formatted rules treat executable and pasted HTML as plain text', () => {
  const html = rulesMarkup('# Rules\n- Show **your work**\n- <img src=x onerror=alert(1)>\n\nGood luck.');
  assert.match(html, /<h2>Rules<\/h2><ul><li>Show <strong>your work<\/strong><\/li>/);
  assert.ok(!html.includes('<img')); assert.match(html, /&lt;img/);
  assert.match(html, /<\/ul><p>Good luck\.<\/p>/);
  assert.equal(formatTime(1001), '00:02'); assert.equal(formatTime(3600000), '1:00:00');
});

function fakeAudio(nativeOutput = false) {
  const contexts = [], sources = [], oscillators = [], gains = [], media = [];
  class AudioContext extends EventTarget {
    constructor() { super(); this.sampleRate = 8000; this.currentTime = 0; this.state = 'suspended'; this.destination = {}; contexts.push(this); }
    createGain() { const node = { gain: { value: 0, setTargetAtTime(value) { this.value = value; }, setValueAtTime(value) { this.value = value; }, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connections: [], connect(target) { this.connections.push(target); }, disconnect() {} }; gains.push(node); return node; }
    createBuffer(channels, length, sampleRate = this.sampleRate) { const data = Array.from({ length: channels }, () => new Float32Array(length)); return { length, sampleRate, numberOfChannels: channels, getChannelData: channel => data[channel] }; }
    createBufferSource() { const source = { stopped: false, connect() {}, disconnect() {}, start() {}, stop() { this.stopped = true; } }; sources.push(source); return source; }
    createBiquadFilter() { return { frequency: { value: 0 }, connect() {}, disconnect() {} }; }
    createOscillator() { const oscillator = { frequency: { value: 0 }, stopTimes: [], connect() {}, disconnect() { this.disconnected = true; }, start(time) { this.startTime = time; }, stop(time) { this.stopTimes.push(time); } }; oscillators.push(oscillator); return oscillator; }
    resume() { this.state = 'running'; this.dispatchEvent(new Event('statechange')); return Promise.resolve(); }
    suspend() { this.state = 'suspended'; this.dispatchEvent(new Event('statechange')); return Promise.resolve(); }
  }
  const result = { AudioContext, contexts, sources, oscillators, gains, media };
  if (nativeOutput) AudioContext.prototype.createMediaStreamDestination = function() { this.mediaDestination = { stream: {} }; return this.mediaDestination; };
  {
    result.Audio = class extends EventTarget {
      constructor() { super(); this.paused = true; this.playCalls = 0; media.push(this); }
      play() { this.playCalls++; this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
      removeAttribute(name) { delete this[name]; }
      load() {}
    };
  }
  return result;
}

function environment(saved = null, wake = null, nativeOutput = false) {
  const browser = new EventTarget(), document = new EventTarget(), timers = new Map(), delays = new Map();
  document.hidden = false;
  let value = saved, count = 0;
  Object.assign(browser, fakeAudio(nativeOutput), { document, navigator: wake ? { wakeLock: wake } : {}, isSecureContext: true, crypto: { randomUUID: () => `tab-${Math.random()}` },
    localStorage: { getItem: () => value, setItem: (key, data) => { assert.equal(key, STORAGE_KEY); value = data; } },
    setTimeout: (callback, delay) => { const id = ++count; timers.set(id, callback); delays.set(id, delay); return id; }, clearTimeout: id => { timers.delete(id); delays.delete(id); }, timers, delays, saved: () => value });
  return browser;
}

test('task and automatic choices restore safely and can change live without moving the deadline', t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = environment(), service = createGadgetService(browser);
  assert.equal(readPreferences({ autoStartBreaks: 'true', autoStartFocus: 1 }).autoStartBreaks, false);
  assert.equal(readPreferences({ autoStartFocus: 1 }).autoStartFocus, false);
  assert.equal(readPreferences({ pomodoroTask: 123 }).pomodoroTask, '');
  assert.equal(readPreferences({ pomodoroTask: 'a\nb\tc' }).pomodoroTask, 'a b c');
  service.start('pomodoro', defaults); const deadline = service.getState().timer.deadline;
  service.pomodoroTask('Read the chain rule'); service.pomodoroTransitions({ autoStartBreaks: true });
  assert.equal(service.getState().timer.deadline, deadline);
  assert.equal(service.getState().timer.config.pomodoroTask, 'Read the chain rule');
  assert.equal(service.getState().timer.config.autoStartBreaks, true);
  assert.equal(service.getState().timer.config.autoStartFocus, false);
  const restored = readState(browser.saved());
  assert.equal(restored.preferences.pomodoroTask, 'Read the chain rule');
  assert.equal(restored.timer.config.autoStartBreaks, true);
  service.pomodoroTask('x'.repeat(200)); assert.equal(service.getState().timer.config.pomodoroTask.length, 100);
  service.pomodoroTask(''); assert.equal(service.getState().preferences.pomodoroTask, '');
  service.start('exam', service.getState().preferences); const exam = service.getState().timer;
  service.pomodoroTask('Next task'); service.pomodoroTransitions({ autoStartFocus: true });
  assert.equal(exam.config.pomodoroTask, ''); assert.equal(exam.config.autoStartFocus, false);
});

test('only fully completed focus phases count once, including after a reload', t => {
  let now = new Date(2026, 9, 23, 10).getTime(); t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 1 });
  now = service.getState().timer.deadline; service.refresh(); service.refresh();
  assert.deepEqual(dailyFocus(service.getState().focusLog), { sessions: 1, milliseconds: 60000 });
  service.next(); now = service.getState().timer.deadline; service.refresh();
  assert.equal(dailyFocus(service.getState().focusLog).sessions, 1);
  service.next(); now = service.getState().timer.deadline; service.refresh();
  assert.deepEqual(dailyFocus(service.getState().focusLog), { sessions: 2, milliseconds: 120000 });
  const restored = createGadgetService(environment(browser.saved())); restored.refresh();
  assert.deepEqual(dailyFocus(restored.getState().focusLog), { sessions: 2, milliseconds: 120000 });
});

test('skips, partial restarts, stopped sessions, paused time and exams do not inflate focus totals', t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const service = createGadgetService(environment());
  service.start('pomodoro', { ...defaults, focusMinutes: 1 });
  now += 10000; service.restart(); now += 10000; service.skip(); service.stop();
  service.start('pomodoro', { ...defaults, focusMinutes: 1 });
  now += 10000; service.pause(); now += 3600000; service.refresh();
  assert.equal(dailyFocus(service.getState().focusLog).sessions, 0);
  service.stop(); service.start('exam', { ...defaults, examMinutes: 1 });
  now = service.getState().timer.deadline; service.refresh(); service.stop();
  assert.equal(service.getState().focusLog.length, 0);
  service.start('pomodoro', { ...defaults, focusMinutes: 1 });
  now = service.getState().timer.deadline; service.stop();
  assert.deepEqual(dailyFocus(service.getState().focusLog), { sessions: 1, milliseconds: 60000 });
});

test('a focus phase that ends while closed is recorded on its actual local finishing date without auto-starting on return', t => {
  let now = new Date(2026, 9, 23, 23, 59, 30).getTime(); t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, autoStartBreaks: true });
  const completedAt = service.getState().timer.deadline, saved = browser.saved();
  now = new Date(2026, 9, 25, 9).getTime();
  const reopened = createGadgetService(environment(saved));
  assert.equal(reopened.getState().timer.status, 'complete');
  assert.equal(reopened.getState().timer.phase, 'focus');
  assert.equal(reopened.getState().focusLog[0].completedAt, completedAt);
  assert.equal(localDay(completedAt), localDay(new Date(2026, 9, 24, 0, 0, 30).getTime()));
  assert.deepEqual(dailyFocus(reopened.getState().focusLog), { sessions: 0, milliseconds: 0 });
  assert.deepEqual(dailyFocus(reopened.getState().focusLog, completedAt), { sessions: 1, milliseconds: 60000 });
  const legacy = { ...reopened.getState(), focusLog: [], timer: { ...reopened.getState().timer } };
  delete legacy.timer.completedAt; delete legacy.timer.completionRecorded;
  assert.equal(createGadgetService(environment(JSON.stringify(legacy))).getState().focusLog.length, 0);
});

test('automatic break and focus starts are independent choices', t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const service = createGadgetService(environment());
  service.start('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 1, autoStartBreaks: true });
  now = service.getState().timer.deadline; service.refresh();
  assert.equal(service.getState().timer.phase, 'break'); assert.equal(service.getState().timer.status, 'running');
  now = service.getState().timer.deadline; service.refresh();
  assert.equal(service.getState().timer.phase, 'break'); assert.equal(service.getState().timer.status, 'complete');
  service.pomodoroTransitions({ autoStartBreaks: false, autoStartFocus: true });
  service.next(); service.skip();
  now = service.getState().timer.deadline; service.refresh();
  assert.equal(service.getState().timer.phase, 'focus'); assert.equal(service.getState().timer.status, 'running');
  now = service.getState().timer.deadline; service.refresh();
  assert.equal(service.getState().timer.phase, 'focus'); assert.equal(service.getState().timer.status, 'complete');
  assert.equal(dailyFocus(service.getState().focusLog).sessions, 2);
});

test('automatic cycles keep the fourth long break, task, distinct phase IDs and one scheduler', t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser), ids = new Set();
  service.start('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 1, longBreakMinutes: 2, pomodoroTask: 'Practice derivatives', autoStartBreaks: true, autoStartFocus: true });
  for (let phase = 0; phase < 7; phase++) {
    ids.add(service.getState().timer.phaseId);
    now = service.getState().timer.deadline; service.refresh();
    assert.equal(browser.timers.size, 1); assert.equal(service.getState().timer.config.pomodoroTask, 'Practice derivatives');
  }
  assert.equal(ids.size, 7); assert.equal(service.getState().timer.phase, 'break');
  assert.equal(service.getState().timer.round, 4); assert.equal(service.getState().timer.duration, 120000);
  assert.deepEqual(dailyFocus(service.getState().focusLog), { sessions: 4, milliseconds: 240000 });
  now = service.getState().timer.deadline; service.refresh();
  assert.equal(service.getState().timer.round, 5); assert.equal(service.getState().timer.phase, 'focus');
});

test('automatic transitions wait for the scheduled chime and can be canceled during that wait', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true, autoStartBreaks: true }); await Promise.resolve();
  const notes = browser.oscillators.slice();
  now = service.getState().timer.deadline; browser.contexts[0].currentTime = 60; service.refresh();
  assert.equal(service.getState().timer.status, 'complete'); assert.equal(service.getState().autoTransition, true);
  assert.ok(notes.every(note => note.stopTimes.length === 1 && !note.disconnected));
  assert.deepEqual([...browser.delays.values()], [2500]);
  for (const note of notes) note.onended();
  now += 2500; browser.contexts[0].currentTime = 62.5; service.refresh(); await Promise.resolve();
  assert.equal(service.getState().timer.phase, 'break'); assert.equal(service.getState().timer.status, 'running');
  assert.ok(notes.every(note => note.stopTimes.length === 1));
  service.stop(); service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true, autoStartBreaks: true }); await Promise.resolve();
  now = service.getState().timer.deadline; browser.contexts[0].currentTime += 60; service.refresh();
  service.pomodoroTransitions({ autoStartBreaks: false }); now += 2500; service.refresh();
  assert.equal(service.getState().timer.status, 'complete'); assert.equal(service.getState().autoTransition, false);
  assert.equal(browser.timers.size, 0);
});

test('sleep, reopening and another tab cannot turn a missed deadline into automatic focus rounds', t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, autoStartBreaks: true, autoStartFocus: true });
  const second = createGadgetService(environment(browser.saved()));
  now = service.getState().timer.deadline;
  second.refresh(); assert.equal(second.getState().timer.status, 'complete');
  now += 6000; service.refresh();
  assert.equal(service.getState().timer.phase, 'focus'); assert.equal(service.getState().timer.status, 'complete');
  service.refresh(); assert.equal(service.getState().focusLog.length, 1);
});

test('daily records merge by phase ID across storage events and do not reappear after storage is cleared', t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1 }); now = service.getState().timer.deadline; service.refresh();
  const incoming = JSON.parse(browser.saved());
  incoming.focusLog.push({ id: 'another-completion', completedAt: now, duration: 120000 });
  incoming.focusLog.push(incoming.focusLog[0]);
  incoming.focusLog.push({ id: 'bad', completedAt: now, duration: -1 });
  const event = new Event('storage'); Object.assign(event, { key: STORAGE_KEY, newValue: JSON.stringify(incoming) }); browser.dispatchEvent(event);
  service.refresh(); assert.deepEqual(dailyFocus(service.getState().focusLog), { sessions: 2, milliseconds: 180000 });
  const cleared = new Event('storage'); Object.assign(cleared, { key: STORAGE_KEY, newValue: null }); browser.dispatchEvent(cleared);
  assert.equal(service.getState().focusLog.length, 0); assert.equal(service.getState().timer, null);
});

test('two tabs finishing together preserve the owner\'s next phase and record one completed focus', t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  for (const observerFirst of [false, true]) {
    let saved = null;
    const storage = { getItem: () => saved, setItem: (key, value) => { saved = value; } };
    const ownerBrowser = environment(); ownerBrowser.localStorage = storage;
    const ownerService = createGadgetService(ownerBrowser);
    ownerService.start('pomodoro', { ...defaults, focusMinutes: 1, autoStartBreaks: true });
    const observerBrowser = environment(); observerBrowser.localStorage = storage;
    const observer = createGadgetService(observerBrowser);
    now = ownerService.getState().timer.deadline;
    if (observerFirst) {
      observer.refresh();
      const event = new Event('storage'); Object.assign(event, { key: STORAGE_KEY, newValue: saved }); ownerBrowser.dispatchEvent(event);
    } else ownerService.refresh();
    observer.refresh();
    const restored = readState(saved);
    assert.equal(restored.timer.phase, 'break'); assert.equal(restored.timer.status, 'running');
    assert.equal(observer.getState().timer.phaseId, restored.timer.phaseId);
    assert.deepEqual(dailyFocus(restored.focusLog), { sessions: 1, milliseconds: 60000 });
  }
});

test('sleeping during the chime wait leaves the finished phase ready for a manual start', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true, autoStartBreaks: true }); await Promise.resolve();
  now = service.getState().timer.deadline; browser.contexts[0].currentTime = 60; service.refresh();
  assert.equal(service.getState().autoTransition, true);
  now += 60000; service.refresh();
  assert.equal(service.getState().timer.status, 'complete'); assert.equal(service.getState().autoTransition, false);
  assert.deepEqual(dailyFocus(service.getState().focusLog), { sessions: 1, milliseconds: 60000 });
});

test('restarting a long break preserves its round and active lengths without replacing newer preferences or ambient sound', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const timer = createTimer('pomodoro', { ...defaults, longBreakMinutes: 20 }, now, 'break', 4);
  const browser = environment(JSON.stringify({ version: 1, timer, preferences: defaults })), service = createGadgetService(browser);
  await service.playSound('brown', 25);
  service.preferences({ focusMinutes: 50, breakMinutes: 10 });
  now += 60000; service.pause(); service.restart();
  const restarted = service.getState();
  assert.equal(restarted.timer.phase, 'break'); assert.equal(restarted.timer.round, 4);
  assert.equal(restarted.timer.duration, 20 * 60000); assert.equal(restarted.timer.deadline, now + 20 * 60000);
  assert.equal(restarted.preferences.focusMinutes, 50); assert.equal(restarted.preferences.breakMinutes, 10);
  assert.equal(restarted.sound.playing, true); assert.equal(browser.timers.size, 1);
});

test('round and cycle restarts begin focus with active settings while preserving saved choices, sound and completed work', async t => {
  let now = 100000; t.mock.method(Date, 'now', () => now);
  for (const action of ['restartRound', 'restartCycle']) for (const phase of ['focus', 'break']) for (const status of ['running', 'paused', 'complete']) {
    const config = { ...defaults, focusMinutes: 30, breakMinutes: 7, longBreakMinutes: 20, pomodoroTask: 'Practice derivatives' };
    const timer = { ...createTimer('pomodoro', config, now, phase, 4), phaseId: `saved-${action}-${phase}-${status}` };
    const focusLog = [{ id: 'earlier-focus', completedAt: now - 60000, duration: 60000 }];
    const preferences = { ...defaults, focusMinutes: 50, breakMinutes: 10, pomodoroTask: 'Next task' };
    const browser = environment(JSON.stringify({ version: 1, timer, preferences, focusLog })), service = createGadgetService(browser);
    await service.playSound('brown', 25);
    const sound = service.getState().sound;
    now += 5000;
    if (status === 'paused') { service.pause(); now += 60000; }
    if (status === 'complete') now = timer.deadline;
    service[action]();
    const restarted = service.getState();
    assert.equal(restarted.timer.phase, 'focus');
    assert.equal(restarted.timer.round, action === 'restartRound' ? 4 : 1);
    assert.equal(restarted.timer.status, 'running');
    assert.equal(restarted.timer.duration, config.focusMinutes * 60000);
    assert.equal(restarted.timer.remaining, restarted.timer.duration);
    assert.equal(restarted.timer.deadline, now + restarted.timer.duration);
    assert.notEqual(restarted.timer.phaseId, timer.phaseId);
    assert.deepEqual(restarted.timer.config, config);
    assert.deepEqual(restarted.preferences, preferences);
    assert.deepEqual(restarted.sound, sound);
    const expectedLog = phase === 'focus' && status === 'complete' ? [...focusLog, { id: timer.phaseId, completedAt: timer.deadline, duration: timer.duration }] : focusLog;
    assert.deepEqual(restarted.focusLog, expectedLog);
    assert.deepEqual(readState(browser.saved()).focusLog, expectedLog);
    assert.equal(browser.timers.size, 1);
  }
});

test('round and cycle restarts replace the alarm and cancel a pending automatic transition with one clock', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  for (const action of ['restartRound', 'restartCycle']) {
    const browser = environment(), service = createGadgetService(browser);
    service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true, autoStartBreaks: true }); await Promise.resolve();
    for (let step = 0; step < 6; step++) { now += 1000; browser.contexts[0].currentTime++; service.skip(); }
    await Promise.resolve();
    const original = browser.oscillators.slice(-3);
    now += 10000; browser.contexts[0].currentTime += 10;
    service[action](); await Promise.resolve();
    assert.ok(original.every(note => note.disconnected));
    const replacement = browser.oscillators.slice(-3);
    assert.equal(replacement[0].startTime, browser.contexts[0].currentTime + 60);
    assert.equal(browser.timers.size, 1);
    now = service.getState().timer.deadline; browser.contexts[0].currentTime = replacement[0].startTime; service.refresh();
    assert.equal(service.getState().autoTransition, true);
    const completed = service.getState().timer, focusLog = service.getState().focusLog;
    service[action](); await Promise.resolve();
    assert.ok(replacement.every(note => note.disconnected));
    assert.equal(service.getState().autoTransition, false);
    assert.notEqual(service.getState().timer.phaseId, completed.phaseId);
    assert.deepEqual(service.getState().focusLog, focusLog);
    now += 2500; browser.contexts[0].currentTime += 2.5; service.refresh();
    assert.equal(service.getState().timer.phase, 'focus');
    assert.equal(service.getState().timer.status, 'running');
    assert.equal(browser.timers.size, 1);
  }
});

test('Pomodoro round and cycle restart commands leave exams and empty timers untouched', t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = environment(), service = createGadgetService(browser);
  for (const kind of [null, 'exam']) {
    if (kind) service.start(kind, defaults);
    const before = service.getState(), saved = browser.saved(), clock = [...browser.timers.keys()];
    let notifications = 0; const unsubscribe = service.subscribe(() => notifications++);
    service.restartRound(); service.restartCycle();
    assert.equal(service.getState().timer, before.timer);
    assert.deepEqual(service.getState(), before);
    assert.equal(browser.saved(), saved);
    assert.deepEqual([...browser.timers.keys()], clock);
    assert.equal(notifications, 1);
    unsubscribe();
  }
});

test('skipping advances exactly one phase without changing the independent sound or an exam timer', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('rain', 25);
  service.start('pomodoro', { ...defaults, longBreakMinutes: 20 });
  for (let step = 0; step < 7; step++) { now += 1000; service.skip(); }
  assert.equal(service.getState().timer.round, 4); assert.equal(service.getState().timer.phase, 'break');
  assert.equal(service.getState().timer.duration, 20 * 60000); assert.equal(service.getState().timer.deadline, now + 20 * 60000);
  assert.equal(service.getState().sound.playing, true); assert.equal(browser.timers.size, 1);
  service.pause(); now += 1000; service.skip();
  assert.equal(service.getState().timer.round, 5); assert.equal(service.getState().timer.phase, 'focus');
  assert.equal(service.getState().timer.status, 'running');
  service.start('exam', defaults); const exam = service.getState().timer; service.skip();
  assert.equal(service.getState().timer, exam);
  service.stop(); service.skip(); assert.equal(service.getState().timer, null);
});

test('selected completion sound persists without changing the deadline and rings only once at expiry', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('exam', { ...defaults, examMinutes: 1, chime: true }); const deadline = service.getState().timer.deadline;
  service.chimeSound('two-tone');
  await Promise.resolve();
  assert.equal(service.getState().timer.deadline, deadline);
  assert.equal(readState(browser.saved(), now).timer.config.chimeSound, 'two-tone');
  const completion = browser.oscillators.slice();
  assert.equal(completion.length, 4); assert.equal(completion[0].startTime, 60);
  await service.previewChime('bell'); now = deadline; browser.contexts[0].currentTime = 60; service.refresh(); await Promise.resolve();
  assert.equal(service.getState().timer.status, 'complete');
  assert.deepEqual(completion.slice(-2).map(note => note.frequency.value), [523.25, 783.99]);
  service.stopChimePreview(); assert.ok(completion.every(note => note.stopTimes.length === 1));
  const count = browser.oscillators.length; service.refresh(); await Promise.resolve(); assert.equal(browser.oscillators.length, count);
  service.chimeSound('unrecognized'); assert.equal(service.getState().preferences.chimeSound, 'soft');
});

test('exam and Pomodoro alarms are scheduled before tab hiding and never replay on return', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  for (const kind of ['exam', 'pomodoro']) {
    const browser = environment(), service = createGadgetService(browser);
    service.start(kind, { ...defaults, examMinutes: 1, focusMinutes: 1, chime: true, chimeSound: 'two-tone' });
    await Promise.resolve();
    const deadline = service.getState().timer.deadline, completion = browser.oscillators.slice();
    assert.equal(completion.length, 4); assert.equal(completion[0].startTime, 60);
    browser.document.hidden = true; browser.document.dispatchEvent(new Event('visibilitychange'));
    assert.deepEqual([...browser.delays.values()], [60000]);
    // The native audio clock advances while no JS timer callback is delivered.
    now = deadline; browser.contexts[0].currentTime = 60;
    assert.equal(service.getState().timer.status, 'running');
    assert.ok(completion.some(note => note.startTime <= 60 && note.stopTimes[0] > 60 && !note.disconnected));
    browser.document.hidden = false; browser.document.dispatchEvent(new Event('visibilitychange'));
    service.refresh(); await Promise.resolve();
    assert.equal(service.getState().timer.status, 'complete');
    assert.equal(browser.oscillators.length, 4);
    assert.ok(completion.every(note => note.stopTimes.length === 1));
  }
});

test('both timers keep native playback active while hidden and leave no player running after cancellation', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  for (const kind of ['exam', 'pomodoro']) {
    const browser = environment(null, null, true), service = createGadgetService(browser);
    service.start(kind, { ...defaults, examMinutes: 1, focusMinutes: 1, chime: true });
    await new Promise(resolve => setImmediate(resolve));
    const context = browser.contexts[0], media = browser.media[0], notes = browser.oscillators.slice();
    browser.document.hidden = true; browser.document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(media.paused, false); assert.equal(notes[0].startTime, 60);
    now = service.getState().timer.deadline; context.currentTime = 60;
    [...browser.timers.values()][0]();
    assert.equal(service.getState().timer.status, 'complete'); assert.equal(media.paused, false);
    for (const note of notes) note.onended();
    assert.equal(media.paused, true); assert.equal(context.state, 'suspended');
    browser.document.hidden = false; browser.document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(browser.oscillators.length, notes.length); assert.equal(media.paused, true);
    service.start(kind, { ...defaults, chime: true }); await new Promise(resolve => setImmediate(resolve));
    service.pause(); assert.equal(media.paused, true);
    service.resume(); await new Promise(resolve => setImmediate(resolve)); service.stop();
    assert.equal(media.paused, true); assert.equal(context.state, 'suspended');
  }
});

test('a canceled native playback request cannot report a failure or revive a stopped alarm', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = fakeAudio(true), player = createAudioPlayer(browser);
  await player.scheduleChime(61000); player.cancelCompletion(); player.rest();
  let reject;
  browser.media[0].play = function() { this.paused = false; return new Promise((resolve, failed) => { reject = failed; }); };
  const scheduled = player.scheduleChime(61000);
  player.cancelCompletion(); player.rest(); reject(new Error('play() interrupted by pause()'));
  assert.equal(await scheduled, false); assert.equal(browser.media[0].paused, true);
  assert.equal(browser.contexts[0].state, 'suspended'); assert.equal(browser.oscillators.length, 3);
});

test('denied native playback reports the failure and releases the alarm instead of claiming it is armed', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = environment(null, null, true), service = createGadgetService(browser);
  browser.Audio.prototype.play = function() { return Promise.reject(new Error('Browser blocked native playback')); };
  service.start('exam', { ...defaults, chime: true }); await new Promise(resolve => setImmediate(resolve));
  assert.match(service.getState().message, /blocked native playback/);
  assert.equal(browser.media[0].paused, true); assert.equal(browser.contexts[0].state, 'suspended');
  assert.equal(browser.oscillators.length, 0);
});

test('unsupported media streams retain ordinary audio playback without leaking a stream', async () => {
  const browser = fakeAudio(true), player = createAudioPlayer(browser); let stopped = false;
  browser.Audio = class { set srcObject(value) { throw new Error('MediaStream output unavailable'); } };
  browser.AudioContext.prototype.createMediaStreamDestination = () => ({ stream: { getTracks: () => [{ stop() { stopped = true; } }] } });
  await player.chime('bell');
  assert.equal(stopped, true);
  assert.ok(browser.gains.every(node => node.connections.includes(browser.contexts[0].destination)));
  assert.equal(player.state, 'running'); player.silenceChime(); player.rest();
  assert.equal(player.state, 'suspended');
});

test('pause, stop, restart, and chime settings cancel or replace only the future completion sound', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true }); await Promise.resolve();
  const original = browser.oscillators.slice(); now = 11000; browser.contexts[0].currentTime = 10;
  service.pause(); assert.ok(original.every(note => note.disconnected)); assert.equal(browser.contexts[0].state, 'suspended');
  now = 21000; service.resume(); await Promise.resolve();
  const resumed = browser.oscillators.slice(-3); assert.equal(resumed[0].startTime, 60);
  service.chime(false); assert.ok(resumed.every(note => note.disconnected));
  service.chime(true); await Promise.resolve(); const enabled = browser.oscillators.slice(-3);
  service.chimeSound('bell'); await Promise.resolve(); assert.ok(enabled.every(note => note.disconnected));
  const changed = browser.oscillators.slice(-3); assert.equal(changed[0].frequency.value, 392); assert.equal(changed[0].startTime, 60);
  now = 22000; browser.contexts[0].currentTime = 11; service.restart(); await Promise.resolve();
  assert.ok(changed.every(note => note.disconnected)); assert.equal(browser.oscillators.at(-3).startTime, 71);
  const count = browser.oscillators.length; service.stop(); assert.ok(browser.oscillators.slice(-3).every(note => note.disconnected));
  service.start('exam', { ...defaults, examMinutes: 1, chime: true }); service.stop(); await Promise.resolve();
  assert.equal(browser.oscillators.length, count); assert.equal(browser.contexts[0].state, 'suspended');
});

test('completion scheduling compensates for asynchronous audio resume and skips an already missed deadline', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = fakeAudio(), player = createAudioPlayer(browser);
  const pending = player.scheduleChime(61000, 'two-tone'); now = 6000; browser.contexts[0].currentTime = 3;
  assert.equal(await pending, true); assert.equal(browser.oscillators[0].startTime, 58);
  player.cancelCompletion(); player.rest();
  const count = browser.oscillators.length, expired = player.scheduleChime(61000);
  now = 62000; assert.equal(await expired, false); assert.equal(browser.oscillators.length, count); assert.equal(player.state, 'suspended');
});

test('each deliberate Pomodoro phase arms its own deadline and a reopened document stays silent', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 1, chime: true }); await Promise.resolve();
  const focus = browser.oscillators.slice(); now = 61000; browser.contexts[0].currentTime = 60;
  service.refresh(); service.next(); await Promise.resolve();
  assert.equal(service.getState().timer.phase, 'break'); assert.ok(focus.every(note => note.disconnected));
  assert.equal(browser.oscillators.at(-3).startTime, 120);
  const reopened = environment(browser.saved()), restored = createGadgetService(reopened);
  assert.equal(restored.getState().timer.phase, 'break'); assert.equal(reopened.contexts.length, 0);
  now = 121000; browser.contexts[0].currentTime = 120; service.refresh(); service.next(); await Promise.resolve();
  assert.equal(service.getState().timer.phase, 'focus'); assert.equal(browser.oscillators.at(-3).startTime, 180);
});

test('a browser audio interruption re-arms against wall time before expiry and never rings late after expiry', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('exam', { ...defaults, examMinutes: 1, chime: true }); await Promise.resolve();
  const original = browser.oscillators.slice();
  browser.document.hidden = true; browser.document.dispatchEvent(new Event('visibilitychange'));
  now = 21000; browser.contexts[0].currentTime = 20; browser.contexts[0].state = 'interrupted'; browser.contexts[0].dispatchEvent(new Event('statechange'));
  assert.ok(original.every(note => note.disconnected));
  now = 41000; browser.document.hidden = false; browser.document.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  const restored = browser.oscillators.slice(-3); assert.equal(restored[0].startTime, 40);
  browser.document.hidden = true; browser.document.dispatchEvent(new Event('visibilitychange'));
  browser.contexts[0].state = 'interrupted'; browser.contexts[0].dispatchEvent(new Event('statechange'));
  const count = browser.oscillators.length; now = 90000;
  browser.document.hidden = false; browser.document.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(service.getState().timer.status, 'complete'); assert.equal(browser.oscillators.length, count);
  assert.ok(restored.every(note => note.disconnected));
});

test('a stalled audio clock and a delayed JS wake-up discard a missed alarm instead of replaying it', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true }); await Promise.resolve();
  const completion = browser.oscillators.slice(); browser.contexts[0].currentTime = 10; now = 90000;
  service.refresh(); await Promise.resolve();
  assert.equal(service.getState().timer.status, 'complete'); assert.ok(completion.every(note => note.disconnected));
  assert.equal(browser.oscillators.length, completion.length); assert.equal(browser.contexts[0].state, 'suspended');
});

test('storage takeover and leaving the document cancel a future alarm without restoring stale audio', async t => {
  let now = 1000; t.mock.method(Date, 'now', () => now);
  const browser = environment(), service = createGadgetService(browser);
  service.start('exam', { ...defaults, examMinutes: 1, chime: true }); await Promise.resolve();
  const original = browser.oscillators.slice(), external = JSON.parse(browser.saved()); external.timer.alarmOwner = 'another-tab';
  const storage = new Event('storage'); Object.assign(storage, { key: STORAGE_KEY, newValue: JSON.stringify(external) }); browser.dispatchEvent(storage);
  assert.ok(original.every(note => note.disconnected));
  service.start('pomodoro', { ...defaults, focusMinutes: 1, chime: true }); await Promise.resolve();
  const local = browser.oscillators.slice(-3); browser.dispatchEvent(new Event('pagehide'));
  assert.ok(local.every(note => note.disconnected)); assert.equal(browser.timers.size, 0);
  now = 90000; browser.dispatchEvent(new Event('pageshow')); await Promise.resolve();
  assert.equal(service.getState().timer.status, 'complete'); assert.equal(browser.oscillators.length, original.length + local.length);
});

test('a live reminder change is validated and restored without resetting the exam deadline', () => {
  const browser = environment(), service = createGadgetService(browser);
  service.start('exam', defaults); const deadline = service.getState().timer.deadline;
  service.examReminder(true, 10);
  const restored = readState(browser.saved());
  assert.equal(restored.preferences.examWarningMinutes, 10);
  assert.equal(restored.timer.config.examWarningMinutes, 10);
  assert.equal(service.getState().timer.deadline, deadline);
  service.examReminder(false, -1);
  assert.equal(service.getState().timer.config.examWarningMinutes, 5);
  assert.equal(service.getState().timer.config.examReminder, false);
  assert.equal(browser.timers.size, 1);
});

test('changing exam top-bar visibility persists and notifies without restarting, pausing, or scheduling extra clocks', () => {
  const browser = environment(), service = createGadgetService(browser);
  service.start('exam', defaults); const before = { ...service.getState().timer }; let calls = 0;
  service.subscribe(() => calls++); service.examInBar(true);
  assert.equal(calls, 2); assert.equal(timerInBar(service.getState().timer), true);
  assert.equal(service.getState().timer.deadline, before.deadline);
  assert.equal(service.getState().timer.status, before.status); assert.equal(browser.timers.size, 1);
  assert.equal(timerInBar(readState(browser.saved()).timer), true);
  service.examInBar(false); assert.equal(timerInBar(service.getState().timer), false);
  service.stop(); service.start('exam', service.getState().preferences);
  assert.equal(timerInBar(service.getState().timer), false);
  service.stop(); service.start('pomodoro', defaults); service.examInBar(false);
  assert.equal(timerInBar(service.getState().timer), true);
});

test('changing Pomodoro top-bar visibility leaves the timer, its next phase, and independent sound running', async () => {
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('brown', 25);
  service.start('pomodoro', defaults);
  const before = { ...service.getState().timer }; let calls = 0;
  service.subscribe(() => calls++); service.pomodoroInBar(false);
  assert.equal(calls, 2); assert.equal(timerInBar(service.getState().timer), false);
  assert.equal(service.getState().timer.deadline, before.deadline);
  assert.equal(service.getState().timer.status, 'running'); assert.equal(browser.timers.size, 1);
  assert.equal(service.getState().sound.playing, true);
  assert.equal(timerInBar(readState(browser.saved()).timer), false);
  const completed = reconcile(service.getState().timer, before.deadline);
  assert.equal(timerInBar(nextPhase(completed, before.deadline)), false);
  service.stop(); service.start('pomodoro', service.getState().preferences);
  assert.equal(timerInBar(service.getState().timer), false);
  service.pomodoroInBar(true); assert.equal(timerInBar(service.getState().timer), true);
  service.stop(); service.start('exam', { ...defaults, examInBar: true }); service.pomodoroInBar(false);
  assert.equal(timerInBar(service.getState().timer), true);
});

test('inactive gadgets do not schedule ticks or create audio; reloading sound stays paused', async () => {
  const browser = environment(), service = createGadgetService(browser);
  assert.equal(browser.timers.size, 0); assert.equal(browser.contexts.length, 0);
  await service.playSound('brown', 25);
  assert.equal(service.getState().sound.playing, true);
  const reopened = environment(browser.saved()), restored = createGadgetService(reopened);
  assert.equal(restored.getState().sound.playing, false); assert.equal(restored.getState().sound.elsewhere, false);
  assert.equal(reopened.contexts.length, 0); assert.equal(reopened.timers.size, 0);
});

test('timer controls leave independent sound playing, and storage takeover silences the previous tab', async () => {
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('soft', 30); service.start('pomodoro', defaults);
  assert.equal(browser.timers.size, 1);
  service.pause(); assert.equal(browser.timers.size, 0); assert.equal(service.getState().sound.playing, true);
  service.resume(); assert.equal(browser.timers.size, 1); service.stop(); assert.equal(browser.timers.size, 0); assert.equal(browser.media[0].paused, false);
  assert.equal(browser.contexts.length, 0);
  const external = JSON.parse(browser.saved()); external.sound.owner = 'another-tab';
  const event = new Event('storage'); Object.assign(event, { key: STORAGE_KEY, newValue: JSON.stringify(external) }); browser.dispatchEvent(event);
  assert.equal(browser.media[0].paused, true); assert.equal(service.getState().sound.playing, false);
  assert.equal(service.getState().sound.elsewhere, true);
  service.stopSound(); assert.equal(service.getState().sound, null);
});

test('wake locks release on pause or hidden pages and a late request cannot keep an ended session awake', async () => {
  const locks = []; let resolve;
  const wake = { request: () => new Promise(done => { resolve = done; }) };
  const browser = environment(null, wake), service = createGadgetService(browser);
  service.start('exam', { ...defaults, awake: true }); service.pause();
  const sentinel = new EventTarget(); sentinel.released = false; sentinel.release = async () => { sentinel.released = true; sentinel.dispatchEvent(new Event('release')); }; locks.push(sentinel); resolve(sentinel);
  await Promise.resolve(); await Promise.resolve(); assert.equal(sentinel.released, true); assert.equal(service.getState().wakeStatus, 'off');
  wake.request = async () => { const lock = new EventTarget(); lock.released = false; lock.release = async () => { lock.released = true; lock.dispatchEvent(new Event('release')); }; locks.push(lock); return lock; };
  service.resume(); await Promise.resolve(); assert.equal(service.getState().wakeStatus, 'active');
  browser.document.hidden = true; browser.document.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(locks.at(-1).released, true); assert.equal(browser.timers.size, 1);
  assert.ok([...browser.delays.values()][0] > 1000);
  browser.document.hidden = false; browser.document.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(service.getState().wakeStatus, 'active'); service.stop(); await Promise.resolve(); assert.equal(locks.at(-1).released, true);
});

test('denied storage and screen awake do not prevent a usable timer', async () => {
  const browser = environment(null, { request: async () => { throw new Error('denied'); } });
  browser.localStorage.setItem = () => { throw new Error('blocked'); };
  const service = createGadgetService(browser); service.start('exam', { ...defaults, awake: true }); await Promise.resolve();
  assert.equal(service.getState().timer.status, 'running'); assert.equal(service.getState().wakeStatus, 'denied'); assert.match(service.getState().message, /could not save/);
});

test('all ambient choices restore safely and top-bar visibility defaults on for older preferences', () => {
  for (const source of Object.keys(sounds)) {
    const saved = { version: 1, preferences: { source }, sound: { source, volume: 40, playing: true } };
    assert.equal(readState(saved).preferences.source, source);
    assert.equal(readState(saved).sound.source, source);
    assert.equal(readState(saved).preferences.soundInBar, true);
    saved.preferences.soundInBar = false;
    assert.equal(readState(saved).preferences.soundInBar, false);
  }
  assert.equal(readState({ version: 1, sound: { source: '__proto__' }, preferences: { source: '__proto__' } }).sound, null);
  assert.equal(readState({ version: 1, preferences: { source: 'unknown', soundInBar: 'false' } }).preferences.source, 'brown');
  assert.equal(readState({ version: 1, preferences: { soundInBar: 'false' } }).preferences.soundInBar, true);
});

test('all ambient choices use a lazy native file player without audio contexts, fetches, or sample processing', async () => {
  const browser = fakeAudio(true), player = createAudioPlayer(browser);
  browser.fetch = () => { throw new Error('Use native streaming, not a JavaScript download'); };
  assert.equal(browser.media.length, 0); assert.equal(browser.contexts.length, 0);
  for (const kind of Object.keys(sounds)) {
    assert.equal(await player.play(kind, 50), true);
    assert.equal(browser.media.length, 1); assert.equal(browser.contexts.length, 0);
    const media = browser.media[0];
    assert.ok(media.src.endsWith('/' + sounds[kind].file));
    assert.equal(media.loop, true); assert.equal(media.preload, 'none');
    assert.equal(media.paused, false); assert.equal(media.volume, .16);
  }
  assert.equal(browser.sources.length, 0); assert.equal(browser.gains.length, 0);
  player.pause(); assert.equal(browser.media[0].paused, true);
  await player.play('soft', 20); assert.equal(browser.media.length, 1);
  player.stop(); assert.equal(browser.media[0].src, undefined);
});

test('native ambient pause and source switching cancel pending play without reviving or pausing the newer sound', async () => {
  const browser = fakeAudio(), player = createAudioPlayer(browser);
  await player.play('brown', 25);
  let resolve, reject;
  browser.media[0].play = function() { this.paused = false; return new Promise((yes, no) => { resolve = yes; reject = no; }); };
  const paused = player.play('rain', 25); player.pause(); resolve();
  assert.equal(await paused, false); assert.equal(browser.media[0].paused, true);
  const old = player.play('river', 25), rejectOld = reject;
  const current = player.play('wind', 40); resolve();
  assert.equal(await current, true); rejectOld(new Error('Superseded'));
  assert.equal(await old, false); assert.equal(browser.media[0].paused, false);
  assert.ok(browser.media[0].src.endsWith('/wind.mp3'));
});

test('failed native playback is recoverable and does not leave an active player', async () => {
  const browser = fakeAudio(), player = createAudioPlayer(browser);
  await player.play('rain', 25);
  browser.media[0].play = () => Promise.reject(new Error('Playback blocked'));
  await assert.rejects(player.play('river', 25), /Playback blocked/);
  assert.equal(browser.media[0].paused, true);
  delete browser.media[0].play;
  assert.equal(await player.play('river', 25), true);
  assert.equal(browser.contexts.length, 0);
});

test('native ambient playback and timer alerts have independent lifecycles', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = fakeAudio(true), player = createAudioPlayer(browser);
  await player.play('brown', 25); const ambient = browser.media[0];
  await player.scheduleChime(61000, 'two-tone');
  const context = browser.contexts[0], output = browser.media[1], completion = browser.oscillators.slice();
  assert.equal(output.srcObject, context.mediaDestination.stream);
  assert.ok(browser.gains.every(node => node.connections.includes(context.mediaDestination)));
  await player.chime('bell'); const preview = browser.oscillators.slice(-3);
  player.silenceChime(); player.pause();
  assert.equal(ambient.paused, true); assert.equal(output.paused, false);
  assert.ok(completion.every(note => !note.disconnected));
  assert.ok(preview.every(note => note.disconnected));
  await player.play('rain', 30);
  for (const note of completion) note.onended();
  assert.equal(output.paused, true); assert.equal(context.state, 'suspended');
  assert.equal(ambient.paused, false);
  player.stop(); assert.equal(ambient.paused, true);
});

test('stopping or interrupting the timer audio clock leaves ambient playback alone', async () => {
  const browser = environment(null, null, true), service = createGadgetService(browser);
  await service.playSound('brown', 25);
  service.start('exam', { ...defaults, chime: true }); await new Promise(resolve => setImmediate(resolve));
  browser.contexts[0].state = 'interrupted'; browser.contexts[0].dispatchEvent(new Event('statechange'));
  assert.equal(service.getState().sound.playing, true); assert.equal(browser.media[0].paused, false);
  service.stop(); assert.equal(service.getState().sound.playing, true);
  service.pauseSound();
  service.start('exam', { ...defaults, chime: true }); await new Promise(resolve => setImmediate(resolve));
  assert.equal(browser.media[0].paused, true); assert.equal(service.getState().sound.playing, false);
});

test('native sound interruption pauses the saved session without cancelling the timer', async () => {
  const browser = environment(null, null, true), service = createGadgetService(browser);
  await service.playSound('brown', 25);
  service.start('pomodoro', { ...defaults, chime: true }); await new Promise(resolve => setImmediate(resolve));
  const deadline = service.getState().timer.deadline, alarm = browser.oscillators.slice();
  browser.media[0].pause();
  assert.equal(service.getState().sound.playing, false); assert.match(service.getState().message, /interrupted/);
  assert.equal(service.getState().timer.deadline, deadline);
  assert.ok(alarm.every(note => !note.disconnected));
  service.refresh(); assert.equal(service.getState().sound.playing, false);
  await service.playSound(); assert.equal(service.getState().sound.playing, true);
});

test('sound visibility preferences do not create audio work or alter playback or timer alerts', async () => {
  const browser = environment(null, null, true), service = createGadgetService(browser);
  await service.playSound('soft', 25);
  service.start('pomodoro', { ...defaults, chime: true }); await new Promise(resolve => setImmediate(resolve));
  const deadline = service.getState().timer.deadline, notes = browser.oscillators.slice();
  service.soundInBar(false);
  assert.equal(readState(browser.saved()).preferences.soundInBar, false);
  assert.equal(browser.media[0].paused, false); assert.equal(service.getState().timer.deadline, deadline);
  assert.ok(notes.every(note => !note.disconnected));
  assert.equal(browser.contexts.length, 1); assert.equal(browser.sources.length, 0);
});
