// Shapes of the sandbox replay data: built on the server from an aoe4world summary,
// then read by the client components to draw the board at any moment of the game.

/** Which units a tech or effect applies to: any class combo that fully matches, or a unit id. */
export type Selector = { class?: string[][]; id?: string[] };

export type StatKey = "hp" | "meleeArmor" | "rangedArmor" | "meleeAttack" | "rangedAttack";
export type AttackKey = "meleeAttack" | "rangedAttack";

/** One age of a unit for one civ: its icon, name and combat stats. */
export type UnitVariant = {
  icon: string;
  name: string;
  classes: string[];
  hp: number;
  producedBy: string[];
  meleeArmor: number;
  rangedArmor: number;
  meleeAttack: number;
  rangedAttack: number;
  /** bonus damage per target category, e.g. { cavalry: 21 } */
  bonus: Record<AttackKey, Record<string, number>>;
};

/** A unit tier this player reached, and from when. */
export type Tier = UnitVariant & { from: number; tier: number; baseId: string };

export type ItemGroup = "landmarks" | "eco-buildings" | "mil-buildings" | "economy" | "army" | "tech";

/** Something built or trained: one tile with its build and loss times. */
export type Item = {
  name: string;
  icon: string;
  group: ItemGroup;
  key: string;
  baseId?: string;
  t: number[];
  dead: number[];
  tiers?: Tier[];
  classes?: string[];
  /** the dropoffs tile keeps each camp type */
  parts?: { name: string; icon: string; t: number[]; dead: number[] }[];
};

export type Tech = {
  id: string;
  name: string;
  icon: string;
  age: number;
  kind: "eco" | "mil";
  unique: boolean;
  type: "technology" | "upgrade";
  /** an age-up researched as a tech (Abbasid wings) */
  landmark: boolean;
  select: Selector[];
  group: string;
  /** first research time, null when never researched */
  t: number | null;
  /** every purchase, for techs bought per building */
  times?: number[];
  /** bought per building (emplacements), not fort-wide */
  equip: boolean;
  gather?: string;
  line?: string;
  tier?: number;
};

export type TechGroup = { key: string; label: string; icon?: string; techs: Tech[] };

export type Building = { key?: string; name: string; icon: string; t: number[]; dead: number[] };

export type FortEntry = Building & { key: string; gate?: Building & { key: string } };
export type FortSlot = { key: string; label: string; entries: FortEntry[] };

export type ArmyCard = {
  key: string;
  building: Building;
  units: string[];
  naval: boolean;
  religious: boolean;
};

export type StatEffect = {
  t: number;
  name: string;
  effects: { property: string; select: Selector; effect: string; value: number }[];
};

export type Player = {
  name: string;
  civ: string;
  result: string;
  ages: { age: number; t: number; name: string }[];
  items: Item[];
  techGroups: TechGroup[];
  forts: FortSlot[];
  statEffects: StatEffect[];
  armyCards: ArmyCard[];
  blacksmith: Building;
  relics: { in: number[]; out: number[] };
};

export type GameData = { duration: number; map: string; players: Player[] };

/** Inline SVG markup for stat and bonus icons, keyed by stat or bonus category. */
export type StatIcons = Record<string, string>;
