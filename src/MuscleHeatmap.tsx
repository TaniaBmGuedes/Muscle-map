import { View, Text, StyleSheet } from "react-native";
import Body, { type Slug } from "react-native-body-highlighter";
import {
  computeBodyData,
  INTENSITY_LEVELS,
  type HeatmapExercise,
} from "./muscleBodyMap";

/** Light → dark ramp, index = intensity - 1. Tune to your design tokens. */
export const HEATMAP_COLORS = [
  "#FDE68A", // 1 - low
  "#FCD34D",
  "#FB923C",
  "#F97316",
  "#DC2626", // 5 - sobrecarregado (vermelho)
];

/** Portuguese label for each intensity level, index = intensity - 1. */
export const INTENSITY_LABELS = [
  "Menos trabalhado",
  "Moderado",
  "Forte",
  "Muito forte",
  "Máximo",
];

type Props = {
  exercises: HeatmapExercise[];
  scale?: number;
  /** Which body silhouette to draw. Defaults to "male". */
  gender?: "male" | "female";
  /** Hide the built-in "Menos → Mais" scale (when shown elsewhere). */
  hideLegend?: boolean;
  /** Fired when a muscle is tapped, with its body-highlighter slug. */
  onMusclePress?: (slug: Slug) => void;
};

export function MuscleHeatmap({
  exercises,
  scale = 0.9,
  gender = "male",
  hideLegend = false,
  onMusclePress,
}: Props) {
  const data = computeBodyData(exercises);

  // Body fires onBodyPartPress for any region; forward only ones with a slug.
  const handlePress = onMusclePress
    ? (part: { slug?: Slug }) => part.slug && onMusclePress(part.slug)
    : undefined;

  return (
    <View>
      <View style={styles.bodies}>
        <Body
          data={data}
          side="front"
          gender={gender}
          scale={scale}
          colors={HEATMAP_COLORS}
          onBodyPartPress={handlePress}
        />
        <Body
          data={data}
          side="back"
          gender={gender}
          scale={scale}
          colors={HEATMAP_COLORS}
          onBodyPartPress={handlePress}
        />
      </View>

      {!hideLegend && (
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Menos</Text>
          {Array.from({ length: INTENSITY_LEVELS }).map((_, i) => (
            <View
              key={i}
              style={[styles.swatch, { backgroundColor: HEATMAP_COLORS[i] }]}
            />
          ))}
          <Text style={styles.legendLabel}>Mais</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bodies: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  swatch: { width: 22, height: 14, borderRadius: 3 },
  legendLabel: { fontSize: 12, color: "#6B7280", marginHorizontal: 6 },
});
