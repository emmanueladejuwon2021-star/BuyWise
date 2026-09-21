import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceHistory extends Document {
  productId: string;
  retailerId: string;
  price: number;
  originalPrice?: number;
  currency: string;
  timestamp: Date;
  isOutlier: boolean;
  percentageChange?: number;
}

const PriceHistorySchema = new Schema({
  productId: { type: String, required: true, index: true },
  retailerId: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  currency: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  isOutlier: { type: Boolean, default: false },
  percentageChange: { type: Number },
});

// Compound index for efficient queries
PriceHistorySchema.index({ productId: 1, retailerId: 1, timestamp: -1 });

export const PriceHistory = mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);
