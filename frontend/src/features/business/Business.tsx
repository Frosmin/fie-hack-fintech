import { useState, useEffect } from "react";
import "./Business.css";
import { ActivityList } from "../activityList/ActivityList";

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

interface BusinessFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
}

const API_URL = "http://localhost:3000/api/business";

export function Business() {
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

  // Activity list state
  const [selectedBiz, setSelectedBiz] = useState<BusinessData | null>(null);

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

  // If a business is selected, show its activities via ActivityList
  if (selectedBiz) {
    return (
      <ActivityList
        business={selectedBiz}
        onBack={() => setSelectedBiz(null)}
      />
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
              onClick={() => setSelectedBiz(biz)}
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