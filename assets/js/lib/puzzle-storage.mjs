const cookieName = 'ao_puzzles';
const games = ['hex', 'klotski', 'tiling'];
export const storageKey = game => `almost-obvious:puzzle:${game}:v1`;

// A small first-party cookie holds the preference; board histories stay on this device.
export function createPuzzleStorage(game, root, environment = globalThis) {
  const control = root.querySelector('[data-puzzle-remember]');
  if (!control) return { read: () => null, save() {}, setSnapshotProvider() {} };
  const document = environment.document;
  let provider = null, previous = null, enabled = true;
  function preference() {
    try { return document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1); }
    catch { return undefined; }
  }
  function writePreference(value) {
    enabled = value;
    try { document.cookie = `${cookieName}=${value ? '1' : '0'}; Max-Age=31536000; Path=/; SameSite=Lax${environment.location?.protocol === 'https:' ? '; Secure' : ''}`; } catch {}
  }
  const initial = preference();
  if (initial === undefined) writePreference(true);
  else enabled = initial !== '0';
  control.checked = enabled; control.disabled = false;
  function sync() {
    const value = preference();
    if (value !== undefined) enabled = value !== '0';
    control.checked = enabled;
    return enabled;
  }
  const storage = {
    read() {
      if (!sync()) return null;
      try { return JSON.parse(environment.localStorage.getItem(storageKey(game))); } catch { return null; }
    },
    save(value) {
      if (!sync()) return;
      try {
        const serialized = JSON.stringify(value);
        if (serialized === previous) return;
        environment.localStorage.setItem(storageKey(game), serialized);
        previous = serialized;
      } catch {}
    },
    setSnapshotProvider(callback) { provider = callback; },
  };
  control.addEventListener('change', () => {
    writePreference(control.checked); previous = null;
    if (!enabled) {
      for (const id of games) { try { environment.localStorage.removeItem(storageKey(id)); } catch {} }
    } else if (provider) storage.save(provider());
  });
  environment.addEventListener?.('focus', sync);
  environment.addEventListener?.('storage', () => { previous = null; sync(); });
  return storage;
}
