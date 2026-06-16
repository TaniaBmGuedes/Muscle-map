import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MuscleHeatmap, HEATMAP_COLORS } from "./MuscleHeatmap";
import {
  useExercises,
  toHeatmapExercise,
  EXERCISE_TYPES,
  MUSCLE_GROUP_FILTERS,
  EXERCISE_TAGS,
  SORT_OPTIONS,
  type ApiExerciseDto,
  type ExerciseType,
  type SortKey,
} from "./useExercises";
import { FilterChip } from "./FilterChip";
import { ExerciseCard } from "./ExerciseCard";
import { MuscleExercisesSheet } from "./MuscleExercisesSheet";
import { SAMPLE_EXERCISES } from "./sampleExercises";
import { useI18n, type Lang } from "./i18n";
import type { HeatmapExercise } from "./muscleBodyMap";
import type { Slug } from "react-native-body-highlighter";

const LEVELS = [1, 2, 3, 4, 5] as const;

export function MuscleMapScreen() {
  const { t, lang, setLang } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;

  // --- filter state ---
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value sent to the API
  const [type, setType] = useState<ExerciseType | undefined>();
  const [muscleGroup, setMuscleGroup] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [showFilters, setShowFilters] = useState(true);

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const sort = SORT_OPTIONS.find((s) => s.key === sortKey)?.value;
  const { items, page, pages, isLoading, error, offline, next, prev } =
    useExercises({ limit: 20, search, type, muscleGroup, tags, sort });

  // --- map / favourites state ---
  const [selected, setSelected] = useState<Map<string, HeatmapExercise>>(
    new Map()
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [gender, setGender] = useState<"male" | "female">("male");
  // Muscle tapped on the heatmap → opens the "exercises for this muscle" sheet.
  const [activeMuscle, setActiveMuscle] = useState<Slug | null>(null);

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );

  const toggle = (ex: ApiExerciseDto) =>
    setSelected((prev) => {
      const map = new Map(prev);
      if (map.has(ex.id)) map.delete(ex.id);
      else map.set(ex.id, toHeatmapExercise(ex));
      return map;
    });

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const nextSet = new Set(prev);
      nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id);
      return nextSet;
    });

  const workoutExercises = useMemo(() => [...selected.values()], [selected]);
  const hasFilters = !!(search || type || muscleGroup || tags.length);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setType(undefined);
    setMuscleGroup(undefined);
    setTags([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerClassName="w-full max-w-[1100px] self-center p-5 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* language switch */}
        <View className="mb-1 flex-row justify-end gap-1">
          {(["pt", "en"] as const).map((l) => (
            <LangButton
              key={l}
              label={t(`lang.${l}`)}
              active={lang === l}
              onPress={() => setLang(l as Lang)}
            />
          ))}
        </View>

        {/* gender toggle */}
        <View className="mb-2 flex-row justify-center">
          {(["male", "female"] as const).map((g) => {
            const on = gender === g;
            return (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                className={`border px-[22px] py-[9px] ${
                  on ? "border-[#EA580C] bg-[#EA580C]" : "border-[#E5E7EB] bg-white"
                }`}
              >
                <Text
                  className={`text-[14px] font-bold ${on ? "text-white" : "text-[#6B7280]"}`}
                >
                  {g === "male" ? "♂ " : "♀ "}
                  {t(`gender.${g}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* bodies + legend card */}
        <View
          className={`mt-2 gap-4 ${wide ? "flex-row items-start" : "flex-col items-stretch"}`}
        >
          <View className="flex-1 items-center">
            <MuscleHeatmap
              exercises={workoutExercises}
              gender={gender}
              hideLegend
              onMusclePress={setActiveMuscle}
            />
            <View className="mt-2 flex-row items-center justify-center gap-1">
              <Text className="mx-1.5 text-[12px] text-[#6B7280]">
                {t("legend.less")}
              </Text>
              {HEATMAP_COLORS.map((c, i) => (
                <View
                  key={i}
                  className="h-[14px] w-[26px] rounded-md"
                  style={{ backgroundColor: c }}
                />
              ))}
              <Text className="mx-1.5 text-[12px] text-[#6B7280]">
                {t("legend.more")}
              </Text>
            </View>
          </View>

          <View
            className={`rounded-md border border-[#FCE9D8] bg-white p-4 ${
              wide ? "w-[280px]" : "mt-2 w-full"
            }`}
          >
            <Text className="mb-2 text-[14px] font-bold text-[#EA580C]">
              ⓘ {t("howto.title")}
            </Text>
            <View className="mb-2 flex-row gap-1.5">
              <Text className="text-[13px] font-bold text-[#6B7280]">1.</Text>
              <Text className="flex-1 text-[13px] leading-[18px] text-[#4B5563]">
                {t("howto.step1")}
              </Text>
            </View>
            <View className="mb-2 flex-row gap-1.5">
              <Text className="text-[13px] font-bold text-[#6B7280]">2.</Text>
              <Text className="flex-1 text-[13px] leading-[18px] text-[#4B5563]">
                {t("howto.step2")}
              </Text>
            </View>
            <View className="mb-2 flex-row gap-1.5">
              <Text className="text-[13px] font-bold text-[#6B7280]">3.</Text>
              <Text className="flex-1 text-[13px] leading-[18px] text-[#4B5563]">
                {t("howto.step3")}
              </Text>
            </View>

            <Text className="mb-2 mt-3.5 text-[14px] font-bold text-[#EA580C]">
              ⏱ {t("legend.title")}
            </Text>
            {LEVELS.map((n, i) => (
              <View key={n} className="mt-[7px] flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-md"
                  style={{ backgroundColor: HEATMAP_COLORS[i] }}
                />
                <Text className="text-[13px] text-[#4B5563]">
                  {t(`legend.lvl${n}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* offline banner */}
        {offline && (
          <View className="mt-[18px] flex-row items-center gap-3 rounded-md border border-[#FDE68A] bg-[#FEF9C3] px-4 py-3">
            <View className="flex-1">
              <Text className="text-[13px] font-bold text-[#92400E]">
                ⓘ {t("offline.title")}
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#A16207]">
                {t("offline.text")}
              </Text>
            </View>
            <Pressable
              className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2"
              onPress={() => setSearch((s) => s)}
            >
              <Text className="text-[12px] font-semibold text-[#374151]">
                ↻ {t("offline.retry")}
              </Text>
            </Pressable>
          </View>
        )}

        {/* search + advanced-filters toggle */}
        <View className="mt-[18px] flex-row gap-2.5">
          <View className="flex-1 flex-row items-center rounded-md border border-[#E5E7EB] bg-white px-3.5">
            <Text className="mr-2 text-[18px] text-[#9CA3AF]">⌕</Text>
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder={t("search.placeholder")}
              placeholderTextColor="#9CA3AF"
              className="flex-1 py-3 text-[15px] text-[#111827]"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <Pressable onPress={() => setSearchInput("")} hitSlop={8}>
                <Text className="px-1 text-[14px] text-[#9CA3AF]">✕</Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            className="flex-row items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4"
          >
            <Text className="text-[14px] font-semibold text-[#374151]">
              ⚙ {t("search.advanced")}
            </Text>
          </Pressable>
        </View>

        {/* type filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 py-2 pr-1"
        >
          <FilterChip
            label={t("filters.all")}
            active={!type}
            onPress={() => setType(undefined)}
          />
          {EXERCISE_TYPES.map((ty) => (
            <FilterChip
              key={ty}
              label={t(`types.${ty}`)}
              active={type === ty}
              onPress={() => setType(type === ty ? undefined : ty)}
            />
          ))}
        </ScrollView>

        {/* muscle-group + equipment filters */}
        {showFilters && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 py-2 pr-1"
            >
              {MUSCLE_GROUP_FILTERS.map((g) => (
                <FilterChip
                  key={g}
                  label={t(`groups.${g}`)}
                  tone="muscle"
                  active={muscleGroup === g}
                  onPress={() =>
                    setMuscleGroup(muscleGroup === g ? undefined : g)
                  }
                />
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 py-2 pr-1"
            >
              {EXERCISE_TAGS.map((tag) => (
                <FilterChip
                  key={tag}
                  label={tag}
                  tone="tag"
                  active={tags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* sort + count */}
        <View className="mb-2.5 mt-1.5 flex-row flex-wrap items-center gap-2">
          <Text className="text-[13px] font-semibold text-[#6B7280]">
            {t("sort.label")}
          </Text>
          {SORT_OPTIONS.map((s) => {
            const on = sortKey === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSortKey(s.key)}
                className={`rounded-md border px-3 py-1.5 ${
                  on ? "border-[#111827] bg-[#111827]" : "border-[#E5E7EB] bg-white"
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold ${on ? "text-white" : "text-[#6B7280]"}`}
                >
                  {t(`sort.${s.key}`)}
                </Text>
              </Pressable>
            );
          })}
          <View className="flex-1" />
          <Text className="text-[13px] text-[#6B7280]">
            {t("list.count", { n: items.length })}
          </Text>
          {hasFilters && (
            <Pressable onPress={clearFilters} hitSlop={6}>
              <Text className="ml-3 text-[13px] font-semibold text-[#2563EB]">
                ⤫ {t("filters.clear")}
              </Text>
            </Pressable>
          )}
        </View>

        {/* list */}
        {error ? (
          <Text className="my-4 text-[13px] text-[#B91C1C]">
            {t("list.error", { msg: error })}
          </Text>
        ) : isLoading ? (
          <ActivityIndicator className="my-6" color="#EA580C" />
        ) : items.length === 0 ? (
          <Text className="my-7 text-center text-[14px] text-[#6B7280]">
            {t("list.empty")}
          </Text>
        ) : (
          <View className="gap-2.5">
            {items.map((ex) => (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                selected={selected.has(ex.id)}
                favorite={favorites.has(ex.id)}
                onToggle={() => toggle(ex)}
                onFavorite={() => toggleFavorite(ex.id)}
              />
            ))}
          </View>
        )}

        {/* pager */}
        <View className="mt-4 flex-row items-center justify-between gap-3">
          <Pressable
            onPress={prev}
            disabled={page <= 1 || isLoading}
            className={`items-center rounded-md border px-5 py-[11px] ${
              page <= 1 || isLoading ? "border-[#E5E7EB]" : "border-[#EA580C]"
            }`}
          >
            <Text className="text-[14px] font-bold text-[#9A3412]">
              ‹ {t("pager.prev")}
            </Text>
          </Pressable>
          <Text className="text-[13px] text-[#6B7280]">
            {t("pager.page", { page, pages })}
          </Text>
          <Pressable
            onPress={next}
            disabled={page >= pages || isLoading}
            className={`items-center rounded-md border px-5 py-[11px] ${
              page >= pages || isLoading ? "border-[#E5E7EB]" : "border-[#EA580C]"
            }`}
          >
            <Text className="text-[14px] font-bold text-[#9A3412]">
              {t("pager.next")} ›
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <MuscleExercisesSheet
        slug={activeMuscle}
        source={SAMPLE_EXERCISES}
        selected={selected}
        favorites={favorites}
        onToggle={toggle}
        onFavorite={toggleFavorite}
        onClose={() => setActiveMuscle(null)}
      />
    </SafeAreaView>
  );
}

function LangButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-md px-2.5 py-1 ${
        active ? "bg-[#111827]" : "border border-[#E5E7EB] bg-white"
      }`}
    >
      <Text
        className={`text-[12px] font-bold ${active ? "text-white" : "text-[#6B7280]"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
