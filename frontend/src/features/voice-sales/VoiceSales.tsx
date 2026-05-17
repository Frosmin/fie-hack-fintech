import { useState } from 'react';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useSaleExtractor, type ExtractionResult } from './hooks/useSaleExtractor';
import type { Sale } from './types/sale';
import './VoiceSales.css';

const MOCK_RECENT_VENTAS: Sale[] = [
  {
    id: '1',
    customer: 'Laura R.',
    product: 'Kit de plantas',
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

export function VoiceSales() {
  const { state, transcript, interimTranscript, startListening, stopListening, reset } = useVoiceRecorder();
  const { extractFromText } = useSaleExtractor();

  const [extractedData, setExtractedData] = useState<Partial<Sale> | null>(null);
  const [pendingSales, setPendingSales] = useState<Partial<Sale>[]>([]);
  const [showForm, setShowForm] = useState(false);

  const currentFormData: Partial<Sale> = extractedData || {};

  const handleVoiceResult = async () => {
    if (!transcript) return;

    const result: ExtractionResult = await extractFromText(transcript);

    setExtractedData({
      customer: result.customer,
      product: result.product,
      amount: result.amount,
      channel: (result.channel as Sale['channel']) || 'whatsapp',
      paymentType: (result.paymentType as Sale['paymentType']) || 'efectivo',
      status: 'pendiente',
    });

    setShowForm(true);
  };

  const handleAddToPending = () => {
    if (currentFormData.product) {
      setPendingSales([...pendingSales, { ...currentFormData, id: Date.now().toString() }]);
      setExtractedData(null);
      setShowForm(false);
      reset();
    }
  };

  const handleSaveAll = () => {
    console.log('Guardando ventas:', [...MOCK_RECENT_VENTAS, ...pendingSales]);
    setPendingSales([]);
    alert('Ventas guardadas correctamente');
  };

  const handleRemovePending = (id: string) => {
    setPendingSales(pendingSales.filter(s => s.id !== id));
  };

  const handleStartNew = () => {
    setExtractedData(null);
    setShowForm(false);
    reset();
  };

  return (
    <section className="voice-sales">
      <div className="section-heading">
        <div>
          <span className="section-heading__eyebrow">Operación comercial</span>
          <h2>Registro por voz</h2>
        </div>
        <p>
          Registra tus ventas hablando en lenguaje natural. El sistema
          detectará automáticamente los detalles de cada transacción.
        </p>
      </div>

      <div className="voice-sales__grid">
        <article className="panel voice-panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Nueva venta</span>
              <h3>Comandos de voz</h3>
            </div>
          </div>

          {!showForm ? (
            <div className="voice-recorder">
              <div className={`voice-recorder__mic ${state}`}>
                <button
                  type="button"
                  className="mic-button"
                  onClick={state === 'listening' ? stopListening : startListening}
                  disabled={state === 'processing'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              </div>

              <div className="voice-recorder__status">
                {state === 'idle' && <span> Toca el micrófono y habla</span>}
                {state === 'listening' && (
                  <span className="listening">
                    {interimTranscript || 'Escuchando...'}
                  </span>
                )}
                {state === 'processing' && <span className="processing">Procesando...</span>}
                {state === 'success' && <span className="success">¡Listo! Revisa los datos detectados</span>}
                {state === 'error' && <span className="error">Error al reconocer voz</span>}
              </div>

              {state === 'success' && (
                <div className="voice-recorder__actions">
                  <button type="button" className="secondary-action" onClick={handleStartNew}>
                    Nuevo registro
                  </button>
                  <button type="button" className="primary-action" onClick={handleVoiceResult}>
                    Ver datos detectados
                  </button>
                </div>
              )}

              <div className="voice-recorder__hints">
                <p>Ejemplos de comandos:</p>
                <ul>
                  <li>"Vendi un kit de plantas por 38 soles en efectivo"</li>
                  <li>"Pack branding para Miguel, 120 por transferencia"</li>
                  <li>"Mentoría 1:1 para Ana, 65 dólares"</li>
                </ul>
              </div>
            </div>
          ) : (
            <form className="voice-form" onSubmit={(e) => e.preventDefault()}>
              <div className="extraction-result">
                <h4>Datos detectados</h4>
                <div className="confidence-bar">
                  <span>Confianza: 85%</span>
                  <div className="confidence-fill" style={{ width: '85%' }} />
                </div>
              </div>

              <label>
                Cliente
                <input
                  type="text"
                  value={currentFormData.customer || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, customer: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </label>

              <label>
                Producto / servicio
                <input
                  type="text"
                  value={currentFormData.product || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, product: e.target.value })}
                  placeholder="Qué se vendió"
                />
              </label>

              <label>
                Monto
                <input
                  type="number"
                  value={currentFormData.amount || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, amount: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </label>

              <label>
                Canal
                <select
                  value={currentFormData.channel || 'whatsapp'}
                  onChange={(e) => setExtractedData({ ...extractedData, channel: e.target.value as Sale['channel'] })}
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
                  value={currentFormData.paymentType || 'efectivo'}
                  onChange={(e) => setExtractedData({ ...extractedData, paymentType: e.target.value as Sale['paymentType'] })}
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
                  value={currentFormData.status || 'pendiente'}
                  onChange={(e) => setExtractedData({ ...extractedData, status: e.target.value as Sale['status'] })}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cobrado">Cobrado</option>
                </select>
              </label>

              <div className="voice-form__actions">
                <button type="button" className="secondary-action" onClick={handleStartNew}>
                  Cancelar
                </button>
                <button type="button" className="primary-action" onClick={handleAddToPending}>
                  Agregar venta
                </button>
              </div>
            </form>
          )}
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
              <span>Agrega ventas usando el micrófono</span>
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

              <button
                type="button"
                className="primary-action full-width"
                onClick={handleSaveAll}
              >
                Registrar {pendingSales.length} venta{pendingSales.length > 1 ? 's' : ''}
              </button>
            </>
          )}
        </article>

        <article className="panel sales-list">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Historial</span>
              <h3>Ventas registradas</h3>
            </div>
            <span className="panel__badge">{MOCK_RECENT_VENTAS.length}</span>
          </div>

          <div className="sales-list__items">
            {MOCK_RECENT_VENTAS.map((sale) => (
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