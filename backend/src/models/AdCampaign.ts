import mongoose, { Schema, Document } from 'mongoose';

export interface IAdCampaign extends Document {
  storeId: string;
  campaignName: string;
  productId?: string;
  targetCategory?: string;
  totalBudget: number;
  spentAmount: number;
  costPerClick: number;
  placementLocation: 'search_top' | 'comparison_top' | 'homepage_banner';
  status: 'active' | 'paused' | 'out_of_credits' | 'completed' | 'draft';
  startDate: Date;
  endDate?: Date;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdCampaignSchema = new Schema({
  storeId: { type: String, required: true, index: true },
  campaignName: { type: String, required: true },
  productId: { type: String, index: true },
  targetCategory: { type: String, index: true },
  totalBudget: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  costPerClick: { type: Number, required: true },
  placementLocation: { 
    type: String, 
    enum: ['search_top', 'comparison_top', 'homepage_banner'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'out_of_credits', 'completed', 'draft'],
    default: 'draft'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  totalImpressions: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  clickThroughRate: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes for efficient queries
AdCampaignSchema.index({ storeId: 1, status: 1 });
AdCampaignSchema.index({ productId: 1, status: 1 });
AdCampaignSchema.index({ targetCategory: 1, status: 1 });
AdCampaignSchema.index({ placementLocation: 1, status: 1 });
AdCampaignSchema.index({ startDate: -1, endDate: -1 });

// Virtual for remaining budget
AdCampaignSchema.virtual('remainingBudget').get(function() {
  return this.totalBudget - this.spentAmount;
});

// Virtual for days active
AdCampaignSchema.virtual('daysActive').get(function() {
  const start = new Date(this.startDate);
  const end = this.endDate ? new Date(this.endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export const AdCampaign = mongoose.model<IAdCampaign>('AdCampaign', AdCampaignSchema);
