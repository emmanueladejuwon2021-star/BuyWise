import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Menu, X, Heart, Bell, ChevronDown, Home, Zap, Tag, User, Mic, Crown, 
  Gift, Globe, BarChart2, Store, ShoppingBag, Shield, Settings, PlusCircle, ArrowLeftRight, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRegion, SUPPORTED_REGIONS } from '../context/RegionContext';
import { trendingSearches } from '../data/products';
import { VoiceSearchModal } from './VoiceSearchModal';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const { user, isAuthenticated, role, isOwner, logout, switchRole } = useAuth();
  const { currentRegion, setRegion } = useRegion();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleVoiceSearchResult = (transcript: string) => {
    setSearchQuery(transcript);
    navigate(`/search?q=${encodeURIComponent(transcript)}`);
    addToast(`Voice search: "${transcript}"`, 'info');
  };

  const filteredSuggestions = trendingSearches.filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSeller = role === 'seller';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-xs border-b border-gray-100">
        {/* Top announcement bar - High converting consumer shopping banner */}
        <div className={`text-white text-[11px] py-1 px-3 ${
          isSeller
            ? 'bg-gradient-to-r from-orange-600 to-red-600'
            : 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600'
        }`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span className="truncate flex-1 text-center sm:text-left flex items-center gap-1.5 justify-center sm:justify-start">
              {isSeller ? (
                '🏪 Merchant Portal Active: Manage your store catalog, CPC campaigns & click logs'
              ) : (
                '🔥 Compare prices across 8+ verified stores & save up to 30%!'
              )}
            </span>
            <div className="hidden md:flex items-center gap-3 shrink-0 text-white/90">
              {isSeller ? (
                <>
                  <Link to="/store/dashboard" className="hover:text-yellow-300 font-semibold transition-colors">
                    <span>Store Dashboard</span>
                  </Link>
                  <span className="text-white/40">|</span>
                  <button 
                    onClick={() => { switchRole('buyer'); addToast('Switched to Shopper View', 'info'); navigate('/'); }}
                    className="hover:text-yellow-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    <ArrowLeftRight size={11} />
                    <span>Switch to Shopper</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/compare" className="hover:text-yellow-300 font-semibold transition-colors">
                    <span>Compare</span>
                  </Link>
                  <span className="text-white/40">|</span>
                  <Link to="/coupons" className="hover:text-yellow-300 font-semibold transition-colors">
                    <span>Coupons</span>
                  </Link>
                  <span className="text-white/40">|</span>
                  <Link to="/shipping-calculator" className="hover:text-yellow-300 font-semibold transition-colors">
                    <span>Shipping Calc</span>
                  </Link>
                  <span className="text-white/40">|</span>
                  <Link to="/referrals" className="hover:text-yellow-300 font-semibold transition-colors flex items-center gap-1">
                    <Gift size={12} className="text-yellow-300" />
                    <span>Refer & Earn</span>
                  </Link>
                  <span className="text-white/40">|</span>
                  <Link to="/membership" className="hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                    <Crown size={12} className="text-amber-300" />
                    <span>VIP Club</span>
                  </Link>
                  <span className="text-white/40">|</span>
                  <Link to="/store/register" className="hover:text-yellow-300 font-semibold transition-colors">
                    🏪 Sell on PriceWise →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main header bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xs">
                <span className="text-white font-bold text-base sm:text-lg">P</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none">
                    PriceWise
                  </h1>
                  {isSeller && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                      Merchant
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {isSeller ? 'Seller Hub & Analytics' : 'Compare • Save • Shop'}
                </p>
              </div>
            </Link>

            {/* Region / Currency Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowRegionMenu(!showRegionMenu)}
                className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                title="Change Country & Currency"
              >
                <span>{currentRegion.flag}</span>
                <span className="hidden sm:inline">{currentRegion.currencyCode}</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>
              {showRegionMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b">
                    Select Market
                  </div>
                  {SUPPORTED_REGIONS.map(r => (
                    <button
                      key={r.countryCode}
                      onClick={() => {
                        setRegion(r.countryCode);
                        setShowRegionMenu(false);
                        addToast(`Region changed to ${r.countryName} (${r.currencySymbol})`, 'info');
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                        currentRegion.countryCode === r.countryCode ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{r.flag}</span>
                        <span>{r.countryName}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{r.currencyCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  placeholder="Search iPhone, Nike, 4K TV across Jumia, Konga, Slot..."
                  className="w-full pl-9 pr-16 py-1.5 sm:py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
                />
                <div className="absolute right-1.5 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setShowVoiceModal(true)}
                    className="p-1 sm:p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Voice Search"
                  >
                    <Mic size={15} />
                  </button>
                  <button
                    type="submit"
                    className="p-1 sm:p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                    title="Search"
                  >
                    <Search size={13} />
                  </button>
                </div>
              </div>

              {/* Autocomplete / Trending Search Dropdown */}
              {showSearchSuggestions && searchQuery.trim() && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1.5 animate-in fade-in duration-150">
                  <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-gray-400">
                    Suggestions
                  </div>
                  {filteredSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Search size={12} className="text-gray-400 group-hover:text-indigo-600" />
                        <span>{item}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 group-hover:text-indigo-600 font-medium">Search</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Context Action Button (Merchant Dashboard / Sell on PriceWise) */}
            {isSeller ? (
              <Link
                to="/store/dashboard"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full hover:opacity-95 transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                <Store size={14} />
                <span className="hidden md:inline">Merchant Dashboard</span>
                <span className="md:hidden text-[11px]">Portal</span>
              </Link>
            ) : (
              <Link
                to="/store/register"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full hover:opacity-95 transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                <Store size={14} />
                <span className="hidden md:inline">Sell on PriceWise</span>
                <span className="md:hidden text-[11px]">Sell</span>
              </Link>
            )}

            {/* Desktop Navigation Icons */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {isAuthenticated ? (
                <>
                  {!isSeller && (
                    <Link
                      to="/watchlist"
                      className="p-2 hover:bg-gray-100 rounded-full relative transition-colors"
                      title="Watchlist"
                    >
                      <Heart size={18} className="text-gray-600" />
                      {user && user.watchlist.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {user.watchlist.length}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link 
                    to={isSeller ? "/store/dashboard" : "/dashboard"}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                    title="Notifications"
                  >
                    <Bell size={18} className="text-gray-600" />
                    {user && user.priceAlerts && user.priceAlerts.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-1.5 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium relative ${
                        isSeller 
                          ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                          : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      }`}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <ChevronDown size={13} className="text-gray-500" />
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="px-3.5 py-2.5 border-b bg-gray-50">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-xs text-gray-900 truncate">
                              {user?.name || 'Shopper'}
                            </p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              isSeller 
                                ? 'bg-orange-100 text-orange-800' 
                                : user?.membershipTier && user.membershipTier !== 'free'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {isSeller ? 'Store Merchant' : user?.membershipTier || 'Shopper'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>

                        {isSeller ? (
                          /* Seller Specific Menu */
                          <>
                            <Link to="/store/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50">
                              <Store size={13} /> Merchant Dashboard
                            </Link>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                switchRole('buyer');
                                addToast('Switched to Shopper Mode', 'info');
                                navigate('/');
                              }}
                              className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs text-indigo-600 hover:bg-indigo-50 font-medium"
                            >
                              <ShoppingBag size={13} /> Switch to Shopper Mode
                            </button>
                          </>
                        ) : (
                          /* Shopper Menu */
                          <>
                            <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="block px-3.5 py-2 text-xs hover:bg-gray-50 font-medium text-gray-700">Shopper Dashboard</Link>
                            <Link to="/membership" onClick={() => setShowUserMenu(false)} className="flex items-center justify-between px-3.5 py-2 text-xs text-amber-700 font-medium hover:bg-amber-50">
                              <span>VIP Membership</span>
                              <Crown size={12} className="text-amber-500" />
                            </Link>
                            <Link to="/referrals" onClick={() => setShowUserMenu(false)} className="flex items-center justify-between px-3.5 py-2 text-xs text-indigo-600 font-medium hover:bg-indigo-50">
                              <span>Referrals (₦{user?.referralBalance?.toLocaleString() || 0})</span>
                              <Gift size={12} className="text-indigo-500" />
                            </Link>
                            <Link to="/compare" onClick={() => setShowUserMenu(false)} className="block px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700">Compare Products</Link>
                            <Link to="/coupons" onClick={() => setShowUserMenu(false)} className="block px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700">Store Coupons</Link>
                            <Link to="/shipping-calculator" onClick={() => setShowUserMenu(false)} className="block px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700">Shipping & Customs</Link>
                            <Link to="/watchlist" onClick={() => setShowUserMenu(false)} className="block px-3.5 py-2 text-xs hover:bg-gray-50 text-gray-700">Watchlist</Link>
                            {user?.storeDetails ? (
                              <button
                                onClick={() => {
                                  setShowUserMenu(false);
                                  switchRole('seller');
                                  addToast('Switched to Store Merchant Portal', 'info');
                                  navigate('/store/dashboard');
                                }}
                                className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs text-orange-600 hover:bg-orange-50 font-medium border-t"
                              >
                                <Store size={13} /> Open Store: {user.storeDetails.businessName}
                              </button>
                            ) : (
                              <Link to="/store/register" onClick={() => setShowUserMenu(false)} className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-orange-600 hover:bg-orange-50 font-medium border-t">
                                <Store size={13} /> Register as Merchant
                              </Link>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => { setShowUserMenu(false); logout(); addToast('Signed out successfully', 'success'); navigate('/'); }}
                          className="w-full text-left px-3.5 py-2 text-xs text-red-500 hover:bg-red-50 border-t flex items-center gap-1.5"
                        >
                          <LogOut size={13} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link to="/login" className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    Sign In
                  </Link>
                  <Link to="/signup" className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
              className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown sidebar / drawer */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-xl animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-3 text-xs">
              
              {/* Role Header Banner in Sidebar */}
              {isAuthenticated ? (
                <div className="p-3 rounded-xl border flex items-center justify-between bg-gray-50 border-gray-200/80 text-gray-900">
                  <div>
                    <p className="font-bold text-xs text-gray-900">
                      {user?.name || 'Shopper'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {isSeller ? 'Merchant Portal Active' : `Shopper • ${user?.membershipTier || 'Free'}`}
                    </p>
                  </div>
                  {isSeller ? (
                    <button
                      onClick={() => {
                        switchRole('buyer');
                        setShowMobileMenu(false);
                        addToast('Switched to Shopper Account', 'info');
                        navigate('/');
                      }}
                      className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-600 text-[11px] font-semibold rounded-lg shadow-xs"
                    >
                      Shopper Mode
                    </button>
                  ) : user?.storeDetails ? (
                    <button
                      onClick={() => {
                        switchRole('seller');
                        setShowMobileMenu(false);
                        addToast('Switched to Merchant Portal', 'info');
                        navigate('/store/dashboard');
                      }}
                      className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-semibold rounded-lg shadow-xs"
                    >
                      Store Portal
                    </button>
                  ) : (
                    <Link
                      to="/store/register"
                      onClick={() => setShowMobileMenu(false)}
                      className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-semibold rounded-lg shadow-xs"
                    >
                      Become Seller
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to="/login" 
                    onClick={() => setShowMobileMenu(false)} 
                    className="py-2 px-3 text-center border border-indigo-600 text-indigo-600 font-semibold rounded-xl"
                  >
                    Shopper Sign In
                  </Link>
                  <Link 
                    to="/store/register" 
                    onClick={() => setShowMobileMenu(false)} 
                    className="py-2 px-3 text-center bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl"
                  >
                    Sell on PriceWise
                  </Link>
                </div>
              )}

              {/* Core Shopping & Savings Navigation */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Savings & Comparison Tools</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link to="/" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 font-medium">Home</Link>
                  <Link to="/compare" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">⚖ Compare</Link>
                  <Link to="/coupons" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-yellow-50 text-yellow-800 font-semibold">🏷 Coupons</Link>
                  <Link to="/shipping-calculator" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-blue-50 text-blue-800 font-semibold">🚚 Shipping Calc</Link>
                  <Link to="/deals" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 font-medium">Hot Deals 🔥</Link>
                  <Link to="/categories" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 font-medium">Categories</Link>
                  <Link to="/market-intelligence" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 font-medium">Price Trends</Link>
                  <Link to="/investors" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 font-medium">How We Grow</Link>
                </div>
              </div>

              {/* VIP & Rewards Section */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Perks & Rewards</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link to="/membership" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-amber-50 text-amber-800 font-semibold flex items-center gap-1.5">
                    <Crown size={13} /> VIP Club
                  </Link>
                  <Link to="/referrals" onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-purple-50 text-purple-800 font-semibold flex items-center gap-1.5">
                    <Gift size={13} /> Earn ₦1,000
                  </Link>
                </div>
              </div>

              {/* Logout button if authenticated */}
              {isAuthenticated && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 truncate max-w-[170px]">{user?.email}</span>
                  <button
                    onClick={() => { logout(); setShowMobileMenu(false); addToast('Signed out', 'success'); navigate('/'); }}
                    className="px-3 py-1 text-xs text-red-600 font-medium hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSearch={handleVoiceSearchResult}
      />

      {/* Compact Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden flex items-center justify-around py-1.5 px-2 shadow-lg">
        {[
          { id: 'nav-home', to: '/', label: 'Home', icon: Home },
          { id: 'nav-search', to: '/search', label: 'Search', icon: Search },
          { id: 'nav-deals', to: '/deals', label: 'Deals', icon: Zap },
          { 
            id: 'nav-primary-action', 
            to: isSeller ? '/store/dashboard' : '/watchlist', 
            label: isSeller ? 'Store' : 'Watchlist', 
            icon: isSeller ? Store : Heart, 
            badge: isSeller ? undefined : user?.watchlist.length 
          },
          { 
            id: 'nav-user-account', 
            to: isAuthenticated ? (isSeller ? '/store/dashboard' : '/dashboard') : '/login', 
            label: isAuthenticated ? 'Account' : 'Sign In', 
            icon: User 
          },
        ].map(item => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg text-[10px] font-medium transition-colors relative min-w-[54px] ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <item.icon size={18} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Header;
