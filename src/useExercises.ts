import { useEffect, useState } from "react";
import type { HeatmapExercise } from "./muscleBodyMap";
import { SAMPLE_EXERCISES } from "./sampleExercises";

/**
 * Base URL of the fitgram-be API. In Expo, only EXPO_PUBLIC_* vars reach the
 * client bundle. Defaults to the local backend (note the /api/v1 prefix).
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

/**
 * GET /exercises is behind JwtAuthGuard, so a bearer token is required.
 * Paste a dev token into .env as EXPO_PUBLIC_API_TOKEN to hit real data.
 */
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN;

/** Subset of the backend ExerciseDto that this prototype consumes. */
export type ApiExerciseDto = {
  id: string;
  name: string;
  type: string;
  muscleGroups: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tags: string[];
  thumbnailUrl: string;
  /** ISO date; present in the offline sample, used for "recent" sorting. */
  createdAt?: string;
};

/** Shape of PaginatedDto(ExerciseDto) returned by GET /exercises. */
export type ExercisesPage = {
  items: ApiExerciseDto[];
  page: number;
  pages: number;
  limit: number;
};

/** Filters shared by the API request and the offline query. */
type ExerciseQuery = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  muscleGroup?: string;
  tags?: string[];
  sort?: string;
};

/**
 * Filter, sort and paginate a list of exercises in memory — mirrors the
 * fitgram-be query semantics so the offline fallback behaves like the API.
 */
export function queryLocal(
  data: ApiExerciseDto[],
  q: ExerciseQuery
): ExercisesPage {
  const search = q.search?.trim().toLowerCase();
  const muscle = q.muscleGroup?.toLowerCase();
  const tags = (q.tags ?? []).map((t) => t.toLowerCase());

  let rows = data.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search)) return false;
    if (q.type && e.type !== q.type) return false;
    if (muscle && !e.muscleGroups.some((g) => g.toLowerCase().includes(muscle)))
      return false;
    // multi-tag = OR (matches any selected equipment)
    if (tags.length) {
      const has = e.tags.map((t) => t.toLowerCase());
      if (!tags.some((t) => has.includes(t))) return false;
    }
    return true;
  });

  const [field, dir] = (q.sort ?? "createdAt:desc").split(":");
  const sign = dir === "asc" ? 1 : -1;
  rows = rows.sort((a, b) => {
    const av = field === "name" ? a.name : (a.createdAt ?? "");
    const bv = field === "name" ? b.name : (b.createdAt ?? "");
    return av < bv ? -sign : av > bv ? sign : 0;
  });

  const pages = Math.max(1, Math.ceil(rows.length / q.limit));
  const page = Math.min(q.page, pages);
  const start = (page - 1) * q.limit;
  return { items: rows.slice(start, start + q.limit), page, pages, limit: q.limit };
}

/**
 * Map a backend exercise onto the trimmed shape the heatmap needs. Muscle
 * names are passed through raw — computeBodyData() resolves them to slugs and
 * falls back to muscleGroups when primary/secondary are empty.
 */
export function toHeatmapExercise(e: ApiExerciseDto): HeatmapExercise {
  return {
    id: e.id,
    name: e.name,
    primaryMuscles: e.primaryMuscles ?? [],
    secondaryMuscles: e.secondaryMuscles ?? [],
    muscleGroups: e.muscleGroups ?? [],
  };
}

export type UseExercisesResult = {
  items: ApiExerciseDto[];
  page: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  /** True when results came from the bundled sample, not the live API. */
  offline: boolean;
  setPage: (p: number) => void;
  next: () => void;
  prev: () => void;
};

/** Exercise types accepted by the backend `type` filter. */
export const EXERCISE_TYPES = ["Strength", "Cardio", "Timed"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

/** Coarse muscle groups accepted by the backend `muscleGroup` filter. */
export const MUSCLE_GROUP_FILTERS = [
  "Back", "Biceps", "Calves", "Chest", "Forearms", "Hamstrings", "Hips",
  "Neck", "Quadriceps", "Shoulders", "Thighs", "Triceps", "UpperArms", "Waist",
] as const;

/** Most common equipment tags (by exercise count) for the `tags` filter. */
export const EXERCISE_TAGS = [
  "Body Weight", "Dumbbell", "Barbell", "Cable", "Leverage Machine",
  "Band", "Kettlebell", "Weighted", "Smith Machine", "EZ Barbell",
  "Medicine Ball", "Suspension",
] as const;

/** Sort options exposed in the UI, mapped to the backend `sort` syntax. */
export const SORT_OPTIONS = [
  { key: "recent", label: "Mais recentes", value: "createdAt:desc" },
  { key: "name-asc", label: "Nome A–Z", value: "name:asc" },
  { key: "name-desc", label: "Nome Z–A", value: "name:desc" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

/**
 * Paginated exercises from the fitgram-be API. The backend clamps `limit` to
 * 10..20, so larger values are ignored server-side. Changing any filter
 * (search / type / muscleGroup) resets to page 1.
 */
export function useExercises(opts?: {
  limit?: number;
  search?: string;
  type?: ExerciseType;
  muscleGroup?: string;
  tags?: string[];
  sort?: string;
}): UseExercisesResult {
  const limit = opts?.limit ?? 20;
  const search = opts?.search?.trim() || undefined;
  const type = opts?.type;
  const muscleGroup = opts?.muscleGroup;
  const sort = opts?.sort;
  // Stable primitive key so the array identity doesn't retrigger the effect.
  const tagsKey = (opts?.tags ?? []).join(",");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [items, setItems] = useState<ApiExerciseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  // Any new filter starts over from the first page.
  useEffect(() => {
    setPage(1);
  }, [search, type, muscleGroup, tagsKey, sort]);

  useEffect(() => {
    let cancelled = false;

    const query: ExerciseQuery = {
      page,
      limit,
      search,
      type,
      muscleGroup,
      tags: tagsKey ? tagsKey.split(",") : [],
      sort,
    };

    // Serve the bundled sample (no network) and flag offline.
    const serveLocal = () => {
      if (cancelled) return;
      const local = queryLocal(SAMPLE_EXERCISES, query);
      setItems(local.items);
      setPages(local.pages);
      setOffline(true);
      setError(null);
    };

    (async () => {
      setIsLoading(true);
      setError(null);

      // No token → run fully offline, never touch the network.
      if (!API_TOKEN) {
        serveLocal();
        setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search) params.set("search", search);
        if (type) params.set("type", type);
        if (muscleGroup) params.set("muscleGroup", muscleGroup);
        if (tagsKey) params.set("tags", tagsKey);
        if (sort) params.set("sort", sort);

        const res = await fetch(`${API_URL}/exercises?${params}`, {
          headers: {
            Accept: "application/json",
            "Accept-Language": "en",
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });

        // 401 is a real auth problem worth surfacing, not an offline case.
        if (res.status === 401) {
          throw new Error("HTTP 401 — token inválido (EXPO_PUBLIC_API_TOKEN)");
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ExercisesPage;
        if (cancelled) return;
        setItems(data.items ?? []);
        setPages(Math.max(1, data.pages ?? 1));
        setOffline(false);
      } catch (e) {
        if (cancelled) return;
        // Network failure (backend down) → fall back to the sample data.
        const isNetwork =
          e instanceof TypeError || /Failed to fetch|Network/i.test(String(e));
        if (isNetwork) serveLocal();
        else setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, type, muscleGroup, tagsKey, sort]);

  return {
    items,
    page,
    pages,
    isLoading,
    error,
    offline,
    setPage,
    next: () => setPage((p) => Math.min(pages, p + 1)),
    prev: () => setPage((p) => Math.max(1, p - 1)),
  };
}
