export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceRecording {
  transcript: string;
  isFinal: boolean;
}

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