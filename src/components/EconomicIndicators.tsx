import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

const indicators = [
  {
    title: 'USD/LKR',
    value: '299.83',
    change: '-2.1%',
    isPositive: false,
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
    dataKey: 'usd'
  },
  {
    title: 'Inflation Rate',
    value: '4.6%',
    change: '-0.3%',
    isPositive: false,
    icon: TrendingDown,
    color: 'from-red-500 to-red-600',
    dataKey: 'inflation'
  },
  {
    title: 'Interest Rate',
    value: '7.25%',
    change: '-0.3%',
    isPositive: false,
    icon: Percent,
    color: 'from-green-500 to-green-600',
    dataKey: 'interest'
  },
  {
    title: 'GDP Growth',
    value: '3.4%',
    change: '+0.2%',
    isPositive: true,
    icon: BarChart3,
    color: 'from-purple-500 to-purple-600',
    dataKey: 'gdp'
  },
];

const EconomicIndicators = () => {
  const [economicData, setEconomicData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/environmental.csv')
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse(text, { header: true });
        // Transform the parsed data to the format expected by the charts
        const months = Object.keys(parsed.data[0] || {}).filter(k => k !== '');
        const inf = parsed.data.find(row => row[''] === 'inf');
        const usd = parsed.data.find(row => row[''] === 'usd');
        const int = parsed.data.find(row => row[''] === 'int');
        const gdp = parsed.data.find(row => row[''] === 'gdp');
        const chartData = months.map(month => ({
          month,
          usd: usd ? parseFloat(usd[month]) : null,
          inflation: inf ? parseFloat(inf[month]) : null,
          interest: int ? parseFloat(int[month]) : null,
          gdp: gdp ? parseFloat(gdp[month]) : null,
        }));
        setEconomicData(chartData);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Economic Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <Card key={index} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${indicator.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    indicator.isPositive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {indicator.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {indicator.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{indicator.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{indicator.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* USD/LKR Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <DollarSign className="h-5 w-5 text-blue-600" />
              USD/LKR Exchange Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={economicData}>
                <defs>
                  <linearGradient id="usdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#3b82f6' }}
                  formatter={v => v?.toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="usd"
                  stroke="#3b82f6"
                  fill="url(#usdGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inflation Rate Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Inflation Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={economicData}>
                <defs>
                  <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#ef4444' }}
                  formatter={v => v?.toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="inflation"
                  stroke="#ef4444"
                  fill="url(#inflationGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#ef4444' }}
                  activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interest Rate Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Percent className="h-5 w-5 text-green-600" />
              Interest Rate Movement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={economicData}>
                <defs>
                  <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#22c55e' }}
                  formatter={v => v?.toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stroke="#22c55e"
                  fill="url(#interestGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#22c55e' }}
                  activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GDP Growth Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              GDP Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={economicData}>
                <defs>
                  <linearGradient id="gdpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a21caf" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#a21caf" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#a21caf' }}
                  formatter={v => v?.toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="gdp"
                  stroke="#a21caf"
                  fill="url(#gdpGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#a21caf' }}
                  activeDot={{ r: 6, fill: '#a21caf', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EconomicIndicators;
