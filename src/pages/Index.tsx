import React, { useEffect, useState } from 'react';
import BankSelector from '@/components/BankSelector';
import EconomicIndicators from '@/components/EconomicIndicators';
import { TrendingUp, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';
import Layout from '@/components/Layout';
import Chatbot from '@/components/Chatbot';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';

const Index = () => {
  const [stats, setStats] = useState({ banks: 0, avgPerformance: 0, totalVolume: 0 });

  useEffect(() => {
    fetch('/forcastnew.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        // Count banks from header row
        const header = rows[0];
        let banks = 0;
        for (let i = 0; i < header.length; i++) {
          if (header[i] && header[i] !== '') banks++;
        }
        banks = banks / 2; // Each bank has 2 columns: Date, Price (no empty columns in new format)
        // Calculate total volume and avg performance
        let totalVolume = 0;
        let priceCount = 0;
        let priceSum = 0;
        for (let i = 2; i < rows.length; i++) {
          for (let j = 1; j < header.length; j += 2) { // Price columns are at odd indices
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
    <>
      <AnimatedBackground />
      <Layout>
        <Chatbot />
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
          {/* Search Section */}
          <section className="mb-6 sm:mb-12">
            <Card className="mb-4 sm:mb-8 shadow-lg bg-gradient-to-br from-white via-blue-50 to-blue-100 animate-fade-in w-full">
              <CardContent className="text-center py-6 sm:py-8">
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Search Trading Banks
                </h2>
                <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6">
                  Find and analyze bank stocks with real-time data and comprehensive insights
                </p>
                <div className="flex justify-center mb-2 sm:mb-4">
                  <BankSelector />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Economic Indicators Section */}
          <section>
            <Card className="shadow-lg bg-gradient-to-br from-white via-blue-50 to-blue-100 animate-fade-in w-full">
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-2 sm:mb-0">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Economic Indicator Trends</h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor key economic factors affecting the banking sector</p>
                  </div>
                </div>
                <EconomicIndicators />
              </CardContent>
            </Card>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Index;
