// Progress store: what the reader earned, their running counts for the
// trophies that track one, and their spoiler setting. Everything lives in
// localStorage under one key, and can be exported to a file and imported back.
const STORAGE_KEY = "leonida-trophy-guide-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      spoilers: parsed.spoilers === true,
    };
  } catch {
    return freshState();
  }
}

export function freshState() {
  return { earned: [], counts: {}, spoilers: false };
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isEarned(state, trophy) {
  return state.earned.includes(trophy.name);
}

export function setEarned(state, trophy, earned) {
  const names = new Set(state.earned);
  if (earned) names.add(trophy.name);
  else names.delete(trophy.name);
  state.earned = [...names];
  saveState(state);
}

export function getCount(state, trophy) {
  if (trophy.count == null) return null;
  const value = state.counts[trophy.name];
  return typeof value === "number" && value >= 0 ? Math.min(value, trophy.count) : 0;
}

export function setCount(state, trophy, value) {
  if (trophy.count == null) return;
  const clamped = Math.max(0, Math.min(Math.round(value), trophy.count));
  state.counts[trophy.name] = clamped;
  saveState(state);
}

export function exportState(state) {
  return JSON.stringify(
    { app: "leonida-trophy-guide", version: 1, earned: state.earned, counts: state.counts, spoilers: state.spoilers },
    null,
    2,
  );
}

export function importState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") throw new Error("not a progress file");
  const state = freshState();
  if (Array.isArray(parsed.earned)) state.earned = parsed.earned.filter((n) => typeof n === "string");
  if (parsed.counts && typeof parsed.counts === "object") {
    for (const [name, value] of Object.entries(parsed.counts)) {
      if (typeof value === "number" && value >= 0) state.counts[name] = Math.floor(value);
    }
  }
  if (parsed.spoilers === true) state.spoilers = true;
  saveState(state);
  return state;
}
