// Reads the metadata at the start of an (unzipped) AoE4 replay.
// Layout: 76-byte prefix with the date, then Relic Chunky blocks:
//   FOLD POST > DATA DATA   game length in ticks
//   DATA SDSC               map size, map name, biome
//   FOLD INFO > DATA DATA   players, then the map settings again with the map seed
// Field positions were worked out from one replay, so treat them as best guesses.

export const TICKS_PER_SECOND = 8;

export type ReplayPlayer = {
  name: string;
  civ: string;
  team: number;
  // Commands identify their sender by this id (1000 + slot).
  commandId: number;
  profileId: number;
  steamId: string;
};

export type ReplayHeader = {
  date: string;
  map: string;
  biome: string;
  mapWidth: number;
  mapHeight: number;
  mapSeed: number;
  ticks: number;
  players: ReplayPlayer[];
};

type Chunk = { kind: string; id: string; parent: string | null; start: number; length: number };

const CHUNKY_MAGIC = "Relic Chunky\r\n\x1a\0";

export function parseReplayHeader(bytes: Uint8Array): ReplayHeader {
  const r = new ByteReader(bytes);
  const chunks = readChunks(r);
  const find = (kind: string, id: string, parent: string | null) => {
    const chunk = chunks.find((c) => c.kind === kind && c.id === id && c.parent === parent);
    if (!chunk) throw new Error(`Replay has no ${kind}${id} chunk`);
    return chunk;
  };

  const post = find("DATA", "DATA", "POST");
  const sdsc = find("DATA", "SDSC", null);
  const info = find("DATA", "DATA", "INFO");

  // SDSC: [u32 width][u32 height][u8][u32 len]"map_size_416", then the map and biome names.
  const sizeName = r.nextAsciiString(sdsc.start, sdsc.start + sdsc.length);
  const map = r.nextAsciiString(sizeName.end, sdsc.start + sdsc.length);
  const biome = r.nextAsciiString(map.end, sdsc.start + sdsc.length);

  return {
    date: r.utf16z(12),
    map: map.value,
    biome: biome.value,
    mapWidth: r.u32(sizeName.lengthAt - 9),
    mapHeight: r.u32(sizeName.lengthAt - 5),
    mapSeed: readMapSeed(r, info, biome.value),
    ticks: r.u32(post.start),
    players: readPlayers(r, info.start, info.start + info.length),
  };
}

function readChunks(r: ByteReader): Chunk[] {
  const chunks: Chunk[] = [];
  const walk = (offset: number, end: number, parent: string | null): number => {
    while (offset < end) {
      if (r.ascii(offset, CHUNKY_MAGIC.length) === CHUNKY_MAGIC) {
        offset += CHUNKY_MAGIC.length + 8; // magic, version, platform
        continue;
      }
      const kind = r.ascii(offset, 4);
      if (kind !== "FOLD" && kind !== "DATA") return offset;
      const id = r.ascii(offset + 4, 4);
      const length = r.u32(offset + 12);
      const start = offset + 20 + r.u32(offset + 16);
      chunks.push({ kind, id, parent, start, length });
      if (kind === "FOLD") walk(start, start + length, id);
      offset = start + length;
    }
    return offset;
  };
  walk(r.indexOf(CHUNKY_MAGIC), r.length, null);
  return chunks;
}

// INFO repeats the map settings: ...[u32 len][biome][u32][u32][u32 seed][u32][u32 len][minimap].
function readMapSeed(r: ByteReader, info: Chunk, biome: string): number {
  let at = info.start;
  for (;;) {
    const found = r.nextAsciiString(at, info.start + info.length);
    if (found.value === biome) return r.u32(found.end + 8);
    at = found.end;
  }
}

// Each player: [u8 1][u32 len][UTF-16 name][u32 team][u32 slot][u8][u32 len][civ], then cosmetics of
// varying size, then [u32 17][UTF-16 Steam ID]. The profile ID sits 9 bytes before the Steam ID.
function readPlayers(r: ByteReader, start: number, end: number): ReplayPlayer[] {
  const count = r.u32(start + 10);
  const players: ReplayPlayer[] = [];
  let offset = start + 14;

  for (let i = 0; i < count; i++) {
    const found = findNameAndCiv(r, offset, end);
    if (!found) throw new Error(`Could not find player ${i + 1} of ${count}`);
    const steamAt = findSteamId(r, found.end, end);
    if (steamAt < 0) throw new Error(`Could not find Steam ID for ${found.name}`);

    players.push({
      name: found.name,
      civ: found.civ,
      team: found.team,
      commandId: 1000 + found.slot,
      profileId: r.u32(steamAt - 9),
      steamId: r.utf16(steamAt + 4, 17),
    });
    offset = steamAt + 4 + 17 * 2;
  }
  return players;
}

function findNameAndCiv(r: ByteReader, from: number, end: number) {
  for (let i = from; i < end - 5; i++) {
    if (r.u8(i) !== 1) continue;
    const nameLength = r.u32(i + 1);
    if (nameLength < 1 || nameLength > 32) continue;
    const nameAt = i + 5;
    if (!r.isPrintableUtf16(nameAt, nameLength)) continue;

    const nameEnd = nameAt + nameLength * 2;
    const civLengthAt = nameEnd + 9;
    const civLength = r.u32(civLengthAt);
    if (civLength < 3 || civLength > 32) continue;
    const civ = r.ascii(civLengthAt + 4, civLength);
    if (!/^[a-z_]+$/.test(civ)) continue;

    return {
      name: r.utf16(nameAt, nameLength),
      civ,
      team: r.u32(nameEnd),
      slot: r.u32(nameEnd + 4),
      end: civLengthAt + 4 + civLength,
    };
  }
  return null;
}

function findSteamId(r: ByteReader, from: number, end: number): number {
  for (let i = from; i < end - 4 - 34; i++) {
    if (r.u32(i) === 17 && /^\d{17}$/.test(r.utf16(i + 4, 17))) return i;
  }
  return -1;
}

class ByteReader {
  private bytes: Uint8Array;
  private view: DataView;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  get length() {
    return this.bytes.length;
  }

  u8(offset: number) {
    return this.view.getUint8(offset);
  }

  u32(offset: number) {
    return this.view.getUint32(offset, true);
  }

  ascii(offset: number, length: number) {
    return String.fromCharCode(...this.bytes.subarray(offset, offset + length));
  }

  utf16(offset: number, chars: number) {
    let s = "";
    for (let i = 0; i < chars; i++) s += String.fromCharCode(this.view.getUint16(offset + i * 2, true));
    return s;
  }

  // Reads a null-terminated UTF-16 string.
  utf16z(offset: number) {
    let s = "";
    for (let c = this.view.getUint16(offset, true); c !== 0; offset += 2, c = this.view.getUint16(offset, true)) {
      s += String.fromCharCode(c);
    }
    return s;
  }

  isPrintableUtf16(offset: number, chars: number) {
    for (let i = 0; i < chars; i++) if (this.view.getUint16(offset + i * 2, true) < 0x20) return false;
    return true;
  }

  indexOf(text: string) {
    const first = text.charCodeAt(0);
    for (let i = this.bytes.indexOf(first); i >= 0; i = this.bytes.indexOf(first, i + 1)) {
      if (this.ascii(i, text.length) === text) return i;
    }
    return -1;
  }

  // Finds the next [u32 length][printable ASCII] string at or after `from`.
  nextAsciiString(from: number, end: number) {
    for (let i = from; i < end - 4; i++) {
      const length = this.u32(i);
      if (length < 3 || length > 64 || i + 4 + length > end) continue;
      const value = this.ascii(i + 4, length);
      if (/^[\x21-\x7e]+$/.test(value)) return { value, lengthAt: i, end: i + 4 + length };
    }
    throw new Error("Expected a text field in the replay header");
  }
}
