/**
 * Calculator Service
 * ──────────────────
 * AI-powered budget calculator that helps entrepreneurs evaluate
 * whether a new product venture is financially viable.
 *
 * It performs:
 *  - Cost breakdown analysis
 *  - Break-even analysis
 *  - Profitability scoring
 *  - Risk assessment
 *  - AI-generated recommendations
 */

export interface BudgetInput {
  productName: string;
  category: string;
  /** Costo unitario de producción / adquisición */
  unitCost: number;
  /** Precio de venta unitario deseado */
  sellingPrice: number;
  /** Costos fijos mensuales (alquiler, servicios, sueldos, etc.) */
  fixedCosts: number;
  /** Costos variables adicionales por unidad (empaque, envío, etc.) */
  variableCostPerUnit: number;
  /** Unidades estimadas de venta por mes */
  estimatedMonthlySales: number;
  /** Inversión inicial */
  initialInvestment: number;
  /** Canal de venta principal */
  salesChannel: string;
  /** Horizonte de análisis en meses (default 12) */
  analysisMonths?: number;
}

export interface CostBreakdown {
  totalUnitCost: number;
  marginPerUnit: number;
  marginPercentage: number;
  monthlyFixedCosts: number;
  monthlyVariableCosts: number;
  monthlyTotalCosts: number;
  monthlyRevenue: number;
  monthlyProfit: number;
}

export interface BreakEvenAnalysis {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  breakEvenMonths: number;
  investmentRecoveryMonths: number;
}

export interface RiskAssessment {
  overallRisk: "bajo" | "medio" | "alto" | "muy alto";
  riskScore: number; // 0-100
  factors: Array<{
    name: string;
    level: "bajo" | "medio" | "alto";
    description: string;
  }>;
}

export interface Recommendation {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
}

export interface Projection {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
}

export interface BudgetResult {
  productName: string;
  category: string;
  viabilityScore: number; // 0-100
  viabilityLabel: string;
  costBreakdown: CostBreakdown;
  breakEven: BreakEvenAnalysis;
  risk: RiskAssessment;
  recommendations: Recommendation[];
  projections: Projection[];
  summary: string;
}

// ─── AI Analysis Logic ───────────────────────────────────────────────

function computeCostBreakdown(input: BudgetInput): CostBreakdown {
  const totalUnitCost = input.unitCost + input.variableCostPerUnit;
  const marginPerUnit = input.sellingPrice - totalUnitCost;
  const marginPercentage =
    input.sellingPrice > 0 ? (marginPerUnit / input.sellingPrice) * 100 : 0;
  const monthlyVariableCosts =
    totalUnitCost * input.estimatedMonthlySales;
  const monthlyTotalCosts = input.fixedCosts + monthlyVariableCosts;
  const monthlyRevenue = input.sellingPrice * input.estimatedMonthlySales;
  const monthlyProfit = monthlyRevenue - monthlyTotalCosts;

  return {
    totalUnitCost,
    marginPerUnit,
    marginPercentage,
    monthlyFixedCosts: input.fixedCosts,
    monthlyVariableCosts,
    monthlyTotalCosts,
    monthlyRevenue,
    monthlyProfit,
  };
}

function computeBreakEven(
  input: BudgetInput,
  costBreakdown: CostBreakdown,
): BreakEvenAnalysis {
  const marginPerUnit = costBreakdown.marginPerUnit;

  const breakEvenUnits =
    marginPerUnit > 0 ? Math.ceil(input.fixedCosts / marginPerUnit) : Infinity;

  const breakEvenRevenue =
    breakEvenUnits === Infinity
      ? Infinity
      : breakEvenUnits * input.sellingPrice;

  const breakEvenMonths =
    input.estimatedMonthlySales > 0 && breakEvenUnits !== Infinity
      ? Math.ceil(breakEvenUnits / input.estimatedMonthlySales)
      : Infinity;

  const monthlyProfit = costBreakdown.monthlyProfit;
  const investmentRecoveryMonths =
    monthlyProfit > 0
      ? Math.ceil(input.initialInvestment / monthlyProfit)
      : Infinity;

  return {
    breakEvenUnits: breakEvenUnits === Infinity ? -1 : breakEvenUnits,
    breakEvenRevenue: breakEvenRevenue === Infinity ? -1 : breakEvenRevenue,
    breakEvenMonths: breakEvenMonths === Infinity ? -1 : breakEvenMonths,
    investmentRecoveryMonths:
      investmentRecoveryMonths === Infinity ? -1 : investmentRecoveryMonths,
  };
}

function assessRisk(
  input: BudgetInput,
  costBreakdown: CostBreakdown,
  breakEven: BreakEvenAnalysis,
): RiskAssessment {
  const factors: RiskAssessment["factors"] = [];
  let riskScore = 0;

  // 1. Margin risk
  if (costBreakdown.marginPercentage < 15) {
    factors.push({
      name: "Margen de ganancia bajo",
      level: "alto",
      description: `Tu margen es ${costBreakdown.marginPercentage.toFixed(1)}%. Se recomienda al menos 30% para cubrir imprevistos.`,
    });
    riskScore += 30;
  } else if (costBreakdown.marginPercentage < 30) {
    factors.push({
      name: "Margen de ganancia moderado",
      level: "medio",
      description: `Tu margen es ${costBreakdown.marginPercentage.toFixed(1)}%. Es aceptable pero podrías optimizar costos.`,
    });
    riskScore += 15;
  } else {
    factors.push({
      name: "Margen de ganancia saludable",
      level: "bajo",
      description: `Tu margen es ${costBreakdown.marginPercentage.toFixed(1)}%. Excelente posición competitiva.`,
    });
    riskScore += 5;
  }

  // 2. Break-even timing risk
  if (breakEven.breakEvenMonths === -1 || breakEven.breakEvenMonths > 12) {
    factors.push({
      name: "Punto de equilibrio tardío",
      level: "alto",
      description:
        breakEven.breakEvenMonths === -1
          ? "No se alcanza el punto de equilibrio con los datos actuales."
          : `Necesitas ${breakEven.breakEvenMonths} meses para alcanzar el punto de equilibrio.`,
    });
    riskScore += 25;
  } else if (breakEven.breakEvenMonths > 6) {
    factors.push({
      name: "Punto de equilibrio moderado",
      level: "medio",
      description: `Necesitas ${breakEven.breakEvenMonths} meses para el punto de equilibrio.`,
    });
    riskScore += 12;
  } else {
    factors.push({
      name: "Punto de equilibrio rápido",
      level: "bajo",
      description: `Alcanzas equilibrio en ${breakEven.breakEvenMonths} meses. Muy buena señal.`,
    });
    riskScore += 3;
  }

  // 3. Investment recovery risk
  if (
    breakEven.investmentRecoveryMonths === -1 ||
    breakEven.investmentRecoveryMonths > 18
  ) {
    factors.push({
      name: "Recuperación de inversión lenta",
      level: "alto",
      description:
        breakEven.investmentRecoveryMonths === -1
          ? "La inversión no se recupera con los datos actuales."
          : `Necesitas ${breakEven.investmentRecoveryMonths} meses para recuperar la inversión.`,
    });
    riskScore += 25;
  } else if (breakEven.investmentRecoveryMonths > 9) {
    factors.push({
      name: "Recuperación de inversión moderada",
      level: "medio",
      description: `Recuperas la inversión en ${breakEven.investmentRecoveryMonths} meses.`,
    });
    riskScore += 12;
  } else {
    factors.push({
      name: "Recuperación de inversión rápida",
      level: "bajo",
      description: `Recuperas la inversión en ${breakEven.investmentRecoveryMonths} meses. Excelente.`,
    });
    riskScore += 3;
  }

  // 4. Fixed costs proportion
  const fixedCostRatio =
    costBreakdown.monthlyTotalCosts > 0
      ? (input.fixedCosts / costBreakdown.monthlyTotalCosts) * 100
      : 0;
  if (fixedCostRatio > 70) {
    factors.push({
      name: "Alta dependencia de costos fijos",
      level: "alto",
      description: `Los costos fijos representan ${fixedCostRatio.toFixed(0)}% del total. Reduce apalancamiento operativo.`,
    });
    riskScore += 20;
  } else if (fixedCostRatio > 45) {
    factors.push({
      name: "Costos fijos moderados",
      level: "medio",
      description: `Los costos fijos representan ${fixedCostRatio.toFixed(0)}% del total.`,
    });
    riskScore += 10;
  } else {
    factors.push({
      name: "Estructura de costos flexible",
      level: "bajo",
      description: `Los costos fijos son solo ${fixedCostRatio.toFixed(0)}% del total. Buena flexibilidad.`,
    });
    riskScore += 3;
  }

  riskScore = Math.min(100, riskScore);

  let overallRisk: RiskAssessment["overallRisk"];
  if (riskScore <= 25) overallRisk = "bajo";
  else if (riskScore <= 50) overallRisk = "medio";
  else if (riskScore <= 75) overallRisk = "alto";
  else overallRisk = "muy alto";

  return { overallRisk, riskScore, factors };
}

function generateRecommendations(
  input: BudgetInput,
  costBreakdown: CostBreakdown,
  breakEven: BreakEvenAnalysis,
  risk: RiskAssessment,
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Profitability
  if (costBreakdown.monthlyProfit > 0) {
    recs.push({
      type: "success",
      title: "Negocio potencialmente rentable",
      description: `Con las ventas estimadas, generarías Bs ${costBreakdown.monthlyProfit.toFixed(2)} de ganancia mensual. Esto indica una buena base para empezar.`,
    });
  } else {
    recs.push({
      type: "danger",
      title: "Operación con pérdidas",
      description: `Con los datos actuales tendrías pérdidas de Bs ${Math.abs(costBreakdown.monthlyProfit).toFixed(2)}/mes. Debes subir el precio, reducir costos o aumentar volumen.`,
    });
  }

  // Margin advice
  if (costBreakdown.marginPercentage < 20) {
    recs.push({
      type: "warning",
      title: "Mejora tu margen de ganancia",
      description:
        "Negocia mejores precios con proveedores, optimiza el empaque o busca materiales alternativos para mejorar tu margen al menos al 30%.",
    });
  }

  // Volume advice
  if (
    breakEven.breakEvenUnits > 0 &&
    breakEven.breakEvenUnits > input.estimatedMonthlySales * 2
  ) {
    recs.push({
      type: "warning",
      title: "Necesitas más volumen de ventas",
      description: `Para cubrir costos fijos necesitas vender ${breakEven.breakEvenUnits} unidades/mes. Considera campañas de marketing o alianzas para acelerar las ventas.`,
    });
  }

  // Channel advice
  const channelTips: Record<string, string> = {
    whatsapp:
      "WhatsApp es ideal para ventas directas. Usa catálogos de WhatsApp Business y responde en menos de 15 min.",
    instagram:
      "Instagram es perfecto para productos visuales. Invierte en fotografía de producto y reels demostrativos.",
    web: "Un canal web requiere SEO y publicidad digital. Asegura que tu página cargue rápido y tenga pagos integrados.",
    presencial:
      "La venta presencial genera confianza. Prepara un pitch de 30 segundos y muestras de producto.",
    marketplace:
      "Los marketplaces dan visibilidad pero cobran comisión. Incluye ese costo en tu análisis.",
  };
  const tip = channelTips[input.salesChannel.toLowerCase()];
  if (tip) {
    recs.push({
      type: "info",
      title: `Consejo para canal: ${input.salesChannel}`,
      description: tip,
    });
  }

  // Investment advice
  if (breakEven.investmentRecoveryMonths > 0 && breakEven.investmentRecoveryMonths <= 6) {
    recs.push({
      type: "success",
      title: "Inversión de bajo riesgo",
      description: `Recuperas tu inversión inicial en ${breakEven.investmentRecoveryMonths} meses. Considera reinvertir ganancias para escalar.`,
    });
  } else if (breakEven.investmentRecoveryMonths > 12) {
    recs.push({
      type: "warning",
      title: "Inversión inicial alta",
      description:
        "Considera empezar con un MVP (producto mínimo viable) para validar el mercado antes de invertir más.",
    });
  }

  // Risk-based
  if (risk.overallRisk === "alto" || risk.overallRisk === "muy alto") {
    recs.push({
      type: "danger",
      title: "Riesgo elevado – valida antes de invertir",
      description:
        "Haz un piloto pequeño: vende 20-50 unidades antes de escalar producción. Mide la demanda real vs. tu estimado.",
    });
  }

  // Category-specific advice
  const categoryAdvice: Record<string, Recommendation> = {
    alimentos: {
      type: "info",
      title: "Sector alimentos",
      description:
        "Considera permisos sanitarios (SENASAG), fecha de vencimiento y cadena de frío. Calcula merma del 5-15%.",
    },
    tecnologia: {
      type: "info",
      title: "Sector tecnología",
      description:
        "Evalúa garantías, soporte post-venta y obsolescencia. Los clientes esperan actualizaciones y servicio técnico.",
    },
    moda: {
      type: "info",
      title: "Sector moda",
      description:
        "Maneja tallas y colores como SKUs separados. Calcula devoluciones del 10-20% y temporadas de descuento.",
    },
    servicios: {
      type: "info",
      title: "Sector servicios",
      description:
        "Tu principal costo es el tiempo. Calcula tu hora de trabajo y asegura que el precio cubra al menos 3x tu costo por hora.",
    },
    artesanias: {
      type: "info",
      title: "Sector artesanías",
      description:
        "Valora tu tiempo de producción. Muchos artesanos subvaloran su trabajo. El precio debe reflejar la exclusividad.",
    },
  };
  const catAdvice = categoryAdvice[input.category.toLowerCase()];
  if (catAdvice) {
    recs.push(catAdvice);
  }

  return recs;
}

function generateProjections(
  input: BudgetInput,
  costBreakdown: CostBreakdown,
): Projection[] {
  const months = input.analysisMonths ?? 12;
  const projections: Projection[] = [];
  let cumulativeProfit = -input.initialInvestment;

  for (let m = 1; m <= months; m++) {
    // Simulate a growth factor (5% monthly growth for optimistic scenario)
    const growthFactor = 1 + 0.03 * Math.min(m - 1, 12);
    const salesVolume = Math.round(input.estimatedMonthlySales * growthFactor);
    const revenue = salesVolume * input.sellingPrice;
    const variableCosts =
      salesVolume * (input.unitCost + input.variableCostPerUnit);
    const totalCosts = input.fixedCosts + variableCosts;
    const profit = revenue - totalCosts;
    cumulativeProfit += profit;

    projections.push({
      month: m,
      revenue: Math.round(revenue * 100) / 100,
      costs: Math.round(totalCosts * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
    });
  }
  return projections;
}

function computeViabilityScore(
  costBreakdown: CostBreakdown,
  breakEven: BreakEvenAnalysis,
  risk: RiskAssessment,
): { score: number; label: string } {
  let score = 50; // Base score

  // Margin contribution (+/-20 max)
  if (costBreakdown.marginPercentage >= 40) score += 20;
  else if (costBreakdown.marginPercentage >= 30) score += 15;
  else if (costBreakdown.marginPercentage >= 20) score += 8;
  else if (costBreakdown.marginPercentage >= 10) score += 0;
  else score -= 15;

  // Profit contribution (+/-15 max)
  if (costBreakdown.monthlyProfit > 0) score += 15;
  else score -= 20;

  // Break-even timing (+/-10 max)
  if (breakEven.breakEvenMonths > 0 && breakEven.breakEvenMonths <= 3)
    score += 10;
  else if (breakEven.breakEvenMonths > 0 && breakEven.breakEvenMonths <= 6)
    score += 5;
  else if (breakEven.breakEvenMonths > 12 || breakEven.breakEvenMonths === -1)
    score -= 10;

  // Risk adjustment
  score -= Math.round(risk.riskScore * 0.15);

  score = Math.max(0, Math.min(100, score));

  let label: string;
  if (score >= 80) label = "Excelente – ¡Adelante con confianza!";
  else if (score >= 60) label = "Viable – Buenas perspectivas con ajustes menores";
  else if (score >= 40) label = "Moderado – Requiere optimización importante";
  else if (score >= 20) label = "Difícil – Revisa el modelo de negocio";
  else label = "No viable – Replantea la estrategia completamente";

  return { score, label };
}

function generateSummary(
  input: BudgetInput,
  costBreakdown: CostBreakdown,
  breakEven: BreakEvenAnalysis,
  viabilityScore: number,
): string {
  const parts: string[] = [];

  parts.push(
    `Análisis del producto "${input.productName}" en la categoría ${input.category}.`,
  );

  if (costBreakdown.monthlyProfit > 0) {
    parts.push(
      `Con una estimación de ${input.estimatedMonthlySales} unidades/mes a Bs ${input.sellingPrice} cada una, proyectas ingresos de Bs ${costBreakdown.monthlyRevenue.toFixed(2)}/mes y una ganancia neta de Bs ${costBreakdown.monthlyProfit.toFixed(2)}/mes.`,
    );
  } else {
    parts.push(
      `Con los costos actuales, el negocio operaría con pérdidas de Bs ${Math.abs(costBreakdown.monthlyProfit).toFixed(2)}/mes. Se necesita ajustar precios o reducir costos.`,
    );
  }

  if (breakEven.breakEvenMonths > 0) {
    parts.push(
      `El punto de equilibrio se alcanza en ${breakEven.breakEvenMonths} meses (${breakEven.breakEvenUnits} unidades).`,
    );
  }

  if (breakEven.investmentRecoveryMonths > 0) {
    parts.push(
      `La inversión inicial de Bs ${input.initialInvestment.toFixed(2)} se recuperaría en aproximadamente ${breakEven.investmentRecoveryMonths} meses.`,
    );
  }

  parts.push(
    `Puntuación de viabilidad: ${viabilityScore}/100.`,
  );

  return parts.join(" ");
}

// ─── Main Service Function ───────────────────────────────────────────

export function analyzeBudget(input: BudgetInput): BudgetResult {
  const costBreakdown = computeCostBreakdown(input);
  const breakEven = computeBreakEven(input, costBreakdown);
  const risk = assessRisk(input, costBreakdown, breakEven);
  const recommendations = generateRecommendations(
    input,
    costBreakdown,
    breakEven,
    risk,
  );
  const projections = generateProjections(input, costBreakdown);
  const { score, label } = computeViabilityScore(
    costBreakdown,
    breakEven,
    risk,
  );
  const summary = generateSummary(input, costBreakdown, breakEven, score);

  return {
    productName: input.productName,
    category: input.category,
    viabilityScore: score,
    viabilityLabel: label,
    costBreakdown,
    breakEven,
    risk,
    recommendations,
    projections,
    summary,
  };
}
