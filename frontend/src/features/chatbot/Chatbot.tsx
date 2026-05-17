import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import pigHappy from "../../assets/character/pig-happy.webp";
import pigNeutral from "../../assets/character/pig-neutral.webp";
import pigPensante from "../../assets/character/pig-pensante.webp";
import pigSad from "../../assets/character/pig-sad.webp";
import "./Chatbot.css";

const API_URL = "http://localhost:3000/api/chatbot/message";

type ChatRole = "user" | "assistant";
type AssistantMood = "neutral" | "thinking" | "happy" | "sad";

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
      "¡Hola! Soy tu asistente inteligente. Puedo ayudarte a analizar tus negocios, actividades, productos, ventas y transacciones con los datos que ya registraste. ¿En qué te puedo ayudar hoy?",
  },
];

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

const assistantCharacterByMood: Record<AssistantMood, string> = {
  neutral: pigNeutral,
  thinking: pigPensante,
  happy: pigHappy,
  sad: pigSad,
};

function getAssistantMood(
  messages: ChatMessage[],
  loading: boolean,
  error: string,
): AssistantMood {
  if (error) return "sad";
  if (loading) return "thinking";
  if (
    messages.some(
      (message) => message.role === "assistant" && message.id !== "welcome",
    )
  ) {
    return "happy";
  }
  return "neutral";
}

function CharacterAvatar({
  mood,
  size = 40,
  className = "",
  alt,
}: {
  mood: AssistantMood;
  size?: number;
  className?: string;
  alt: string;
}) {
  return (
    <img
      className={`character-avatar ${className}`.trim()}
      src={assistantCharacterByMood[mood]}
      alt={alt}
      width={size}
      height={size}
      loading="eager"
      decoding="async"
    />
  );
}

/* ── Inline SVG icons ── */

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
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
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EyeIcon() {
  return (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

export function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const assistantMood = getAssistantMood(messages, loading, error);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
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
        throw new Error(
          data.error || "No se pudo obtener respuesta del asistente",
        );
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
      <div className="chat-hero">
        <div className="chat-hero__top">
          <div className="chat-hero__icon chat-hero__icon--character">
            <CharacterAvatar
              mood={"neutral"}
              size={48}
              alt="Personaje asistente Tinka"
              className="character-avatar--hero"
            />
          </div>
          <div className="chat-hero__label">
            <h2>Tinka IA</h2>

          </div>
        </div>
        <p className="chat-hero__desc">
          Tu asistente inteligente para consultar negocios, actividades,
          productos, ventas y transacciones con respuestas basadas en tus
          registros.
        </p>
      </div>

      {/* ── Main grid ── */}
      <div className="chatbot__grid">
        {/* ── Chat panel ── */}
        <article className="chat-panel">
          <div className="chat-panel__header">
            <div className="chat-panel__header-left">
              <div className="chat-panel__title-group">
                <span className="chat-panel__title">Asistente Tinka</span>
                <span className="chat-panel__subtitle">
                  Analisis inteligente de tu negocio
                </span>
              </div>
            </div>
            <span className="chat-panel__model-badge">✦ Gemini 2.5</span>
          </div>

          <div
            className="chat-panel__messages"
            aria-label="Mensajes del asistente"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message--${message.role}`}
              >
                <div className="chat-message__avatar">
                  {message.role === "assistant" ? (
                    <CharacterAvatar
                      mood={assistantMood}
                      size={34}
                      alt="Personaje asistente Tinka"
                      className="character-avatar--message"
                    />
                  ) : (
                    "Tu"
                  )}
                </div>
                <div className="chat-message__bubble">
                  <span className="chat-message__name">
                    {message.role === "assistant" ? "Tinka IA" : "Tu"}
                  </span>
                  <p className="chat-message__text">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message chat-message--assistant">
                <div className="chat-message__avatar">
                  <CharacterAvatar
                    mood="thinking"
                    size={34}
                    alt="Personaje asistente Tinka pensando"
                    className="character-avatar--message"
                  />
                </div>
                <div className="chat-message__bubble">
                  <span className="chat-message__name">Tinka IA</span>
                  <div
                    className="typing-indicator"
                    aria-label="Generando respuesta"
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="chat-panel__error" role="alert">
              ⚠ {error}
            </div>
          )}

          <form className="chat-panel__composer" onSubmit={handleSubmit}>
            <div className="chat-panel__input-wrap">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu pregunta sobre negocios, ventas o productos..."
                disabled={loading}
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              className="chat-panel__send-btn"
              disabled={loading || input.trim().length === 0}
            >
              <SendIcon />
              {loading ? "Analizando..." : "Enviar"}
            </button>
          </form>
        </article>

        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          {/* Suggestions */}
          <div className="suggestion-card">
            <div className="suggestion-card__header">
              <div className="suggestion-card__header-icon">
                <LightbulbIcon />
              </div>
              <span className="suggestion-card__title">
                Preguntas sugeridas
              </span>
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
                  <span>{item}</span>
                  <span className="suggestion-chip__arrow">
                    <ArrowIcon />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="assistant-tips">
            <article className="tip-card">
              <span className="tip-card__label tip-card__label--context">
                <ShieldIcon />
                Contexto
              </span>
              <p>
                Las respuestas usan un resumen de tus datos registrados, no
                informacion de otros usuarios.
              </p>
            </article>
            <article className="tip-card">
              <span className="tip-card__label tip-card__label--scope">
                <EyeIcon />
                Alcance
              </span>
              <p>
                El asistente solo consulta y analiza. No crea, edita ni elimina
                registros.
              </p>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
}
