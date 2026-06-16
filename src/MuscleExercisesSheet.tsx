import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import type { Slug } from "react-native-body-highlighter";
import type { ApiExerciseDto } from "./useExercises";
import { exercisesForSlug } from "./muscleBodyMap";
import { ExerciseCard } from "./ExerciseCard";
import { useI18n } from "./i18n";

type Props = {
  /** Tapped muscle slug, or null when the sheet is closed. */
  slug: Slug | null;
  /** Exercise library to search for the muscle (the full bundled set). */
  source: ApiExerciseDto[];
  /** Exercises currently shown on the map, to highlight matching rows. */
  selected: Map<string, unknown>;
  favorites: Set<string>;
  onToggle: (ex: ApiExerciseDto) => void;
  onFavorite: (id: string) => void;
  onClose: () => void;
};

/**
 * Bottom sheet that lists every exercise working a tapped muscle — primary
 * movers first, then the ones that only assist (secondary). Cards reuse the
 * same toggle/favorite actions as the main list.
 */
export function MuscleExercisesSheet({
  slug,
  source,
  selected,
  favorites,
  onToggle,
  onFavorite,
  onClose,
}: Props) {
  const { t } = useI18n();

  const { primary, secondary } = slug
    ? exercisesForSlug(slug, source)
    : { primary: [], secondary: [] };
  const total = primary.length + secondary.length;
  const muscleName = slug ? t(`bodyparts.${slug}`) : "";

  const renderCard = (ex: ApiExerciseDto) => (
    <ExerciseCard
      key={ex.id}
      ex={ex}
      selected={selected.has(ex.id)}
      favorite={favorites.has(ex.id)}
      onToggle={() => onToggle(ex)}
      onFavorite={() => onFavorite(ex.id)}
    />
  );

  return (
    <Modal
      visible={slug !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      />

      <View className="absolute bottom-0 left-0 right-0 max-h-[82%] rounded-t-2xl bg-white">
        {/* grabber */}
        <View className="items-center pt-2.5">
          <View className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </View>

        {/* header */}
        <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
          <View className="flex-1 pr-3">
            <Text className="text-[18px] font-bold text-[#111827]">
              {muscleName}
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#6B7280]">
              {t("muscleSheet.count", { n: total })}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]"
          >
            <Text className="text-[16px] text-[#6B7280]">✕</Text>
          </Pressable>
        </View>

        {total === 0 ? (
          <Text className="px-5 py-10 text-center text-[14px] text-[#6B7280]">
            {t("muscleSheet.empty")}
          </Text>
        ) : (
          <ScrollView
            contentContainerClassName="gap-2.5 px-5 pb-8 pt-1"
            showsVerticalScrollIndicator={false}
          >
            {primary.length > 0 && (
              <SectionHeader
                label={t("muscleSheet.primary")}
                count={primary.length}
                color="#EA580C"
              />
            )}
            {primary.map(renderCard)}

            {secondary.length > 0 && (
              <SectionHeader
                label={t("muscleSheet.secondary")}
                count={secondary.length}
                color="#94A3B8"
              />
            )}
            {secondary.map(renderCard)}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function SectionHeader({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <View className="mt-2 flex-row items-center gap-2">
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="text-[14px] font-bold text-[#111827]">{label}</Text>
      <Text className="text-[13px] text-[#9CA3AF]">{count}</Text>
    </View>
  );
}
