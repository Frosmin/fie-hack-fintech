import "./Chatbot.css";

const suggestions = [
  "¿Cómo valido mi idea en 7 días?",
  "Hazme un plan de ventas inicial.",
  "¿Qué debo medir en mi primer mes?",
];

const assistantTips = [
  "Define una propuesta de valor simple y concreta.",
  "Habla con 5 usuarios antes de invertir más.",
  "Mide leads, conversión y ticket promedio desde el día 1.",
];

export function Chatbot() {
  return (
    <section className="chatbot">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Asistente IA</span>
          <h2>Chatbot para emprender</h2>
        </div>
        <p>
          Un asistente guía con respuestas rápidas, sugerencias y foco en las
          primeras decisiones de negocio.
        </p>
      </div>

      <div className="chatbot__grid">
        <article className="panel chat-panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Conversación</span>
              <h3>Tu copiloto de negocio</h3>
            </div>
            <span className="panel__badge">En línea</span>
          </div>

          <div
            className="chat-panel__messages"
            aria-label="Mensajes del chatbot"
          >
            <div className="chat-message chat-message--assistant">
              <strong>Asistente</strong>
              <p>
                Te ayudaré a priorizar tu idea, detectar oportunidades y crear
                acciones concretas para avanzar.
              </p>
            </div>

            <div className="chat-message chat-message--user">
              <strong>Emprendedor</strong>
              <p>Quiero arrancar sin perder tiempo ni presupuesto.</p>
            </div>

            <div className="chat-message chat-message--assistant">
              <strong>Asistente</strong>
              <p>
                Perfecto. Empecemos con validación, oferta inicial y primer
                canal de ventas.
              </p>
            </div>
          </div>

          <form className="chat-panel__composer">
            <input
              type="text"
              placeholder="Escribe tu duda o meta de negocio"
            />
            <button type="button" className="primary-action">
              Enviar
            </button>
          </form>
        </article>

        <article className="panel chat-panel__side">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Sugerencias</span>
              <h3>Prompts rápidos</h3>
            </div>
          </div>

          <div className="suggestion-list">
            {suggestions.map((item) => (
              <button key={item} type="button" className="suggestion-chip">
                {item}
              </button>
            ))}
          </div>

          <div className="assistant-tips">
            {assistantTips.map((tip) => (
              <article key={tip}>
                <span>Recomendación</span>
                <p>{tip}</p>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
