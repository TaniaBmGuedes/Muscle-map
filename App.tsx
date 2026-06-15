import "./global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "./src/i18n";
import { MuscleMapScreen } from "./src/MuscleMapScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <MuscleMapScreen />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
