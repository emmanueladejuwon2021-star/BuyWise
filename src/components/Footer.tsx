import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'warning');
      return;
    }
    addToast(`Subscribed! We'll send price drop alerts to ${email}`, 'success');
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:py-6">
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">Get Price Drop Alerts</h3>
              <p className="text-xs text-gray-400">Subscribe to get notified when prices drop on your favorite products</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-xs sm:text-sm outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-medium rounded-r-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">P</span>
              </div>
              <span className="text-lg font-bold text-white">PriceWise</span>
            </Link>
            <p className="text-xs text-gray-400 mb-3 max-w-xs">
              Nigeria's #1 price comparison platform. Compare prices across Jumia, Konga, Amazon, and 5+ stores.
            </p>
            <div className="flex gap-2">
              {[
                { icon: '📘', label: 'Facebook', url: 'https://facebook.com' },
                { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
                { icon: '📷', label: 'Instagram', url: 'https://instagram.com' },
                { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com' },
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors" title={social.label}>
                  <span className="text-xs">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs sm:text-sm font-semibold mb-2.5">Explore</h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-xs hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/compare" className="text-xs hover:text-indigo-400 transition-colors font-semibold text-indigo-300">⚖ Compare Products</Link></li>
              <li><Link to="/coupons" className="text-xs hover:text-yellow-400 transition-colors font-semibold text-yellow-300">🏷 Store Coupons</Link></li>
              <li><Link to="/shipping-calculator" className="text-xs hover:text-indigo-400 transition-colors">🚚 Shipping & Customs Calc</Link></li>
              <li><Link to="/membership" className="text-xs hover:text-amber-400 transition-colors text-amber-300 font-medium">★ VIP Club (Ad-Free)</Link></li>
              <li><Link to="/referrals" className="text-xs hover:text-purple-400 transition-colors text-purple-300 font-medium">🎁 Refer & Earn ₦1,000</Link></li>
              <li><Link to="/categories" className="text-xs hover:text-indigo-400 transition-colors">Categories</Link></li>
              <li><Link to="/deals" className="text-xs hover:text-indigo-400 transition-colors">Hot Deals 🔥</Link></li>
              <li><Link to="/market-intelligence" className="text-xs hover:text-indigo-400 transition-colors">Price Trends & Insights</Link></li>
              <li><Link to="/investors" className="text-xs hover:text-indigo-400 transition-colors">How Our Business Works</Link></li>
              <li><Link to="/store/register" className="text-xs hover:text-orange-400 transition-colors font-semibold text-orange-300">🏪 Sell on PriceWise</Link></li>
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h4 className="text-white text-xs sm:text-sm font-semibold mb-2.5">Partner Stores</h4>
            <ul className="space-y-1.5">
              <li><Link to="/search?store=jumia" className="text-xs hover:text-indigo-400 transition-colors">🟠 Jumia</Link></li>
              <li><Link to="/search?store=konga" className="text-xs hover:text-indigo-400 transition-colors">🔴 Konga</Link></li>
              <li><Link to="/search?store=amazon" className="text-xs hover:text-indigo-400 transition-colors">📦 Amazon</Link></li>
              <li><Link to="/search?store=aliexpress" className="text-xs hover:text-indigo-400 transition-colors">🔶 AliExpress</Link></li>
              <li><Link to="/search?store=slot" className="text-xs hover:text-indigo-400 transition-colors">🔵 Slot</Link></li>
              <li><Link to="/search?store=ebay" className="text-xs hover:text-indigo-400 transition-colors">🟡 eBay</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-xs sm:text-sm font-semibold mb-2.5">Customer Support</h4>
            <ul className="space-y-1.5">
              <li><Link to="/help" className="text-xs hover:text-indigo-400 transition-colors">Help Center</Link></li>
              <li><a href="mailto:help@pricewise.ng" className="text-xs hover:text-indigo-400 transition-colors">Contact Us</a></li>
              <li><Link to="/help" className="text-xs hover:text-indigo-400 transition-colors">FAQs</Link></li>
              <li><Link to="/store/register" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Merchant Portal</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-xs sm:text-sm font-semibold mb-2.5">Legal</h4>
            <ul className="space-y-1.5">
              <li><Link to="/privacy" className="text-xs hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-xs hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-xs hover:text-indigo-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/affiliate" className="text-xs hover:text-indigo-400 transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/about" className="text-xs hover:text-indigo-400 transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
            <p className="text-[11px] text-gray-500">
              © 2024 PriceWise. All rights reserved. Prices updated every 15 min.
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-[11px] text-gray-500">Partners:</span>
              {['Paystack', 'Flutterwave', 'Visa', 'Mastercard'].map((partner, i) => (
                <span key={i} className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] text-gray-400">{partner}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
