// Reads the production commands from an (unzipped) AoE4 replay: every unit queued and tech researched,
// by whom, in which building. Layout follows aoe4world/replays-api docs/replayData.bt:
//   record   [u32 type (0 = tick, 1 = chat)][u32 length][payload]
//   tick     [u8 0x20][u32 tick][u32 hash][u32 blockCount] blocks...
//   block    [u32 host][u32][u32 size] commands...
//   command  [i16 size][u8 type][u8 flags][u16 count][14 bytes][u32 playerId] data...
// Queue (3) and research (16) data: [0x10][3-byte building id][2 bytes][u8 count][u32 pbgid]...

export type QueueCommand = {
  /** game seconds */
  t: number;
  playerId: number;
  /** the building doing the work, unique within the game */
  building: string;
  pbgid: number;
};

const TICKS_PER_SECOND = 8;
const QUEUE_UNIT = 3;
const RESEARCH = 16;
const COMMAND_HEADER = 24;
const BUILDING_TARGET = 0x10;

export function parseQueueCommands(bytes: Uint8Array): QueueCommand[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: QueueCommand[] = [];
  let offset = streamStart(bytes, view);

  while (offset + 8 <= bytes.length) {
    const type = view.getUint32(offset, true);
    const length = view.getUint32(offset + 4, true);
    const payload = offset + 8;
    offset = payload + length;
    if (type !== 0) continue;

    const t = view.getUint32(payload + 1, true) / TICKS_PER_SECOND;
    const blockCount = view.getUint32(payload + 9, true);
    let block = payload + 13;
    for (let b = 0; b < blockCount; b++) {
      const end = block + 12 + view.getUint32(block + 8, true);
      for (let c = block + 12; c < end; ) {
        const size = view.getInt16(c, true);
        if (size <= 0) break;
        const kind = view.getUint8(c + 2), data = c + COMMAND_HEADER;
        if ((kind === QUEUE_UNIT || kind === RESEARCH) && size >= COMMAND_HEADER + 11 && bytes[data] === BUILDING_TARGET) {
          const building = [1, 2, 3].map((i) => bytes[data + i].toString(16).padStart(2, "0")).join("");
          const cmd = { t, playerId: view.getUint32(c + 20, true), building, pbgid: view.getUint32(data + 7, true) };
          // a shift-click queues several at once
          for (let n = Math.max(1, bytes[data + 6]); n > 0; n--) out.push(cmd);
        }
        c += size;
      }
      block = end;
    }
  }
  return out;
}

// The tick stream starts right after the last header chunk, DATA GRIF.
function streamStart(bytes: Uint8Array, view: DataView) {
  const grif = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).indexOf("DATAGRIF");
  if (grif < 0) throw new Error("Replay has no DATAGRIF chunk");
  return grif + 20 + view.getUint32(grif + 12, true);
}
