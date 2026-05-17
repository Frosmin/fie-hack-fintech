import { useState } from 'react';
import type { ExtractionResult } from './types';

const MOCK_EXTRACTIONS: Record<string, Partial<ExtractionResult>> = {
  'kit': { product: 'Kit de plantas', amount: 38, confidence: 0.95 },
  'plant': { product: 'Kit de plantas', amount: 38, confidence: 0.9 },
  'plantas': { product: 'Kit de plantas', amount: 38, confidence: 0.9 },
  'branding': { product: 'Pack Branding', amount: 120, confidence: 0.95 },
  'mentoría': { product: 'Mentoría 1:1', amount: 65, confidence: 0.9 },
  'mentoria': { product: 'Mentoría 1:1', amount: 65, confidence: 0.9 },
  'laura': { customer: 'Laura R.', confidence: 0.9 },
  'miguel': { customer: 'Miguel T.', confidence: 0.9 },
  'ana': { customer: 'Ana V.', confidence: 0.9 },
  'efectivo': { paymentType: 'efectivo', confidence: 0.95 },
  'qr': { paymentType: 'qr', confidence: 0.95 },
  'transferencia': { paymentType: 'transferencia', confidence: 0.95 },
  'whatsapp': { channel: 'whatsapp', confidence: 0.9 },
  'instagram': { channel: 'instagram', confidence: 0.9 },
  'web': { channel: 'web', confidence: 0.9 },
  'presencial': { channel: 'presencial', confidence: 0.9 },
};

export function useSaleExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);

  const extractFromText = async (text: string): Promise<ExtractionResult> => {
    setIsExtracting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerText = text.toLowerCase();
    const result: ExtractionResult = {
      customer: undefined,
      product: undefined,
      amount: undefined,
      channel: undefined,
      paymentType: undefined,
      notes: undefined,
      confidence: 0,
      rawText: text,
    };

    for (const [keyword, extraction] of Object.entries(MOCK_EXTRACTIONS)) {
      if (lowerText.includes(keyword)) {
        Object.assign(result, extraction);
      }
    }

    if (!result.product && !result.amount) {
      result.product = 'Venta detectada (revisa los detalles)';
      result.confidence = 0.3;
    } else {
      result.confidence = 0.85;
    }

    setIsExtracting(false);
    return result;
  };

  return { extractFromText, isExtracting };
}