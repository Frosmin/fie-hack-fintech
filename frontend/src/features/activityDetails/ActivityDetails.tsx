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
      // Re-fetch activity to get updated balance
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
      <section className="activity-details">
        <div className="activity-details__loading">
          <div className="ad-spinner" />
          <span>Cargando actividad...</span>
        </div>
      </section>
    );
  }

  if (error && !activity) {
    return (
      <section className="activity-details">
        <div className="activity-details__error">{error}</div>
        <button className="btn btn--secondary" onClick={() => navigate(-1)}>
          ← Volver
        </button>
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

  return (
    <section className="activity-details">
      {/* Back button */}
      <button
        className="ad-back-btn"
        onClick={() => navigate(-1)}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="12 4 6 10 12 16" />
        </svg>
        Volver
      </button>

      {/* Activity header card */}
      <div className="ad-hero">
        <div className="ad-hero__left">
          <div className="ad-hero__icon-wrap">
            {activity.icon || "📋"}
          </div>
          <div className="ad-hero__info">
            <div className="ad-hero__eyebrow">Actividad</div>
            <h1 className="ad-hero__title">{activity.name}</h1>
            {activity.description && (
              <p className="ad-hero__desc">{activity.description}</p>
            )}
            <div className="ad-hero__meta">
              <span className={`ad-status-badge ${activity.isActive ? "is-active" : ""}`}>
                {activity.isActive ? "Activa" : "Inactiva"}
              </span>
              <span className="ad-hero__date">
                Creada {formatDate(activity.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="ad-hero__balance-card">
          <span className="ad-hero__balance-label">Saldo de actividad</span>
          <span className="ad-hero__balance-amount">
            {formatMoney(activity.activityMoney)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="ad-stats">
        <div className="ad-stat-card ad-stat-card--income">
          <div className="ad-stat-card__icon">↓</div>
          <div className="ad-stat-card__body">
            <span className="ad-stat-card__label">Ingresos</span>
            <span className="ad-stat-card__value">{formatMoney(totalIncome)}</span>
          </div>
        </div>
        <div className="ad-stat-card ad-stat-card--expense">
          <div className="ad-stat-card__icon">↑</div>
          <div className="ad-stat-card__body">
            <span className="ad-stat-card__label">Egresos</span>
            <span className="ad-stat-card__value">{formatMoney(totalExpense)}</span>
          </div>
        </div>
        <div className="ad-stat-card ad-stat-card--count">
          <div className="ad-stat-card__icon">📊</div>
          <div className="ad-stat-card__body">
            <span className="ad-stat-card__label">Transacciones</span>
            <span className="ad-stat-card__value">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="ad-success-toast">{successMessage}</div>
      )}

      {/* Actions bar */}
      <div className="ad-actions-bar">
        <h2 className="ad-section-title">Transacciones</h2>
        <div className="ad-actions-bar__buttons">
          <button
            className="btn ad-btn--charge"
            onClick={() => openForm("charge")}
            type="button"
          >
            <span className="ad-btn-icon">↓</span>
            Cobrar
          </button>
          <button
            className="btn ad-btn--pay"
            onClick={() => openForm("pay")}
            type="button"
          >
            <span className="ad-btn-icon">↑</span>
            Pagar
          </button>
        </div>
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="ad-empty">
          <div className="ad-empty__icon">💸</div>
          <h3>Sin transacciones</h3>
          <p>Aún no hay transacciones registradas para esta actividad.</p>
        </div>
      ) : (
        <div className="ad-tx-list">
          {transactions.map((tx) => {
            const isIncome = tx.type === "DEPOSIT" || tx.type === "REFUND";
            return (
              <article
                key={tx.id}
                className={`ad-tx-card ${isIncome ? "ad-tx-card--income" : "ad-tx-card--expense"}`}
              >
                <div className="ad-tx-card__left">
                  <div className={`ad-tx-card__type-icon ${isIncome ? "is-income" : "is-expense"}`}>
                    {TYPE_ICONS[tx.type] || "•"}
                  </div>
                  <div className="ad-tx-card__info">
                    <span className="ad-tx-card__name">{tx.nameCuate}</span>
                    <span className="ad-tx-card__meta">
                      <span className="ad-tx-card__type-label">{TYPE_LABELS[tx.type]}</span>
                      {tx.description && <> · {tx.description}</>}
                    </span>
                    <span className="ad-tx-card__date">{formatDate(tx.date)}</span>
                  </div>
                </div>
                <div className="ad-tx-card__right">
                  <span className={`ad-tx-card__amount ${isIncome ? "is-income" : "is-expense"}`}>
                    {isIncome ? "+" : "-"}{formatMoney(tx.amount)}
                  </span>
                  <span className={`ad-tx-card__status ad-tx-card__status--${tx.status.toLowerCase()}`}>
                    {STATUS_LABELS[tx.status]}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* New Transaction Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="modal ad-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <div className="ad-modal__title-group">
                <span className={`ad-modal__mode-badge ${formMode === "pay" ? "is-pay" : "is-charge"}`}>
                  {formMode === "pay" ? "↑ Pago" : "↓ Cobro"}
                </span>
                <h3>
                  {formMode === "pay"
                    ? "Registrar pago"
                    : "Registrar cobro"}
                </h3>
              </div>
              <button
                className="modal__close"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="tx-name">Nombre *</label>
                <input
                  id="tx-name"
                  type="text"
                  value={formData.nameCuate}
                  onChange={(e) =>
                    setFormData({ ...formData, nameCuate: e.target.value })
                  }
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tx-amount">Monto (Bs) *</label>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tx-type">Tipo *</label>
                <select
                  id="tx-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as TransactionForm["type"],
                    })
                  }
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
              <div className="form-group">
                <label htmlFor="tx-description">Descripción</label>
                <textarea
                  id="tx-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción opcional..."
                  rows={2}
                />
              </div>
              <div className="ad-form-row">
                <div className="form-group">
                  <label htmlFor="tx-bank">Banco</label>
                  <input
                    id="tx-bank"
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    placeholder="Ej: BancoFIE"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tx-account">Nro. Cuenta</label>
                  <input
                    id="tx-account"
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="Ej: 123456789"
                  />
                </div>
              </div>
              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`btn ${formMode === "pay" ? "ad-btn--pay" : "ad-btn--charge"}`}
                  disabled={submitting}
                >
                  {submitting
                    ? "Procesando..."
                    : formMode === "pay"
                      ? "Registrar pago"
                      : "Registrar cobro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
