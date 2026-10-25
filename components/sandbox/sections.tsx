"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CastleIcon, ChevronDownIcon, ChurchIcon, FlaskConicalIcon, GaugeIcon, LandmarkIcon, ShieldIcon, ShipIcon, SwordsIcon,
  TrophyIcon, WheatIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cx } from "./moment";

/** each section's icon, shared by its header and the side menu so the two read as one */
export const SECTION_ICON: Record<string, LucideIcon> = {
  advantage: TrophyIcon, landmarks: LandmarkIcon, economy: WheatIcon, tech: FlaskConicalIcon, religion: ChurchIcon,
  "mil-buildings": CastleIcon, defense: ShieldIcon, army: SwordsIcon, navy: ShipIcon, stats: GaugeIcon,
};

// which sections are collapsed; shared by both players so their rows stay lined up
type Sections = { closed: Set<string>; toggle: (id: string) => void; open: (id: string) => void };
const SectionsContext = createContext<Sections | null>(null);

export function SectionsProvider({ children }: { children: ReactNode }) {
  const [closed, setClosed] = useState(() => new Set<string>());
  const value = useMemo(() => ({
    closed,
    toggle: (id: string) => setClosed((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    }),
    open: (id: string) => setClosed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    }),
  }), [closed]);
  return <SectionsContext.Provider value={value}>{children}</SectionsContext.Provider>;
}

export function useSections(): Sections {
  const s = useContext(SectionsContext);
  if (!s) throw new Error("useSections must be used inside the sandbox replay");
  return s;
}

// quick start, soft landing; no overshoot on a data board
const FOLD = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const;

// clips what spills out while the height moves, but reaches past the box far enough for the
// corner badges that stick out of tiles (overflow: hidden would cut those off)
const CLIP = { clipPath: "inset(-12px)" };

/** Slides its content open (height from 0) and closed again. */
export function Fold({ show, className, children }: { show: boolean; className?: string; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div className={className} style={CLIP} transition={FOLD}
          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A section's header bar: its icon and title, plus the arrow when it folds. The whole bar is the button. */
export function SectionHead({ id, title, foldable = true }: { id: string; title: ReactNode; foldable?: boolean }) {
  const Icon = SECTION_ICON[id];
  const inner = (
    <>
      {Icon && <Icon className={cx("sec-icon")} />}
      <span className={cx("sec-title")}>{title}</span>
      {foldable && <ChevronDownIcon className={cx("chev")} />}
    </>
  );
  if (!foldable) return <div className={cx("sec-h")}>{inner}</div>;
  return <CollapsibleTrigger className={cx("sec-h", "sec-btn")}>{inner}</CollapsibleTrigger>;
}

/** A board section that folds to a one-line summary of what's happening in it. */
export function Section({ id, title, summary, className, children }:
  { id: string; title: ReactNode; summary: ReactNode; className?: string; children: ReactNode }) {
  const { closed, toggle } = useSections();
  const open = !closed.has(id);
  return (
    <Collapsible open={open} onOpenChange={() => toggle(id)} className={cx("group", className)} data-section={id}>
      <SectionHead id={id} title={title} />
      {/* folded: the summary is a big target that opens the section again */}
      <Fold show={!open}>
        <button type="button" className={cx("abstract")} onClick={() => toggle(id)}
          aria-label={`Open ${typeof title === "string" ? title : "section"}`}>
          {summary}<span className={cx("abstract-open")}>Open</span>
        </button>
      </Fold>
      <Fold show={open}>{children}</Fold>
    </Collapsible>
  );
}
