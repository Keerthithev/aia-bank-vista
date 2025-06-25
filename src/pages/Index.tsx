import React, { useEffect, useState } from 'react';
import BankSelector from '@/components/BankSelector';
import EconomicIndicators from '@/components/EconomicIndicators';
import { TrendingUp, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';
import Layout from '@/components/Layout';

const Index = () => {
  const [stats, setStats] = useState({ banks: 0, avgPerformance: 0, totalVolume: 0 });

  useEffect(() => {
    fetch('/forcasted stock price.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        // Count banks from header row
        const header = rows[0];
        let banks = 0;
        for (let i = 0; i < header.length; i++) {
          if (header[i] && header[i] !== '') banks++;
        }
        banks = banks / 3; // Each bank has 3 columns: name, empty, name, empty, etc.
        // Calculate total volume and avg performance
        let totalVolume = 0;
        let priceCount = 0;
        let priceSum = 0;
        for (let i = 2; i < rows.length; i++) {
          for (let j = 1; j < header.length; j += 3) {
            const price = parseFloat(rows[i][j]);
            if (!isNaN(price)) {
              totalVolume += price;
              priceSum += price;
              priceCount++;
            }
          }
        }
        const avgPerformance = priceCount > 0 ? (priceSum / priceCount) : 0;
        setStats({ banks: Math.round(banks), avgPerformance, totalVolume });
      });
  }, []);

  return (
    <Layout>
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
    </Layout>
  );
};

export default Index;
