import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  brand: string;
  specifications: Record<string, string>;
  tags: string[];
  listings: IStoreListing[];
  lastVerified: Date;
  totalClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreListing {
  store: {
    id: string;
    name: string;
    logo: string;
    color: string;
  };
  price: number;
  originalPrice: number;
  currency: string;
  shippingCost: number;
  totalCost: number;
  deliveryDays: string;
  deliveryDate: string;
  inStock: boolean;
  stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order';
  rating: number;
  reviews: number;
  affiliateUrl: string;
  affiliateTag: string;
  discount: number;
  lastUpdated: Date;
  lastVerified: Date;
  seller: string;
  sellerId: string;
  condition: 'new' | 'refurbished' | 'used';
  warranty: string;
  freshnessHours: number;
}

const StoreListingSchema = new Schema({
  store: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    color: { type: String, required: true },
  },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  currency: { type: String, required: true },
  shippingCost: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  deliveryDays: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  stockLevel: { 
    type: String, 
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'pre-order'],
    default: 'in-stock'
  },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  affiliateUrl: { type: String, required: true },
  affiliateTag: { type: String, required: true },
  discount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  lastVerified: { type: Date, default: Date.now },
  seller: { type: String, required: true },
  sellerId: { type: String, required: true },
  condition: { 
    type: String, 
    enum: ['new', 'refurbished', 'used'],
    default: 'new'
  },
  warranty: { type: String, default: '1 year manufacturer warranty' },
  freshnessHours: { type: Number, default: 0 },
});

const ProductSchema = new Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, default: '' },
  images: [{ type: String }],
  brand: { type: String, required: true, index: true },
  specifications: { type: Schema.Types.Mixed, default: {} },
  tags: [{ type: String }],
  listings: [StoreListingSchema],
  lastVerified: { type: Date, default: Date.now },
  totalClicks: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Indexes for faster queries
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });
ProductSchema.index({ category: 1, brand: 1 });
ProductSchema.index({ 'listings.store.id': 1 });
ProductSchema.index({ lastVerified: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
