import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlistItem extends Document {
  userId: string;
  masterProductId: string;
  productName: string;
  productImage: string;
  targetPrice?: number;
  targetPercentageDrop?: number;
  alertType: 'absolute' | 'percentage' | 'any';
  channels: ('email' | 'sms' | 'push')[];
  isActive: boolean;
  initialPrice: number;
  currentLowestPrice: number;
  allTimeLow: number;
  allTimeLowDate?: Date;
  lastTriggeredAt?: Date;
  totalSavings: number;
  savingsPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistItemSchema = new Schema({
  userId: { type: String, required: true, index: true },
  masterProductId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: '' },
  targetPrice: { type: Number },
  targetPercentageDrop: { type: Number },
  alertType: { 
    type: String, 
    enum: ['absolute', 'percentage', 'any'],
    default: 'any'
  },
  channels: [{ 
    type: String, 
    enum: ['email', 'sms', 'push'],
    default: ['email']
  }],
  isActive: { type: Boolean, default: true, index: true },
  initialPrice: { type: Number, required: true },
  currentLowestPrice: { type: Number, required: true },
  allTimeLow: { type: Number, required: true },
  allTimeLowDate: { type: Date },
  lastTriggeredAt: { type: Date },
  totalSavings: { type: Number, default: 0 },
  savingsPercentage: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Compound index for fast queries
WatchlistItemSchema.index({ userId: 1, masterProductId: 1 }, { unique: true });
WatchlistItemSchema.index({ userId: 1, isActive: 1 });
WatchlistItemSchema.index({ masterProductId: 1, isActive: 1 });

export const WatchlistItem = mongoose.model<IWatchlistItem>('WatchlistItem', WatchlistItemSchema);
