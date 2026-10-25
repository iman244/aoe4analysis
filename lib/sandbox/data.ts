// Game summaries and icons on disk (data/), read on the server.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { buildGame, isSupported } from "./build-game";
import { layoutGame } from "./placement";
import { parseQueueCommands } from "./replay";
import type { StatIcons } from "./types";

const dataDir = path.join(process.cwd(), "data");
const summaryDir = path.join(dataDir, "summaries");
// gzipped replays, same name as the summary: data/replays/253816913.gz
const replayDir = path.join(dataDir, "replays");

/** ids of the game summaries we have, e.g. "253816913" from data/summaries/253816913.json */
export const listGameIds = () =>
  fs.readdirSync(summaryDir).filter((f) => /^\d+\.json$/.test(f)).map((f) => f.replace(/\.json$/, ""));

/** the board for one game, or null when we don't have it or it isn't a 1v1; built once per game */
export async function loadSandbox(gameId: string) {
  "use cache";
  const file = path.join(summaryDir, `${gameId}.json`);
  if (!/^\d+$/.test(gameId) || !fs.existsSync(file)) return null;
  const summary = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (!isSupported(summary)) return null;
  const replay = path.join(replayDir, `${gameId}.gz`);
  const commands = fs.existsSync(replay) ? parseQueueCommands(zlib.gunzipSync(fs.readFileSync(replay))) : [];
  const game = buildGame(summary, commands);
  return { game, layouts: layoutGame(game) };
}

// stat icons from game-icons.net (CC BY 3.0), inlined so they take the text colour
const ICON_FILES: [string, string][] = [
  ["hp", "heart-plus"], ["meleeArmor", "round-shield"], ["rangedArmor", "arrows-shield"],
  ["meleeAttack", "broadsword"], ["rangedAttack", "bow-arrow"],
  // bonus damage targets
  ["cavalry", "horse-head"], ["heavy", "visored-helm"], ["ranged", "bowman"], ["siege", "catapult"],
  ["light-infantry", "light-helm"], ["infantry", "swordman"], ["elephant", "elephant-head"],
  ["building", "castle"], ["ship", "galleon"],
];
export const loadStatIcons = (): StatIcons => Object.fromEntries(ICON_FILES.map(([k, name]) =>
  [k, fs.readFileSync(path.join(dataDir, "stat-icons", `${name}.svg`), "utf-8")]));
