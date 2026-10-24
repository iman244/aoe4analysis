"use client";

import { Application, extend } from "@pixi/react";
import { Assets, Container, Graphics, Sprite, Text, TextStyle, type Texture } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildingInfo, type BuildingKind } from "../_lib/buildings";
import type { MapEvent } from "../_lib/replay-commands";

extend({ Container, Graphics, Sprite, Text });

const GRID_STEP = 16;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 20;
// Building tiles: size in map units, but never smaller than this many screen pixels, so icons stay readable.
const BUILDING_SIZE = 6;
const LANDMARK_SIZE = 10;
const MIN_TILE_PX = 22;
const MIN_LANDMARK_PX = 34;
const ICON_FILL = 0.9;
const tileSize = (kind: BuildingKind, zoom: number) =>
  kind === "landmark" ? Math.max(LANDMARK_SIZE, MIN_LANDMARK_PX / zoom) : Math.max(BUILDING_SIZE, MIN_TILE_PX / zoom);
// Tile fill shows the building type; the player is the outline around it.
const KIND_COLOR: Record<BuildingKind, number> = {
  landmark: 0x6b3fa0,
  military: 0x7a4a24,
  religious: 0x7d7d7d,
  economy: 0x2b6e6a,
  technology: 0x2b6e6a,
  defense: 0x3b4a5a,
  other: 0x1f1f1f,
};
const OUTLINE_PX = 1.5;
// Orders stay visible for this many ticks (20 s of game time), fading out.
const ORDER_TRAIL = 160;
// Tiles never overlap: same-type neighbours share one tile with a count below it, and any
// remaining overlaps are nudged apart.
// Space between tiles, counting the outline that sits outside each one.
const TILE_GAP_PX = 2 + 2 * OUTLINE_PX;
const COUNT_PX = 14;
const NUDGE_PASSES = 40;

const countStyle = new TextStyle({
  fontFamily: "Geist, sans-serif",
  fontSize: 11,
  fontWeight: "600",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 3, join: "round" },
});

// One tile on screen: a single building, or several of the same type and player. y is screen y.
type Tile = { key: number; playerId: number; type: string; kind: BuildingKind; icon: string | null; x: number; y: number; count: number };

// Same-type buildings of one player whose tiles would touch become one tile at their centre.
function groupBuildings(buildings: { key: number; playerId: number; pbgid: number; kind: BuildingKind; icon: string | null; x: number; y: number }[], zoom: number) {
  const gap = TILE_GAP_PX / zoom;
  const groups: { first: (typeof buildings)[number]; type: string; members: { x: number; y: number }[] }[] = [];
  for (const b of buildings) {
    const type = b.icon ?? String(b.pbgid);
    const reach = tileSize(b.kind, zoom) + gap;
    const near = groups.filter(
      (g) =>
        g.first.playerId === b.playerId &&
        g.type === type &&
        g.members.some((m) => Math.abs(m.x - b.x) < reach && Math.abs(m.y + b.y) < reach),
    );
    const into = near[0] ?? groups[groups.push({ first: b, type, members: [] }) - 1];
    // A new building can bridge two groups; fold the others into the first.
    for (const other of near.slice(1)) {
      into.members.push(...other.members);
      groups.splice(groups.indexOf(other), 1);
    }
    into.members.push({ x: b.x, y: -b.y });
  }
  return groups.map<Tile>(({ first, type, members }) => ({
    key: first.key,
    playerId: first.playerId,
    type,
    kind: first.kind,
    icon: first.icon,
    x: members.reduce((s, m) => s + m.x, 0) / members.length,
    y: members.reduce((s, m) => s + m.y, 0) / members.length,
    count: members.length,
  }));
}

// Push overlapping tiles apart along whichever axis needs the smaller move. Each tile's box
// includes the count below it.
function separateTiles(tiles: Tile[], zoom: number) {
  const gap = TILE_GAP_PX / zoom;
  const boxes = tiles.map((t) => {
    const s = tileSize(t.kind, zoom);
    const below = t.count > 1 ? COUNT_PX / zoom : 0;
    return { t, hw: (s + gap) / 2, hh: (s + below + gap) / 2, dy: below / 2 };
  });
  for (let pass = 0; pass < NUDGE_PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const dx = b.t.x - a.t.x;
        const dy = b.t.y + b.dy - (a.t.y + a.dy);
        const ox = a.hw + b.hw - Math.abs(dx);
        const oy = a.hh + b.hh - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        if (ox < oy) {
          const push = (dx < 0 ? -ox : ox) / 2;
          a.t.x -= push;
          b.t.x += push;
        } else {
          const push = (dy < 0 ? -oy : oy) / 2;
          a.t.y -= push;
          b.t.y += push;
        }
      }
    }
    if (!moved) break;
  }
  return tiles;
}

export type MapPlayer = { commandId: number; color: number };

type Props = { size: number; events: MapEvent[]; players: MapPlayer[]; tick: number };

// The map is drawn in game units, centred on (0, 0). Game y points up, screen y points down.
export default function ReplayMap({ size, events, players, tick }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<Container>(null);
  // Pixels per map unit. Kept in state so building tiles can keep a minimum size on screen.
  const [zoom, setZoom] = useState(1);
  const half = size / 2;

  const buildings = useMemo(
    () =>
      events.flatMap((e, i) => {
        if (e.kind !== "build" || e.pbgid === undefined || Math.abs(e.x) > half || Math.abs(e.y) > half) return [];
        return [{ ...e, pbgid: e.pbgid, key: i, ...buildingInfo(e.pbgid) }];
      }),
    [events, half],
  );

  // Icon textures, loaded once for the building types in this replay.
  const [icons, setIcons] = useState<Record<string, Texture>>({});
  useEffect(() => {
    const urls = [...new Set(buildings.flatMap((b) => (b.icon ? [b.icon] : [])))];
    let cancelled = false;
    Assets.load<Texture>(urls).then((loaded) => {
      if (cancelled) return;
      // Icons are 96 px and drawn much smaller; mipmaps keep them smooth when shrunk.
      for (const t of Object.values(loaded)) {
        t.source.autoGenerateMipmaps = true;
        t.source.updateMipmaps();
      }
      setIcons(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [buildings]);

  // Tiles at the current tick and zoom. Buildings are already in game order, so groups keep the oldest key.
  const tiles = useMemo(
    () => separateTiles(groupBuildings(buildings.filter((b) => b.tick <= tick), zoom), zoom),
    [buildings, tick, zoom],
  );

  const drawMap = useCallback(
    (g: Graphics) => {
      g.clear();
      g.rect(-half, -half, size, size).fill({ color: 0x5b6b3c });

      for (let v = -half + GRID_STEP; v < half; v += GRID_STEP) {
        g.moveTo(v, -half).lineTo(v, half);
        g.moveTo(-half, v).lineTo(half, v);
      }
      g.stroke({ color: 0xffffff, alpha: 0.12, pixelLine: true });

      g.moveTo(0, -half).lineTo(0, half);
      g.moveTo(-half, 0).lineTo(half, 0);
      g.stroke({ color: 0xffffff, alpha: 0.35, pixelLine: true });

      g.rect(-half, -half, size, size).stroke({ color: 0xffffff, alpha: 0.8, pixelLine: true });
    },
    [half, size],
  );

  const drawEvents = useCallback(
    (g: Graphics) => {
      g.clear();
      const colorOf = new Map(players.map((p) => [p.commandId, p.color]));
      // Orders first, then buildings on top. Orders fade out; buildings stay once placed.
      for (const e of events) {
        const color = colorOf.get(e.playerId);
        const age = tick - e.tick;
        if (e.kind === "build" || color === undefined || age < 0 || age > ORDER_TRAIL) continue;
        if (Math.abs(e.x) > half || Math.abs(e.y) > half) continue;
        const alpha = 1 - age / ORDER_TRAIL;
        if (e.kind === "move") g.circle(e.x, -e.y, 1).fill({ color, alpha: 0.8 * alpha });
        else g.circle(e.x, -e.y, 2).stroke({ color, width: 0.6, alpha });
      }
      // Building tiles filled by type and outlined in the player's colour; the icon is drawn on top as a sprite.
      for (const t of tiles) {
        const color = colorOf.get(t.playerId);
        if (color === undefined) continue;
        const s = tileSize(t.kind, zoom);
        g.roundRect(t.x - s / 2, t.y - s / 2, s, s, s * 0.15)
          .fill({ color: KIND_COLOR[t.kind] })
          // Outline widths are in screen pixels, so divide by zoom. Drawn outside so it doesn't cover the icon.
          .stroke({ color, width: OUTLINE_PX / zoom, alignment: 0 });
      }
    },
    [events, tiles, players, half, tick, zoom],
  );

  const fit = useCallback(() => {
    const host = hostRef.current;
    const world = worldRef.current;
    if (!host || !world) return;
    const scale = (Math.min(host.clientWidth, host.clientHeight) * 0.96) / size;
    world.scale.set(scale);
    world.position.set(host.clientWidth / 2, host.clientHeight / 2);
    setZoom(scale);
  }, [size]);

  // Pixi initialises asynchronously, so fit once the container actually exists.
  const setWorld = useCallback(
    (world: Container | null) => {
      worldRef.current = world;
      fit();
    },
    [fit],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let drag: { x: number; y: number } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      host.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const world = worldRef.current;
      if (!drag || !world) return;
      world.position.x += e.clientX - drag.x;
      world.position.y += e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      drag = null;
    };

    // Zoom towards the cursor so the point under it stays put.
    const onWheel = (e: WheelEvent) => {
      const world = worldRef.current;
      if (!world) return;
      e.preventDefault();
      const rect = host.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const old = world.scale.x;
      const next = Math.min(Math.max(old * Math.exp(-e.deltaY * 0.0015), (MIN_ZOOM * host.clientHeight) / size), MAX_ZOOM);
      world.position.x = mx - ((mx - world.position.x) * next) / old;
      world.position.y = my - ((my - world.position.y) * next) / old;
      world.scale.set(next);
      setZoom(next);
    };

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("wheel", onWheel, { passive: false });
    host.addEventListener("dblclick", fit);
    // Re-fit when the window (and so the map area) changes size.
    const resize = new ResizeObserver(fit);
    resize.observe(host);
    return () => {
      resize.disconnect();
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("dblclick", fit);
    };
  }, [fit, size]);

  return (
    <div ref={hostRef} className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing">
      <Application resizeTo={hostRef} backgroundAlpha={0} antialias>
        <pixiContainer ref={setWorld}>
          <pixiGraphics draw={drawMap} />
          <pixiGraphics draw={drawEvents} />
          {tiles.map((t) => {
            const texture = t.icon ? icons[t.icon] : undefined;
            if (!texture) return null;
            const s = tileSize(t.kind, zoom) * ICON_FILL;
            return <pixiSprite key={t.key} texture={texture} anchor={0.5} x={t.x} y={t.y} width={s} height={s} />;
          })}
          {tiles.map((t) =>
            t.count > 1 ? (
              <pixiText
                key={t.key}
                text={String(t.count)}
                style={countStyle}
                anchor={{ x: 0.5, y: 0 }}
                x={t.x}
                y={t.y + tileSize(t.kind, zoom) / 2 + OUTLINE_PX / zoom}
                // Undo the map zoom so counts keep the same size on screen.
                scale={1 / zoom}
                resolution={typeof window === "undefined" ? 1 : window.devicePixelRatio}
              />
            ) : null,
          )}
        </pixiContainer>
      </Application>
    </div>
  );
}
