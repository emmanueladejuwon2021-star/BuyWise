import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  watchlistItemId: string;
  masterProductId: string;
  type: 'price_drop' | 'back_in_stock' | 'deal_alert';
  channel: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  subject?: string;
  message: string;
  templateData?: Record<string, any>;
  productName: string;
  oldPrice: number;
  newPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  retailerName: string;
  affiliateUrl: string;
  isAllTimeLow: boolean;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  watchlistItemId: { type: String, required: true, index: true },
  masterProductId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['price_drop', 'back_in_stock', 'deal_alert'],
    required: true
  },
  channel: { 
    type: String, 
    enum: ['email', 'sms', 'push'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending',
    index: true
  },
  subject: { type: String },
  message: { type: String, required: true },
  templateData: { type: Schema.Types.Mixed },
  productName: { type: String, required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  savingsAmount: { type: Number, required: true },
  savingsPercentage: { type: Number, required: true },
  retailerName: { type: String, required: true },
  affiliateUrl: { type: String, required: true },
  isAllTimeLow: { type: Boolean, default: false },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  failedAt: { type: Date },
  errorMessage: { type: String },
  retryCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ masterProductId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ watchlistItemId: 1, type: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
