import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  storeId: string;
  userId: string;
  paymentType: 'membership' | 'ad_credits' | 'one_time';
  amount: number;
  currency: string;
  paymentProvider: 'paystack' | 'flutterwave' | 'stripe';
  transactionRef: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  description: string;
  metadata?: {
    membershipLevel?: string;
    creditsPurchased?: number;
    campaignId?: string;
  };
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  storeId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  paymentType: { 
    type: String, 
    enum: ['membership', 'ad_credits', 'one_time'],
    required: true
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  paymentProvider: { 
    type: String, 
    enum: ['paystack', 'flutterwave', 'stripe'],
    required: true
  },
  transactionRef: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'successful', 'failed', 'refunded'],
    default: 'pending'
  },
  description: { type: String, required: true },
  metadata: {
    membershipLevel: { type: String },
    creditsPurchased: { type: Number },
    campaignId: { type: String },
  },
  paidAt: { type: Date },
  failedAt: { type: Date },
  failureReason: { type: String },
}, {
  timestamps: true,
});

// Indexes
PaymentSchema.index({ storeId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ paymentType: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
