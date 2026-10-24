// Reads the player commands that carry a map position from an (unzipped) AoE4 replay.
// Layout follows aoe4world/replays-api docs/replayData.bt:
//   record   [u32 type (0 = tick, 1 = chat)][u32 length][payload]
//   tick     [u8 0x20][u32 tick][u32 hash][u32 blockCount] blocks...
//   block    [u32 host][u32][u32 size] commands...
//   command  [i16 size][u8 type][u8 flags][u16 count][14 bytes][u32 playerId] data...
// Positions are floats in map units: x, height, y.

export type MapEventKind = "move" | "attackMove" | "build";

export type MapEvent = {
  tick: number;
  playerId: number;
  kind: MapEventKind;
  x: number;
  y: number;
  // Building type, for "build" events only.
  pbgid?: number;
};

const COMMAND_KIND: Record<number, MapEventKind> = { 62: "move", 71: "attackMove", 123: "build" };
const COMMAND_HEADER = 24;
const BUILD_PBGID = 31;
const BUILD_POSITION = 35;

export function parseMapEvents(bytes: Uint8Array): MapEvent[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const events: MapEvent[] = [];
  let offset = streamStart(bytes, view);

  while (offset + 8 <= bytes.length) {
    const type = view.getUint32(offset, true);
    const length = view.getUint32(offset + 4, true);
    const payload = offset + 8;
    offset = payload + length;
    if (type !== 0) continue;

    const tick = view.getUint32(payload + 1, true);
    const blockCount = view.getUint32(payload + 9, true);
    let block = payload + 13;
    for (let b = 0; b < blockCount; b++) {
      const end = block + 12 + view.getUint32(block + 8, true);
      for (let c = block + 12; c < end; ) {
        const size = view.getInt16(c, true);
        if (size <= 0) break;
        const kind = COMMAND_KIND[view.getUint8(c + 2)];
        const at = kind && positionOf(bytes, view, kind, c, size);
        if (at) {
          const event: MapEvent = { tick, playerId: view.getUint32(c + 20, true), kind, x: at.x, y: at.y };
          if (kind === "build") event.pbgid = view.getUint32(c + BUILD_PBGID, true);
          events.push(event);
        }
        c += size;
      }
      block = end;
    }
  }
  return events;
}

// The tick stream starts right after the last header chunk, DATA GRIF.
function streamStart(bytes: Uint8Array, view: DataView) {
  const grif = indexOf(bytes, "DATAGRIF");
  if (grif < 0) throw new Error("Replay has no DATAGRIF chunk");
  return grif + 20 + view.getUint32(grif + 12, true);
}

function positionOf(bytes: Uint8Array, view: DataView, kind: MapEventKind, start: number, size: number) {
  if (kind === "build") {
    // A placement stores its position twice in a row; other build commands have something else here.
    const at = start + BUILD_POSITION;
    if (size < BUILD_POSITION + 24) return null;
    const x = view.getFloat32(at, true);
    const y = view.getFloat32(at + 8, true);
    if (x !== view.getFloat32(at + 12, true) || y !== view.getFloat32(at + 20, true)) return null;
    // Leftover bytes can repeat too; they decode to values that are effectively zero.
    if (Math.abs(x) < 1e-3 && Math.abs(y) < 1e-3) return null;
    return { x, y };
  }
  // Move targets: [01 0d] (13 bytes follow) then [02] and the position. Targets on an entity have no position.
  for (let i = start + COMMAND_HEADER; i + 15 <= start + size; i++) {
    if (bytes[i] === 0x01 && bytes[i + 1] === 0x0d && bytes[i + 2] === 0x02) {
      return { x: view.getFloat32(i + 3, true), y: view.getFloat32(i + 11, true) };
    }
  }
  return null;
}

function indexOf(bytes: Uint8Array, text: string) {
  const first = text.charCodeAt(0);
  for (let i = bytes.indexOf(first); i >= 0; i = bytes.indexOf(first, i + 1)) {
    let match = true;
    for (let j = 1; j < text.length && match; j++) match = bytes[i + j] === text.charCodeAt(j);
    if (match) return i;
  }
  return -1;
}
