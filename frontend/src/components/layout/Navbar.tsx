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
    label: "Registro ventas",
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
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export function Navbar({ activeView, onChangeView, user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleChangeView = (view: AppView) => {
    onChangeView(view);
    setIsMenuOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

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

      {/* ─── User Menu ─── */}
      {user && (
        <div className="navbar__user-area">
          <button
            type="button"
            className="navbar__avatar-btn"
            onClick={() => setIsUserMenuOpen((v) => !v)}
            aria-label="Menú de usuario"
            aria-expanded={isUserMenuOpen}
          >
            <span className="navbar__avatar">{initials}</span>
            <span className="navbar__user-name">{user.name}</span>
            <svg
              className={`navbar__chevron${isUserMenuOpen ? " is-open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="navbar__backdrop"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="navbar__dropdown">
                <div className="navbar__dropdown-header">
                  <span className="navbar__dropdown-name">{user.name}</span>
                  <span className="navbar__dropdown-email">{user.email}</span>
                </div>
                <div className="navbar__dropdown-divider" />
                <button
                  type="button"
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
                    <polyline points="11 15 15 10 11 5" />
                    <line x1="15" y1="10" x2="7" y2="10" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
