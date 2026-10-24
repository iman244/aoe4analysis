# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Age of Empires IV players who want to analyse games. Anyone can build or browse dashboards. Three working personas (proto-personas, not yet confirmed by research; see the [wiki](https://github.com/iman244/aoe4analysis/wiki/09-Personas)):

- **Squad Reviewer**: plays team games with the same friends and analyses each game together with them right afterwards, in the few minutes before the next game. Has never used a dashboard tool.
- **Analyst Creator**: a pro, caster or content creator (for example Beasty) who breaks games down for an audience and wants to reuse one way of analysing on many games.
- **Lens Borrower**: opens dashboards other people built, usually from a link in Discord, Reddit or Twitch, and points them at their own game.

## Product Purpose

A platform for building and sharing dashboards of AoE4 game data. A dashboard is a set of charts that can be opened on any game, so it works as a reusable lens: people see a game through their own way of analysing it, and share that view with others. Version 1 covers single games. Success: 100 weekly active people; first-time builders make a dashboard with no help and see their first chart within 60 seconds.

## Positioning

Every existing AoE4 and game-stats site shows a fixed match page chosen by the site. Here the people who play build the views, and any dashboard opens any game. The product is a tool, not a coach: it never tells players what they did wrong.

## Operating Context

- Most reviews happen at home on a PC, right after a match, with the squad on voice, often under time pressure before the next game.
- Dashboards are shared as links in Discord, Reddit and Twitch chat, and opened on PC or phone.
- Players already use the in-game stats screen and aoe4world.com, and use the game's own words: Score, Military, Economy, Technology, Society, Villagers, APM, Feudal/Castle/Imperial.

## Capabilities and Constraints

- **Data:** the aoe4world public API (players, games, search, autocomplete) and aoe4world's per-game summary (resources every 20 s, score over time, build order with timestamps, upgrades, age-ups, landmarks, APM, kills and losses). The summary endpoint blocks server requests and needs the aoe4world developers' permission or loading in the browser. Unit and upgrade stats come from aoe4world/data (current patch only; credit aoe4world).
- **Calculated stats** such as army DPS, army HP, army value and villager count are worked out from the build order plus unit stats.
- **Not in the data:** positions, so no map control.
- **Identity in Version 1:** a simple sign-up with any username plus a Steam ID or Steam name field, trusted without checking. Steam sign-in comes later. Viewing needs no account.
- **Language:** English only. No right-to-left layout.
- **Stack:** the existing Next.js 16, React 19, TypeScript and Tailwind CSS 4 repo.
- **Terminology:** dashboard, chart, stat, calculated, my last game, starter dashboard, question template, time cursor, share, publish, make a copy, gallery.

## Evidence on Hand

- Sample game summary: game 256853280 (Himeyama, rm_3v3), shared by the owner.
- UX record: https://github.com/iman244/aoe4analysis/wiki (stakeholder interview, competitive analysis, proto-personas, journey map, user flows, sitemap).
- Survey running: https://forms.gle/QgNATVdnwyZCesap9. No user results yet; do not invent quotes, usage numbers or testimonials.

## Product Principles

1. **Easy without instructions.** If building a dashboard needs explaining, it has failed, even if it works.
2. **Chart first.** Show real data from the game before asking for any choice.
3. **Game words, not analyst words.** Say "stat", not "measure", "dimension" or "aggregation".
4. **One link, same view.** A shared link always opens the same dashboard on the same game.
5. **A tool, not a coach.** Show the data clearly and let players draw their own conclusions; be honest about what the data can't show.
