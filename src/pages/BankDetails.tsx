
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, TrendingUp, TrendingDown, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const bankData = {
  commercial: {
    name: 'Commercial Bank of Ceylon',
    symbol: 'COMB',
    currentPrice: 125.50,
    change: '+2.3%',
    isPositive: true,
    marketCap: '156.8B LKR',
    volume: '2.1M',
    pe: '8.4',
    dividend: '4.2%',
    capital: '15.2B LKR',
    description: 'Commercial Bank of Ceylon PLC is a leading private sector commercial bank in Sri Lanka.'
  },
  sampath: {
    name: 'Sampath Bank PLC',
    symbol: 'SAMP',
    currentPrice: 98.75,
    change: '+1.8%',
    isPositive: true,
    marketCap: '98.2B LKR',
    volume: '1.8M',
    pe: '7.2',
    dividend: '3.8%',
    capital: '12.5B LKR',
    description: 'Sampath Bank PLC is one of the largest private sector commercial banks in Sri Lanka.'
  },
  hnb: {
    name: 'Hatton National Bank',
    symbol: 'HNB',
    currentPrice: 156.20,
    change: '-0.5%',
    isPositive: false,
    marketCap: '201.3B LKR',
    volume: '3.2M',
    pe: '9.1',
    dividend: '5.1%',
    capital: '18.7B LKR',
    description: 'Hatton National Bank PLC is one of the premier commercial banks in Sri Lanka.'
  },
  panasia: {
    name: 'Pan Asia Banking Corporation',
    symbol: 'PAB',
    currentPrice: 32.40,
    change: '+3.2%',
    isPositive: true,
    marketCap: '32.1B LKR',
    volume: '890K',
    pe: '6.8',
    dividend: '2.9%',
    capital: '8.2B LKR',
    description: 'Pan Asia Banking Corporation PLC is a commercial bank in Sri Lanka.'
  },
  dfcc: {
    name: 'DFCC Bank',
    symbol: 'DFCC',
    currentPrice: 67.80,
    change: '+1.1%',
    isPositive: true,
    marketCap: '67.1B LKR',
    volume: '1.2M',
    pe: '7.9',
    dividend: '3.5%',
    capital: '11.8B LKR',
    description: 'DFCC Bank is a premier development bank in Sri Lanka with commercial banking operations.'
  },
  ndb: {
    name: 'National Development Bank',
    symbol: 'NDB',
    currentPrice: 89.30,
    change: '+0.9%',
    isPositive: true,
    marketCap: '78.9B LKR',
    volume: '1.5M',
    pe: '8.2',
    dividend: '4.0%',
    capital: '13.2B LKR',
    description: 'National Development Bank PLC is a premier development bank in Sri Lanka.'
  }
};

const priceHistory = [
  { month: 'Jan', price: 118 },
  { month: 'Feb', price: 122 },
  { month: 'Mar', price: 119 },
  { month: 'Apr', price: 124 },
  { month: 'May', price: 121 },
  { month: 'Jun', price: 126 },
];

const BankDetails = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  
  const bank = bankData[bankId as keyof typeof bankData];

  if (!bank) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bank Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Bank Header */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{bank.name}</h1>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm font-medium">
                      {bank.symbol}
                    </Badge>
                    <span className="text-gray-600">{bank.description}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  LKR {bank.currentPrice}
                </div>
                <div className={`flex items-center gap-1 text-lg font-semibold ${
                  bank.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {bank.isPositive ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {bank.change}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Market Cap</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{bank.marketCap}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Volume</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{bank.volume}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">P/E Ratio</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{bank.pe}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Dividend Yield</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{bank.dividend}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Chart */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Stock Price Historical & Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2ec4b6" 
                    fill="#e6f9f7"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Financial Ratios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Capital</span>
                  <span className="font-semibold">{bank.capital}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Current Value</span>
                  <span className="font-semibold">LKR {bank.currentPrice}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Ins Value</span>
                  <span className="font-semibold">LKR {(bank.currentPrice * 0.95).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex gap-2 mb-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Buy
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-50">
                    Sell
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        <Card className="mt-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Policy Notes & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-blue-50 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                Environmental and policy factors continue to influence the banking sector. 
                Current monetary policies, inflation trends, and regulatory changes are key 
                drivers for {bank.name}'s performance. The bank shows strong fundamentals 
                with consistent dividend payments and stable capital ratios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankDetails;
