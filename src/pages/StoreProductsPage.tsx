import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, 
  AlertCircle, ArrowUpRight, TrendingUp, Eye, MousePointer, RefreshCw, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'draft';
  clicks: number;
  conversions: number;
  cpcBid: number;
  inCampaign: boolean;
  syncedAt: string;
}

const StoreProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [products, setProducts] = useState<StoreProduct[]>([
    {
      id: 'prod-1',
      name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
      category: 'smartphones',
      price: 1420000,
      originalPrice: 1550000,
      stock: 14,
      status: 'active',
      clicks: 840,
      conversions: 18,
      cpcBid: 45,
      inCampaign: true,
      syncedAt: 'Just now',
    },
    {
      id: 'prod-2',
      name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      category: 'smartphones',
      price: 1680000,
      originalPrice: 1750000,
      stock: 8,
      status: 'active',
      clicks: 1250,
      conversions: 24,
      cpcBid: 50,
      inCampaign: true,
      syncedAt: '2 mins ago',
    },
    {
      id: 'prod-3',
      name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      category: 'audio',
      price: 380000,
      originalPrice: 420000,
      stock: 22,
      status: 'active',
      clicks: 430,
      conversions: 11,
      cpcBid: 25,
      inCampaign: false,
      syncedAt: '10 mins ago',
    },
    {
      id: 'prod-4',
      name: 'Apple MacBook Pro 14" M3 Pro 18GB/512GB Space Black',
      category: 'laptops',
      price: 2450000,
      originalPrice: 2600000,
      stock: 5,
      status: 'active',
      clicks: 620,
      conversions: 7,
      cpcBid: 60,
      inCampaign: true,
      syncedAt: '15 mins ago',
    },
    {
      id: 'prod-5',
      name: 'LG 55-inch OLED C3 4K Smart TV 120Hz',
      category: 'appliances',
      price: 1150000,
      originalPrice: 1250000,
      stock: 0,
      status: 'out_of_stock',
      clicks: 310,
      conversions: 4,
      cpcBid: 30,
      inCampaign: false,
      syncedAt: '1 hour ago',
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'smartphones',
    price: '',
    originalPrice: '',
    stock: '',
    cpcBid: '35',
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      addToast('Please enter product title and price', 'warning');
      return;
    }

    const priceNum = parseFloat(newProduct.price);
    const origNum = newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : priceNum;

    const created: StoreProduct = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: priceNum,
      originalPrice: origNum,
      stock: parseInt(newProduct.stock) || 10,
      status: 'active',
      clicks: 0,
      conversions: 0,
      cpcBid: parseFloat(newProduct.cpcBid) || 35,
      inCampaign: false,
      syncedAt: 'Just now',
    };

    setProducts([created, ...products]);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      category: 'smartphones',
      price: '',
      originalPrice: '',
      stock: '',
      cpcBid: '35',
    });
    addToast('Product successfully added to store catalog and synced to comparison index', 'success');
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    addToast('Product removed from store catalog', 'info');
  };

  const handleToggleStatus = (id: string) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const next = p.status === 'active' ? 'out_of_stock' : 'active';
        return { ...p, status: next };
      }
      return p;
    }));
    addToast('Product stock status updated', 'success');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatNgn = (val: number) => `₦${val.toLocaleString()}`;

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-orange-600" />
            Store Catalog & Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your store's active listings, price index feeds, and CPC bidding parameters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addToast('Store catalog re-indexed across all search engines', 'success')}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} /> Re-sync Index
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-xs transition-opacity"
          >
            <Plus size={14} /> Add New Listing
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] text-gray-500">Total Catalog Items</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{products.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% active on price index</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] text-gray-500">Campaign Promoted</p>
          <p className="text-lg font-bold text-orange-600 mt-0.5">
            {products.filter(p => p.inCampaign).length}
          </p>
          <span className="text-[10px] text-orange-600 font-semibold">Bidding on Top Placement</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] text-gray-500">Total Shopper Clicks</p>
          <p className="text-lg font-bold text-indigo-600 mt-0.5">
            {products.reduce((acc, p) => acc + p.clicks, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-indigo-600 font-semibold">High purchase intent</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] text-gray-500">Lead Conversions</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {products.reduce((acc, p) => acc + p.conversions, 0)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Verified store checkouts</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-orange-500 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="audio">Audio</option>
            <option value="appliances">Appliances</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-orange-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Merchant Price</th>
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3">CPC Bid</th>
                <th className="py-2.5 px-3">Traffic & Leads</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No products matched your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        SKU: {product.id} • Sync: {product.syncedAt}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{formatNgn(product.price)}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-[10px] text-gray-400 line-through">
                          {formatNgn(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(product.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {product.status === 'active' ? `✓ In Stock (${product.stock})` : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-semibold text-orange-600">
                        <span>₦{product.cpcBid}</span>
                        {product.inCampaign && (
                          <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[9px] font-bold">
                            BOOST
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-gray-900 font-medium">
                        {product.clicks.toLocaleString()} clicks
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {product.conversions} conversions ({((product.conversions / (product.clicks || 1)) * 100).toFixed(1)}% CTR)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/store/campaigns`}
                          className="p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Promote in Campaign"
                        >
                          <Sparkles size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-gray-900 mb-1">Add Product to Store Catalog</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your item details to publish immediately to the PriceWise search index.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Apple iPad Pro 11-inch M4"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="audio">Audio</option>
                    <option value="appliances">Appliances</option>
                    <option value="gaming">Gaming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₦)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 850000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Original Price (₦)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    placeholder="e.g. 920000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CPC Placement Bid (₦ per shopper click)
                </label>
                <input
                  type="number"
                  value={newProduct.cpcBid}
                  onChange={(e) => setNewProduct({ ...newProduct, cpcBid: e.target.value })}
                  placeholder="e.g. 35"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Recommended bid for top position: ₦30 - ₦60</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 shadow-xs"
                >
                  Publish to Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreProductsPage;
