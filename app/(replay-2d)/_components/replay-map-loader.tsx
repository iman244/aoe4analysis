"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type ReplayMapComponent from "./replay-map";

// PixiJS needs the browser (canvas/WebGL), so skip server rendering.
const ReplayMap = dynamic(() => import("./replay-map"), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-zinc-500">Loading map…</p>,
});

export default function ReplayMapLoader(props: ComponentProps<typeof ReplayMapComponent>) {
  return <ReplayMap {...props} />;
}
