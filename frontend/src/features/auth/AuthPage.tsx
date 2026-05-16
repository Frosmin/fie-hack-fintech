import { useState, useCallback, type FormEvent } from "react";
import brandIcon from "../../assets/icon.webp";
import "./AuthPage.css";

const API_URL = "http://localhost:3000/api/auth";

/* ─── Types ─── */
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthPageProps {
  onLogin: (token: string, user: AuthUser) => void;
}

type Mode = "login" | "register";

/* ─── Password Strength ─── */
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: "weak", label: "Débil", bars: 1 };
  if (score <= 3) return { level: "medium", label: "Media", bars: 3 };
  return { level: "strong", label: "Fuerte", bars: 5 };
}

/* ─── SVG Icons ─── */
function IconMail() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M2 4l8 6 8-6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s3.5-6 9-6c1.5 0 2.8.4 4 1" />
      <path d="M17.5 7A14.5 14.5 0 0 1 19 10s-3.5 6-9 6c-1.2 0-2.3-.3-3.3-.7" />
      <line x1="2" y1="2" x2="18" y2="18" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg className="auth-alert__icon" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 10h10M12 6l4 4-4 4" />
    </svg>
  );
}

/* ─── Main Component ─── */
export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const switchMode = useCallback(() => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setFieldErrors({});
  }, []);

  /* ─── Validation ─── */
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (mode === "register" && !name.trim()) {
      errs.name = "El nombre es requerido";
    }

    if (!email.trim()) {
      errs.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Ingresa un correo válido";
    }

    if (!password) {
      errs.password = "La contraseña es requerida";
    } else if (mode === "register" && password.length < 6) {
      errs.password = "Mínimo 6 caracteres";
    }

    if (mode === "register" && password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ─── Submit ─── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const url = `${API_URL}/${mode === "login" ? "login" : "register"}`;
      const body =
        mode === "login"
          ? { email, password }
          : { name: name.trim(), email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ocurrió un error inesperado");
        return;
      }

      const { token, user } = data as AuthResponse;
      onLogin(token, user);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  const pwStrength = getPasswordStrength(password);

  return (
    <div className="auth-page">
      {/* ─── Left Panel ─── */}
      <div className="auth-panel">
        <div className="auth-panel__orb auth-panel__orb--1" />
        <div className="auth-panel__orb auth-panel__orb--2" />
        <div className="auth-panel__orb auth-panel__orb--3" />

        <div className="auth-panel__content">
          <img
            className="auth-panel__logo"
            src={brandIcon}
            alt="Tinka Emprende Hub"
          />
          <h1 className="auth-panel__title">
            Comunidad <span>Tinka</span>
          </h1>
          <p className="auth-panel__subtitle">
            Impulsa tu emprendimiento con herramientas inteligentes de gestión
            financiera y ventas.
          </p>

          <div className="auth-panel__features">
            <div className="auth-panel__feature">
              <div className="auth-panel__feature-icon">📊</div>
              <span className="auth-panel__feature-text">
                Dashboard con métricas en tiempo real
              </span>
            </div>
            <div className="auth-panel__feature">
              <div className="auth-panel__feature-icon">🤖</div>
              <span className="auth-panel__feature-text">
                Asistente de IA para análisis financiero
              </span>
            </div>
            <div className="auth-panel__feature">
              <div className="auth-panel__feature-icon">💰</div>
              <span className="auth-panel__feature-text">
                Registro y seguimiento de ventas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="auth-form-panel">
        <div className="auth-card" key={mode}>
          <div className="auth-card__header">
            <div className="auth-card__welcome">
              {mode === "login" ? "👋 Bienvenido" : "🚀 Empieza ahora"}
            </div>
            <h2 className="auth-card__title">
              {mode === "login"
                ? "Inicia sesión"
                : "Crea tu cuenta"}
            </h2>
            <p className="auth-card__desc">
              {mode === "login"
                ? "Ingresa tus credenciales para acceder a tu panel de emprendedor."
                : "Regístrate para comenzar a gestionar tu negocio de forma inteligente."}
            </p>
          </div>

          {/* ─── Error Alert ─── */}
          {error && (
            <div className="auth-alert" role="alert">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {/* ─── Form ─── */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name (register only) */}
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="auth-name">
                  Nombre completo
                </label>
                <div className="auth-field__input-wrap">
                  <span className="auth-field__icon">
                    <IconUser />
                  </span>
                  <input
                    id="auth-name"
                    className="auth-field__input"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <span className="auth-field__error">{fieldErrors.name}</span>
                )}
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="auth-email">
                Correo electrónico
              </label>
              <div className="auth-field__input-wrap">
                <span className="auth-field__icon">
                  <IconMail />
                </span>
                <input
                  id="auth-email"
                  className="auth-field__input"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {fieldErrors.email && (
                <span className="auth-field__error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="auth-password">
                Contraseña
              </label>
              <div className="auth-field__input-wrap">
                <span className="auth-field__icon">
                  <IconLock />
                </span>
                <input
                  id="auth-password"
                  className="auth-field__input"
                  type={showPw ? "text" : "password"}
                  placeholder={
                    mode === "login"
                      ? "Tu contraseña"
                      : "Mínimo 6 caracteres"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
                <button
                  type="button"
                  className="auth-field__toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="auth-field__error">
                  {fieldErrors.password}
                </span>
              )}

              {/* Password Strength (register only) */}
              {mode === "register" && password.length > 0 && (
                <>
                  <div
                    className={`pw-strength pw-strength--${pwStrength.level}`}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`pw-strength__bar${
                          i <= pwStrength.bars ? " is-filled" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="pw-strength__text">
                    Seguridad: {pwStrength.label}
                  </span>
                </>
              )}
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div className="auth-field">
                <label
                  className="auth-field__label"
                  htmlFor="auth-confirm-password"
                >
                  Confirmar contraseña
                </label>
                <div className="auth-field__input-wrap">
                  <span className="auth-field__icon">
                    <IconLock />
                  </span>
                  <input
                    id="auth-confirm-password"
                    className="auth-field__input"
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-field__toggle-pw"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    aria-label={
                      showConfirmPw ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="auth-field__error">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
              id="auth-submit-btn"
            >
              <span className="auth-submit__content">
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                    <IconArrow />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* ─── Switch Mode ─── */}
          <div className="auth-divider">
            <span>O</span>
          </div>

          <p className="auth-switch">
            {mode === "login"
              ? "¿No tienes cuenta?"
              : "¿Ya tienes cuenta?"}
            <button
              type="button"
              className="auth-switch__btn"
              onClick={switchMode}
            >
              {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
