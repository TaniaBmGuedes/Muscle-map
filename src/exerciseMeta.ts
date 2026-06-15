import type { ApiExerciseDto } from "./useExercises";
import type { TFunction } from "./i18n";

/**
 * Presentation helpers the raw FitGram data doesn't carry: a translated muscle
 * list, a deterministic difficulty key, and a generated description. All copy
 * is resolved through the i18n `t` function so it follows the active locale.
 */

export type DifficultyKey = "beginner" | "intermediate" | "advanced";
const DIFFICULTIES: DifficultyKey[] = ["beginner", "intermediate", "advanced"];

/** Stable per-exercise difficulty: hash the id so it never flickers. */
export function difficultyFor(ex: ApiExerciseDto): DifficultyKey {
  let h = 0;
  for (let i = 0; i < ex.id.length; i++) h = (h + ex.id.charCodeAt(i)) % 9973;
  return DIFFICULTIES[h % DIFFICULTIES.length];
}

/** Translated, de-duplicated muscle list shown on a card (primary → groups). */
export function musclesLabel(ex: ApiExerciseDto, t: TFunction): string {
  const usePrimary = ex.primaryMuscles.length > 0;
  const source = usePrimary ? ex.primaryMuscles : ex.muscleGroups;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of source) {
    const label = usePrimary
      ? t(`muscles.${m.toLowerCase()}`)
      : t(`groups.${m}`);
    if (!seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out.join(", ") || "—";
}

/** A generated one-liner so cards aren't description-less (data has none). */
export function describe(ex: ApiExerciseDto, t: TFunction): string {
  const type = t(`types.${ex.type}`).toLowerCase();
  const muscles = musclesLabel(ex, t).toLowerCase();
  const equipment = ex.tags[0];
  return equipment
    ? t("describeEq", { type, equipment, muscles })
    : t("describe", { type, muscles });
}
