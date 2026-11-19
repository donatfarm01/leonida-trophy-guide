// Boots the guide: loads the trophies, restores saved progress, wires the
// tabs, filters, spoiler setting and progress export/import, and re-renders
// every view whenever the state changes.
import { loadTrophies } from "./data.js";
import { exportState, importState, loadState, saveState } from "./store.js";
import { renderDetail, renderList, renderMissables, renderProgress, renderRoadmap } from "./views.js";

const state = loadState();
let trophies = [];
let selectedName = null;
let activeKind = "all";
let activeGrade = "all";

const searchInput = document.getElementById("search");
const gradeFilter = document.getElementById("gradeFilter");
const spoilerToggle = document.getElementById("spoilerToggle");
spoilerToggle.checked = state.spoilers;

function renderAll() {
  renderProgress(trophies, state);
  renderList(
    trophies,
    state,
    { kind: activeKind, grade: activeGrade, query: searchInput.value },
    selectedName,
    selectTrophy,
  );
  renderDetail(trophies, state, selectedName, renderAll);
  renderRoadmap(trophies, state);
  renderMissables(trophies, state, selectTrophy);
}

function selectTrophy(name, keepSelection) {
  selectedName = name;
  renderAll();
  if (!keepSelection) {
    document.getElementById("detailPane").scrollIntoView({ block: "nearest" });
  }
}

function switchView(view) {
  for (const button of document.querySelectorAll(".tab")) {
    button.classList.toggle("active", button.dataset.view === view);
  }
  for (const section of document.querySelectorAll(".view")) {
    section.classList.toggle("active", section.id === `view-${view}`);
  }
}

for (const button of document.querySelectorAll(".tab")) {
  button.addEventListener("click", () => switchView(button.dataset.view));
}

for (const chip of document.querySelectorAll("#kindChips .chip")) {
  chip.addEventListener("click", () => {
    for (const other of document.querySelectorAll("#kindChips .chip")) {
      other.classList.toggle("active", other === chip);
    }
    activeKind = chip.dataset.kind;
    renderAll();
  });
}

gradeFilter.addEventListener("change", () => {
  activeGrade = gradeFilter.value;
  renderAll();
});

searchInput.addEventListener("input", () => renderAll());

spoilerToggle.addEventListener("change", () => {
  state.spoilers = spoilerToggle.checked;
  saveState(state);
  renderAll();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([exportState(state)], { type: "application/json" }));
  link.download = "leonida-trophy-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById("importInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const next = importState(await file.text());
    state.earned = next.earned;
    state.counts = next.counts;
    state.spoilers = next.spoilers;
    spoilerToggle.checked = state.spoilers;
    renderAll();
  } catch {
    alert("That file is not a Leonida Trophy Guide progress export.");
  }
  event.target.value = "";
});

// Screenshot helper: a query string can pre-set the view, the spoiler
// setting and a filter, so the maker's screenshots show each part at work.
// It changes nothing for a normal reader opening index.html plain.
function applyScreenshotParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  if (view === "roadmap" || view === "missables") switchView(view);
  if (params.get("spoilers") === "on") {
    state.spoilers = true;
    spoilerToggle.checked = true;
  }
  const kind = params.get("kind");
  if (kind) {
    activeKind = kind;
    for (const chip of document.querySelectorAll("#kindChips .chip")) {
      chip.classList.toggle("active", chip.dataset.kind === kind);
    }
  }
  const select = params.get("select");
  if (select) selectedName = select;
}

try {
  trophies = await loadTrophies();
  selectedName = trophies[0].name;
  applyScreenshotParams();
  renderAll();
} catch (error) {
  document.getElementById("trophyList").innerHTML =
    '<li class="empty-state">The trophy list could not be loaded. Open this guide from its own files (app/ served as the site root) and try again.</li>';
  console.error(error);
}
