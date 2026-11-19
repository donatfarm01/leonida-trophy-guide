// Leonida Trophy Guide — the program that hands the guide in.
//
// The guide itself is plain static files under app/ (index.html, its ES
// modules, styles and data/trophies.json), served with app/ at the root and
// working with the network off. This program copies app/ and screenshots/
// from beside this file into /output and writes /output/dossier.json with
// buildDossier from the kit's vendored library, so the judge reads the
// screenshots and the source outline from one file.
//
// It runs on Node 22 with the standard library only, twice, and both runs
// must write the same bytes. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The whole app, exactly as it stands in the repository.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

// The maker's screenshots of the guide, first by name the cover.
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// The dossier the judge reads: the same library and the same options the
// scorer uses, so the file here is byte for byte the one it rebuilds.
writeFileSync(
  join(outputDir, "dossier.json"),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
