import assert from 'node:assert/strict';
import test from 'node:test';
import { defaults, createTimer, remaining, pauseTimer, resumeTimer, reconcile, nextPhase, readState, rulesMarkup, formatTime, formatExamTime, examTone, timerInBar, STORAGE_KEY } from '../assets/js/gadgets/model.mjs';
import { createAudioPlayer } from '../assets/js/gadgets/audio.mjs';
import { createGadgetService } from '../assets/js/gadgets/service.mjs';
import { sounds, noiseBuffer, seamlessLoop } from '../assets/js/gadgets/sounds.mjs';

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
  if (nativeOutput) {
    AudioContext.prototype.createMediaStreamDestination = function() { this.mediaDestination = { stream: {} }; return this.mediaDestination; };
    result.Audio = class extends EventTarget {
      constructor() { super(); this.paused = true; this.playCalls = 0; media.push(this); }
      play() { this.playCalls++; this.paused = false; return Promise.resolve(); }
      pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
    };
  }
  return result;
}

test('sound choices preview on one context without disturbing ambient playback, and cancel pending previews', async () => {
  const environment = fakeAudio(), player = createAudioPlayer(environment);
  await player.play('brown', 25); await player.chime('bell');
  assert.equal(environment.contexts.length, 1); assert.equal(environment.sources.length, 1); assert.equal(environment.sources[0].stopped, false);
  assert.deepEqual(environment.oscillators.map(note => note.frequency.value), [392, 784, 1177]);
  await player.chime('two-tone'); assert.ok(environment.oscillators.slice(0, 3).every(note => note.disconnected));
  assert.deepEqual(environment.oscillators.slice(-2).map(note => note.frequency.value), [523.25, 783.99]);
  const pending = player.chime('soft'); player.silenceChime(); assert.equal(await pending, false);
  assert.equal(environment.sources[0].stopped, false); assert.equal(player.state, 'running');
  player.stop(); assert.equal(player.state, 'suspended');
});

test('the sound player reuses one context, releases switched sources, and cancels a paused start', async () => {
  const environment = fakeAudio(), player = createAudioPlayer(environment);
  await player.play('brown', 25); await player.play('brown', 40);
  assert.equal(environment.contexts.length, 1); assert.equal(environment.sources.length, 1);
  await player.play('soft', 20);
  assert.equal(environment.sources[0].stopped, true); assert.equal(environment.sources.length, 2);
  const pending = player.play('brown', 25); player.pause(); assert.equal(await pending, false);
  assert.equal(player.state, 'suspended'); player.stop(); assert.equal(environment.sources.at(-1).stopped, true);
});

function environment(saved = null, wake = null, nativeOutput = false) {
  const browser = new EventTarget(), document = new EventTarget(), timers = new Map(), delays = new Map();
  document.hidden = false;
  let value = saved, count = 0;
  Object.assign(browser, fakeAudio(nativeOutput), { document, navigator: wake ? { wakeLock: wake } : {}, isSecureContext: true, crypto: { randomUUID: () => `tab-${Math.random()}` },
    localStorage: { getItem: () => value, setItem: (key, data) => { assert.equal(key, STORAGE_KEY); value = data; } },
    setTimeout: (callback, delay) => { const id = ++count; timers.set(id, callback); delays.set(id, delay); return id; }, clearTimeout: id => { timers.delete(id); delays.delete(id); }, timers, delays, saved: () => value });
  return browser;
}

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

test('the alarm and ambient audio use one native stream, without connecting the suspended default output', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = fakeAudio(true), player = createAudioPlayer(browser);
  const scheduled = player.scheduleChime(61000, 'two-tone');
  assert.equal(browser.media[0].playCalls, 1); // Native play starts before the action returns.
  assert.equal(await scheduled, true);
  const context = browser.contexts[0], media = browser.media[0], completion = browser.oscillators.slice();
  assert.equal(media.srcObject, context.mediaDestination.stream);
  assert.ok(browser.gains.every(node => node.connections.includes(context.mediaDestination)));
  assert.ok(browser.gains.every(node => !node.connections.includes(context.destination)));
  await player.play('brown', 25); await player.chime('bell');
  assert.equal(browser.contexts.length, 1); assert.equal(browser.media.length, 1);
  player.silenceChime(); player.pause(); assert.equal(media.paused, false);
  assert.ok(completion.every(note => !note.disconnected));
  for (const note of completion) note.onended();
  assert.equal(media.paused, true); assert.equal(context.state, 'suspended');
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

test('previews and ambient pause do not cancel an armed alarm or suspend its audio clock', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = fakeAudio(), player = createAudioPlayer(browser);
  await player.play('brown', 25); await player.scheduleChime(61000, 'two-tone');
  const completion = browser.oscillators.slice(); await player.chime('bell'); const preview = browser.oscillators.slice(-3);
  player.silenceChime(); player.rest();
  assert.ok(preview.every(note => note.disconnected)); assert.ok(completion.every(note => note.stopTimes.length === 1));
  player.pause(); assert.equal(browser.sources[0].stopped, true); assert.equal(player.state, 'running');
  assert.equal(browser.contexts.length, 1); assert.ok(completion.every(note => !note.disconnected));
  player.cancelCompletion(); player.rest(); assert.equal(player.state, 'suspended');
});

test('finished tones release their nodes and the audio clock rests only after the last active sound', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = fakeAudio(), player = createAudioPlayer(browser);
  await player.scheduleChime(61000, 'two-tone'); const completion = browser.oscillators.slice();
  await player.chime('bell'); const preview = browser.oscillators.slice(-3);
  for (const note of preview) note.onended();
  assert.ok(preview.every(note => note.disconnected)); assert.equal(player.state, 'running');
  for (const note of completion.slice(0, -1)) note.onended();
  assert.equal(player.state, 'running'); completion.at(-1).onended();
  assert.ok(completion.every(note => note.disconnected)); assert.equal(player.state, 'suspended');
  await player.play('brown', 25); await player.scheduleChime(61000);
  for (const note of browser.oscillators.slice(-3)) note.onended();
  assert.equal(player.state, 'running'); assert.equal(browser.sources[0].stopped, false);
  player.stop(); assert.equal(player.state, 'suspended');
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


test('a paused ambient source cannot restart when a timer arms its completion chime', async () => {
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('brown', 25); service.pauseSound();
  assert.equal(browser.sources[0].stopped, true);
  service.start('exam', { ...defaults, chime: true });
  assert.equal(browser.sources.length, 1); assert.equal(service.getState().sound.playing, false);
  service.pause(); assert.equal(browser.contexts[0].state, 'suspended');
});

test('browser audio interruption leaves ambient sound paused when a future timer re-arms', async () => {
  const browser = environment(), service = createGadgetService(browser);
  await service.playSound('brown', 25);
  service.start('exam', { ...defaults, chime: true }); await Promise.resolve();
  browser.contexts[0].state = 'interrupted'; browser.contexts[0].dispatchEvent(new Event('statechange'));
  assert.equal(service.getState().sound.playing, false); assert.match(service.getState().message, /interrupted/);
  assert.equal(browser.sources[0].stopped, true);
  browser.document.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(browser.sources.length, 1); assert.equal(service.getState().sound.playing, false);
  assert.equal(browser.contexts[0].state, 'running');
  await service.playSound(); assert.equal(service.getState().sound.playing, true); assert.equal(service.getState().message, '');
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

test('hiding ambient controls persists without touching playback, the active timer, or its alarm', async () => {
  const browser = environment(null, null, true), service = createGadgetService(browser);
  await service.playSound('brown', 25); service.start('pomodoro', { ...defaults, chime: true }); await Promise.resolve();
  const deadline = service.getState().timer.deadline, alarm = browser.oscillators.slice(), player = browser.media[0];
  service.soundInBar(false);
  assert.equal(readState(browser.saved()).preferences.soundInBar, false);
  assert.equal(service.getState().sound.playing, true); assert.equal(browser.sources[0].stopped, false);
  assert.equal(service.getState().timer.deadline, deadline); assert.equal(player.paused, false);
  assert.ok(alarm.every(note => !note.disconnected));
  service.restart(); await Promise.resolve();
  assert.equal(service.getState().preferences.soundInBar, false); assert.equal(browser.sources[0].stopped, false);
  service.soundInBar(true); assert.equal(readState(browser.saved()).preferences.soundInBar, true);
});

test('loop joins blend full opening audio at constant power and return directly into its continuation', () => {
  const browser = fakeAudio(), audio = new browser.AudioContext(), input = audio.createBuffer(2, 40, 10);
  input.getChannelData(0).set(Array.from({ length: 40 }, (_, i) => i / 100));
  input.getChannelData(1).fill(.25);
  const result = seamlessLoop(audio, input, 1), first = result.getChannelData(0), second = result.getChannelData(1);
  assert.equal(result.length, 30); assert.equal(result.numberOfChannels, 2);
  assert.equal(first[0], input.getChannelData(0)[10]);
  assert.equal(first[20], input.getChannelData(0)[30]);
  assert.equal(first[29], input.getChannelData(0)[9]);
  assert.ok(Math.abs(first[0] - first.at(-1) - .01) < 1e-7);
  assert.ok([...second].every(sample => sample >= .25));
  let value = 0; const noise = noiseBuffer(audio, 'soft', () => (value++ % 97) / 97);
  assert.equal(noise.length / noise.sampleRate, 58);
  assert.ok(noise.getChannelData(0).some(sample => Math.abs(sample) > .1));
});

function recordingBrowser(native = true) {
  const browser = fakeAudio(native), requests = [], decodes = [];
  browser.fetch = (url, options) => new Promise(resolve => requests.push({ url, signal: options.signal, resolve, mediaPlaying: browser.media[0]?.paused === false }));
  browser.AudioContext.prototype.decodeAudioData = function() { return new Promise(resolve => decodes.push({ resolve, audio: this })); };
  browser.requests = requests; browser.decodes = decodes;
  browser.download = async index => { requests[index].resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }); for (let i = 0; i < 5; i++) await Promise.resolve(); };
  browser.decode = index => { const { resolve, audio } = decodes[index]; const buffer = audio.createBuffer(1, audio.sampleRate * 12, audio.sampleRate); buffer.getChannelData(0).fill(.2); resolve(buffer); };
  return browser;
}

test('recordings load only after native playback begins, share the alarm output, and reuse only the last buffer', async t => {
  t.mock.method(Date, 'now', () => 1000);
  const browser = recordingBrowser(), player = createAudioPlayer(browser);
  assert.equal(browser.contexts.length, 0); assert.equal(browser.requests.length, 0);
  const started = player.play('rain', 25);
  assert.equal(browser.requests[0].mediaPlaying, true);
  assert.match(String(browser.requests[0].url), /\/assets\/audio\/ambient\/rain\.mp3$/);
  assert.equal(browser.sources.length, 0);
  await player.scheduleChime(61000); const alarm = browser.oscillators.slice();
  await browser.download(0); browser.decode(0); player.volume(60);
  assert.equal(await started, true); assert.equal(browser.sources.length, 1);
  assert.equal(browser.sources[0].buffer.length / browser.sources[0].buffer.sampleRate, 9);
  assert.ok(Math.abs(browser.gains[0].gain.value - .192) < 1e-7);
  assert.equal(browser.gains[0].connections[0], browser.contexts[0].mediaDestination);
  player.pause(); assert.equal(browser.media[0].paused, false); assert.ok(alarm.every(note => !note.disconnected));
  await player.play('rain', 25); assert.equal(browser.requests.length, 1);
  player.stop(); const restarted = player.play('rain', 25); assert.equal(browser.requests.length, 2);
  player.stop(); await browser.download(1); browser.decode(1); assert.equal(await restarted, false);
  player.cancelCompletion(); player.rest(); assert.equal(browser.media[0].paused, true);
});

test('paused or superseded downloads and late decoding never revive an old recording', async () => {
  const browser = recordingBrowser(), player = createAudioPlayer(browser);
  const rain = player.play('rain', 25); await browser.download(0);
  const river = player.play('river', 30); assert.equal(browser.requests[0].signal.aborted, true);
  browser.decode(0); assert.equal(await rain, false); assert.equal(browser.sources.length, 0);
  await browser.download(1); browser.decode(1); assert.equal(await river, true);
  const jungle = player.play('jungle', 25); await browser.download(2); player.pause();
  assert.equal(browser.requests[2].signal.aborted, true); browser.decode(2);
  assert.equal(await jungle, false); assert.equal(browser.sources.length, 1);
  assert.equal(browser.sources[0].stopped, true); assert.equal(browser.media[0].paused, true);
});

test('failed recording downloads report a recoverable error and release native playback', async () => {
  const browser = recordingBrowser(), player = createAudioPlayer(browser), started = player.play('wind', 25);
  browser.requests[0].resolve({ ok: false });
  await assert.rejects(started, /could not load/);
  assert.equal(browser.sources.length, 0); assert.equal(browser.media[0].paused, true); assert.equal(player.state, 'suspended');
});
