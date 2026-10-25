// When each unit and tech was in production: the replay says when it was queued and in which building,
// the summary says when it came out. Server only (uses the reference data).
import { getMade } from "./reference";
import type { QueueCommand } from "./replay";
import type { Job } from "./types";

// production stalls at the population cap, so a unit can come out well after its training time
const STALL = 60;
// bonuses (Military Academy, civ perks) make things faster than the reference time
const FASTEST = 0.5;

type Pending = QueueCommand & { time: number };

/**
 * Plays each building's queue forward: an item starts when it's queued or when the one before it is done,
 * and ends at the first matching finish in the summary. Items with no finish were cancelled or never paid
 * for, and are dropped.
 */
export function productionJobs(civ: string, finished: Map<number, number[]>, commands: QueueCommand[],
  duration: number): Job[] {
  const queues = new Map<string, { free: number; items: Pending[] }>();
  for (const c of [...commands].sort((a, b) => a.t - b.t)) {
    const made = getMade(c.pbgid, civ);
    if (!made) continue;
    const q = queues.get(c.building) ?? { free: 0, items: [] };
    q.items.push({ ...c, time: made.time });
    queues.set(c.building, q);
  }
  const used = new Map<number, Set<number>>(); // pbgid -> indexes of finishes already taken
  const out: Job[] = [];
  for (;;) {
    // the item that can finish first, across all buildings, takes its finish first
    let next: { q: { free: number; items: Pending[] }; start: number } | null = null;
    for (const q of queues.values()) {
      if (!q.items.length) continue;
      const start = Math.max(q.items[0].t, q.free);
      if (!next || start + q.items[0].time < next.start + next.q.items[0].time) next = { q, start };
    }
    if (!next) break;
    const { q, start } = next;
    const item = q.items.shift()!;
    const times = finished.get(item.pbgid) ?? [];
    const taken = used.get(item.pbgid) ?? new Set<number>();
    const i = times.findIndex((f, j) => !taken.has(j)
      && f >= start + item.time * FASTEST - 1 && f <= start + item.time + STALL);
    let end: number;
    if (i >= 0) {
      taken.add(i);
      used.set(item.pbgid, taken);
      end = times[i];
    } else if (start + item.time > duration) {
      end = duration; // still in production when the game ended
    } else {
      continue;
    }
    q.free = end;
    const made = getMade(item.pbgid, civ)!;
    out.push({ id: made.baseId, cost: made.cost, q: item.t, s: start, e: end });
  }
  return out;
}
