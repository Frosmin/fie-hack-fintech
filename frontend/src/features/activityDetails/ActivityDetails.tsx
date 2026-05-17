import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ActivityDetails.css";

const API_BASE = "http://localhost:3000/api";

interface Activity {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  qr_url: string | null;
  activityMoney: string;
  isActive: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  nameCuate: string;
  amount: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "REFUND";
  description: string | null;
  date: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  bankName: string | null;
  accountNumber: string | null;
  activityId: string;
  createdAt: string;
}

interface TransactionForm {
  nameCuate: string;
  amount: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT" | "REFUND";
  description: string;
  bankName: string;
  accountNumber: string;
}

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Depósito",
  WITHDRAWAL: "Retiro",
  TRANSFER: "Transferencia",
  PAYMENT: "Pago",
  REFUND: "Reembolso",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
};

const TYPE_ICONS: Record<string, string> = {
  DEPOSIT: "↓",
  WITHDRAWAL: "↑",
  TRANSFER: "⇄",
  PAYMENT: "💳",
  REFUND: "↩",
};

function formatMoney(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(num);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<"pay" | "charge">("charge");
  const [showQrModal, setShowQrModal] = useState(false);
  const [formData, setFormData] = useState<TransactionForm>({
    nameCuate: "",
    amount: "",
    type: "DEPOSIT",
    description: "",
    bankName: "",
    accountNumber: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("auth_token");

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar actividad");
      const data = await res.json();
      setActivity(data);
    } catch {
      setError("No se pudo cargar la actividad");
    }
  }, [id, token]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE}/transactions?activityId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Error al cargar transacciones");
      const data = await res.json();
      setTransactions(data);
    } catch {
      // silent fail for transactions
    }
  }, [id, token]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchActivity(), fetchTransactions()]);
      setLoading(false);
    }
    loadData();
  }, [fetchActivity, fetchTransactions]);

  function openForm(mode: "pay" | "charge") {
    setFormMode(mode);
    setFormData({
      nameCuate: "",
      amount: "",
      type: mode === "pay" ? "PAYMENT" : "DEPOSIT",
      description: "",
      bankName: "",
      accountNumber: "",
    });
    setShowForm(true);
    setSuccessMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setSuccessMessage("");

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          activityId: Number(id),
        }),
      });
      if (!res.ok) throw new Error("Error al crear transacción");
      const newTx = await res.json();
      setTransactions((prev) => [newTx, ...prev]);
      setShowForm(false);
      await fetchActivity();
      setSuccessMessage(
        formMode === "pay"
          ? "¡Pago registrado exitosamente!"
          : "¡Cobro registrado exitosamente!"
      );
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch {
      setError("No se pudo crear la transacción");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="ad">
        <div className="ad__loading">
          <div className="ad__loading-ring">
            <div /><div /><div /><div />
          </div>
          <span>Cargando actividad...</span>
        </div>
      </section>
    );
  }

  if (error && !activity) {
    return (
      <section className="ad">
        <div className="ad__error">{error}</div>
        <button className="ad__back" onClick={() => navigate(-1)}>← Volver</button>
      </section>
    );
  }

  if (!activity) return null;

  const totalIncome = transactions
    .filter((t) => t.type === "DEPOSIT" || t.type === "REFUND")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "PAYMENT" || t.type === "WITHDRAWAL")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = parseFloat(activity.activityMoney);

  return (
    <section className="ad">
      {/* ─── Top bar ─── */}
      <div className="ad__topbar">
        <button className="ad__back" onClick={() => navigate(-1)} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Volver</span>
        </button>
        <div className="ad__topbar-actions">
          <button className="ad__qr-trigger" onClick={() => setShowQrModal(true)} type="button" title="Ver QR de pago">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" />
              <path d="M21 14h-3v3" />
              <path d="M18 21h3v-3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Hero section: two-column layout ─── */}
      <div className="ad__hero-grid">
        {/* Left: Activity info + Balance */}
        <div className="ad__hero-card">
          <div className="ad__hero-card-glow" />
          <div className="ad__hero-top">
            <div className="ad__hero-icon" style={{ color: "white", textTransform: "uppercase" }}>
              {activity.name.charAt(0)}
            </div>
            <div className="ad__hero-info">
              <span className="ad__hero-eyebrow">Actividad</span>
              <h1 className="ad__hero-name">{activity.name}</h1>
              {activity.description && (
                <p className="ad__hero-desc">{activity.description}</p>
              )}
            </div>
          </div>

          <div className="ad__hero-balance-section">
            <div className="ad__hero-balance">
              <span className="ad__hero-balance-label">Saldo disponible</span>
              <span className={`ad__hero-balance-value ${balance >= 0 ? "is-positive" : "is-negative"}`}>
                {formatMoney(balance)}
              </span>
            </div>
            <div className="ad__hero-meta-row">
              <span className={`ad__badge ${activity.isActive ? "ad__badge--active" : "ad__badge--inactive"}`}>
                <span className="ad__badge-dot" />
                {activity.isActive ? "Activa" : "Inactiva"}
              </span>
              <span className="ad__hero-date">{formatDate(activity.createdAt)}</span>
            </div>
            <button
              className="ad__report-btn"
              onClick={() => navigate(`/activity/${id}/report`)}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Ver Reporte</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: QR + quick actions */}
        <div className="ad__qr-card">
          <div className="ad__qr-card-inner">
            <span className="ad__qr-label">Escanea para pagar</span>
            <div className="ad__qr-frame" onClick={() => setShowQrModal(true)}>
              <img
                src="/qr_bueno.png"
                alt="Código QR BancoFie"
                className="ad__qr-img"
              />
              <div className="ad__qr-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span>Ampliar</span>
              </div>
            </div>
            <span className="ad__qr-sublabel">BancoFie · QR Simple</span>
          </div>

          {/* Quick action buttons */}
          <div className="ad__quick-actions">
            <button className="ad__action-btn ad__action-btn--charge" onClick={() => openForm("charge")} type="button">
              <div className="ad__action-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span>Cobrar</span>
            </button>
            <button className="ad__action-btn ad__action-btn--pay" onClick={() => openForm("pay")} type="button">
              <div className="ad__action-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <span>Pagar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats strip ─── */}
      <div className="ad__stats-strip">
        <div className="ad__stat ad__stat--income">
          <div className="ad__stat-icon-ring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <div className="ad__stat-data">
            <span className="ad__stat-label">Ingresos</span>
            <span className="ad__stat-value">{formatMoney(totalIncome)}</span>
          </div>
        </div>
        <div className="ad__stat-divider" />
        <div className="ad__stat ad__stat--expense">
          <div className="ad__stat-icon-ring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div className="ad__stat-data">
            <span className="ad__stat-label">Egresos</span>
            <span className="ad__stat-value">{formatMoney(totalExpense)}</span>
          </div>
        </div>
        <div className="ad__stat-divider" />
        <div className="ad__stat ad__stat--count">
          <div className="ad__stat-icon-ring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </div>
          <div className="ad__stat-data">
            <span className="ad__stat-label">Movimientos</span>
            <span className="ad__stat-value">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* ─── Toast ─── */}
      {successMessage && (
        <div className="ad__toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* ─── Transactions section ─── */}
      <div className="ad__tx-section">
        <div className="ad__tx-header">
          <h2 className="ad__tx-title">Historial de movimientos</h2>
          <span className="ad__tx-count">{transactions.length} registros</span>
        </div>

        {transactions.length === 0 ? (
          <div className="ad__tx-empty">
            <div className="ad__tx-empty-visual">
              <div className="ad__tx-empty-circle">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 12h6M12 9v6" />
                </svg>
              </div>
            </div>
            <h3>Sin movimientos aún</h3>
            <p>Registra tu primer cobro o pago para comenzar a ver el historial.</p>
            <div className="ad__tx-empty-actions">
              <button className="ad__action-btn ad__action-btn--charge" onClick={() => openForm("charge")} type="button">
                <div className="ad__action-btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span>Primer cobro</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="ad__tx-list">
            {transactions.map((tx) => {
              const isIncome = tx.type === "DEPOSIT" || tx.type === "REFUND";
              return (
                <div key={tx.id} className="ad__tx-row">
                  <div className={`ad__tx-indicator ${isIncome ? "is-income" : "is-expense"}`}>
                    {TYPE_ICONS[tx.type] || "•"}
                  </div>
                  <div className="ad__tx-body">
                    <div className="ad__tx-primary">
                      <span className="ad__tx-name">{tx.nameCuate}</span>
                      <span className={`ad__tx-amount ${isIncome ? "is-income" : "is-expense"}`}>
                        {isIncome ? "+" : "−"}{formatMoney(tx.amount)}
                      </span>
                    </div>
                    <div className="ad__tx-secondary">
                      <span className="ad__tx-type">{TYPE_LABELS[tx.type]}</span>
                      {tx.description && <span className="ad__tx-desc"> · {tx.description}</span>}
                      <span className="ad__tx-time">{formatShortDate(tx.date)}</span>
                    </div>
                  </div>
                  <span className={`ad__tx-status ad__tx-status--${tx.status.toLowerCase()}`}>
                    {STATUS_LABELS[tx.status]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── QR Full-screen Modal ─── */}
      {showQrModal && (
        <div className="ad__overlay" onClick={() => setShowQrModal(false)}>
          <div className="ad__qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ad__qr-modal-close" onClick={() => setShowQrModal(false)} type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="ad__qr-modal-content">
              <img src="/qr_bueno.png" alt="Código QR BancoFie" className="ad__qr-modal-img" />
              <div className="ad__qr-modal-info">
                <h3>{activity.name}</h3>
                <p>Escanea este código QR con tu app de BancoFie para realizar un pago</p>
                <span className="ad__qr-modal-amount">Saldo: {formatMoney(balance)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Transaction Form Modal ─── */}
      {showForm && (
        <div className="ad__overlay" onClick={() => setShowForm(false)}>
          <div className="ad__form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad__form-header">
              <div className="ad__form-header-left">
                <div className={`ad__form-mode-icon ${formMode === "pay" ? "is-pay" : "is-charge"}`}>
                  {formMode === "pay" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3>{formMode === "pay" ? "Registrar pago" : "Registrar cobro"}</h3>
                  <span className="ad__form-subtitle">{activity.name}</span>
                </div>
              </div>
              <button className="ad__form-close" onClick={() => setShowForm(false)} type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="ad__form-body" onSubmit={handleSubmit}>
              {/* Amount — big and prominent */}
              <div className="ad__form-amount-section">
                <label htmlFor="tx-amount">Monto (Bs)</label>
                <div className="ad__form-amount-input">
                  <span className="ad__form-currency">Bs</span>
                  <input
                    id="tx-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div className="ad__form-fields">
                <div className="ad__form-group">
                  <label htmlFor="tx-name">Nombre del contacto *</label>
                  <input
                    id="tx-name"
                    type="text"
                    value={formData.nameCuate}
                    onChange={(e) => setFormData({ ...formData, nameCuate: e.target.value })}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="ad__form-group">
                  <label htmlFor="tx-type">Tipo de operación</label>
                  <select
                    id="tx-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionForm["type"] })}
                  >
                    {formMode === "charge" ? (
                      <>
                        <option value="DEPOSIT">Depósito</option>
                        <option value="REFUND">Reembolso</option>
                      </>
                    ) : (
                      <>
                        <option value="PAYMENT">Pago</option>
                        <option value="WITHDRAWAL">Retiro</option>
                        <option value="TRANSFER">Transferencia</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="ad__form-group">
                  <label htmlFor="tx-description">Nota (opcional)</label>
                  <input
                    id="tx-description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Concepto del movimiento"
                  />
                </div>

                <div className="ad__form-row">
                  <div className="ad__form-group">
                    <label htmlFor="tx-bank">Banco</label>
                    <input
                      id="tx-bank"
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Ej: BancoFie"
                    />
                  </div>
                  <div className="ad__form-group">
                    <label htmlFor="tx-account">Nro. Cuenta</label>
                    <input
                      id="tx-account"
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>
                </div>
              </div>

              <div className="ad__form-footer">
                <button type="button" className="ad__form-btn ad__form-btn--cancel" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`ad__form-btn ${formMode === "pay" ? "ad__form-btn--pay" : "ad__form-btn--charge"}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="ad__form-btn-loading" />
                  ) : null}
                  {submitting
                    ? "Procesando..."
                    : formMode === "pay"
                      ? "Confirmar pago"
                      : "Confirmar cobro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
