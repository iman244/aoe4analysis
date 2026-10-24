// The single replay we pilot with, served from public/.
export const PILOT_REPLAY = { gameId: 253149768, url: "/replays/AgeIV_Replay_253149768.gz" };

// Downloads a gzipped replay and unzips it with the browser's built-in DecompressionStream.
export async function loadReplay(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Could not download replay (${res.status})`);
  const unzipped = res.body.pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(unzipped).arrayBuffer());
}
