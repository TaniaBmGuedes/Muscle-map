# @fitgram/muscle-map

Muscle heatmap for React Native. Give it a workout's exercises and it draws
front + back body silhouettes with each muscle coloured by how much it's worked.

Built on top of [`react-native-body-highlighter`](https://github.com/HichamELBSI/react-native-body-highlighter).

## Install

```sh
npm install @fitgram/muscle-map react-native-body-highlighter react-native-svg
```

`react`, `react-native`, `react-native-body-highlighter` and `react-native-svg`
are **peer dependencies** — install them in the host app.

## Usage

```tsx
import { MuscleHeatmap, type HeatmapExercise } from "@fitgram/muscle-map";

const exercises: HeatmapExercise[] = [
  {
    id: "1",
    name: "Bench Press",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "deltoidAnterior"],
    sets: 4,
  },
];

export function Screen() {
  return <MuscleHeatmap exercises={exercises} gender="male" />;
}
```

### Props

| Prop         | Type                      | Default            | Description                                              |
| ------------ | ------------------------- | ------------------ | -------------------------------------------------------- |
| `exercises`  | `HeatmapExercise[]`       | —                  | Workout to visualise.                                    |
| `gender`     | `"male" \| "female"`      | `"male"`           | Body silhouette.                                         |
| `scale`      | `number`                  | `0.9`              | Passed through to the body component.                    |
| `colors`     | `string[]`                | 5-step yellow→red  | Light→dark ramp; its length sets the intensity levels.   |
| `hideLegend` | `boolean`                 | `false`            | Hide the built-in less→more scale.                       |
| `lessLabel` / `moreLabel` | `string`     | `"Less"` / `"More"`| Legend end labels (localise here).                       |

### Lower-level helpers

```ts
import { computeBodyData, resolveSlugs, MUSCLE_TO_SLUGS } from "@fitgram/muscle-map";
```

`computeBodyData(exercises, levels?)` returns the `{ slug, intensity }[]` array
if you want to drive `react-native-body-highlighter` yourself.

## Muscle names

`primaryMuscles` / `secondaryMuscles` accept the detailed FitGram vocabulary
(`chest`, `latissimusDorsi`, `gluteusMaximus`, …). When those resolve to nothing
the optional `muscleGroups` (`Back`, `Chest`, `Thighs`, …) are used as a coarse
fallback. See `MUSCLE_TO_SLUGS` for the full mapping.
