
import React from 'react';
import BankSelector from '@/components/BankSelector';
import EconomicIndicators from '@/components/EconomicIndicators';
import { TrendingUp, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="trading-gradient text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AIA Investments</h1>
                <p className="text-white/80 mt-1">Professional Trading Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-white/80">Market Status</div>
                <div className="font-semibold text-green-300">🟢 Open</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Search Trading Banks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find and analyze bank stocks with real-time data and comprehensive insights
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <BankSelector />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-primary mb-2">6</div>
              <div className="text-gray-600">Listed Banks</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">+2.1%</div>
              <div className="text-gray-600">Avg. Performance</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">8.2M</div>
              <div className="text-gray-600">Total Volume</div>
            </div>
          </div>
        </section>

        {/* Economic Indicators Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Economic Indicator Trends</h2>
              <p className="text-gray-600 mt-1">Monitor key economic factors affecting the banking sector</p>
            </div>
          </div>
          
          <EconomicIndicators />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 AIA Investments. Professional trading platform for Sri Lankan banking sector.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
