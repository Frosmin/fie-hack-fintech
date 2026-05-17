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