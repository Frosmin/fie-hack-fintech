import { useState } from "react";
import "./Navbar.css";
import brandIcon from "../../assets/icon.webp";

export type AppView = "dashboard" | "sales" | "chatbot";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
  },
  {
    id: "sales",
    label: "Ventas",
  },
  {
    id: "chatbot",
    label: "Chatbot",
  },
] as const satisfies Array<{
  id: AppView;
  label: string;
}>;

interface NavbarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
}

export function Navbar({ activeView, onChangeView }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChangeView = (view: AppView) => {
    onChangeView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <img
          className="navbar__mark"
          src={brandIcon}
          alt="Tinka Emprende Hub"
        />
        <div>
          <span className="navbar__eyebrow">Comunidad Tinka</span>
          <strong>Tu registro de ventas, claro y rapido</strong>
        </div>
      </div>

      <button
        type="button"
        className="navbar__toggle"
        aria-label="Abrir menu"
        aria-expanded={isMenuOpen}
        aria-controls="navbar-menu"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="navbar-menu"
        className={isMenuOpen ? "navbar__nav is-open" : "navbar__nav"}
        aria-label="Navegación principal"
      >
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.id === activeView ? "navbar__tab is-active" : "navbar__tab"
            }
            onClick={() => handleChangeView(item.id)}
            aria-current={item.id === activeView ? "page" : undefined}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
