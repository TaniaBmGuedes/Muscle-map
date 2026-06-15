import { View, Text, StyleSheet } from "react-native";
import Body from "react-native-body-highlighter";
import { computeBodyData, type HeatmapExercise } from "./muscleBodyMap";

/** Default light → dark intensity ramp, index = intensity - 1. */
export const HEATMAP_COLORS = [
  "#FDE68A", // 1 - low
  "#FCD34D",
  "#FB923C",
  "#F97316",
  "#DC2626", // 5 - overloaded
];

export type MuscleHeatmapProps = {
  /** The workout draft to visualise. */
  exercises: HeatmapExercise[];
  /** Body silhouette to draw. Defaults to "male". */
  gender?: "male" | "female";
  /** Scale passed through to react-native-body-highlighter. */
  scale?: number;
  /** Light → dark ramp. Its length defines the number of intensity levels. */
  colors?: string[];
  /** Hide the built-in less → more scale below the bodies. */
  hideLegend?: boolean;
  /** Labels at the ends of the legend scale. */
  lessLabel?: string;
  moreLabel?: string;
};

/**
 * Renders front + back body silhouettes with each muscle coloured by how much
 * the given `exercises` work it. Intensity is relative to the most-worked
 * muscle in the set.
 */
export function MuscleHeatmap({
  exercises,
  gender = "male",
  scale = 0.9,
  colors = HEATMAP_COLORS,
  hideLegend = false,
  lessLabel = "Less",
  moreLabel = "More",
}: MuscleHeatmapProps) {
  const data = computeBodyData(exercises, colors.length);

  return (
    <View>
      <View style={styles.bodies}>
        <Body data={data} side="front" gender={gender} scale={scale} colors={colors} />
        <Body data={data} side="back" gender={gender} scale={scale} colors={colors} />
      </View>

      {!hideLegend && (
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>{lessLabel}</Text>
          {colors.map((c, i) => (
            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
          <Text style={styles.legendLabel}>{moreLabel}</Text>
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