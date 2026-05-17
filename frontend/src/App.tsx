import { useState } from "react";
import type { ReactNode } from "react";
import { Navbar, type AppView } from "./components/layout/Navbar";
import { Chatbot } from "./features/chatbot/Chatbot";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Sales } from "./features/sales/Sales";
import "./App.css";

const views: Record<AppView, ReactNode> = {
  dashboard: <Dashboard />,
  sales: <Sales />,
  chatbot: <Chatbot />,
};

function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  return (
    <div className="app-shell">
      <Navbar activeView={activeView} onChangeView={setActiveView} />

      <main className="app-main">
        <section className="app-view">{views[activeView]}</section>
      </main>
    </div>
  );
}

export default App;
