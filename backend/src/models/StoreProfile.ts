import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreProfile extends Document {
  userId: string;
  businessName: string;
  logoUrl: string;
  description: string;
  address: string;
  city: string;
  state: string;
  deliveryAreas: string[];
  contactEmail: string;
  contactPhone: string;
  website: string;
  membershipLevel: 'free' | 'premium' | 'enterprise';
  membershipStatus: 'active' | 'suspended' | 'cancelled' | 'pending';
  membershipExpiry: Date;
  adCreditsBalance: number;
  totalAdCreditsPurchased: number;
  isVerified: boolean;
  verificationDate?: Date;
  rating: number;
  totalProducts: number;
  totalClicks: number;
  totalSales: number;
  payoutDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  businessName: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  deliveryAreas: [{ type: String }],
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, default: '' },
  website: { type: String, default: '' },
  membershipLevel: { 
    type: String, 
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  membershipStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'cancelled', 'pending'],
    default: 'pending'
  },
  membershipExpiry: { type: Date },
  adCreditsBalance: { type: Number, default: 0 },
  totalAdCreditsPurchased: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  rating: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  payoutDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String },
  },
}, {
  timestamps: true,
});

// Indexes
StoreProfileSchema.index({ membershipLevel: 1, membershipStatus: 1 });
StoreProfileSchema.index({ isVerified: 1 });
StoreProfileSchema.index({ businessName: 'text', description: 'text' });

export const StoreProfile = mongoose.model<IStoreProfile>('StoreProfile', StoreProfileSchema);
