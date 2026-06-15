import { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import type { ApiExerciseDto } from "./useExercises";
import { musclesLabel, difficultyFor, describe, type DifficultyKey } from "./exerciseMeta";
import { useI18n } from "./i18n";

/** Badge background/text colour classes per difficulty level. */
const DIFFICULTY_TONE: Record<DifficultyKey, { bg: string; text: string }> = {
  beginner: { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
  intermediate: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
  advanced: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
};

type Props = {
  ex: ApiExerciseDto;
  /** Whether this exercise is currently shown on the muscle map. */
  selected: boolean;
  favorite: boolean;
  onToggle: () => void;
  onFavorite: () => void;
};

/** A single exercise row: thumbnail, badges, muscles, description and actions. */
export function ExerciseCard({
  ex,
  selected,
  favorite,
  onToggle,
  onFavorite,
}: Props) {
  const { t } = useI18n();
  const [imgFailed, setImgFailed] = useState(false);
  const difficulty = difficultyFor(ex);
  const tone = DIFFICULTY_TONE[difficulty];
  const equipment = ex.tags[0];

  return (
    <Pressable
      onPress={onToggle}
      className={`flex-row items-center gap-[14px] rounded-md border p-3.5 ${
        selected ? "border-[#EA580C] bg-[#FFFBF7]" : "border-[#E5E7EB] bg-white"
      }`}
    >
      <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-md bg-[#F1F5F9]">
        {ex.thumbnailUrl && !imgFailed ? (
          <Image
            source={{ uri: ex.thumbnailUrl }}
            className="h-full w-full"
            onError={() => setImgFailed(true)}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-[28px]">🏋</Text>
        )}
      </View>

      <View className="flex-1 gap-[5px]">
        <Text className="text-[16px] font-bold text-[#111827]" numberOfLines={1}>
          {ex.name.trim()}
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          <Badge bg="bg-[#FFF7ED]" text="text-[#EA580C]" label={t(`types.${ex.type}`)} />
          {equipment && (
            <Badge bg="bg-[#F3F4F6]" text="text-[#475569]" label={equipment} />
          )}
          <Badge bg={tone.bg} text={tone.text} label={t(`difficulty.${difficulty}`)} />
        </View>
        <Text className="text-[13px] text-[#374151]" numberOfLines={1}>
          <Text className="font-bold text-[#111827]">{t("list.muscles")}</Text>
          {musclesLabel(ex, t)}
        </Text>
        <Text className="text-[13px] leading-[18px] text-[#6B7280]" numberOfLines={2}>
          {describe(ex, t)}
        </Text>
      </View>

      <View className="items-end justify-between gap-2.5 self-stretch">
        <Pressable onPress={onFavorite} hitSlop={8} className="p-0.5">
          <Text className={`text-[20px] ${favorite ? "text-[#F59E0B]" : "text-[#CBD5E1]"}`}>
            {favorite ? "★" : "☆"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onToggle}
          className="rounded-md border border-[#EA580C] px-3.5 py-2"
        >
          <Text className="text-[13px] font-bold text-[#9A3412]">
            {selected ? `✓ ${t("card.onMap")}` : t("card.details")}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function Badge({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <View className={`rounded-md px-2 py-[3px] ${bg}`}>
      <Text className={`text-[11px] font-bold ${text}`}>{label}</Text>
    </View>
  );
}
