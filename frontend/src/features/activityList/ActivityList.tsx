import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ActivityList.css";

interface BusinessData {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  BusinessMoney: string;
  isActive: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  activityMoney: string;
  isActive: boolean;
}

interface ActivityFormData {
  name: string;
  description: string;
  icon: string;
}

interface ActivityListProps {
  business: BusinessData;
  onBack: () => void;
}

const ACTIVITY_API_URL = "http://localhost:3000/api/activities";

function formatMoney(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Bs 0.00";
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(num);
}

export function ActivityList({ business, onBack }: ActivityListProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState<ActivityFormData>({
    name: "",
    description: "",
    icon: "",
  });
  const [submittingActivity, setSubmittingActivity] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      try {
        const res = await fetch(`${ACTIVITY_API_URL}?businessId=${business.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (!res.ok) throw new Error("Error");
        const data = await res.json();
        setActivities(data);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [business.id]);

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingActivity(true);
    try {
      const res = await fetch(ACTIVITY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          ...activityForm,
          businessId: Number(business.id),
        }),
      });
      if (!res.ok) throw new Error("Error");
      const newAct = await res.json();
      setActivities((prev) => [newAct, ...prev]);
      setShowActivityModal(false);
      setActivityForm({ name: "", description: "", icon: "" });
    } catch {
      setError("No se pudo crear la actividad");
    } finally {
      setSubmittingActivity(false);
    }
  }

  return (
    <section className="business">
      <button
        className="biz-back-btn"
        onClick={onBack}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="12 4 6 10 12 16" />
        </svg>
        Volver a negocios
      </button>

      <div className="biz-selected-header">
        <div className="biz-selected-header__left">
          <div className="business-card__logo-placeholder biz-selected-avatar">
            {business.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="biz-selected-header__eyebrow">Negocio</div>
            <h2 className="biz-selected-header__name">{business.name}</h2>
            {business.description && (
              <p className="biz-selected-header__desc">{business.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="biz-report-btn"
            onClick={() => navigate(`/business/${business.id}/report`)}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Ver Reporte</span>
          </button>
          <div className="biz-selected-header__balance">
            <span className="biz-selected-header__balance-label">Saldo negocio</span>
            <span className="biz-selected-header__balance-amount">{formatMoney(business.BusinessMoney)}</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Gestión</span>
          <h2>Actividades</h2>
        </div>
        <div className="section-heading__actions">
          <button
            className="btn btn--primary"
            onClick={() => setShowActivityModal(true)}
          >
            + Nueva actividad
          </button>
        </div>
      </div>

      {error && <div className="business__error">{error}</div>}

      {loading ? (
        <div className="business__loading">
          <div className="spinner" />
          <span>Cargando actividades...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="business__empty">
          <div className="business__empty-icon">📋</div>
          <h3>Sin actividades</h3>
          <p>Este negocio aún no tiene actividades. ¡Crea una!</p>
        </div>
      ) : (
        <div className="business__grid">
          {activities.map((act) => (
            <article
              key={act.id}
              className="business-card activity-card"
              onClick={() => navigate(`/activity/${act.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="business-card__header">
                <div className="activity-card__icon" style={{ textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>
                  {act.name.charAt(0)}
                </div>
                <div className="business-card__info">
                  <h3 className="business-card__name">{act.name}</h3>
                  <span className={`business-card__status ${act.isActive ? "is-active" : ""}`}>
                    {act.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
              {act.description && (
                <p className="business-card__description">{act.description}</p>
              )}
              <div className="activity-card__money">
                <span className="activity-card__money-label">Saldo</span>
                <span className="activity-card__money-value">
                  {formatMoney(act.activityMoney)}
                </span>
              </div>
              <div className="activity-card__arrow">→</div>
            </article>
          ))}
        </div>
      )}

      {/* Create Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Nueva actividad</h3>
              <button className="modal__close" onClick={() => setShowActivityModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateActivity}>
              <div className="form-group">
                <label htmlFor="act-name">Nombre *</label>
                <input
                  id="act-name"
                  type="text"
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                  required
                  placeholder="Ej: Ventas de temporada"
                />
              </div>
              <div className="form-group">
                <label htmlFor="act-desc">Descripción</label>
                <textarea
                  id="act-desc"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Describe la actividad..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="act-icon">Ícono (emoji)</label>
                <input
                  id="act-icon"
                  type="text"
                  value={activityForm.icon}
                  onChange={(e) => setActivityForm({ ...activityForm, icon: e.target.value })}
                  placeholder="Ej: 🛍️"
                />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowActivityModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={submittingActivity}>
                  {submittingActivity ? "Creando..." : "Crear actividad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
