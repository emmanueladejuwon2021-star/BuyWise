import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies' | 'affiliate' | 'about';
}

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const pages = {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'January 15, 2024',
      content: (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Watchlist Data:</strong> Products you save and price alerts you set</li>
              <li><strong>Usage Data:</strong> Click history, search queries, and browsing patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Send you price alerts and notifications you've requested</li>
              <li>Personalize your experience and recommendations</li>
              <li>Analyze trends and improve our platform</li>
              <li>Communicate with you about updates and promotions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
            <p className="text-gray-600 mb-3">We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Service Providers:</strong> Third parties who help us operate our platform</li>
              <li><strong>Partner Stores:</strong> When you click through to make a purchase</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information, including encryption, 
              secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@pricewise.ng" className="text-indigo-600 hover:underline">privacy@pricewise.ng</a>
            </p>
          </section>
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'January 15, 2024',
      content: (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using PriceWise, you agree to be bound by these Terms of Service. If you do not agree 
              to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600">
              PriceWise is a price comparison platform that aggregates product information from various online retailers. 
              We provide price comparisons, product details, and redirect users to retailer websites for purchases.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-3">When creating an account, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
            <p className="text-gray-600 mb-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape or collect data without permission</li>
              <li>Interfere with or disrupt the service</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600">
              All content on PriceWise, including text, graphics, logos, and software, is the property of PriceWise 
              or its licensors and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-gray-600">
              PriceWise is provided "as is" without warranties of any kind. We do not guarantee the accuracy, 
              completeness, or reliability of any information on our platform. Prices and availability may change 
              without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600">
              PriceWise shall not be liable for any indirect, incidental, special, or consequential damages, 
              including but not limited to loss of profits, data, or business opportunities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Continued use of the service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>
        </>
      ),
    },
    cookies: {
      title: 'Cookie Policy',
      lastUpdated: 'January 15, 2024',
      content: (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600">
              Cookies are small text files stored on your device when you visit a website. They help websites remember 
              your preferences and improve your browsing experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-600 mb-3">We use cookies for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function (authentication, security)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Track usage patterns to improve our service</li>
              <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-3">You can control cookies through your browser settings:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>View and delete existing cookies</li>
              <li>Block all cookies</li>
              <li>Allow only first-party cookies</li>
              <li>Receive notifications when cookies are set</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Note: Disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600">
              Some cookies are placed by third-party services (like Google Analytics). We do not control these cookies. 
              Please refer to the respective third-party privacy policies for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an 
              updated revision date.
            </p>
          </section>
        </>
      ),
    },
    affiliate: {
      title: 'Affiliate Disclosure',
      lastUpdated: 'January 15, 2024',
      content: (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Make Money</h2>
            <p className="text-gray-600">
              PriceWise participates in affiliate programs with various online retailers. When you click on a product 
              link on our site and make a purchase, we may earn a commission at no extra cost to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to You</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>No Price Impact:</strong> Affiliate commissions do not affect the prices you pay</li>
              <li><strong>Unbiased Comparisons:</strong> We rank products by value, not by commission rates</li>
              <li><strong>Transparency:</strong> We clearly mark sponsored content and affiliate links</li>
              <li><strong>Your Trust:</strong> We only partner with reputable retailers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
              <li>You browse products on PriceWise</li>
              <li>You click "Buy Now" or a product link</li>
              <li>We redirect you to the retailer's website with a tracking code</li>
              <li>If you make a purchase, the retailer pays us a commission</li>
              <li>You pay the same price as if you visited the retailer directly</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Commission Rates</h2>
            <p className="text-gray-600 mb-3">Commission rates vary by retailer:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Jumia: 5-8% commission</li>
              <li>Konga: 4-7% commission</li>
              <li>Amazon: 3-6% commission</li>
              <li>Other retailers: 3-10% commission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why This Matters</h2>
            <p className="text-gray-600">
              Affiliate commissions allow us to keep PriceWise free for all users. Instead of charging subscription fees 
              or showing intrusive ads, we earn revenue by helping you find the best deals. It's a win-win!
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-600">
              If you have questions about our affiliate relationships, please contact us at{' '}
              <a href="mailto:partners@pricewise.ng" className="text-indigo-600 hover:underline">partners@pricewise.ng</a>
            </p>
          </section>
        </>
      ),
    },
    about: {
      title: 'About PriceWise',
      lastUpdated: 'January 15, 2024',
      content: (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg">
              PriceWise is on a mission to help every shopper in Nigeria find the best deals and save money on every 
              purchase. We believe that informed consumers make better buying decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-gray-600 mb-3">
              We aggregate product information from multiple online retailers and present it in an easy-to-compare format. 
              Our platform helps you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Compare prices across 8+ major retailers</li>
              <li>Track price history and spot the best time to buy</li>
              <li>Set alerts for price drops on products you want</li>
              <li>Discover deals and promotions you might have missed</li>
              <li>Make informed decisions with seller ratings and reviews</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-3">
              PriceWise was founded in 2024 by a team of tech enthusiasts who were frustrated by the time-consuming 
              process of comparing prices across multiple websites. We built PriceWise to solve this problem for 
              millions of Nigerian shoppers.
            </p>
            <p className="text-gray-600">
              Today, we help over 100,000 shoppers save an average of ₦15,000 per purchase, totaling over ₦1.5 billion 
              in savings for our users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">🎯 Transparency</h3>
                <p className="text-gray-600 text-sm">We clearly show all prices, fees, and affiliate relationships</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">⚡ Speed</h3>
                <p className="text-gray-600 text-sm">We update prices every 15 minutes to ensure accuracy</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">🤝 Trust</h3>
                <p className="text-gray-600 text-sm">We only partner with verified, reputable retailers</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">💡 Innovation</h3>
                <p className="text-gray-600 text-sm">We constantly improve our algorithms and user experience</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">100K+</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">8+</p>
                <p className="text-sm text-gray-600">Partner Stores</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">₦1.5B</p>
                <p className="text-sm text-gray-600">User Savings</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">50K+</p>
                <p className="text-sm text-gray-600">Products Tracked</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
            <p className="text-gray-600">
              We're always looking for talented individuals to join our team. If you're passionate about e-commerce, 
              technology, and helping consumers save money, we'd love to hear from you. Send your resume to{' '}
              <a href="mailto:careers@pricewise.ng" className="text-indigo-600 hover:underline">careers@pricewise.ng</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="space-y-2 text-gray-600">
              <p>📧 General Inquiries: <a href="mailto:hello@pricewise.ng" className="text-indigo-600 hover:underline">hello@pricewise.ng</a></p>
              <p>📞 Phone: +234 800 PRICE (77423)</p>
              <p>📍 Address: 123 Tech Hub, Victoria Island, Lagos, Nigeria</p>
            </div>
          </section>
        </>
      ),
    },
  };

  const page = pages[type];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
          <p className="text-sm text-gray-500">Last updated: {page.lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          {page.content}
        </div>

        {/* Navigation */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Related Pages</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/privacy" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              Cookie Policy
            </Link>
            <Link to="/affiliate" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              Affiliate Disclosure
            </Link>
            <Link to="/about" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              About Us
            </Link>
            <Link to="/help" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
