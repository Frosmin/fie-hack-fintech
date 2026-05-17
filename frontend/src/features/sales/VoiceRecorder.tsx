import { useVoiceRecorder } from './useVoiceRecorder';
import { useSaleExtractor } from './useSaleExtractor';
import type { Sale, ExtractionResult } from './types';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onSaleExtracted: (sale: Partial<Sale>) => void;
}

export function VoiceRecorder({ onSaleExtracted }: VoiceRecorderProps) {
  const { state, transcript, interimTranscript, startListening, stopListening, reset } = useVoiceRecorder();
  const { extractFromText } = useSaleExtractor();

  const handleVoiceResult = async () => {
    if (!transcript) return;
    const result: ExtractionResult = await extractFromText(transcript);
    onSaleExtracted({
      customer: result.customer,
      product: result.product,
      amount: result.amount,
      channel: (result.channel as Sale['channel']) || 'whatsapp',
      paymentType: (result.paymentType as Sale['paymentType']) || 'efectivo',
      status: 'pendiente',
    });
    reset();
  };

  const handleNewRecording = () => {
    reset();
  };

  return (
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
        {state === 'idle' && <span>Toca el micrófono y habla</span>}
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
          <button type="button" className="secondary-action" onClick={handleNewRecording}>
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
  );
}