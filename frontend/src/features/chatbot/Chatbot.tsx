import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import "./Chatbot.css";

const API_URL = "http://localhost:3000/api/chatbot/message";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const suggestions = [
  "Que negocio me esta generando mas ingresos?",
  "Que actividad tiene mejor saldo y por que?",
  "Que productos deberia revisar por precio o margen?",
  "Resume mis ventas y transacciones recientes.",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Puedo ayudarte a analizar tus negocios, actividades, productos, ventas y transacciones con los datos que ya registraste.",
  },
];

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

export function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    const token = localStorage.getItem("auth_token");

    if (!trimmed || loading) return;

    if (!token) {
      setError("Tu sesion expiro. Vuelve a iniciar sesion.");
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const recentHistory = messages
      .filter((item) => item.id !== "welcome")
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          history: recentHistory,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener respuesta del asistente");
      }

      setMessages((prev) => [
        ...prev,
        createMessage("assistant", data.reply || "No encontre una respuesta."),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el asistente",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="chatbot">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Asistente IA</span>
          <h2>Chatbot de negocio</h2>
        </div>
        <p>
          Consulta tus negocios, actividades, productos, ventas y transacciones
          con respuestas basadas en tus registros.
        </p>
      </div>

      <div className="chatbot__grid">
        <article className="panel chat-panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Conversacion</span>
              <h3>Asistente Tinka</h3>
            </div>
            <span className="panel__badge">Gemini 2.5</span>
          </div>

          <div
            className="chat-panel__messages"
            aria-label="Mensajes del chatbot"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message--${message.role}`}
              >
                <strong>{message.role === "assistant" ? "Asistente" : "Tu"}</strong>
                <p>{message.content}</p>
              </div>
            ))}

            {loading && (
              <div className="chat-message chat-message--assistant">
                <strong>Asistente</strong>
                <div className="typing-indicator" aria-label="Generando respuesta">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="chat-panel__error" role="alert">
              {error}
            </div>
          )}

          <form className="chat-panel__composer" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pregunta sobre tus negocios o ventas"
              disabled={loading}
              maxLength={1000}
            />
            <button
              type="submit"
              className="primary-action"
              disabled={loading || input.trim().length === 0}
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </article>

        <article className="panel chat-panel__side">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Sugerencias</span>
              <h3>Preguntas rapidas</h3>
            </div>
          </div>

          <div className="suggestion-list">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="suggestion-chip"
                onClick={() => setInput(item)}
                disabled={loading}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="assistant-tips">
            <article>
              <span>Contexto</span>
              <p>
                Las respuestas usan un resumen de tus datos registrados, no
                informacion de otros usuarios.
              </p>
            </article>
            <article>
              <span>Alcance</span>
              <p>
                El asistente solo consulta y analiza. No crea, edita ni elimina
                registros.
              </p>
            </article>
          </div>
        </article>
      </div>
    </section>
  );
}
