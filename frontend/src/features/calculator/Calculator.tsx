import { useState } from "react";
import "./Calculator.css";

/* ─── Types ───────────────────────────────────────────────────────── */

interface CostBreakdown {
  totalUnitCost: number;
  marginPerUnit: number;
  marginPercentage: number;
  monthlyFixedCosts: number;
  monthlyVariableCosts: number;
  monthlyTotalCosts: number;
  monthlyRevenue: number;
  monthlyProfit: number;
}

interface BreakEvenAnalysis {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  breakEvenMonths: number;
  investmentRecoveryMonths: number;
}

interface RiskFactor {
  name: string;
  level: "bajo" | "medio" | "alto";
  description: string;
}

interface RiskAssessment {
  overallRisk: "bajo" | "medio" | "alto" | "muy alto";
  riskScore: number;
  factors: RiskFactor[];
}

interface Recommendation {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
}

interface Projection {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
}

interface BudgetResult {
  productName: string;
  category: string;
  viabilityScore: number;
  viabilityLabel: string;
  costBreakdown: CostBreakdown;
  breakEven: BreakEvenAnalysis;
  risk: RiskAssessment;
  recommendations: Recommendation[];
  projections: Projection[];
  summary: string;
}

/* ─── Constants ───────────────────────────────────────────────────── */

const CATEGORIES = [
  { value: "alimentos", label: "🍽️ Alimentos y bebidas" },
  { value: "moda", label: "👗 Moda y textiles" },
  { value: "tecnologia", label: "💻 Tecnología" },
  { value: "servicios", label: "🛠️ Servicios" },
  { value: "artesanias", label: "🎨 Artesanías" },
  { value: "salud", label: "💊 Salud y bienestar" },
  { value: "educacion", label: "📚 Educación" },
  { value: "otro", label: "📦 Otro" },
];

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "web", label: "Tienda web" },
  { value: "presencial", label: "Presencial" },
  { value: "marketplace", label: "Marketplace" },
];

const QUICK_TIPS = [
  {
    icon: "🎯",
    title: "Define tu margen ideal",
    description:
      "Un margen mínimo del 30% te da espacio para descuentos y costos inesperados.",
  },
  {
    icon: "📊",
    title: "Conoce tu punto de equilibrio",
    description:
      "Saber cuántas unidades debes vender para cubrir costos es fundamental.",
  },
  {
    icon: "💡",
    title: "Empieza con un MVP",
    description:
      "Valida tu producto con una versión mínima antes de invertir en producción masiva.",
  },
  {
    icon: "🔄",
    title: "Itera rápido",
    description:
      "Ajusta precios y costos según la respuesta real del mercado.",
  },
];

const API_BASE = "http://localhost:3000/api";

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatBs(value: number): string {
  return `Bs ${value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getViabilityColor(score: number): string {
  if (score >= 80) return "#2ecc71";
  if (score >= 60) return "#44c2f4";
  if (score >= 40) return "#f39c12";
  if (score >= 20) return "#e67e22";
  return "#e74c3c";
}

function getRecIcon(type: string): string {
  switch (type) {
    case "success":
      return "✅";
    case "warning":
      return "⚠️";
    case "danger":
      return "🚨";
    case "info":
      return "💡";
    default:
      return "📌";
  }
}

/* ─── Component ───────────────────────────────────────────────────── */

export function Calculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BudgetResult | null>(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("alimentos");
  const [unitCost, setUnitCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("");
  const [estimatedMonthlySales, setEstimatedMonthlySales] = useState("");
  const [initialInvestment, setInitialInvestment] = useState("");
  const [salesChannel, setSalesChannel] = useState("whatsapp");

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!productName.trim()) {
      setError("Ingresa el nombre de tu producto");
      return;
    }

    const payload = {
      productName,
      category,
      unitCost: Number(unitCost) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      fixedCosts: Number(fixedCosts) || 0,
      variableCostPerUnit: Number(variableCostPerUnit) || 0,
      estimatedMonthlySales: Number(estimatedMonthlySales) || 0,
      initialInvestment: Number(initialInvestment) || 0,
      salesChannel,
      analysisMonths: 12,
    };

    if (payload.sellingPrice <= 0) {
      setError("El precio de venta debe ser mayor a cero");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/calculator/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Error al analizar");
        return;
      }

      setResult(data.data);
    } catch {
      setError("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
    } finally {
      setLoading(false);
    }
  };

  // SVG ring calculations
  const ringRadius = 65;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = result
    ? ringCircumference - (result.viabilityScore / 100) * ringCircumference
    : ringCircumference;

  return (
    <section className="calculator" id="calculator-view">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">
            Calculadora IA
          </span>
          <h2>Presupuesto de producto</h2>
        </div>
        <p>
          Analiza la viabilidad financiera de tu próximo producto con
          inteligencia artificial. Toma decisiones basadas en datos.
        </p>
      </div>

      {/* ── Form + Tips ───────────────────────────────────────────── */}
      <div className="calc-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Datos del producto</span>
              <h3>Completa la información</h3>
            </div>
            <span className="panel__badge">Paso 1</span>
          </div>

          <div className="calc-form__fields">
            <label className="full-width">
              Nombre del producto
              <input
                id="calc-product-name"
                type="text"
                placeholder="Ej: Mermelada artesanal de frutilla"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </label>

            <label>
              Categoría
              <select
                id="calc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Canal de venta
              <select
                id="calc-channel"
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Costo unitario de producción (Bs)
              <input
                id="calc-unit-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 15.00"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
              />
              <span className="input-hint">
                Cuánto te cuesta producir o comprar cada unidad
              </span>
            </label>

            <label>
              Precio de venta (Bs)
              <input
                id="calc-selling-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 35.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
              <span className="input-hint">
                Precio al que venderás cada unidad
              </span>
            </label>

            <label>
              Costos variables por unidad (Bs)
              <input
                id="calc-variable-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 3.00"
                value={variableCostPerUnit}
                onChange={(e) => setVariableCostPerUnit(e.target.value)}
              />
              <span className="input-hint">
                Empaque, envío, comisiones, etc.
              </span>
            </label>

            <label>
              Costos fijos mensuales (Bs)
              <input
                id="calc-fixed-costs"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 2000.00"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
              />
              <span className="input-hint">
                Alquiler, servicios, sueldos, internet
              </span>
            </label>

            <label>
              Ventas estimadas por mes
              <input
                id="calc-monthly-sales"
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 200"
                value={estimatedMonthlySales}
                onChange={(e) => setEstimatedMonthlySales(e.target.value)}
              />
              <span className="input-hint">
                Cuántas unidades esperas vender al mes
              </span>
            </label>

            <label className="full-width">
              Inversión inicial (Bs)
              <input
                id="calc-initial-investment"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 5000.00"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
              />
              <span className="input-hint">
                Maquinaria, materia prima inicial, diseño de marca, etc.
              </span>
            </label>

            {error && (
              <div className="calc-error full-width">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="button"
              className="calc-analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
              id="calc-analyze-button"
            >
              {loading ? (
                <>
                  <span className="calc-spinner" />
                  Analizando con IA…
                </>
              ) : (
                <>
                  <span className="btn-icon">🤖</span>
                  Analizar viabilidad con IA
                </>
              )}
            </button>
          </div>
        </article>

        {/* ── Quick Tips Sidebar ──────────────────────────────────── */}
        <article className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Guía rápida</span>
              <h3>Tips para emprender</h3>
            </div>
          </div>

          <div className="calc-tips">
            {QUICK_TIPS.map((tip) => (
              <div key={tip.title} className="calc-tip-card">
                <div className="calc-tip-card__icon">{tip.icon}</div>
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      {result && (
        <div className="calc-results" id="calculator-results">
          {/* Viability Score */}
          <article className="panel calc-viability">
            <div className="viability-ring">
              <svg viewBox="0 0 150 150">
                <circle
                  className="viability-ring__bg"
                  cx="75"
                  cy="75"
                  r={ringRadius}
                />
                <circle
                  className="viability-ring__fill"
                  cx="75"
                  cy="75"
                  r={ringRadius}
                  stroke={getViabilityColor(result.viabilityScore)}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="viability-ring__label">
                <span
                  className="viability-ring__score"
                  style={{ color: getViabilityColor(result.viabilityScore) }}
                >
                  {result.viabilityScore}
                </span>
                <span className="viability-ring__unit">de 100</span>
              </div>
            </div>
            <h3>{result.viabilityLabel}</h3>
            <p>
              Puntuación de viabilidad para{" "}
              <strong>{result.productName}</strong>
            </p>
          </article>

          {/* Metrics Row */}
          <div className="calc-metrics">
            <article className="panel calc-metric">
              <div className="calc-metric__icon calc-metric__icon--revenue">
                💰
              </div>
              <span>Ingreso mensual</span>
              <strong>{formatBs(result.costBreakdown.monthlyRevenue)}</strong>
              <small>
                {result.costBreakdown.monthlyRevenue > 0 ? "proyectado" : "—"}
              </small>
            </article>

            <article className="panel calc-metric">
              <div className="calc-metric__icon calc-metric__icon--cost">
                📉
              </div>
              <span>Costo mensual total</span>
              <strong>
                {formatBs(result.costBreakdown.monthlyTotalCosts)}
              </strong>
              <small>fijos + variables</small>
            </article>

            <article className="panel calc-metric">
              <div className="calc-metric__icon calc-metric__icon--profit">
                📈
              </div>
              <span>Ganancia mensual</span>
              <strong
                style={{
                  color:
                    result.costBreakdown.monthlyProfit >= 0
                      ? "#2ecc71"
                      : "#e74c3c",
                }}
              >
                {formatBs(result.costBreakdown.monthlyProfit)}
              </strong>
              <small>
                {result.costBreakdown.monthlyProfit >= 0
                  ? "rentable"
                  : "en pérdida"}
              </small>
            </article>

            <article className="panel calc-metric">
              <div className="calc-metric__icon calc-metric__icon--margin">
                🎯
              </div>
              <span>Margen de ganancia</span>
              <strong>
                {result.costBreakdown.marginPercentage.toFixed(1)}%
              </strong>
              <small>por unidad</small>
            </article>
          </div>

          {/* Break-even + Risk */}
          <div className="calc-details-grid">
            <article className="panel">
              <div className="panel__header">
                <div>
                  <span className="panel__eyebrow">Punto de equilibrio</span>
                  <h3>¿Cuándo empiezas a ganar?</h3>
                </div>
              </div>
              <div className="calc-breakeven-items">
                <div className="calc-breakeven-item">
                  <span>Unidades para equilibrio</span>
                  <strong>
                    {result.breakEven.breakEvenUnits > 0
                      ? `${result.breakEven.breakEvenUnits} uds`
                      : "N/A"}
                  </strong>
                </div>
                <div className="calc-breakeven-item">
                  <span>Ingreso de equilibrio</span>
                  <strong>
                    {result.breakEven.breakEvenRevenue > 0
                      ? formatBs(result.breakEven.breakEvenRevenue)
                      : "N/A"}
                  </strong>
                </div>
                <div className="calc-breakeven-item">
                  <span>Meses al equilibrio</span>
                  <strong>
                    {result.breakEven.breakEvenMonths > 0
                      ? `${result.breakEven.breakEvenMonths} meses`
                      : "N/A"}
                  </strong>
                </div>
                <div className="calc-breakeven-item">
                  <span>Recuperar inversión</span>
                  <strong>
                    {result.breakEven.investmentRecoveryMonths > 0
                      ? `${result.breakEven.investmentRecoveryMonths} meses`
                      : "N/A"}
                  </strong>
                </div>
              </div>
            </article>

            <article className="panel">
              <div className="panel__header">
                <div>
                  <span className="panel__eyebrow">Evaluación de riesgo</span>
                  <h3>Análisis de factores</h3>
                </div>
              </div>
              <div
                className={`calc-risk-overall calc-risk-overall--${result.risk.overallRisk.split(" ")[0]}`}
              >
                <span>
                  {result.risk.overallRisk === "bajo"
                    ? "🟢"
                    : result.risk.overallRisk === "medio"
                      ? "🟡"
                      : result.risk.overallRisk === "alto"
                        ? "🔴"
                        : "🟣"}
                </span>
                Riesgo {result.risk.overallRisk} ({result.risk.riskScore}
                /100)
              </div>
              <div className="calc-risk-factors">
                {result.risk.factors.map((factor) => (
                  <div key={factor.name} className="calc-risk-factor">
                    <div className="calc-risk-factor__head">
                      <span
                        className={`calc-risk-factor__dot calc-risk-factor__dot--${factor.level}`}
                      />
                      <strong>{factor.name}</strong>
                    </div>
                    <p>{factor.description}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Recommendations */}
          <article className="panel">
            <div className="panel__header">
              <div>
                <span className="panel__eyebrow">
                  Recomendaciones IA
                </span>
                <h3>Plan de acción sugerido</h3>
              </div>
              <span className="panel__badge">
                {result.recommendations.length} consejos
              </span>
            </div>
            <div className="calc-recommendations">
              {result.recommendations.map((rec) => (
                <div
                  key={rec.title}
                  className={`calc-recommendation calc-recommendation--${rec.type}`}
                >
                  <div className="calc-recommendation__icon">
                    {getRecIcon(rec.type)}
                  </div>
                  <div className="calc-recommendation__body">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Projections */}
          <article className="panel">
            <div className="panel__header">
              <div>
                <span className="panel__eyebrow">Proyección a 12 meses</span>
                <h3>Ingresos vs. costos</h3>
              </div>
              <span className="panel__badge">
                {result.projections[11]?.cumulativeProfit >= 0
                  ? "✅ Rentable"
                  : "⚠️ En pérdida"}
              </span>
            </div>
            <div className="calc-projections">
              <div className="calc-projections-chart">
                {result.projections.map((proj) => {
                  const maxVal = Math.max(
                    ...result.projections.map((p) =>
                      Math.max(p.revenue, p.costs),
                    ),
                  );
                  const revH =
                    maxVal > 0 ? (proj.revenue / maxVal) * 220 : 10;
                  const costH =
                    maxVal > 0 ? (proj.costs / maxVal) * 220 : 10;

                  return (
                    <div key={proj.month} className="calc-proj-bar">
                      <div className="calc-proj-bar__col">
                        <div
                          className="calc-proj-bar__revenue"
                          style={{ height: `${revH}px` }}
                          title={`Ingresos: ${formatBs(proj.revenue)}`}
                        />
                        <div
                          className="calc-proj-bar__cost"
                          style={{ height: `${costH}px` }}
                          title={`Costos: ${formatBs(proj.costs)}`}
                        />
                      </div>
                      <span>M{proj.month}</span>
                      <strong
                        style={{
                          color:
                            proj.profit >= 0 ? "#2ecc71" : "#e74c3c",
                        }}
                      >
                        {proj.profit >= 0 ? "+" : ""}
                        {formatBs(proj.profit)}
                      </strong>
                    </div>
                  );
                })}
              </div>
              <div className="calc-proj-legend">
                <span className="legend-revenue">Ingresos</span>
                <span className="legend-cost">Costos</span>
              </div>
            </div>
          </article>

          {/* Summary */}
          <div className="calc-summary">
            <div className="calc-summary__icon">🤖</div>
            <h3>Resumen del análisis IA</h3>
            <p>{result.summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}
