export interface Sale {
  id: string;
  customer: string;
  product: string;
  amount: number;
  channel: 'whatsapp' | 'instagram' | 'web' | 'presencial';
  paymentType: 'efectivo' | 'qr' | 'transferencia' | 'otro';
  status: 'pendiente' | 'confirmado' | 'cobrado';
  notes?: string;
  createdAt: Date;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface ExtractionResult {
  customer?: string;
  product?: string;
  amount?: number;
  channel?: string;
  paymentType?: string;
  notes?: string;
  confidence: number;
  rawText: string;
}