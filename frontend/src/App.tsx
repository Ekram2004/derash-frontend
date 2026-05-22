// src/App.tsx
import { ThemeProvider } from "./contexts/ThemeContext";
import LanguageLoader from "./components/LanguageLoader";
import AppRouter from "./core/router/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <LanguageLoader />
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;