import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Business.css";

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

interface BusinessFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
}

interface ActivityFormData {
  name: string;
  description: string;
  icon: string;
}

const API_URL = "http://localhost:3000/api/business";
const ACTIVITY_API_URL = "http://localhost:3000/api/activities";

function formatMoney(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Bs 0.00";
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(num);
}

export function Business() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Activity state
  const [selectedBiz, setSelectedBiz] = useState<BusinessData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState<ActivityFormData>({
    name: "",
    description: "",
    icon: "",
  });
  const [submittingActivity, setSubmittingActivity] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setError("No se encontró información del usuario");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar negocios");
        return res.json();
      })
      .then((data) => {
        setBusinesses(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar tus negocios");
        setLoading(false);
      });
  }, []);

  function getUserId(): number | null {
    const user = localStorage.getItem("auth_user");
    if (!user) return null;
    try {
      const parsed = JSON.parse(user);
      return parsed.id ? Number(parsed.id) : null;
    } catch {
      return null;
    }
  }

  function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) return;

    setSubmitting(true);
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify({ ...formData, userId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al crear negocio");
        return res.json();
      })
      .then((newBusiness) => {
        setBusinesses((prev) => [...prev, newBusiness]);
        setShowModal(false);
        setFormData({ name: "", description: "", address: "", phone: "" });
        setSubmitting(false);
      })
      .catch(() => {
        setError("No se pudo crear el negocio");
        setSubmitting(false);
      });
  }

  async function handleSelectBusiness(biz: BusinessData) {
    setSelectedBiz(biz);
    setLoadingActivities(true);
    try {
      const res = await fetch(`${ACTIVITY_API_URL}?businessId=${biz.id}`, {
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
      setLoadingActivities(false);
    }
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBiz) return;
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
          businessId: Number(selectedBiz.id),
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

  if (loading) {
    return (
      <section className="business">
        <div className="business__loading">
          <div className="spinner" />
          <span>Cargando negocios...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="business">
        <div className="business__error">{error}</div>
      </section>
    );
  }

  // If a business is selected, show its activities
  if (selectedBiz) {
    return (
      <section className="business">
        <button
          className="biz-back-btn"
          onClick={() => {
            setSelectedBiz(null);
            setActivities([]);
          }}
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
              {selectedBiz.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="biz-selected-header__eyebrow">Negocio</div>
              <h2 className="biz-selected-header__name">{selectedBiz.name}</h2>
              {selectedBiz.description && (
                <p className="biz-selected-header__desc">{selectedBiz.description}</p>
              )}
            </div>
          </div>
          <div className="biz-selected-header__balance">
            <span className="biz-selected-header__balance-label">Saldo negocio</span>
            <span className="biz-selected-header__balance-amount">{formatMoney(selectedBiz.BusinessMoney)}</span>
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

        {loadingActivities ? (
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

  return (
    <section className="business">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Gestión</span>
          <h2>Mis negocios</h2>
        </div>
        <div className="section-heading__actions">
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>
            + Crear negocio
          </button>
        </div>
      </div>

      {businesses.length === 0 ? (
        <div className="business__empty">
          <div className="business__empty-icon">🏪</div>
          <h3>No tienes negocios registrados</h3>
          <p>Aún no has creado ningún negocio. ¡Empieza ahora!</p>
        </div>
      ) : (
        <div className="business__grid">
          {businesses.map((biz) => (
            <article
              key={biz.id}
              className="business-card"
              onClick={() => handleSelectBusiness(biz)}
              style={{ cursor: "pointer" }}
            >
              <div className="business-card__header">
                {biz.logoUrl ? (
                  <img
                    src={biz.logoUrl}
                    alt={biz.name}
                    className="business-card__logo"
                  />
                ) : (
                  <div className="business-card__logo-placeholder">
                    {biz.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="business-card__info">
                  <h3 className="business-card__name">{biz.name}</h3>
                  <span className={`business-card__status ${biz.isActive ? "is-active" : ""}`}>
                    {biz.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              {biz.description && (
                <p className="business-card__description">{biz.description}</p>
              )}
              <div className="business-card__details">
                {biz.address && (
                  <div className="business-card__detail">
                    <span className="business-card__detail-label">Dirección:</span>
                    <span>{biz.address}</span>
                  </div>
                )}
                {biz.phone && (
                  <div className="business-card__detail">
                    <span className="business-card__detail-label">Teléfono:</span>
                    <span>{biz.phone}</span>
                  </div>
                )}
              </div>
              <div className="activity-card__arrow">→</div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Crear nuevo negocio</h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateBusiness}>
              <div className="form-group">
                <label htmlFor="name">Nombre del negocio *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Mi Tienda"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu negocio..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Principal 123"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: 3001234567"
                />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? "Creando..." : "Crear negocio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}