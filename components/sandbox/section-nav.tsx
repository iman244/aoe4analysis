"use client";

import { Button } from "@/components/ui/button";
import { cx } from "./moment";
import { SECTION_ICON, useSections } from "./sections";

// sections are marked with data-section on the page; both players share them
const SECTIONS: [string, string][] = [
  ["advantage", "Advantage"], ["landmarks", "Landmarks & ages"], ["economy", "Economy infrastructure"],
  ["tech", "Technologies"], ["religion", "Religion"], ["army", "Army"], ["navy", "Navy"],
];

/** Scrolls to a section: whichever player's copy of it is higher up the page. */
function scrollTo(key: string) {
  const els = [...document.querySelectorAll<HTMLElement>(`[data-section="${key}"]`)];
  const top = els.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  top?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

/** One sticky column on the right edge of the page with a button per section. */
export function SectionNav() {
  const { open } = useSections();
  // a folded section opens first, then the page scrolls once it has its full height
  const goTo = (key: string) => {
    open(key);
    requestAnimationFrame(() => scrollTo(key));
  };
  return (
    <nav className={cx("secnav")} aria-label="Sections">
      {SECTIONS.map(([key, label]) => {
        const Icon = SECTION_ICON[key];
        return (
          <Button key={key} variant="ghost" size="icon" className={cx("secnav-item")} title={label} aria-label={label}
            onClick={() => goTo(key)}>
            <Icon />
          </Button>
        );
      })}
    </nav>
  );
}
