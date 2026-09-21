import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is PriceWise?',
    answer: 'PriceWise is Nigeria\'s #1 price comparison platform. We help you find the best deals across multiple online stores like Jumia, Konga, Amazon, and more. Compare prices side-by-side and save money on every purchase.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click the "Sign Up" button in the top right corner. You can register with your email address or use Google/Facebook social login. It only takes 30 seconds!',
  },
  {
    category: 'Getting Started',
    question: 'Is PriceWise free to use?',
    answer: 'Yes! PriceWise is completely free for shoppers. You can search, compare prices, create watchlists, and set price alerts without paying anything. We earn a small commission from stores when you make a purchase through our links.',
  },
  {
    category: 'Shopping',
    question: 'How do I search for products?',
    answer: 'Use the search bar at the top of any page. Type the product name, brand, or category and press Enter. You can also browse by category from the homepage or use filters to narrow down results.',
  },
  {
    category: 'Shopping',
    question: 'How do I compare prices?',
    answer: 'Click on any product to see its detail page. You\'ll see a comparison table showing prices from all stores selling that product. The table includes base price, shipping cost, total cost, delivery time, and seller ratings.',
  },
  {
    category: 'Shopping',
    question: 'What does "Best Value" mean?',
    answer: 'Best Value is our smart ranking algorithm that considers price (50%), seller rating (30%), and delivery speed (20%) to recommend the overall best option, not just the cheapest.',
  },
  {
    category: 'Watchlist & Alerts',
    question: 'How do I add products to my watchlist?',
    answer: 'Click the heart icon (❤️) on any product card or product detail page. You must be logged in to use this feature. Products in your watchlist will be tracked for price changes.',
  },
  {
    category: 'Watchlist & Alerts',
    question: 'How do price alerts work?',
    answer: 'On any product page, click the "Price Alert" button. Set your target price and choose how you want to be notified (email, SMS, or push notification). We\'ll alert you when the price drops to or below your target.',
  },
  {
    category: 'Watchlist & Alerts',
    question: 'Can I set percentage-based alerts?',
    answer: 'Yes! When setting a price alert, you can choose between absolute price targets (e.g., "notify me at ₦50,000") or percentage drops (e.g., "notify me when price drops 10%").',
  },
  {
    category: 'Stores & Sellers',
    question: 'Which stores do you compare?',
    answer: 'We currently compare prices from Jumia, Konga, Amazon, AliExpress, Jiji, Slot, PayPorte Mall, and eBay. We\'re constantly adding more stores!',
  },
  {
    category: 'Stores & Sellers',
    question: 'Are the prices up-to-date?',
    answer: 'We update prices every 15-30 minutes. Each listing shows when it was last verified. If a price hasn\'t been updated in 24 hours, we flag it as "stale" so you know to double-check.',
  },
  {
    category: 'Stores & Sellers',
    question: 'I\'m a store owner. How do I list my products?',
    answer: 'Click "Sell on PriceWise" in the header to register your store. You can start with a free account or upgrade to Premium/Enterprise for verified badges, analytics, and sponsored listings.',
  },
  {
    category: 'Payments & Orders',
    question: 'Do I pay through PriceWise?',
    answer: 'No. When you click "Buy Now", we redirect you to the store\'s website where you complete the purchase directly. This ensures you get the store\'s full customer service and return policies.',
  },
  {
    category: 'Payments & Orders',
    question: 'Is it safe to click through to stores?',
    answer: 'Absolutely! We only link to verified, legitimate stores. All links are tracked for your protection, and we never store your payment information.',
  },
  {
    category: 'Account & Privacy',
    question: 'How do I delete my account?',
    answer: 'Go to your Dashboard → Settings → Account Settings → Delete Account. Note that this action cannot be undone and all your watchlists and alerts will be permanently deleted.',
  },
  {
    category: 'Account & Privacy',
    question: 'What data do you collect?',
    answer: 'We collect minimal data: your email, name, watchlist items, price alerts, and click history (to track which stores you visit). We never sell your data to third parties. See our Privacy Policy for details.',
  },
  {
    category: 'Technical',
    question: 'Why is a product showing as "Out of Stock"?',
    answer: 'This means the store currently doesn\'t have the item available. We automatically check stock status every 15 minutes. You can set a "back in stock" alert to be notified when it becomes available again.',
  },
  {
    category: 'Technical',
    question: 'The price seems wrong. What should I do?',
    answer: 'Prices can change rapidly. Click "Visit Store" to check the current price on the retailer\'s website. If you notice a significant discrepancy, use the "Report a Bug" feature to let us know.',
  },
];

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg text-white/80 mb-8">Find answers to common questions or search below</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 bg-white shadow-xl outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">No results found. Try a different search term.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="text-xs text-indigo-600 font-medium">{faq.category}</span>
                    <h3 className="text-base font-semibold text-gray-900 mt-1">{faq.question}</h3>
                  </div>
                  {openIndex === index ? (
                    <ChevronUp size={20} className="text-gray-400 shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 shrink-0 ml-4" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-6">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:help@pricewise.ng"
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
            >
              📧 Email Support
            </a>
            <a
              href="tel:+23480077423"
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              📞 Call Us: +234 800 PRICE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
