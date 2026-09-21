import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { trendingSearches } from '../data/products';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSearchSuggestions(false);
  };

  const filteredSuggestions = trendingSearches.filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🔥 Compare prices across 8+ stores and save up to 30%!</span>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/store/register" className="hover:text-yellow-300 font-semibold transition-colors">
              🏪 Are you a store owner? Sell on PriceWise →
            </Link>
            <span className="text-white/50">|</span>
            <span>📞 +234 800 PRICE</span>
            <span>📧 help@pricewise.ng</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PriceWise
              </h1>
              <p className="text-[10px] text-gray-500 -mt-1">Compare • Save • Shop</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-full overflow-hidden focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <input
                type="text"
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                className="flex-1 px-5 py-2.5 bg-transparent outline-none text-sm"
              />
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 hover:opacity-90 transition-opacity">
                <Search size={18} />
              </button>
            </div>

            {/* Search Suggestions */}
            {showSearchSuggestions && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {filteredSuggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b">SUGGESTIONS</div>
                    {filteredSuggestions.slice(0, 6).map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                      >
                        <Search size={14} className="text-gray-400" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No suggestions found</div>
                )}
              </div>
            )}
          </form>

          {/* Sell on PriceWise Button - ALWAYS VISIBLE */}
          <Link
            to="/store/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full hover:scale-105 transition-all shadow-lg whitespace-nowrap"
          >
            <span className="text-lg">🏪</span>
            <span className="hidden sm:inline">Sell on PriceWise</span>
            <span className="sm:hidden">Sell</span>
          </Link>

          {/* Navigation Icons */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/watchlist" className="p-2.5 hover:bg-gray-100 rounded-full relative transition-colors">
                  <Heart size={20} className="text-gray-600" />
                  {user && user.watchlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {user.watchlist.length}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => addToast('No new notifications', 'info')}
                  className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative"
                  title="Notifications"
                >
                  <Bell size={20} className="text-gray-600" />
                  {user && user.priceAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b bg-gray-50">
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Dashboard</Link>
                      <Link to="/admin" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Admin Panel</Link>
                      <Link to="/watchlist" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Watchlist</Link>
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Price Alerts</Link>
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">Click History</Link>
                      <button
                        onClick={() => { logout(); addToast('Signed out successfully', 'success'); navigate('/'); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* PROMINENT MERCHANT LINK */}
            <Link 
              to="/store/register" 
              onClick={() => setShowMobileMenu(false)} 
              className="block py-3 px-4 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-center shadow-lg"
            >
              🏪 Sell on PriceWise
            </Link>
            
            <div className="border-t border-gray-200 pt-3">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium hover:text-indigo-600">Home</Link>
              <Link to="/categories" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium hover:text-indigo-600">Categories</Link>
              <Link to="/deals" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium hover:text-indigo-600">Hot Deals 🔥</Link>
              <Link to="/watchlist" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium hover:text-indigo-600">Watchlist</Link>
              {isAuthenticated && <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium hover:text-indigo-600">Dashboard</Link>}
            </div>
            {isAuthenticated ? (
              <button onClick={() => { logout(); setShowMobileMenu(false); addToast('Signed out successfully', 'success'); navigate('/'); }} className="block py-2 text-sm font-medium text-red-500">Sign Out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-indigo-600">Sign In</Link>
                <Link to="/signup" onClick={() => setShowMobileMenu(false)} className="block py-2 text-sm font-medium text-purple-600">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
