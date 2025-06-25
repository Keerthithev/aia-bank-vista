import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, TrendingUp, TrendingDown, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';
import Papa from 'papaparse';
import Layout from '@/components/Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BANK_COLUMN_MAP = {
  commercial: { name: 'Commercial', dateCol: 0, priceCol: 1 },
  sampath: { name: 'Sampath', dateCol: 3, priceCol: 4 },
  hnb: { name: 'HNB', dateCol: 6, priceCol: 7 },
  panasia: { name: 'Pan Asia', dateCol: 9, priceCol: 10 },
  dfcc: { name: 'DFCC', dateCol: 12, priceCol: 13 },
  ndb: { name: 'NDB', dateCol: 15, priceCol: 16 },
};

const BankDetails = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const [bankData, setBankData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [chartType, setChartType] = useState('area');
  const [granularity, setGranularity] = useState('daily');
  const [insValue, setInsValue] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    fetch('/forcasted stock price.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        const map = BANK_COLUMN_MAP[bankId];
        if (!map) {
          setPriceHistory([]);
          setMeta({});
          setLoading(false);
          return;
        }
        // Extract price history for the selected bank
        const priceHistoryArr = [];
        for (let i = 2; i < rows.length; i++) {
          const date = rows[i][map.dateCol];
          const price = rows[i][map.priceCol];
          if (date && price) {
            priceHistoryArr.push({ date, price: parseFloat(price) });
          }
        }
        setPriceHistory(priceHistoryArr);
        // No meta data in CSV, so set all fields to NaN
        setMeta({
          name: map.name,
          symbol: bankId.toUpperCase(),
          marketCap: 'NaN',
          volume: 'NaN',
          pe: 'NaN',
          dividend: 'NaN',
          capital: 'NaN',
          description: '',
          currentPrice: priceHistoryArr.length > 0 ? priceHistoryArr[priceHistoryArr.length - 1].price : 'NaN',
          isPositive: false,
          change: 'NaN',
        });
        setLoading(false);
      });
  }, [bankId]);

  // Aggregate priceHistory based on granularity
  const aggregatedData = useMemo(() => {
    if (granularity === 'daily') return priceHistory;
    if (granularity === 'monthly') {
      const map = {};
      priceHistory.forEach(({ date, price }) => {
        const [month, , year] = date.split('/');
        const key = `${year}-${month}`;
        if (!map[key]) map[key] = { date: key, price: 0, count: 0 };
        map[key].price += price;
        map[key].count += 1;
      });
      return Object.values(map).map(d => ({ date: d.date, price: d.price / d.count }));
    }
    if (granularity === 'yearly') {
      const map = {};
      priceHistory.forEach(({ date, price }) => {
        const year = date.split('/').pop();
        if (!map[year]) map[year] = { date: year, price: 0, count: 0 };
        map[year].price += price;
        map[year].count += 1;
      });
      return Object.values(map).map(d => ({ date: d.date, price: d.price / d.count }));
    }
    return priceHistory;
  }, [granularity, priceHistory]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${meta.name || 'report'}.pdf`);
  };

  if (loading) return <div>Loading...</div>;

  if (!meta) {
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
    <Layout>
      <div ref={contentRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
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
                  <div className="w-16 h-16 flex items-center justify-center shadow-lg bg-white border border-gray-200">
                    <img src={`/logos/${bankId}.png`} alt={meta.name} className="w-16 h-16 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{meta.name}</h1>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-sm font-medium">
                        {meta.symbol}
                      </Badge>
                      <span className="text-gray-600">{meta.description}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    LKR {meta.currentPrice}
                  </div>
                  <div className={`flex items-center gap-1 text-lg font-semibold ${
                    meta.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {meta.isPositive ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {meta.change}
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
                <p className="text-2xl font-bold text-gray-900">{meta.marketCap}</p>
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
                <p className="text-2xl font-bold text-gray-900">{meta.volume}</p>
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
                <p className="text-2xl font-bold text-gray-900">{meta.pe}</p>
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
                <p className="text-2xl font-bold text-gray-900">{meta.dividend}</p>
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
                <div className="flex gap-4 mb-4">
                  <div>
                    <label className="mr-2 font-medium">Chart Type:</label>
                    <select value={chartType} onChange={e => setChartType(e.target.value)} className="border rounded px-2 py-1">
                      <option value="area">Area</option>
                      <option value="line">Line</option>
                      <option value="bar">Bar</option>
                    </select>
                  </div>
                  <div>
                    <label className="mr-2 font-medium">Granularity:</label>
                    <select value={granularity} onChange={e => setGranularity(e.target.value)} className="border rounded px-2 py-1">
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'area' && (
                    <AreaChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="price" stroke="#2ec4b6" fill="#e6f9f7" strokeWidth={3} />
                    </AreaChart>
                  )}
                  {chartType === 'line' && (
                    <LineChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
                      <Line type="monotone" dataKey="price" stroke="#2ec4b6" strokeWidth={3} dot={{ fill: '#2ec4b6', strokeWidth: 2, r: 3 }} />
                    </LineChart>
                  )}
                  {chartType === 'bar' && (
                    <BarChart data={aggregatedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
                      <Bar dataKey="price" fill="#2ec4b6" />
                    </BarChart>
                  )}
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
                    <span className="font-semibold">{meta.capital}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Current Value</span>
                    <span className="font-semibold">LKR {meta.currentPrice}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Ins Value</span>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-32 text-right"
                      placeholder="Enter Ins Value"
                      value={insValue}
                      onChange={e => setInsValue(e.target.value)}
                    />
                  </div>
                </div>
                
                {insValue && !isNaN(parseFloat(insValue)) && meta.currentPrice !== 'NaN' && (
                  parseFloat(insValue) > parseFloat(meta.currentPrice) ? (
                    <Button className="w-full mt-4" color="primary">Buy</Button>
                  ) : (
                    <Button className="w-full mt-4" color="destructive">Sell</Button>
                  )
                )}
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
                  drivers for {meta.name}'s performance. The bank shows strong fundamentals 
                  with consistent dividend payments and stable capital ratios.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportPDF} className="bg-primary text-white">Export as PDF</Button>
      </div>
    </Layout>
  );
};

export default BankDetails;
