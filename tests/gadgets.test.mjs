import assert from 'node:assert/strict';
import test from 'node:test';
import { defaults, createTimer, remaining, pauseTimer, resumeTimer, reconcile, nextPhase, readState, rulesMarkup, formatTime, formatExamTime, examTone, timerInBar, STORAGE_KEY } from '../assets/js/gadgets/model.mjs';
import { createAudioPlayer } from '../assets/js/gadgets/audio.mjs';
import { createGadgetService } from '../assets/js/gadgets/service.mjs';

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

function fakeAudio() {
  const contexts = [], sources = [];
  class AudioContext extends EventTarget {
    constructor() { super(); this.sampleRate = 8000; this.currentTime = 0; this.state = 'suspended'; this.destination = {}; contexts.push(this); }
    createGain() { return { gain: { value: 0, setTargetAtTime() {}, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
    createBuffer(_, length) { const data = new Float32Array(length); return { getChannelData: () => data }; }
    createBufferSource() { const source = { stopped: false, connect() {}, disconnect() {}, start() {}, stop() { this.stopped = true; } }; sources.push(source); return source; }
    createBiquadFilter() { return { frequency: { value: 0 }, connect() {}, disconnect() {} }; }
    resume() { this.state = 'running'; this.dispatchEvent(new Event('statechange')); return Promise.resolve(); }
    suspend() { this.state = 'suspended'; this.dispatchEvent(new Event('statechange')); return Promise.resolve(); }
  }
  return { AudioContext, contexts, sources };
}

test('the sound player reuses one context, releases switched sources, and cancels a paused start', async () => {
  const environment = fakeAudio(), player = createAudioPlayer(environment);
  await player.play('brown', 25); await player.play('brown', 40);
  assert.equal(environment.contexts.length, 1); assert.equal(environment.sources.length, 1);
  await player.play('soft', 20);
  assert.equal(environment.sources[0].stopped, true); assert.equal(environment.sources.length, 2);
  const pending = player.play('brown', 25); player.pause(); assert.equal(await pending, false);
  assert.equal(player.state, 'suspended'); player.stop(); assert.equal(environment.sources.at(-1).stopped, true);
});

function environment(saved = null, wake = null) {
  const browser = new EventTarget(), document = new EventTarget(), timers = new Map();
  document.hidden = false;
  let value = saved, count = 0;
  Object.assign(browser, fakeAudio(), { document, navigator: wake ? { wakeLock: wake } : {}, isSecureContext: true, crypto: { randomUUID: () => `tab-${Math.random()}` },
    localStorage: { getItem: () => value, setItem: (key, data) => { assert.equal(key, STORAGE_KEY); value = data; } },
    setTimeout: callback => { const id = ++count; timers.set(id, callback); return id; }, clearTimeout: id => timers.delete(id), timers, saved: () => value });
  return browser;
}

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
  service.resume(); assert.equal(browser.timers.size, 1); service.stop(); assert.equal(browser.timers.size, 0); assert.equal(browser.contexts[0].state, 'running');
  const external = JSON.parse(browser.saved()); external.sound.owner = 'another-tab';
  const event = new Event('storage'); Object.assign(event, { key: STORAGE_KEY, newValue: JSON.stringify(external) }); browser.dispatchEvent(event);
  assert.equal(browser.contexts[0].state, 'suspended'); assert.equal(service.getState().sound.playing, false);
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
  assert.equal(locks.at(-1).released, true); assert.equal(browser.timers.size, 0);
  browser.document.hidden = false; browser.document.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(service.getState().wakeStatus, 'active'); service.stop(); await Promise.resolve(); assert.equal(locks.at(-1).released, true);
});

test('denied storage and screen awake do not prevent a usable timer', async () => {
  const browser = environment(null, { request: async () => { throw new Error('denied'); } });
  browser.localStorage.setItem = () => { throw new Error('blocked'); };
  const service = createGadgetService(browser); service.start('exam', { ...defaults, awake: true }); await Promise.resolve();
  assert.equal(service.getState().timer.status, 'running'); assert.equal(service.getState().wakeStatus, 'denied'); assert.match(service.getState().message, /could not save/);
});


test('a paused ambient source cannot restart when a timer primes its completion chime', async () => {
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('brown', 25); service.pauseSound();
  assert.equal(browser.sources[0].stopped, true);
  service.start('exam', { ...defaults, chime: true });
  assert.equal(browser.sources.length, 1); assert.equal(service.getState().sound.playing, false);
  service.pause(); assert.equal(browser.contexts[0].state, 'suspended');
});

test('browser audio interruption reports paused state with an explicit resume action', async () => {
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('brown', 25);
  browser.contexts[0].state = 'interrupted'; browser.contexts[0].dispatchEvent(new Event('statechange'));
  assert.equal(service.getState().sound.playing, false); assert.match(service.getState().message, /interrupted/);
  await service.playSound(); assert.equal(service.getState().sound.playing, true); assert.equal(service.getState().message, '');
});
