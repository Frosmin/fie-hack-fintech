import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import "./Navbar.css"
import brandIcon from "../../assets/icon.webp"

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="2" />
        <rect x="11" y="2" width="7" height="5" rx="2" />
        <rect x="2" y="12" width="7" height="6" rx="2" />
        <rect x="11" y="9" width="7" height="9" rx="2" />
      </svg>
    ),
  },
  {
    id: "business",
    label: "Mis negocios",
    path: "/business",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l7-5 7 5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M8 18V10h4v8" />
      </svg>
    ),
  },
  {
    id: "calculator",
    label: "Calculadora IA",
    path: "/calculator",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
        <path d="M10 6v4l3 2" />
      </svg>
    ),
  },
  {
    id: "chatbot",
    label: "Chatbot",
    path: "/chatbot",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10a7 7 0 0 1 7-7 7 7 0 0 1 7 7c0 3.87-3.13 7-7 7a7.9 7.9 0 0 1-3-.6L3 18l1.3-3.2A6.93 6.93 0 0 1 3 10z" />
      </svg>
    ),
  },
] as const

export type AppView = "dashboard" | "business" | "calculator" | "chatbot"

interface NavbarProps {
  user?: { name: string; email: string; role: string } | null
  onLogout?: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isUserMenuOpen])

  // Close dropdown on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false)
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?"

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
        className={`navbar__toggle${isMenuOpen ? " is-open" : ""}`}
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
          <Link
            key={item.id}
            to={item.path}
            className={
              location.pathname === item.path
                ? "navbar__tab is-active"
                : "navbar__tab"
            }
            onClick={handleNavClick}
            aria-current={location.pathname === item.path ? "page" : undefined}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="navbar__user-area" ref={dropdownRef}>
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
                    setIsUserMenuOpen(false)
                    onLogout?.()
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
  )
}