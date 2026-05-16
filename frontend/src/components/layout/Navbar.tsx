import "./Navbar.css";

export type AppView = "dashboard" | "sales" | "chatbot";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Resumen general",
  },
  {
    id: "sales",
    label: "Registro ventas",
    description: "Nueva operación",
  },
  {
    id: "chatbot",
    label: "Chatbot",
    description: "Asistente emprendedor",
  },
] as const satisfies Array<{
  id: AppView;
  label: string;
  description: string;
}>;

interface NavbarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
}

export function Navbar({ activeView, onChangeView }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__mark" aria-hidden="true">
          EH
        </div>
        <div>
          <span className="navbar__eyebrow">Emprende Hub</span>
          <strong>Fintech para arrancar tu idea</strong>
        </div>
      </div>

      <nav className="navbar__nav" aria-label="Navegación principal">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.id === activeView ? "navbar__tab is-active" : "navbar__tab"
            }
            onClick={() => onChangeView(item.id)}
            aria-current={item.id === activeView ? "page" : undefined}
          >
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </nav>
    </header>
  );
}
