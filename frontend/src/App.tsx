import { useState, useEffect, useCallback } from "react";
import { Navbar, type AppView } from "./components/layout/Navbar";
import { AuthPage } from "./features/auth/AuthPage";
import { Calculator } from "./features/calculator/Calculator";
import { Chatbot } from "./features/chatbot/Chatbot";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Sales } from "./features/sales/Sales";
import "./App.css";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const views: Record<AppView, JSX.Element> = {
  dashboard: <Dashboard />,
  sales: <Sales />,
  calculator: <Calculator />,
  chatbot: <Chatbot />,
};

function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  /* ─── Restore session from localStorage ─── */
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setChecking(false);
  }, []);

  /* ─── Login handler ─── */
  const handleLogin = useCallback(
    (newToken: string, newUser: AuthUser) => {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    },
    [],
  );

  /* ─── Logout handler ─── */
  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  /* ─── Loading state ─── */
  if (checking) {
    return null;
  }

  /* ─── Auth gate ─── */
  if (!token || !user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        user={user}
        onLogout={handleLogout}
      />

      <main className="app-main">
        <section className="app-view">{views[activeView]}</section>
      </main>
    </div>
  );
}

export default App;
