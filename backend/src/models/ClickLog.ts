import mongoose, { Schema, Document } from 'mongoose';

export interface IClickLog extends Document {
  userId?: string;
  sessionId?: string;
  productId: string;
  productName: string;
  retailerId: string;
  retailerName: string;
  userIp?: string;
  userAgent?: string;
  referrerUrl?: string;
  sourcePage?: string;
  affiliateTag?: string;
  originalPrice: number;
  currency: string;
  redirectUrl: string;
  timestamp: Date;
  conversionTracked: boolean;
}

const ClickLogSchema = new Schema({
  userId: { type: String, index: true },
  sessionId: { type: String, index: true },
  productId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  retailerId: { type: String, required: true, index: true },
  retailerName: { type: String, required: true },
  userIp: { type: String },
  userAgent: { type: String },
  referrerUrl: { type: String },
  sourcePage: { type: String },
  affiliateTag: { type: String },
  originalPrice: { type: Number, required: true },
  currency: { type: String, required: true },
  redirectUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  conversionTracked: { type: Boolean, default: false },
});

// Indexes for analytics queries
ClickLogSchema.index({ productId: 1, retailerId: 1, timestamp: -1 });
ClickLogSchema.index({ userId: 1, timestamp: -1 });
ClickLogSchema.index({ retailerId: 1, timestamp: -1 });
ClickLogSchema.index({ timestamp: -1 });

export const ClickLog = mongoose.model<IClickLog>('ClickLog', ClickLogSchema);
