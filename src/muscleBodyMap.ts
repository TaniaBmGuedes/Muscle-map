import type { Slug } from "react-native-body-highlighter";


export const MUSCLE_TO_SLUGS: Record<string, Slug[]> = {
  // --- detailed muscles (primaryMuscles / secondaryMuscles) ---
  biceps: ["biceps"],
  brachialis: ["biceps"],
  brachioradialis: ["forearm"],
  wristextensors: ["forearm"],
  wristflexors: ["forearm"],
  triceps: ["triceps"],
  chest: ["chest"],
  chestclavicularhead: ["chest"],
  serratusanterior: ["chest"],
  deltoids: ["deltoids"],
  deltoidanterior: ["deltoids"],
  deltoidlateral: ["deltoids"],
  trapezius: ["trapezius"],
  latissimusdorsi: ["upper-back"],
  teresmajor: ["upper-back"],
  teresminor: ["upper-back"],
  infraspinatus: ["upper-back"],
  obliques: ["obliques"],
  rectusabdominis: ["abs"],
  quadriceps: ["quadriceps"],
  sartorius: ["quadriceps"],
  iliopsoas: ["quadriceps"],
  tensorfasciaefemoris: ["quadriceps"],
  hamstrings: ["hamstring"],
  gluteusmaximus: ["gluteal"],
  hipadductors: ["adductors"],
  gastrocnemius: ["calves"],
  soleus: ["calves"],
  tibialis: ["tibialis"],

  // --- coarse muscleGroups (used as fallback) ---
  back: ["upper-back", "lower-back"],
  calves: ["calves"],
  feet: ["feet"],
  forearms: ["forearm"],
  hips: ["gluteal", "adductors"],
  neck: ["neck"],
  shoulders: ["deltoids"],
  thighs: ["quadriceps", "hamstring"],
  upperarms: ["biceps", "triceps"],
  waist: ["abs", "obliques"],
  // "Cardio" intentionally maps to nothing.
};

/** Resolve a list of FitGram muscle names to unique body-highlighter slugs. */
export function resolveSlugs(names: string[] | undefined): Slug[] {
  const out = new Set<Slug>();
  for (const n of names ?? []) {
    for (const slug of MUSCLE_TO_SLUGS[n.toLowerCase()] ?? []) out.add(slug);
  }
  return [...out];
}

/**
 * The fields the heatmap needs from an exercise. Muscle arrays hold the RAW
 * FitGram names (any of the two vocabularies above) — resolution to slugs
 * happens in computeBodyData.
 */
export type HeatmapExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  /** Coarse fallback, used only when primary & secondary resolve to nothing. */
  muscleGroups?: string[];
  /** number of sets — used to weight volume. Defaults to 1 if absent. */
  sets?: number;
};

/** How much each role contributes to a muscle's volume score. */
const PRIMARY_WEIGHT = 3;
const SECONDARY_WEIGHT = 1;

/** Number of intensity levels (matches the colors array length). */
export const INTENSITY_LEVELS = 5;

export type BodyDatum = { slug: Slug; intensity: number };

/**
 * Turns a list of exercises (a workout draft) into the `data` array that
 * react-native-body-highlighter expects: one entry per touched slug, with an
 * intensity from 1..INTENSITY_LEVELS scaled against the most-worked muscle.
 */
export function computeBodyData(exercises: HeatmapExercise[]): BodyDatum[] {
  const scoreBySlug = new Map<Slug, number>();
  const add = (slug: Slug, weight: number) =>
    scoreBySlug.set(slug, (scoreBySlug.get(slug) ?? 0) + weight);

  for (const ex of exercises) {
    const sets = ex.sets ?? 1;
    let primary = resolveSlugs(ex.primaryMuscles);
    const secondary = resolveSlugs(ex.secondaryMuscles);

    // Many records leave primary/secondary empty but fill muscleGroups; only
    // then do we fall back to the coarse regions so the body isn't left blank.
    if (primary.length === 0 && secondary.length === 0) {
      primary = resolveSlugs(ex.muscleGroups);
    }

    primary.forEach((s) => add(s, PRIMARY_WEIGHT * sets));
    secondary.forEach((s) => add(s, SECONDARY_WEIGHT * sets));
  }

  if (scoreBySlug.size === 0) return [];

  const max = Math.max(...scoreBySlug.values());

  return [...scoreBySlug.entries()].map(([slug, score]) => ({
    slug,
    // scale to 1..INTENSITY_LEVELS, never 0 for a touched muscle
    intensity: Math.max(1, Math.round((score / max) * INTENSITY_LEVELS)),
  }));
}

/** The muscle fields any exercise-like record needs for the reverse lookup. */
export type WithMuscles = {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  /** Coarse fallback, used only when primary & secondary resolve to nothing. */
  muscleGroups?: string[];
};

/** Whether any of `names` resolves to the given body slug. */
function namesHitSlug(names: string[] | undefined, slug: Slug): boolean {
  return resolveSlugs(names).includes(slug);
}

/**
 * Reverse of computeBodyData: given a tapped body slug, split a list of
 * exercises into the ones that work it as a *primary* mover and the ones that
 * only *assist* it. Mirrors computeBodyData's fallback — when an exercise has no
 * detailed primary/secondary muscles, its coarse muscleGroups count as primary.
 * An exercise that is already primary is never also listed as secondary.
 */
export function exercisesForSlug<T extends WithMuscles>(
  slug: Slug,
  exercises: T[]
): { primary: T[]; secondary: T[] } {
  const primary: T[] = [];
  const secondary: T[] = [];

  for (const ex of exercises) {
    const hasDetail =
      resolveSlugs(ex.primaryMuscles).length > 0 ||
      resolveSlugs(ex.secondaryMuscles).length > 0;
    const primaryNames = hasDetail ? ex.primaryMuscles : ex.muscleGroups;

    if (namesHitSlug(primaryNames, slug)) primary.push(ex);
    else if (hasDetail && namesHitSlug(ex.secondaryMuscles, slug)) secondary.push(ex);
  }

  return { primary, secondary };
}