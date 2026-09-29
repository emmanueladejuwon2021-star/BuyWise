import React from 'react';
import { Link } from 'react-router-dom';

const MarketIntelligencePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Market trends</h1>
        <p className="text-base text-gray-500 mt-2">No sample search volumes or fake prices. This page fills when real search logs exist.</p>
        <Link to="/search" className="inline-block mt-6 text-indigo-600 font-semibold">Go to search</Link>
      </div>
    </div>
  );
};

export default MarketIntelligencePage;
