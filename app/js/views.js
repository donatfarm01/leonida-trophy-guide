// Renders the three views: the checklist with its detail pane, the roadmap
// and the missables list, plus the header progress card.
import { GRADE_ORDER, KIND_LABELS, ROADMAP_STAGES } from "./data.js";
import { getCount, isEarned, setCount, setEarned } from "./store.js";
import { applyFilters, displayDescription, displayName, isSpoiled } from "./filters.js";

function gradeTag(grade) {
  const span = document.createElement("span");
  span.className = `tag grade-${grade}`;
  span.textContent = grade;
  return span;
}

function kindTag(trophy) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  return span;
}

function missableTag() {
  const span = document.createElement("span");
  span.className = "tag missable";
  span.textContent = "Missable";
  return span;
}

export function renderProgress(trophies, state) {
  const earned = trophies.filter((t) => isEarned(state, t)).length;
  document.getElementById("earnedCount").textContent = String(earned);
  const fill = document.getElementById("progressFill");
  fill.style.width = `${(earned / trophies.length) * 100}%`;
  document.getElementById("progressBarWrap").setAttribute("aria-valuenow", String(earned));
  const byGrade = GRADE_ORDER.map(
    (grade) => `${trophies.filter((t) => t.grade === grade && isEarned(state, t)).length}/${trophies.filter((t) => t.grade === grade).length} ${grade}`,
  ).join(" · ");
  document.getElementById("gradeCounts").textContent = byGrade;
  const next = trophies
    .slice()
    .sort((a, b) => a.roadmap_stage - b.roadmap_stage || a.id - b.id)
    .find((t) => !isEarned(state, t));
  const nextUp = document.getElementById("nextUp");
  nextUp.replaceChildren();
  if (next) {
    nextUp.append("Next up: ");
    const strong = document.createElement("strong");
    strong.textContent = displayName(next, state);
    nextUp.append(strong);
    nextUp.append(` — stage ${next.roadmap_stage} of the roadmap.`);
  } else {
    nextUp.textContent = "Every trophy earned — Leonida Legend.";
  }
}

function buildTrophyItem(trophy, state, selectedName, onSelect) {
  const item = document.createElement("li");
  item.className = "trophy-item";
  if (isEarned(state, trophy)) item.classList.add("earned");
  if (trophy.name === selectedName) item.classList.add("selected");

  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = isEarned(state, trophy);
  box.setAttribute("aria-label", `Earned: ${displayName(trophy, state)}`);
  box.addEventListener("click", (event) => {
    event.stopPropagation();
    setEarned(state, trophy, box.checked);
    onSelect(trophy.name, true);
  });

  const main = document.createElement("div");
  main.className = "trophy-main";
  const name = document.createElement("div");
  name.className = "trophy-name";
  name.textContent = displayName(trophy, state);
  const desc = document.createElement("div");
  desc.className = "trophy-desc";
  desc.textContent = displayDescription(trophy, state);
  const tags = document.createElement("div");
  tags.className = "trophy-tags";
  tags.append(gradeTag(trophy.grade), kindTag(trophy));
  if (trophy.missable) tags.append(missableTag());
  if (trophy.count != null) {
    const countTag = document.createElement("span");
    countTag.className = "tag";
    countTag.textContent = `${getCount(state, trophy)} / ${trophy.count}`;
    tags.append(countTag);
  }
  main.append(name, desc, tags);
  item.append(box, main);
  item.addEventListener("click", () => onSelect(trophy.name, false));
  return item;
}

export function renderList(trophies, state, options, selectedName, onSelect) {
  const list = document.getElementById("trophyList");
  const shown = applyFilters(trophies, state, options);
  list.replaceChildren();
  const meta = document.getElementById("listMeta");
  if (shown.length === 0) {
    meta.textContent = "No trophies match these filters.";
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent =
      options.kind === "online"
        ? "This list has no online trophies — every one of the 55 is earned in the single-player game."
        : "Try clearing the search or choosing another kind or grade.";
    list.append(empty);
    return;
  }
  meta.textContent = `Showing ${shown.length} of ${trophies.length} trophies — ${shown.filter((t) => isEarned(state, t)).length} earned.`;
  for (const trophy of shown) {
    list.append(buildTrophyItem(trophy, state, selectedName, onSelect));
  }
}

export function renderDetail(trophies, state, selectedName, onStateChange) {
  const pane = document.getElementById("detailPane");
  const trophy = trophies.find((t) => t.name === selectedName) || trophies[0];
  if (!trophy) {
    pane.replaceChildren();
    return;
  }
  pane.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = displayName(trophy, state);
  pane.append(heading);

  const tags = document.createElement("div");
  tags.className = "trophy-tags";
  tags.append(gradeTag(trophy.grade), kindTag(trophy));
  if (trophy.missable) tags.append(missableTag());
  pane.append(tags);

  const descHeading = document.createElement("h3");
  descHeading.textContent = "Official description";
  const desc = document.createElement("p");
  desc.className = "official-desc";
  desc.textContent = `“${displayDescription(trophy, state)}”`;
  pane.append(descHeading, desc);

  if (trophy.missable) {
    const note = document.createElement("p");
    note.className = "missable-note";
    note.textContent =
      "Missable: tied to one story moment. Replay the mission from the pause menu where the game offers it, or it only comes again on a new playthrough.";
    pane.append(note);
  }

  if (isSpoiled(trophy, state)) {
    const hint = document.createElement("p");
    hint.textContent =
      "The guide stays hidden with the trophy — spoilers are on. Earn it, or turn spoilers off, to read the guide.";
    pane.append(hint);
    return;
  }

  const guideHeading = document.createElement("h3");
  guideHeading.textContent = "Guide";
  const guide = document.createElement("p");
  guide.className = "guide-text";
  guide.textContent = trophy.guide;
  pane.append(guideHeading, guide);

  if (trophy.count != null) {
    const countHeading = document.createElement("h3");
    countHeading.textContent = "Your count";
    const stepper = document.createElement("div");
    stepper.className = "count-stepper";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Decrease count");
    const output = document.createElement("output");
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase count");
    const paint = () => {
      output.textContent = `${getCount(state, trophy)} / ${trophy.count}`;
    };
    minus.addEventListener("click", () => {
      setCount(state, trophy, getCount(state, trophy) - 1);
      paint();
      onStateChange();
    });
    plus.addEventListener("click", () => {
      setCount(state, trophy, getCount(state, trophy) + 1);
      paint();
      onStateChange();
    });
    paint();
    stepper.append(minus, output, plus);
    pane.append(countHeading, stepper);
  }

  const stageHeading = document.createElement("h3");
  stageHeading.textContent = "Roadmap";
  const stage = document.createElement("p");
  const stageDef = ROADMAP_STAGES[trophy.roadmap_stage - 1];
  stage.textContent = `Stage ${trophy.roadmap_stage} — ${stageDef ? stageDef.title : ""}.`;
  pane.append(stageHeading, stage);

  const sourcesHeading = document.createElement("h3");
  sourcesHeading.textContent = "Sources";
  const sourcesList = document.createElement("ul");
  for (const source of trophy.sources || []) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.label;
    item.append(link);
    sourcesList.append(item);
  }
  const basis = document.createElement("li");
  basis.textContent =
    "Guide: our own words from the official description, not yet checked in the game — the game released 19 November 2026.";
  sourcesList.append(basis);
  pane.append(sourcesHeading, sourcesList);
}

export function renderRoadmap(trophies, state) {
  const list = document.getElementById("roadmapList");
  list.replaceChildren();
  for (const stageDef of ROADMAP_STAGES) {
    const stageTrophies = trophies.filter((t) => t.roadmap_stage === stageDef.stage);
    const done = stageTrophies.filter((t) => isEarned(state, t)).length;
    const item = document.createElement("li");
    item.className = "stage";
    const head = document.createElement("div");
    head.className = "stage-head";
    const num = document.createElement("span");
    num.className = "stage-num";
    num.textContent = String(stageDef.stage);
    const title = document.createElement("h2");
    title.textContent = stageDef.title;
    const progress = document.createElement("span");
    progress.className = "stage-progress";
    progress.textContent = `${done} / ${stageTrophies.length} earned`;
    head.append(num, title, progress);
    const text = document.createElement("p");
    text.textContent = stageDef.text;
    const chips = document.createElement("ul");
    chips.className = "stage-trophies";
    for (const trophy of stageTrophies) {
      const chip = document.createElement("li");
      if (isEarned(state, trophy)) chip.classList.add("done");
      chip.textContent = `${displayName(trophy, state)} (${trophy.grade})`;
      chips.append(chip);
    }
    item.append(head, text, chips);
    list.append(item);
  }
}

export function renderMissables(trophies, state, onSelect) {
  const list = document.getElementById("missableList");
  list.replaceChildren();
  document.getElementById("missableCount").textContent = String(trophies.filter((t) => t.missable).length);
  for (const trophy of trophies.filter((t) => t.missable)) {
    list.append(buildTrophyItem(trophy, state, null, (name) => onSelect(name)));
  }
}
