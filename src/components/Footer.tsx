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
        <div className="max-w-7xl mx-auto px-4 py-10">
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Get Price Drop Alerts</h3>
              <p className="text-sm text-gray-400">Subscribe to get notified when prices drop on your favorite products</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-xl text-sm outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-r-xl hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">PriceWise</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Nigeria's #1 price comparison platform. Compare prices across Jumia, Konga, Amazon, and 5+ stores.
            </p>
            <div className="flex gap-3">
              {[
                { icon: '📘', label: 'Facebook', url: 'https://facebook.com' },
                { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
                { icon: '📷', label: 'Instagram', url: 'https://instagram.com' },
                { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com' },
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors" title={social.label}>
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/categories" className="text-sm hover:text-indigo-400 transition-colors">Categories</Link></li>
              <li><Link to="/deals" className="text-sm hover:text-indigo-400 transition-colors">Hot Deals</Link></li>
              <li><Link to="/search" className="text-sm hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/dashboard" className="text-sm hover:text-indigo-400 transition-colors">My Dashboard</Link></li>
              <li><Link to="/store/register" className="text-sm hover:text-indigo-400 transition-colors font-semibold">🏪 Sell on PriceWise</Link></li>
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h4 className="text-white font-semibold mb-4">Partner Stores</h4>
            <ul className="space-y-2.5">
              <li><Link to="/search?store=jumia" className="text-sm hover:text-indigo-400 transition-colors">🟠 Jumia</Link></li>
              <li><Link to="/search?store=konga" className="text-sm hover:text-indigo-400 transition-colors">🔴 Konga</Link></li>
              <li><Link to="/search?store=amazon" className="text-sm hover:text-indigo-400 transition-colors">📦 Amazon</Link></li>
              <li><Link to="/search?store=aliexpress" className="text-sm hover:text-indigo-400 transition-colors">🔶 AliExpress</Link></li>
              <li><Link to="/search?store=slot" className="text-sm hover:text-indigo-400 transition-colors">🔵 Slot</Link></li>
              <li><Link to="/search?store=ebay" className="text-sm hover:text-indigo-400 transition-colors">🟡 eBay</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="text-sm hover:text-indigo-400 transition-colors">Help Center</Link></li>
              <li><a href="mailto:help@pricewise.ng" className="text-sm hover:text-indigo-400 transition-colors">Contact Us</a></li>
              <li><Link to="/help" className="text-sm hover:text-indigo-400 transition-colors">FAQs</Link></li>
              <li><a href="mailto:feedback@pricewise.ng" className="text-sm hover:text-indigo-400 transition-colors">Send Feedback</a></li>
              <li><a href="mailto:bugs@pricewise.ng" className="text-sm hover:text-indigo-400 transition-colors">Report a Bug</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-sm hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-sm hover:text-indigo-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/affiliate" className="text-sm hover:text-indigo-400 transition-colors">Affiliate Disclosure</Link></li>
              <li><Link to="/about" className="text-sm hover:text-indigo-400 transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © 2024 PriceWise. All rights reserved. Prices are updated every 15 minutes.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Payment Partners:</span>
              <div className="flex items-center gap-2">
                {['Paystack', 'Flutterwave', 'Visa', 'Mastercard'].map((partner, i) => (
                  <span key={i} className="bg-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-700 cursor-default">{partner}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
