import Link from "next/link";
import { listGameIds, loadSandbox } from "@/lib/sandbox/data";

export default async function Home() {
  const games = (await Promise.all(listGameIds().map(async (id) => {
    const sandbox = await loadSandbox(id);
    return sandbox ? [{ id, game: sandbox.game }] : [];
  }))).flat();
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-xl font-semibold">Sandbox replays</h1>
      <ul className="mt-6 flex flex-col gap-2">
        {games.map(({ id, game }) => (
          <li key={id}>
            <Link href={`/sandbox/${id}`} className="block rounded-lg border px-4 py-3 hover:bg-muted">
              {game.players[0].name} ({game.players[0].civ}) vs {game.players[1].name} ({game.players[1].civ})
              <span className="text-muted-foreground"> · {game.map}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
