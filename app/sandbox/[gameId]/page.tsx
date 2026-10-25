import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SandboxReplay } from "@/components/sandbox/sandbox-replay";
import { listGameIds, loadSandbox, loadStatIcons } from "@/lib/sandbox/data";

export function generateStaticParams() {
  return listGameIds().map((gameId) => ({ gameId }));
}

export async function generateMetadata({ params }: PageProps<"/sandbox/[gameId]">): Promise<Metadata> {
  const { gameId } = await params;
  const players = loadSandbox(gameId)?.game.players;
  return { title: players ? `${players[0].name} vs ${players[1].name} · Sandbox replay` : "Sandbox replay" };
}

/** The board depends on the game id in the URL, so it sits behind a Suspense boundary. */
async function Sandbox({ params }: { params: PageProps<"/sandbox/[gameId]">["params"] }) {
  const { gameId } = await params;
  const sandbox = loadSandbox(gameId);
  if (!sandbox) notFound();
  return <SandboxReplay game={sandbox.game} layouts={sandbox.layouts} icons={loadStatIcons()} />;
}

export default function SandboxPage(props: PageProps<"/sandbox/[gameId]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#14120e] p-6 text-sm text-[#9d937c]">Loading game…</div>}>
      <Sandbox params={props.params} />
    </Suspense>
  );
}
