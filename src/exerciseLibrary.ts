import type { HeatmapExercise } from "./muscleBodyMap";

/**
 * Mock exercise library mirroring FitGram's real ExerciseDto shape
 * (primaryMuscles / secondaryMuscles use the exact 14 group names).
 */
export const EXERCISE_LIBRARY: HeatmapExercise[] = [
  {
    id: "bench-press",
    name: "Bench Press",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    sets: 4,
  },
  {
    id: "pull-up",
    name: "Pull-up",
    primaryMuscles: ["Mid Back", "Upper Back & Neck"],
    secondaryMuscles: ["Biceps", "Forearms"],
    sets: 3,
  },
  {
    id: "squat",
    name: "Back Squat",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Lower Back", "Core"],
    sets: 5,
  },
  {
    id: "deadlift",
    name: "Deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    secondaryMuscles: ["Quads", "Forearms", "Upper Back & Neck"],
    sets: 3,
  },
  {
    id: "ohp",
    name: "Overhead Press",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps", "Core"],
    sets: 4,
  },
  {
    id: "biceps-curl",
    name: "Biceps Curl",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    sets: 3,
  },
  {
    id: "calf-raise",
    name: "Calf Raise",
    primaryMuscles: ["Lower Leg"],
    secondaryMuscles: [],
    sets: 4,
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    primaryMuscles: ["Glutes"],
    secondaryMuscles: ["Hamstrings", "Hip & Groin"],
    sets: 3,
  },
  {
    id: "plank",
    name: "Plank",
    primaryMuscles: ["Core"],
    secondaryMuscles: [],
    sets: 3,
  },
];
