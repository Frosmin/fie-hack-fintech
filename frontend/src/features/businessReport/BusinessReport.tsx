import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE as API } from "../../lib/api";
import "./BusinessReport.css";

interface Business { id: string; name: string; description: string | null; BusinessMoney: string; isActive: boolean; createdAt: string; }
interface Activity { id: string; name: string; description: string | null; activityMoney: string; isActive: boolean; businessId: string; }
interface Transaction { id: string; nameCuate: string; amount: string; type: "DEPOSIT"|"WITHDRAWAL"|"TRANSFER"|"PAYMENT"|"REFUND"; description: string | null; date: string; status: "PENDING"|"COMPLETED"|"FAILED"|"CANCELLED"; bankName: string | null; accountNumber: string | null; activityId: string; createdAt: string; }

const TYPE_LABELS: Record<string,string> = { DEPOSIT:"Depósito", WITHDRAWAL:"Retiro", TRANSFER:"Transferencia", PAYMENT:"Pago", REFUND:"Reembolso" };
const STATUS_LABELS: Record<string,string> = { PENDING:"Pendiente", COMPLETED:"Completado", FAILED:"Fallido", CANCELLED:"Cancelado" };
const TYPE_ICONS: Record<string,string> = { DEPOSIT:"↓", WITHDRAWAL:"↑", TRANSFER:"⇄", PAYMENT:"💳", REFUND:"↩" };
type FilterType = "ALL"|"DEPOSIT"|"WITHDRAWAL"|"TRANSFER"|"PAYMENT"|"REFUND";

const ACTIVITY_COLORS = ["#ee008a","#005ba7","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#ec4899","#14b8a6","#f97316"];

function fmt(v: string|number) { return new Intl.NumberFormat("es-BO",{style:"currency",currency:"BOB"}).format(typeof v==="string"?parseFloat(v):v); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("es-BO",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}); }
function fmtShort(d: string) { return new Date(d).toLocaleDateString("es-BO",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }

function groupByDate(txs: Transaction[]) {
  const m = new Map<string,{income:number;expense:number;label:string}>();
  txs.forEach(tx => {
    const k = new Date(tx.date).toLocaleDateString("es-BO",{day:"2-digit",month:"short"});
    const e = m.get(k)||{income:0,expense:0,label:k};
    const a = parseFloat(tx.amount);
    if (tx.type==="DEPOSIT"||tx.type==="REFUND") e.income+=a; else e.expense+=a;
    m.set(k,e);
  });
  return Array.from(m.values()).slice(-7);
}

export function BusinessReport() {
  const { bizId } = useParams<{bizId:string}>();
  const nav = useNavigate();
  const [biz, setBiz] = useState<Business|null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allTx, setAllTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("auth_token");

  const fetchData = useCallback(async () => {
    try {
      const [bizRes, actRes] = await Promise.all([
        fetch(`${API}/business/${bizId}`,{headers:{Authorization:`Bearer ${token}`}}),
        fetch(`${API}/activities?businessId=${bizId}`,{headers:{Authorization:`Bearer ${token}`}}),
      ]);
      if (!bizRes.ok) throw new Error("No se pudo cargar el negocio");
      const bizData = await bizRes.json();
      setBiz(bizData);
      const actData: Activity[] = actRes.ok ? await actRes.json() : [];
      setActivities(actData);
      // Fetch transactions for each activity
      const txPromises = actData.map(a =>
        fetch(`${API}/transactions?activityId=${a.id}`,{headers:{Authorization:`Bearer ${token}`}})
          .then(r => r.ok ? r.json() : []).catch(() => [])
      );
      const txArrays = await Promise.all(txPromises);
      setAllTx(txArrays.flat());
    } catch { setError("Error al cargar datos del negocio"); }
  },[bizId,token]);

  useEffect(() => { setLoading(true); fetchData().finally(()=>setLoading(false)); },[fetchData]);

  // Computed
  const totalBalance = useMemo(()=> activities.reduce((s,a)=>s+parseFloat(a.activityMoney||"0"),0),[activities]);
  const totalIncome = useMemo(()=> allTx.filter(t=>t.type==="DEPOSIT"||t.type==="REFUND").reduce((s,t)=>s+parseFloat(t.amount),0),[allTx]);
  const totalExpense = useMemo(()=> allTx.filter(t=>t.type==="PAYMENT"||t.type==="WITHDRAWAL").reduce((s,t)=>s+parseFloat(t.amount),0),[allTx]);

  // Activity name map
  const actMap = useMemo(()=> {const m: Record<string,string>={}; activities.forEach(a=>{m[a.id]=a.name}); return m;},[activities]);

  // Filtered
  const filtered = useMemo(()=> {
    let list = allTx;
    if (filterType!=="ALL") list = list.filter(t=>t.type===filterType);
    if (search.trim()) { const q=search.toLowerCase(); list=list.filter(t=>t.nameCuate.toLowerCase().includes(q)||(t.description&&t.description.toLowerCase().includes(q))); }
    return list;
  },[allTx,filterType,search]);

  // Bar chart
  const barData = useMemo(()=>groupByDate(allTx),[allTx]);
  const barMax = useMemo(()=>Math.max(...barData.map(d=>Math.max(d.income,d.expense)),1),[barData]);

  // Donut: per-activity distribution
  const actDistribution = useMemo(()=>{
    const total = activities.reduce((s,a)=>s+Math.abs(parseFloat(a.activityMoney||"0")),0);
    return activities.map((a,i)=>({name:a.name,amount:parseFloat(a.activityMoney||"0"),pct:total>0?(Math.abs(parseFloat(a.activityMoney||"0"))/total)*100:0,color:ACTIVITY_COLORS[i%ACTIVITY_COLORS.length]}));
  },[activities]);

  const donutGradient = useMemo(()=>{
    if (!actDistribution.length) return "conic-gradient(#e5ebf6 0deg 360deg)";
    let acc=0;
    return `conic-gradient(${actDistribution.map(e=>{const s=acc;acc+=(e.pct/100)*360;return `${e.color} ${s}deg ${acc}deg`;}).join(", ")})`;
  },[actDistribution]);

  // Activity bar breakdown
  const actBarTotal = useMemo(()=>activities.reduce((s,a)=>s+Math.abs(parseFloat(a.activityMoney||"0")),0),[activities]);

  // Export
  function exportCSV() {
    const h="Contacto,Actividad,Tipo,Monto,Estado,Fecha,Descripcion\n";
    const r=filtered.map(t=>`"${t.nameCuate}","${actMap[t.activityId]||""}","${TYPE_LABELS[t.type]}","${t.amount}","${STATUS_LABELS[t.status]}","${fmtDate(t.date)}","${t.description||""}"`).join("\n");
    const b=new Blob([h+r],{type:"text/csv;charset=utf-8;"});
    const u=URL.createObjectURL(b);
    const a=document.createElement("a"); a.href=u; a.download=`reporte-${biz?.name||"negocio"}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(u);
  }

  if (loading) return <section className="br"><div className="br__loading"><div className="br__loading-ring"><div/><div/><div/><div/></div><span>Cargando reporte...</span></div></section>;
  if (error&&!biz) return <section className="br"><div className="br__error">{error}</div><button className="br__back" onClick={()=>nav(-1)}>← Volver</button></section>;
  if (!biz) return null;

  return (
    <section className="br">
      {/* Top bar */}
      <div className="br__topbar br__stagger-1">
        <button className="br__back" onClick={()=>nav(-1)} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span>Volver al negocio</span>
        </button>
        <div className="br__topbar-right">
          <button className="br__export-btn" onClick={exportCSV} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Dark header */}
      <div className="br__page-header br__stagger-2">
        <div className="br__page-header-glow"/><div className="br__page-header-glow2"/>
        <div className="br__page-header-content">
          <div className="br__page-icon">{biz.name.charAt(0)}</div>
          <div className="br__page-info">
            <span className="br__page-eyebrow">Reporte general del negocio</span>
            <h1 className="br__page-title">{biz.name}</h1>
            {biz.description && <p className="br__page-subtitle">{biz.description}</p>}
            <div className="br__page-badges">
              <span className="br__page-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Desde {fmtDate(biz.createdAt)}
              </span>
              <span className="br__page-badge">{activities.length} actividades</span>
              <span className="br__page-badge">{allTx.length} transacciones</span>
            </div>
          </div>
          <div className="br__page-balance">
            <span className="br__page-balance-label">Saldo total del negocio</span>
            <span className="br__page-balance-value">{fmt(totalBalance)}</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="br__summary-grid br__stagger-3">
        <div className="br__summary-card br__summary-card--balance">
          <div className="br__summary-card-accent"/>
          <div className="br__summary-card-top"><span className="br__summary-card-label">Saldo consolidado</span>
            <div className="br__summary-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
          </div>
          <div className="br__summary-card-value">{fmt(totalBalance)}</div>
          <div className="br__summary-card-sub">Suma de todas las actividades</div>
        </div>
        <div className="br__summary-card br__summary-card--income">
          <div className="br__summary-card-accent"/>
          <div className="br__summary-card-top"><span className="br__summary-card-label">Ingresos totales</span>
            <div className="br__summary-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
          </div>
          <div className="br__summary-card-value">{fmt(totalIncome)}</div>
          <div className="br__summary-card-sub">{allTx.filter(t=>t.type==="DEPOSIT"||t.type==="REFUND").length} depósitos</div>
        </div>
        <div className="br__summary-card br__summary-card--expense">
          <div className="br__summary-card-accent"/>
          <div className="br__summary-card-top"><span className="br__summary-card-label">Egresos totales</span>
            <div className="br__summary-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
          </div>
          <div className="br__summary-card-value">{fmt(totalExpense)}</div>
          <div className="br__summary-card-sub">{allTx.filter(t=>t.type==="PAYMENT"||t.type==="WITHDRAWAL").length} pagos</div>
        </div>
        <div className="br__summary-card br__summary-card--activities">
          <div className="br__summary-card-accent"/>
          <div className="br__summary-card-top"><span className="br__summary-card-label">Actividades</span>
            <div className="br__summary-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg></div>
          </div>
          <div className="br__summary-card-value">{activities.length}</div>
          <div className="br__summary-card-sub">{activities.filter(a=>a.isActive).length} activas · {allTx.length} movimientos</div>
        </div>
      </div>

      {/* Activities breakdown */}
      <div className="br__activities-section br__stagger-4">
        <div className="br__activities-header">
          <span className="br__activities-title">Desglose por actividad</span>
          <span className="br__activities-count">{activities.length} actividades</span>
        </div>
        {activities.length > 0 && (
          <div className="br__activity-bar-section">
            <div className="br__activity-bar-container">
              {activities.map((a,i) => {
                const val = Math.abs(parseFloat(a.activityMoney||"0"));
                const pct = actBarTotal>0?(val/actBarTotal)*100:0;
                return (
                  <div key={a.id} className="br__activity-bar-segment" style={{width:`${Math.max(pct,1)}%`,background:ACTIVITY_COLORS[i%ACTIVITY_COLORS.length]}}>
                    <span className="br__activity-bar-tooltip">{a.name}: {fmt(a.activityMoney)}</span>
                  </div>
                );
              })}
            </div>
            <div className="br__activity-bar-legend">
              {activities.map((a,i) => (
                <div key={a.id} className="br__activity-bar-legend-item">
                  <div className="br__activity-bar-legend-dot" style={{background:ACTIVITY_COLORS[i%ACTIVITY_COLORS.length]}}/>
                  {a.name}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="br__activities-list">
          {activities.map((a,i) => {
            const txs = allTx.filter(t=>t.activityId===a.id);
            const inc = txs.filter(t=>t.type==="DEPOSIT"||t.type==="REFUND").reduce((s,t)=>s+parseFloat(t.amount),0);
            const exp = txs.filter(t=>t.type==="PAYMENT"||t.type==="WITHDRAWAL").reduce((s,t)=>s+parseFloat(t.amount),0);
            return (
              <div key={a.id} className="br__activity-row" onClick={()=>nav(`/activity/${a.id}/report`)}>
                <div className="br__activity-icon" style={{background:`linear-gradient(135deg,${ACTIVITY_COLORS[i%ACTIVITY_COLORS.length]},${ACTIVITY_COLORS[(i+1)%ACTIVITY_COLORS.length]})`}}>{a.name.charAt(0)}</div>
                <div className="br__activity-info">
                  <span className="br__activity-name">{a.name}</span>
                  {a.description && <span className="br__activity-desc">{a.description}</span>}
                </div>
                <span className={`br__activity-badge ${a.isActive?"is-active":"is-inactive"}`}><span className="br__activity-badge-dot"/>{a.isActive?"Activa":"Inactiva"}</span>
                <div className="br__activity-stats">
                  <div className="br__activity-stat"><span className="br__activity-stat-label">Saldo</span><span className="br__activity-stat-value">{fmt(a.activityMoney)}</span></div>
                  <div className="br__activity-stat"><span className="br__activity-stat-label">Ingresos</span><span className="br__activity-stat-value is-income">{fmt(inc)}</span></div>
                  <div className="br__activity-stat"><span className="br__activity-stat-label">Egresos</span><span className="br__activity-stat-value is-expense">{fmt(exp)}</span></div>
                </div>
                <span className="br__activity-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="br__charts-grid br__stagger-5">
        <div className="br__chart-card">
          <div className="br__chart-card-header"><span className="br__chart-card-title">Ingresos vs Egresos</span><span className="br__chart-card-badge">Últimos {barData.length} períodos</span></div>
          {barData.length>0 ? (
            <div className="br__bar-chart">
              {barData.map((d,i) => (
                <div key={i} className="br__bar-col">
                  <div className="br__bar-col-bars">
                    <div className="br__bar br__bar--income" style={{height:`${Math.max((d.income/barMax)*100,6)}%`}}><span className="br__bar-tooltip">{fmt(d.income)}</span></div>
                    <div className="br__bar br__bar--expense" style={{height:`${Math.max((d.expense/barMax)*100,6)}%`}}><span className="br__bar-tooltip">{fmt(d.expense)}</span></div>
                  </div>
                  <span className="br__bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          ) : <div style={{textAlign:"center",color:"var(--muted)",padding:"40px 0",fontSize:".88rem"}}>Sin datos</div>}
        </div>
        <div className="br__chart-card">
          <div className="br__chart-card-header"><span className="br__chart-card-title">Distribución por actividad</span><span className="br__chart-card-badge">{activities.length} actividades</span></div>
          <div className="br__donut-container">
            <div className="br__donut">
              <div className="br__donut-ring" style={{background:donutGradient,mask:"radial-gradient(circle,transparent 55%,black 55.5%)",WebkitMask:"radial-gradient(circle,transparent 55%,black 55.5%)"}}/>
              <div className="br__donut-center"><span className="br__donut-center-value">{fmt(totalBalance)}</span><span className="br__donut-center-label">Total</span></div>
            </div>
            <div className="br__donut-legend">
              {actDistribution.map(e => (
                <div key={e.name} className="br__donut-legend-item">
                  <div className="br__donut-legend-color" style={{background:e.color}}/>
                  <div className="br__donut-legend-info"><span className="br__donut-legend-name">{e.name}</span><span className="br__donut-legend-value">{fmt(e.amount)} · {e.pct.toFixed(1)}%</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="br__filters br__stagger-6">
        <span className="br__filters-label">Filtrar:</span>
        {(["ALL","DEPOSIT","WITHDRAWAL","TRANSFER","PAYMENT","REFUND"] as FilterType[]).map(t => (
          <button key={t} className={`br__filter-chip ${filterType===t?"is-active":""}`} onClick={()=>setFilterType(t)} type="button">{t==="ALL"?"Todos":TYPE_LABELS[t]}</button>
        ))}
        <div className="br__filter-search"><input type="text" placeholder="Buscar por nombre, descripción..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>

      {/* Transaction table */}
      <div className="br__table-card br__stagger-7">
        <div className="br__table-header"><span className="br__table-title">Todas las transacciones</span><span className="br__table-count">{filtered.length} de {allTx.length} registros</span></div>
        {filtered.length===0 ? (
          <div className="br__table-empty">
            <div className="br__table-empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
            <h3>Sin resultados</h3><p>{search||filterType!=="ALL"?"No se encontraron transacciones con los filtros.":"Sin transacciones registradas."}</p>
          </div>
        ) : (
          <table className="br__table">
            <thead><tr><th>Contacto</th><th>Actividad</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Monto</th></tr></thead>
            <tbody>
              {filtered.map(tx => {
                const isInc = tx.type==="DEPOSIT"||tx.type==="REFUND";
                return (
                  <tr key={tx.id}>
                    <td><div className="br__table-tx-info"><div className={`br__table-tx-indicator ${isInc?"is-income":"is-expense"}`}>{TYPE_ICONS[tx.type]||"•"}</div><div className="br__table-tx-details"><span className="br__table-tx-name">{tx.nameCuate}</span>{tx.description&&<span className="br__table-tx-desc">{tx.description}</span>}</div></div></td>
                    <td><span className="br__table-tx-activity">{actMap[tx.activityId]||"—"}</span></td>
                    <td><span className={`br__table-type-badge br__table-type-badge--${tx.type}`}>{TYPE_LABELS[tx.type]}</span></td>
                    <td><span className="br__table-date">{fmtShort(tx.date)}</span></td>
                    <td><span className={`br__table-status br__table-status--${tx.status.toLowerCase()}`}>{STATUS_LABELS[tx.status]}</span></td>
                    <td><span className={`br__table-amount ${isInc?"is-income":"is-expense"}`}>{isInc?"+":"−"}{fmt(tx.amount)}</span></td>
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
