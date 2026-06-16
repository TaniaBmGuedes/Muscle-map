 Longer description (README intro or repo "About this project")

  ▎ react-native-muscle-map
  ▎
  ▎ I built this as a reusable React Native library while working on a fitness
  ▎ app. It takes a workout's list of exercises and draws front + back body
  ▎ silhouettes, coloring each muscle by how much that workout works it — a
  ▎ simple "less → more" heatmap.
  ▎
  ▎ It's published to npm as react-native-muscle-map so any React Native / Expo
  ▎ app can drop it in, rather than re-implementing the muscle-mapping logic
  ▎ each time.
  ▎
  ▎ What it does
  ▎ - Maps detailed muscle names (chest, latissimusDorsi, gluteusMaximus, …)
  ▎ onto body regions, with a coarse muscle-group fallback.
  ▎ - Renders a color-coded heatmap with a built-in, customizable intensity
  ▎ legend.
  ▎ - Ships lower-level helpers (computeBodyData, resolveSlugs, MUSCLE_TO_SLUGS)
  ▎ if you want to drive the rendering yourself.
  ▎ - Configurable gender silhouette, color ramp, scale, and labels
  ▎ (localizable).
  ▎
  ▎ Built on top of react-native-body-highlighter and packaged with
  ▎ react-native-builder-bob (CommonJS, ESM, and TypeScript types). The repo
  ▎ also contains an Expo demo app that uses the library.
