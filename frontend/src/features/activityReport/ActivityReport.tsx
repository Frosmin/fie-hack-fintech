import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../../lib/api";
import "./ActivityReport.css";

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

type FilterType =
  | "ALL"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "PAYMENT"
  | "REFUND";

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

/** Group transactions by date label for bar chart */
function groupByDate(txs: Transaction[]) {
  const map = new Map<
    string,
    { income: number; expense: number; label: string }
  >();

  txs.forEach((tx) => {
    const key = new Date(tx.date).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
    });
    const entry = map.get(key) || { income: 0, expense: 0, label: key };
    const amount = parseFloat(tx.amount);
    const isIncome = tx.type === "DEPOSIT" || tx.type === "REFUND";
    if (isIncome) entry.income += amount;
    else entry.expense += amount;
    map.set(key, entry);
  });

  return Array.from(map.values()).slice(-7); // last 7 periods
}

export function ActivityReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
      const res = await fetch(`${API_BASE}/transactions?activityId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar transacciones");
      const data = await res.json();
      setTransactions(data);
    } catch {
      // silent
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

  /* ─── Computed data ─── */
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "DEPOSIT" || t.type === "REFUND")
        .reduce((s, t) => s + parseFloat(t.amount), 0),
    [transactions],
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter(
          (t) =>
            t.type === "PAYMENT" ||
            t.type === "WITHDRAWAL" ||
            t.type === "TRANSFER",
        )
        .reduce((s, t) => s + parseFloat(t.amount), 0),
    [transactions],
  );
  const balance = activity ? parseFloat(activity.activityMoney) : 0;

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (filterType !== "ALL") {
      list = list.filter((t) => t.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.nameCuate.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.bankName && t.bankName.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [transactions, filterType, searchQuery]);

  /* ─── Type distribution for donut chart ─── */
  const typeDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      map[t.type] = (map[t.type] || 0) + parseFloat(t.amount);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    const colors: Record<string, string> = {
      DEPOSIT: "#10b981",
      WITHDRAWAL: "#ef4444",
      TRANSFER: "#3b82f6",
      PAYMENT: "#f59e0b",
      REFUND: "#8b5cf6",
    };
    const entries = Object.entries(map)
      .map(([type, amount]) => ({
        type,
        amount,
        pct: total > 0 ? (amount / total) * 100 : 0,
        color: colors[type] || "#94a3b8",
      }))
      .sort((a, b) => b.amount - a.amount);
    return { entries, total };
  }, [transactions]);

  /* ─── Bar chart data ─── */
  const barData = useMemo(() => groupByDate(transactions), [transactions]);
  const barMax = useMemo(
    () => Math.max(...barData.map((d) => Math.max(d.income, d.expense)), 1),
    [barData],
  );

  /* ─── Status distribution ─── */
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      map[t.status] = (map[t.status] || 0) + 1;
    });
    return map;
  }, [transactions]);

  /* ─── Donut conic-gradient ─── */
  const donutGradient = useMemo(() => {
    if (typeDistribution.entries.length === 0)
      return "conic-gradient(#e5ebf6 0deg 360deg)";
    let acc = 0;
    const stops = typeDistribution.entries.map((e) => {
      const start = acc;
      acc += (e.pct / 100) * 360;
      return `${e.color} ${start}deg ${acc}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [typeDistribution]);

  /* ─── Export CSV ─── */
  function exportCSV() {
    const header = "Nombre,Tipo,Monto,Estado,Fecha,Descripcion,Banco,Cuenta\n";
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.nameCuate}","${TYPE_LABELS[t.type]}","${t.amount}","${STATUS_LABELS[t.status]}","${formatDate(t.date)}","${t.description || ""}","${t.bankName || ""}","${t.accountNumber || ""}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${activity?.name || "actividad"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── Render ─── */
  if (loading) {
    return (
      <section className="ar">
        <div className="ar__loading">
          <div className="ar__loading-ring">
            <div />
            <div />
            <div />
            <div />
          </div>
          <span>Cargando reporte...</span>
        </div>
      </section>
    );
  }

  if (error && !activity) {
    return (
      <section className="ar">
        <div className="ar__error">{error}</div>
        <button className="ar__back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </section>
    );
  }

  if (!activity) return null;

  const createdDate = formatDate(activity.createdAt);

  return (
    <section className="ar">
      {/* ─── Top bar ─── */}
      <div className="ar__topbar ar__stagger-1">
        <button className="ar__back" onClick={() => navigate(-1)} type="button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Volver a actividad</span>
        </button>
        <div className="ar__topbar-right">
          <button className="ar__export-btn" onClick={exportCSV} type="button">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* ─── Page header ─── */}
      <div className="ar__page-header ar__stagger-2">
        <div className="ar__page-header-glow" />
        <div className="ar__page-header-glow2" />
        <div className="ar__page-header-content">
          <div className="ar__page-icon">{activity.name.charAt(0)}</div>
          <div className="ar__page-info">
            <span className="ar__page-eyebrow">Reporte financiero</span>
            <h1 className="ar__page-title">{activity.name}</h1>
            {activity.description && (
              <p className="ar__page-subtitle">{activity.description}</p>
            )}
            <div className="ar__page-date-range">
              <span className="ar__page-date-badge">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Desde {createdDate}
              </span>
              <span className="ar__page-date-badge">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {transactions.length} transacciones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Summary cards ─── */}
      <div className="ar__summary-grid ar__stagger-3">
        <div className="ar__summary-card ar__summary-card--balance">
          <div className="ar__summary-card-accent" />
          <div className="ar__summary-card-top">
            <span className="ar__summary-card-label">Saldo actual</span>
            <div className="ar__summary-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
          </div>
          <div className="ar__summary-card-value">{formatMoney(balance)}</div>
          <div className="ar__summary-card-sub">
            {activity.isActive ? "Actividad activa" : "Actividad inactiva"}
          </div>
        </div>

        <div className="ar__summary-card ar__summary-card--income">
          <div className="ar__summary-card-accent" />
          <div className="ar__summary-card-top">
            <span className="ar__summary-card-label">Ingresos totales</span>
            <div className="ar__summary-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="ar__summary-card-value">
            {formatMoney(totalIncome)}
          </div>
          <div className="ar__summary-card-sub">
            <span className="ar__summary-card-trend is-up">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {
                transactions.filter(
                  (t) => t.type === "DEPOSIT" || t.type === "REFUND",
                ).length
              }{" "}
              depósitos
            </span>
          </div>
        </div>

        <div className="ar__summary-card ar__summary-card--expense">
          <div className="ar__summary-card-accent" />
          <div className="ar__summary-card-top">
            <span className="ar__summary-card-label">Egresos totales</span>
            <div className="ar__summary-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
          <div className="ar__summary-card-value">
            {formatMoney(totalExpense)}
          </div>
          <div className="ar__summary-card-sub">
            <span className="ar__summary-card-trend is-down">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
              {
                transactions.filter(
                  (t) => t.type === "PAYMENT" || t.type === "WITHDRAWAL",
                ).length
              }{" "}
              pagos
            </span>
          </div>
        </div>

        <div className="ar__summary-card ar__summary-card--count">
          <div className="ar__summary-card-accent" />
          <div className="ar__summary-card-top">
            <span className="ar__summary-card-label">Total movimientos</span>
            <div className="ar__summary-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
          </div>
          <div className="ar__summary-card-value">{transactions.length}</div>
          <div className="ar__summary-card-sub">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} style={{ marginRight: 8 }}>
                {STATUS_LABELS[status]}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className="ar__charts-grid ar__stagger-4">
        {/* Bar chart: income vs expense by day */}
        <div className="ar__chart-card">
          <div className="ar__chart-card-header">
            <span className="ar__chart-card-title">Ingresos vs Egresos</span>
            <span className="ar__chart-card-badge">
              Últimos {barData.length} períodos
            </span>
          </div>
          {barData.length > 0 ? (
            <div className="ar__bar-chart">
              {barData.map((d, i) => (
                <div key={i} className="ar__bar-col">
                  <div className="ar__bar-col-bars">
                    <div
                      className="ar__bar ar__bar--income"
                      style={{
                        height: `${Math.max((d.income / barMax) * 100, 6)}%`,
                      }}
                    >
                      <span className="ar__bar-tooltip">
                        {formatMoney(d.income)}
                      </span>
                    </div>
                    <div
                      className="ar__bar ar__bar--expense"
                      style={{
                        height: `${Math.max((d.expense / barMax) * 100, 6)}%`,
                      }}
                    >
                      <span className="ar__bar-tooltip">
                        {formatMoney(d.expense)}
                      </span>
                    </div>
                  </div>
                  <span className="ar__bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--muted)",
                padding: "40px 0",
                fontSize: ".88rem",
              }}
            >
              Sin datos para graficar
            </div>
          )}
        </div>

        {/* Donut chart: type distribution */}
        <div className="ar__chart-card">
          <div className="ar__chart-card-header">
            <span className="ar__chart-card-title">Distribución por tipo</span>
            <span className="ar__chart-card-badge">
              {typeDistribution.entries.length} tipos
            </span>
          </div>
          <div className="ar__donut-container">
            <div className="ar__donut">
              <div
                className="ar__donut-ring"
                style={{
                  background: donutGradient,
                  mask: "radial-gradient(circle, transparent 55%, black 55.5%)",
                  WebkitMask:
                    "radial-gradient(circle, transparent 55%, black 55.5%)",
                }}
              />
              <div className="ar__donut-center">
                <span className="ar__donut-center-value">
                  {formatMoney(typeDistribution.total)}
                </span>
                <span className="ar__donut-center-label">Total</span>
              </div>
            </div>
            <div className="ar__donut-legend">
              {typeDistribution.entries.map((e) => (
                <div key={e.type} className="ar__donut-legend-item">
                  <div
                    className="ar__donut-legend-color"
                    style={{ background: e.color }}
                  />
                  <div className="ar__donut-legend-info">
                    <span className="ar__donut-legend-name">
                      {TYPE_LABELS[e.type]}
                    </span>
                    <span className="ar__donut-legend-value">
                      {formatMoney(e.amount)} · {e.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="ar__filters ar__stagger-5">
        <span className="ar__filters-label">Filtrar:</span>
        {(
          [
            "ALL",
            "DEPOSIT",
            "WITHDRAWAL",
            "TRANSFER",
            "PAYMENT",
            "REFUND",
          ] as FilterType[]
        ).map((type) => (
          <button
            key={type}
            className={`ar__filter-chip ${filterType === type ? "is-active" : ""}`}
            onClick={() => setFilterType(type)}
            type="button"
          >
            {type === "ALL" ? "Todos" : TYPE_LABELS[type]}
          </button>
        ))}
        <div className="ar__filter-search">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Transaction table ─── */}
      <div className="ar__table-card ar__stagger-6">
        <div className="ar__table-header">
          <span className="ar__table-title">Detalle de transacciones</span>
          <span className="ar__table-count">
            {filteredTransactions.length} de {transactions.length} registros
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="ar__table-empty">
            <div className="ar__table-empty-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <h3>Sin resultados</h3>
            <p>
              {searchQuery || filterType !== "ALL"
                ? "No se encontraron transacciones con los filtros aplicados."
                : "Aún no hay transacciones registradas en esta actividad."}
            </p>
          </div>
        ) : (
          <table className="ar__table">
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === "DEPOSIT" || tx.type === "REFUND";
                return (
                  <tr key={tx.id}>
                    <td>
                      <div className="ar__table-tx-info">
                        <div
                          className={`ar__table-tx-indicator ${isIncome ? "is-income" : "is-expense"}`}
                        >
                          {TYPE_ICONS[tx.type] || "•"}
                        </div>
                        <div className="ar__table-tx-details">
                          <span className="ar__table-tx-name">
                            {tx.nameCuate}
                          </span>
                          {tx.description && (
                            <span className="ar__table-tx-desc">
                              {tx.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ar__table-type-badge ar__table-type-badge--${tx.type}`}
                      >
                        {TYPE_LABELS[tx.type]}
                      </span>
                    </td>
                    <td>
                      <span className="ar__table-date">
                        {formatShortDate(tx.date)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`ar__table-status ar__table-status--${tx.status.toLowerCase()}`}
                      >
                        {STATUS_LABELS[tx.status]}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`ar__table-amount ${isIncome ? "is-income" : "is-expense"}`}
                      >
                        {isIncome ? "+" : "−"}
                        {formatMoney(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
