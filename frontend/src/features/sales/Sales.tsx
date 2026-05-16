import "./Sales.css";

const recentSales = [
  {
    customer: "Laura R.",
    product: "Plant Kit",
    amount: "$38",
    status: "Cobrado",
  },
  {
    customer: "Miguel T.",
    product: "Pack Branding",
    amount: "$120",
    status: "Pendiente",
  },
  {
    customer: "Ana V.",
    product: "Mentoría 1:1",
    amount: "$65",
    status: "Confirmado",
  },
];

export function Sales() {
  return (
    <section className="sales">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Operación comercial</span>
          <h2>Registro de ventas</h2>
        </div>
        <p>
          Captura cada operación, sigue el estado de cobro y mantén el flujo de
          caja visible desde cualquier pantalla.
        </p>
      </div>

      <div className="sales__grid">
        <article className="panel sales-form">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Nueva venta</span>
              <h3>Formulario de registro</h3>
            </div>
          </div>

          <form className="sales-form__grid">
            <label>
              Cliente
              <input type="text" placeholder="Nombre del cliente" />
            </label>

            <label>
              Producto / servicio
              <input type="text" placeholder="Qué se vendió" />
            </label>

            <label>
              Monto
              <input type="text" placeholder="$0.00" />
            </label>

            <label>
              Canal
              <select defaultValue="whatsapp">
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="web">Web</option>
                <option value="presencial">Presencial</option>
              </select>
            </label>

            <label>
              Estado
              <select defaultValue="pendiente">
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cobrado">Cobrado</option>
              </select>
            </label>

            <label className="sales-form__notes">
              Notas
              <textarea
                rows={4}
                placeholder="Detalles de pago, entrega o seguimiento"
              />
            </label>

            <button type="button" className="primary-action">
              Registrar venta
            </button>
          </form>
        </article>

        <article className="panel sales-list">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Movimientos recientes</span>
              <h3>Últimas operaciones</h3>
            </div>
            <span className="panel__badge">3 hoy</span>
          </div>

          <div className="sales-list__items">
            {recentSales.map((sale) => (
              <article
                key={`${sale.customer}-${sale.product}`}
                className="sale-item"
              >
                <div>
                  <strong>{sale.customer}</strong>
                  <span>{sale.product}</span>
                </div>
                <div className="sale-item__meta">
                  <strong>{sale.amount}</strong>
                  <span>{sale.status}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
