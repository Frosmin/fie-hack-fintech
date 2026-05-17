import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import type { Sale } from './types';
import './Sales.css';

const recentSales: Sale[] = [
  {
    id: '1',
    customer: 'Laura R.',
    product: 'Plant Kit',
    amount: 38,
    channel: 'whatsapp',
    paymentType: 'efectivo',
    status: 'cobrado',
    createdAt: new Date(),
  },
  {
    id: '2',
    customer: 'Miguel T.',
    product: 'Pack Branding',
    amount: 120,
    channel: 'instagram',
    paymentType: 'transferencia',
    status: 'pendiente',
    createdAt: new Date(),
  },
  {
    id: '3',
    customer: 'Ana V.',
    product: 'Mentoría 1:1',
    amount: 65,
    channel: 'web',
    paymentType: 'qr',
    status: 'confirmado',
    createdAt: new Date(),
  },
];

export function Sales() {
  const [formData, setFormData] = useState({
    customer: '',
    product: '',
    amount: '',
    channel: 'whatsapp',
    paymentType: 'efectivo',
    status: 'pendiente',
    notes: '',
  });

  const [pendingSales, setPendingSales] = useState<Partial<Sale>[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVoiceExtracted = (extracted: Partial<Sale>) => {
    setFormData({
      customer: extracted.customer || '',
      product: extracted.product || '',
      amount: extracted.amount?.toString() || '',
      channel: extracted.channel || 'whatsapp',
      paymentType: extracted.paymentType || 'efectivo',
      status: extracted.status || 'pendiente',
      notes: '',
    });
  };

  const handleAddPending = () => {
    if (formData.product && formData.amount) {
      const newSale: Partial<Sale> = {
        customer: formData.customer,
        product: formData.product,
        amount: Number(formData.amount),
        channel: formData.channel as Sale['channel'],
        paymentType: formData.paymentType as Sale['paymentType'],
        status: formData.status as Sale['status'],
        notes: formData.notes,
        id: Date.now().toString(),
      };
      setPendingSales([...pendingSales, newSale]);
      setFormData({
        customer: '',
        product: '',
        amount: '',
        channel: 'whatsapp',
        paymentType: 'efectivo',
        status: 'pendiente',
        notes: '',
      });
    }
  };

  const handleRemovePending = (id: string) => {
    setPendingSales(pendingSales.filter((s) => s.id !== id));
  };

  const handleSaveAll = () => {
    console.log('Guardando ventas:', [...recentSales, ...pendingSales]);
    setPendingSales([]);
    alert('Ventas guardadas correctamente');
  };

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

          <VoiceRecorder onSaleExtracted={handleVoiceExtracted} />

          <form className="sales-form__grid" onSubmit={(e) => e.preventDefault()}>
            <label>
              Cliente
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
              />
            </label>

            <label>
              Producto / servicio
              <input
                type="text"
                placeholder="Qué se vendió"
                value={formData.product}
                onChange={(e) => handleInputChange('product', e.target.value)}
              />
            </label>

            <label>
              Monto
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
            </label>

            <label>
              Canal
              <select
                value={formData.channel}
                onChange={(e) => handleInputChange('channel', e.target.value)}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="web">Web</option>
                <option value="presencial">Presencial</option>
              </select>
            </label>

            <label>
              Tipo de pago
              <select
                value={formData.paymentType}
                onChange={(e) => handleInputChange('paymentType', e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="qr">QR</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </label>

            <label>
              Estado
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
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
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </label>

            <div className="sales-form__actions">
              <button type="button" className="secondary-action" onClick={handleAddPending}>
                Agregar a lista
              </button>
              <button type="button" className="primary-action" onClick={handleSaveAll} disabled={pendingSales.length === 0}>
                Registrar {pendingSales.length > 0 ? `(${pendingSales.length})` : ''}
              </button>
            </div>
          </form>
        </article>

        <article className="panel pending-sales">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Ventas pendientes</span>
              <h3>Por registrar</h3>
            </div>
            <span className="panel__badge">{pendingSales.length}</span>
          </div>

          {pendingSales.length === 0 ? (
            <div className="empty-state">
              <p>No hay ventas pendientes</p>
              <span>Agrega ventas con el micrófono o el formulario</span>
            </div>
          ) : (
            <>
              <div className="pending-sales__list">
                {pendingSales.map((sale) => (
                  <article key={sale.id} className="pending-item">
                    <div>
                      <strong>{sale.customer || 'Sin cliente'}</strong>
                      <span>{sale.product}</span>
                    </div>
                    <div className="pending-item__meta">
                      <strong>${sale.amount}</strong>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemovePending(sale.id!)}
                        aria-label="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </article>

        <article className="panel sales-list">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Movimientos recientes</span>
              <h3>Últimas operaciones</h3>
            </div>
            <span className="panel__badge">{recentSales.length} hoy</span>
          </div>

          <div className="sales-list__items">
            {recentSales.map((sale) => (
              <article key={sale.id} className="sale-item">
                <div>
                  <strong>{sale.customer}</strong>
                  <span>{sale.product}</span>
                </div>
                <div className="sale-item__meta">
                  <strong>${sale.amount}</strong>
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