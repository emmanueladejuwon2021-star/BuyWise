import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsoredClick extends Document {
  campaignId: string;
  storeId: string;
  productId?: string;
  userId?: string;
  sessionId?: string;
  userIp?: string;
  userAgent?: string;
  referrerUrl?: string;
  costPerClick: number;
  placementLocation: string;
  timestamp: Date;
}

const SponsoredClickSchema = new Schema({
  campaignId: { type: String, required: true, index: true },
  storeId: { type: String, required: true, index: true },
  productId: { type: String, index: true },
  userId: { type: String, index: true },
  sessionId: { type: String },
  userIp: { type: String },
  userAgent: { type: String },
  referrerUrl: { type: String },
  costPerClick: { type: Number, required: true },
  placementLocation: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

// Indexes for analytics and billing
SponsoredClickSchema.index({ campaignId: 1, timestamp: -1 });
SponsoredClickSchema.index({ storeId: 1, timestamp: -1 });
SponsoredClickSchema.index({ productId: 1, timestamp: -1 });

export const SponsoredClick = mongoose.model<ISponsoredClick>('SponsoredClick', SponsoredClickSchema);
