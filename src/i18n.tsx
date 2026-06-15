import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";

export type Lang = "pt" | "en";

/**
 * All UI copy lives here. Interpolation uses i18n-js syntax: %{name}.
 * Muscle / group / difficulty maps are keyed by the raw data values so the
 * display helpers in exerciseMeta can translate without extra lookup tables.
 */
const translations = {
  pt: {
    lang: { pt: "PT", en: "EN" },
    gender: { male: "Homem", female: "Mulher" },
    howto: {
      title: "Como usar",
      step1: "Selecione o exercício na lista ou use os filtros abaixo",
      step2: "Veja os músculos trabalhados destacados no mapa",
    },
    legend: {
      title: "Legenda",
      less: "Menos",
      more: "Mais",
      lvl1: "Menos trabalhado",
      lvl2: "Moderado",
      lvl3: "Forte",
      lvl4: "Muito forte",
      lvl5: "Máximo",
    },
    offline: {
      title: "Dados de exemplo (offline)",
      text: "Conexão com o backend indisponível no momento.",
      retry: "Tentar novamente",
    },
    search: {
      placeholder: "Pesquisar exercício…",
      advanced: "Filtros avançados",
    },
    filters: { all: "Todos", clear: "Limpar filtros" },
    sort: {
      label: "Ordenar:",
      recent: "Mais recentes",
      "name-asc": "Nome A–Z",
      "name-desc": "Nome Z–A",
    },
    list: {
      count: "%{n} exercícios encontrados",
      empty: "Nenhum exercício encontrado.",
      error: "Erro: %{msg}",
      muscles: "Músculos: ",
    },
    pager: { prev: "Anterior", next: "Próxima", page: "Página %{page}/%{pages}" },
    card: { onMap: "No mapa", details: "Ver detalhes" },
    types: { Strength: "Força", Cardio: "Cardio", Timed: "Tempo" },
    groups: {
      Back: "Costas",
      Biceps: "Bíceps",
      Calves: "Panturrilhas",
      Chest: "Peito",
      Forearms: "Antebraços",
      Hamstrings: "Isquiotibiais",
      Hips: "Glúteos",
      Neck: "Pescoço",
      Quadriceps: "Quadríceps",
      Shoulders: "Ombros",
      Thighs: "Coxas",
      Triceps: "Tríceps",
      UpperArms: "Braços",
      Waist: "Abdômen",
    },
    difficulty: {
      beginner: "Iniciante",
      intermediate: "Intermédio",
      advanced: "Avançado",
    },
    describe: "Exercício de %{type} com foco em %{muscles}.",
    describeEq: "Exercício de %{type} com %{equipment} e foco em %{muscles}.",
    muscles: {
      latissimusdorsi: "Latíssimo do dorso",
      trapezius: "Trapézio",
      biceps: "Bíceps",
      brachialis: "Braquial",
      brachioradialis: "Braquiorradial",
      deltoids: "Deltoides",
      deltoidanterior: "Deltoide anterior",
      deltoidlateral: "Deltoide lateral",
      teresmajor: "Redondo maior",
      teresminor: "Redondo menor",
      infraspinatus: "Infraespinhoso",
      chest: "Peitoral",
      chestclavicularhead: "Peitoral clavicular",
      serratusanterior: "Serrátil anterior",
      triceps: "Tríceps",
      obliques: "Oblíquos",
      rectusabdominis: "Reto abdominal",
      quadriceps: "Quadríceps",
      sartorius: "Sartório",
      iliopsoas: "Iliopsoas",
      tensorfasciaefemoris: "Tensor da fáscia lata",
      hamstrings: "Isquiotibiais",
      gluteusmaximus: "Glúteo máximo",
      hipadductors: "Adutores",
      gastrocnemius: "Gastrocnémio",
      soleus: "Sóleo",
      tibialis: "Tibial",
      wristflexors: "Flexores do punho",
      wristextensors: "Extensores do punho",
    },
  },
  en: {
    lang: { pt: "PT", en: "EN" },
    gender: { male: "Male", female: "Female" },
    howto: {
      title: "How to use",
      step1: "Select an exercise from the list or use the filters below",
      step2: "See the worked muscles highlighted on the map",
    },
    legend: {
      title: "Legend",
      less: "Less",
      more: "More",
      lvl1: "Least worked",
      lvl2: "Moderate",
      lvl3: "Strong",
      lvl4: "Very strong",
      lvl5: "Maximum",
    },
    offline: {
      title: "Sample data (offline)",
      text: "Backend connection unavailable right now.",
      retry: "Retry",
    },
    search: { placeholder: "Search exercise…", advanced: "Advanced filters" },
    filters: { all: "All", clear: "Clear filters" },
    sort: {
      label: "Sort:",
      recent: "Most recent",
      "name-asc": "Name A–Z",
      "name-desc": "Name Z–A",
    },
    list: {
      count: "%{n} exercises found",
      empty: "No exercises found.",
      error: "Error: %{msg}",
      muscles: "Muscles: ",
    },
    pager: { prev: "Previous", next: "Next", page: "Page %{page}/%{pages}" },
    card: { onMap: "On map", details: "View details" },
    types: { Strength: "Strength", Cardio: "Cardio", Timed: "Timed" },
    groups: {
      Back: "Back",
      Biceps: "Biceps",
      Calves: "Calves",
      Chest: "Chest",
      Forearms: "Forearms",
      Hamstrings: "Hamstrings",
      Hips: "Glutes",
      Neck: "Neck",
      Quadriceps: "Quadriceps",
      Shoulders: "Shoulders",
      Thighs: "Thighs",
      Triceps: "Triceps",
      UpperArms: "Arms",
      Waist: "Core",
    },
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    describe: "%{type} exercise focusing on %{muscles}.",
    describeEq: "%{type} exercise with %{equipment} focusing on %{muscles}.",
    muscles: {
      latissimusdorsi: "Latissimus dorsi",
      trapezius: "Trapezius",
      biceps: "Biceps",
      brachialis: "Brachialis",
      brachioradialis: "Brachioradialis",
      deltoids: "Deltoids",
      deltoidanterior: "Front deltoid",
      deltoidlateral: "Side deltoid",
      teresmajor: "Teres major",
      teresminor: "Teres minor",
      infraspinatus: "Infraspinatus",
      chest: "Chest",
      chestclavicularhead: "Upper chest",
      serratusanterior: "Serratus anterior",
      triceps: "Triceps",
      obliques: "Obliques",
      rectusabdominis: "Rectus abdominis",
      quadriceps: "Quadriceps",
      sartorius: "Sartorius",
      iliopsoas: "Iliopsoas",
      tensorfasciaefemoris: "Tensor fasciae latae",
      hamstrings: "Hamstrings",
      gluteusmaximus: "Gluteus maximus",
      hipadductors: "Hip adductors",
      gastrocnemius: "Gastrocnemius",
      soleus: "Soleus",
      tibialis: "Tibialis",
      wristflexors: "Wrist flexors",
      wristextensors: "Wrist extensors",
    },
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "pt";

const deviceLang = getLocales()[0]?.languageCode ?? "pt";
const INITIAL_LANG: Lang = deviceLang.startsWith("en") ? "en" : "pt";

/** A translate function bound to the active locale. */
export type TFunction = (key: string, options?: Record<string, unknown>) => string;

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(INITIAL_LANG);
  i18n.locale = lang;

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, options) => i18n.t(key, options),
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
