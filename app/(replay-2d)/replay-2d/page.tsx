import type { Metadata } from "next";
import ReplayView from "../_components/replay-view";

export const metadata: Metadata = {
  title: "2D Replay",
};

export default function Replay2dPage() {
  return (
    <div className="flex h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <ReplayView />
    </div>
  );
}
