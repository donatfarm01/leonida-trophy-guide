// Loads the trophy list and holds the roadmap's six stages.
// The trophies themselves live in data/trophies.json: official names,
// descriptions and grades, plus this guide's own guides and sources.
export async function loadTrophies() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) throw new Error("could not load data/trophies.json");
  const doc = await response.json();
  return doc.trophies.slice().sort((a, b) => a.id - b.id);
}

export const KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
};

export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: "Story first",
    text: "Play Chapters 1–4 and the final mission, in order. The six named story missions and the five companions' final missions pop as you reach them, and the 8 stranger strands fill in along the way. Nothing here needs grinding — just the story.",
  },
  {
    stage: 2,
    title: "Activities sampler",
    text: "Try each of the 9 activity types once, then work the activity trophies: fishing against Cal, one arcade game, bowling at Kolt & Associates, a cocktail on Ocean Beach, and all 18 meditation spots. Start the long ones here — 250 stunts and the 42 shooting-range golds — so they build while you play.",
  },
  {
    stage: 3,
    title: "Explore and collect",
    text: "Cover the map: all 52 areas of Leonida, 100 vehicles discovered, 3 collectible card sets, WAiNK at 100 locations, all 8 garage properties bought, and 10 vehicles registered to the Scooter Bros app. One tour of the state serves most of these at once.",
  },
  {
    stage: 4,
    title: "Crime and chaos",
    text: "The robbery set: 5 bank vaults, an armored truck, a jewelry store undetected, one illegal operation for each of the 9 gangs, and the partner jobs — 3 shops back-to-back and losing a 4-star wanted level together. Plus the combat one-offs: 5 enemies in one Combat Focus, a melee drive-by, the Rhinos, the VCIA departure and the showroom smash.",
  },
  {
    stage: 5,
    title: "Money and choices",
    text: "Launder $250,000 of marked bills through your contacts, spend $100,000 across all shops, finish 50 challenges, and let the 500 choices count up. The vague trophies live here too: succeed on a second try, witness something strange, and build the partnership to its peak.",
  },
  {
    stage: 6,
    title: "Cleanup and platinum",
    text: "Check the stats screen for what is still short, finish the last counts, and reach 100% completion for the second gold. The moment the 54th trophy pops, “Vice Got a Price!” — the platinum — pops with it.",
  },
];
