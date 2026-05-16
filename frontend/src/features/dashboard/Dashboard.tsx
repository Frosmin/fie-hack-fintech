import "./Dashboard.css";

const metrics = [
  { label: "Ventas hoy", value: "24", detail: "+18% vs ayer" },
  { label: "Clientes activos", value: "128", detail: "22 en seguimiento" },
  { label: "Ticket promedio", value: "$42", detail: "Meta: $50" },
  { label: "Respuestas chatbot", value: "96%", detail: "Satisfacción alta" },
];

const weeklyPerformance = [
  { day: "Lun", value: 38 },
  { day: "Mar", value: 54 },
  { day: "Mié", value: 48 },
  { day: "Jue", value: 72 },
  { day: "Vie", value: 64 },
  { day: "Sáb", value: 86 },
];

const priorities = [
  "Responder leads nuevos antes de 15 minutos.",
  "Revisar ventas de ticket alto para upsell.",
  "Programar recordatorios de cobro y postventa.",
];

export function Dashboard() {
  return (
    <section className="dashboard">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Vista principal</span>
          <h2>Dashboard del emprendimiento</h2>
        </div>
        <p>
          Controla el flujo de ventas, el progreso comercial y las tareas que
          necesitan atención inmediata.
        </p>
      </div>

      <div className="dashboard__metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="stat-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </div>

      <div className="dashboard__grid">
        <article className="panel panel--chart">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Ritmo semanal</span>
              <h3>Actividad comercial</h3>
            </div>
            <span className="panel__badge">+12.4%</span>
          </div>

          <div className="chart" aria-label="Gráfico de rendimiento semanal">
            {weeklyPerformance.map((item) => (
              <div key={item.day} className="chart__bar-wrap">
                <div
                  className="chart__bar"
                  style={{ height: `${item.value}%` }}
                />
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel--list">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Prioridades</span>
              <h3>Acciones sugeridas</h3>
            </div>
          </div>

          <ul className="priority-list">
            {priorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
