// Game summaries and icons on disk (data/), read on the server.
import fs from "node:fs";
import path from "node:path";
import { buildGame, isSupported } from "./build-game";
import { layoutGame } from "./placement";
import type { StatIcons } from "./types";

const dataDir = path.join(process.cwd(), "data");
const summaryDir = path.join(dataDir, "summaries");

/** ids of the game summaries we have, e.g. "253816913" from data/summaries/253816913.json */
export const listGameIds = () =>
  fs.readdirSync(summaryDir).filter((f) => /^\d+\.json$/.test(f)).map((f) => f.replace(/\.json$/, ""));

/** the board for one game, or null when we don't have it or it isn't a 1v1 */
export function loadSandbox(gameId: string) {
  const file = path.join(summaryDir, `${gameId}.json`);
  if (!/^\d+$/.test(gameId) || !fs.existsSync(file)) return null;
  const summary = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (!isSupported(summary)) return null;
  const game = buildGame(summary);
  return { game, layouts: layoutGame(game) };
}

// stat icons from game-icons.net (CC BY 3.0), inlined so they take the text colour
const ICON_FILES: [string, string][] = [
  ["hp", "heart-plus"], ["meleeArmor", "round-shield"], ["rangedArmor", "arrows-shield"],
  ["meleeAttack", "broadsword"], ["rangedAttack", "bow-arrow"],
  // bonus damage targets
  ["cavalry", "horse-head"], ["heavy", "visored-helm"], ["ranged", "bowman"], ["siege", "catapult"],
  ["light-infantry", "light-helm"], ["infantry", "swordman"], ["elephant", "elephant-head"],
  ["building", "castle"], ["ship", "galleon"], ["relic", "locked-chest"],
];
export const loadStatIcons = (): StatIcons => Object.fromEntries(ICON_FILES.map(([k, name]) =>
  [k, fs.readFileSync(path.join(dataDir, "stat-icons", `${name}.svg`), "utf-8")]));
