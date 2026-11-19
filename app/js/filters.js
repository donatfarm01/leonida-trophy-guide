// Filtering and the spoiler rule: which trophies a view shows, and what a
// hidden story trophy looks like until it is earned.
export function applyFilters(trophies, state, options) {
  const query = (options.query || "").trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (options.kind === "story" && trophy.kind !== "story") return false;
    if (options.kind === "missable" && !trophy.missable) return false;
    if (options.kind === "collectibles" && trophy.kind !== "collectibles") return false;
    if (options.kind === "activities" && trophy.kind !== "activities") return false;
    if (options.kind === "online") return false;
    if (options.grade !== "all" && trophy.grade !== options.grade) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// A story trophy is spoiled when spoilers are on and it is not earned yet:
// its name and description stay hidden in the list and the detail pane.
export function isSpoiled(trophy, state) {
  return state.spoilers && trophy.kind === "story" && !state.earned.includes(trophy.name);
}

export function displayName(trophy, state) {
  return isSpoiled(trophy, state) ? "Hidden story trophy" : trophy.name;
}

export function displayDescription(trophy, state) {
  return isSpoiled(trophy, state)
    ? "A story trophy — its name and description stay hidden until you earn it. Turn spoilers off to see it."
    : trophy.description;
}
