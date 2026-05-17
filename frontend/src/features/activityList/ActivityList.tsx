import { useState, useEffect, useMemo } from "react";
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
const BUSINESS_API_URL = "http://localhost:3000/api/business";

function formatMoney(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Bs 0,00";
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
  const [liveBizMoney, setLiveBizMoney] = useState<string>(business.BusinessMoney);

  // Business edit/delete states
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    name: business.name,
    description: business.description || "",
    address: business.address || "",
    phone: business.phone || "",
  });
  const [submittingBusiness, setSubmittingBusiness] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBusiness, setDeletingBusiness] = useState(false);

  // Compute business balance dynamically from activities
  const computedBalance = useMemo(() => {
    if (activities.length === 0) return parseFloat(liveBizMoney) || 0;
    return activities.reduce((sum, act) => {
      const val = parseFloat(act.activityMoney);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [activities, liveBizMoney]);

  // Count positive / negative activity balances
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    activities.forEach((act) => {
      const val = parseFloat(act.activityMoney);
      if (!isNaN(val)) {
        if (val >= 0) totalIncome += val;
        else totalExpense += Math.abs(val);
      }
    });
    return { totalIncome, totalExpense, count: activities.length };
  }, [activities]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch activities and fresh business data in parallel
        const [actRes, bizRes] = await Promise.all([
          fetch(`${ACTIVITY_API_URL}?businessId=${business.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }),
          fetch(`${BUSINESS_API_URL}/${business.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }),
        ]);

        if (actRes.ok) {
          const data = await actRes.json();
          setActivities(data);
        } else {
          setActivities([]);
        }

        if (bizRes.ok) {
          const bizData = await bizRes.json();
          setLiveBizMoney(bizData.BusinessMoney ?? business.BusinessMoney);
        }
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [business.id, business.BusinessMoney]);

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

  async function handleUpdateBusiness(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingBusiness(true);
    try {
      const res = await fetch(`${BUSINESS_API_URL}/${business.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(businessForm),
      });
      if (!res.ok) throw new Error("Error");
      const updatedBiz = await res.json();
      localStorage.setItem("selected_business", JSON.stringify(updatedBiz));
      window.location.reload();
    } catch {
      setError("No se pudo actualizar el negocio");
      setSubmittingBusiness(false);
    }
  }

  async function handleDeleteBusiness() {
    setDeletingBusiness(true);
    try {
      const res = await fetch(`${BUSINESS_API_URL}/${business.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!res.ok) throw new Error("Error");
      localStorage.removeItem("selected_business");
      onBack();
    } catch {
      setError("No se pudo eliminar el negocio");
      setDeletingBusiness(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <section className="al">
      {/* ── Back navigation ── */}
      <button className="al__back" onClick={onBack} type="button">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="12 4 6 10 12 16" />
        </svg>
        Volver a negocios
      </button>

      {/* ── Hero Header Card ── */}
      <div className="al__hero">
        <div className="al__hero-glow" />
        <div className="al__hero-content">
          {/* Left side: Business info */}
          <div className="al__hero-left">
            <div className="al__hero-avatar">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} />
              ) : (
                business.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="al__hero-info">
              <span className="al__hero-eyebrow">
                <span className="al__hero-dot" />
                Negocio
              </span>
              <h2 className="al__hero-name">{business.name}</h2>
              {business.description && (
                <p className="al__hero-desc">{business.description}</p>
              )}
            </div>
          </div>

          {/* Right side: Balance + Report */}
          <div className="al__hero-right">
            <div className="al__hero-actions">
              <button
                className="al__report-btn"
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
              <button
                className="al__edit-btn"
                onClick={() => {
                  setBusinessForm({
                    name: business.name,
                    description: business.description || "",
                    address: business.address || "",
                    phone: business.phone || "",
                  });
                  setShowBusinessModal(true);
                }}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Editar negocio</span>
              </button>
            </div>
            <div className={`al__balance-card ${computedBalance >= 0 ? "is-positive" : "is-negative"}`}>
              <span className="al__balance-label">Saldo negocio</span>
              <span className="al__balance-amount">{formatMoney(computedBalance)}</span>
              <span className="al__balance-sync">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sincronizado
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="al__stats">
          <div className="al__stat al__stat--income">
            <div className="al__stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
            <div className="al__stat-data">
              <span className="al__stat-label">Actividades positivas</span>
              <span className="al__stat-value">{formatMoney(stats.totalIncome)}</span>
            </div>
          </div>
          <div className="al__stat-divider" />
          <div className="al__stat al__stat--expense">
            <div className="al__stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
            <div className="al__stat-data">
              <span className="al__stat-label">Actividades negativas</span>
              <span className="al__stat-value">{formatMoney(stats.totalExpense)}</span>
            </div>
          </div>
          <div className="al__stat-divider" />
          <div className="al__stat al__stat--count">
            <div className="al__stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
            <div className="al__stat-data">
              <span className="al__stat-label">Total actividades</span>
              <span className="al__stat-value">{stats.count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activities Section ── */}
      <div className="al__section">
        <div className="al__section-header">
          <div>
            <span className="al__section-eyebrow">Gestión</span>
            <h2 className="al__section-title">Actividades</h2>
          </div>
          <button
            className="al__new-btn"
            onClick={() => setShowActivityModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva actividad
          </button>
        </div>

        {error && <div className="al__error">{error}</div>}

        {loading ? (
          <div className="al__loading">
            <div className="al__loading-ring">
              <div /><div /><div /><div />
            </div>
            <span>Cargando actividades...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="al__empty">
            <div className="al__empty-visual">
              <div className="al__empty-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 12h6M12 9v6" />
                </svg>
              </div>
            </div>
            <h3>Sin actividades</h3>
            <p>Este negocio aún no tiene actividades. ¡Crea una!</p>
          </div>
        ) : (
          <div className="al__grid">
            {activities.map((act) => {
              const money = parseFloat(act.activityMoney);
              const isPositive = !isNaN(money) && money >= 0;
              return (
                <article
                  key={act.id}
                  className="al__card"
                  onClick={() => navigate(`/activity/${act.id}`)}
                >
                  <div className="al__card-left">
                    <div className={`al__card-icon ${isPositive ? "is-positive" : "is-negative"}`}>
                      {act.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="al__card-info">
                      <h3 className="al__card-name">{act.name}</h3>
                      <div className="al__card-meta">
                        <span className={`al__card-status ${act.isActive ? "is-active" : ""}`}>
                          {act.isActive ? "Activa" : "Inactiva"}
                        </span>
                        {act.description && (
                          <span className="al__card-desc">{act.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="al__card-right">
                    <span className="al__card-money-label">Saldo</span>
                    <span className={`al__card-money ${isPositive ? "is-positive" : "is-negative"}`}>
                      {formatMoney(act.activityMoney)}
                    </span>
                  </div>
                  <div className="al__card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Activity Modal ── */}
      {showActivityModal && (
        <div className="al__overlay" onClick={() => setShowActivityModal(false)}>
          <div className="al__modal" onClick={(e) => e.stopPropagation()}>
            <div className="al__modal-header">
              <div className="al__modal-header-left">
                <div className="al__modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div>
                  <h3>Nueva actividad</h3>
                  <span className="al__modal-subtitle">{business.name}</span>
                </div>
              </div>
              <button className="al__modal-close" onClick={() => setShowActivityModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="al__modal-form">
              <div className="al__form-group">
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
              <div className="al__form-group">
                <label htmlFor="act-desc">Descripción</label>
                <textarea
                  id="act-desc"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Describe la actividad..."
                  rows={3}
                />
              </div>
              {/* <div className="al__form-group">
                <label htmlFor="act-icon">Ícono (emoji)</label>
                <input
                  id="act-icon"
                  type="text"
                  value={activityForm.icon}
                  onChange={(e) => setActivityForm({ ...activityForm, icon: e.target.value })}
                  placeholder="Ej: 🛍️"
                />
              </div> */}
              <div className="al__modal-actions">
                <button type="button" className="al__btn al__btn--cancel" onClick={() => setShowActivityModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="al__btn al__btn--primary" disabled={submittingActivity}>
                  {submittingActivity ? "Creando..." : "Crear actividad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Edit Modal */}
      {showBusinessModal && (
        <div className="al__overlay" onClick={() => setShowBusinessModal(false)}>
          <div className="al__modal" onClick={(e) => e.stopPropagation()}>
            <div className="al__modal-header">
              <h3>Editar negocio</h3>
              <button className="al__modal-close" onClick={() => setShowBusinessModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateBusiness} className="al__modal-form">
              <div className="al__form-group">
                <label htmlFor="biz-name">Nombre del negocio *</label>
                <input
                  id="biz-name"
                  type="text"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  required
                  placeholder="Ej: Mi Tienda"
                />
              </div>
              <div className="al__form-group">
                <label htmlFor="biz-desc">Descripcion</label>
                <textarea
                  id="biz-desc"
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  placeholder="Describe tu negocio..."
                  rows={3}
                />
              </div>
              <div className="al__form-group">
                <label htmlFor="biz-address">Direccion</label>
                <input
                  id="biz-address"
                  type="text"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  placeholder="Ej: Av. Principal 123"
                />
              </div>
              <div className="al__form-group">
                <label htmlFor="biz-phone">Telefono</label>
                <input
                  id="biz-phone"
                  type="tel"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                  placeholder="Ej: 3001234567"
                />
              </div>
              <div className="al__modal-actions">
                {/* <button
                  type="button"
                  className="al__btn al__btn--danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Eliminar negocio
                </button> */}
                <div className="al__modal-actions-right">
                  <button type="button" className="al__btn al__btn--cancel" onClick={() => setShowBusinessModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="al__btn al__btn--primary" disabled={submittingBusiness}>
                    {submittingBusiness ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="al__overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="al__modal al__modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="al__modal-header">
              <h3>Eliminar negocio</h3>
            </div>
            <div className="al__modal-body">
              <p>Estas seguro de eliminar <strong>{business.name}</strong>?</p>
              <p className="al__warning">Esta accion no se puede deshacer. Perderas todas las actividades y movimientos asociados.</p>
            </div>
            <div className="al__modal-actions al__modal-actions--center">
              <button type="button" className="al__btn al__btn--cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="al__btn al__btn--danger"
                onClick={handleDeleteBusiness}
                disabled={deletingBusiness}
              >
                {deletingBusiness ? "Eliminando..." : "Eliminar negocio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
