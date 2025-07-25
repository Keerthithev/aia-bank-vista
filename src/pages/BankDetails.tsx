import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Layout, Row, Col, Card, Typography, Statistic, Badge as AntBadge } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import FinancialMetrics from '@/components/FinancialMetrics';
import Chatbot from '@/components/Chatbot';
import 'antd/dist/reset.css';
import Papa from 'papaparse';
import { ResponsiveContainer, LineChart, BarChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Bar, Area, ComposedChart, PieChart, Pie, Cell, Legend } from 'recharts';

interface PriceData {
  date: string;
  price: number;
}

interface MonthlyData {
  date: string;
  price: number;
  count: number;
}

interface MetaData {
  name: string;
  symbol: string;
  marketCap: string;
  volume: string;
  pe: string;
  dividend: string;
  capital: string;
  description: string;
  currentPrice: number | string;
  isPositive: boolean;
  change: string;
}

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const BANK_COLUMN_MAP = {
  commercial: { name: 'Commercial', dateCol: 0, priceCol: 1 },
  hnb: { name: 'HNB', dateCol: 3, priceCol: 4 },
  sampath: { name: 'Sampath', dateCol: 6, priceCol: 7 },
  seylan: { name: 'Seylan Bank', dateCol: 9, priceCol: 10 },
  panasia: { name: 'Pan Asia Bank', dateCol: 12, priceCol: 13 },
  ntb: { name: 'NTB', dateCol: 15, priceCol: 16 },
};

// Map bankId to CSV section name
const BANK_CSV_SECTION_MAP: Record<string, string> = {
  commercial: 'Commercial',
  hnb: 'HNB',
  sampath: 'Sampath',
  seylan: 'Seylan',
  panasia: 'Pan Asia',
  ntb: 'NTB',
};

const BANK_HANDLE_MAP = {
  commercial: { name: 'Commercial', startCol: 0 },
  hnb: { name: 'HNB', startCol: 6 },
  sampath: { name: 'Sampath', startCol: 12 },
  seylan: { name: 'Seylan', startCol: 18 },
  panasia: { name: 'Pan Asia', startCol: 24 },
  ntb: { name: 'NTB', startCol: 30 },
};

const BANKS = [
  { id: 'commercial', name: 'Commercial' },
  { id: 'hnb', name: 'HNB' },
  { id: 'sampath', name: 'Sampath' },
  { id: 'panasia', name: 'Pan Asia' },
  { id: 'seylan', name: 'Seylan' },
];
const METRICS = [
  { key: 'EPS', label: 'EPS' },
  { key: 'DPS', label: 'DPS' },
  { key: 'P/E', label: 'P/E' },
  { key: 'P/B', label: 'P/B' },
  { key: 'Dividend yield', label: 'Dividend Yield' },
];

// Helper: Column indices for each metric in Valuation.csv
const METRIC_COLS = {
  EPS: [1, 6],
  DPS: [8, 13],
  'P/E': [15, 20],
  'P/B': [22, 27],
  'Dividend yield': [29, 34],
};
const METRIC_KEYS = [
  { key: 'EPS', label: 'EPS', color: '#2ec4b6' },
  { key: 'DPS', label: 'DPS', color: '#e4572e' },
  { key: 'P/E', label: 'P/E', color: '#3a86ff' },
  { key: 'P/B', label: 'P/B', color: '#ffbe0b' },
  { key: 'Dividend yield', label: 'Dividend Yield', color: '#8338ec' },
];

// Add forecast column mapping
const BANK_FORECAST_COLS = {
  commercial: { dateCol: 0, priceCol: 1 },
  hnb: { dateCol: 3, priceCol: 4 },
  sampath: { dateCol: 6, priceCol: 7 },
  seylan: { dateCol: 9, priceCol: 10 },
  panasia: { dateCol: 12, priceCol: 13 },
  ntb: { dateCol: 15, priceCol: 16 },
};

function getMetricDataForBank(rows, bankName, metric) {
  // Find the row for the metrics section (any cell is 'EPS')
  const metricStartRow = rows.findIndex(r => r.some(cell => cell && cell.toString().trim() === 'EPS'));
  if (metricStartRow === -1) {
    console.warn('Could not find metrics section in Valuation.csv');
    return [];
  }
  // Dynamically find the start index for the metric in the header row
  const headerRow = rows[metricStartRow];
  const start = headerRow.findIndex(cell => cell && cell.toString().trim() === metric);
  if (start === -1) {
    console.warn('Could not find metric', metric, 'in header row');
    return [];
  }
  // Get the years from the years row
  const yearsRow = rows[metricStartRow + 1];
  const years = yearsRow.slice(start, start + 6);
  // The bank rows start after the years row (metricStartRow+2)
  const bankRow = rows.slice(metricStartRow + 2).find(r => r[0] && r[0].toString().trim().toLowerCase() === bankName.trim().toLowerCase());
  if (!bankRow) {
    console.warn('Could not find bank row for', bankName, 'in Valuation.csv');
    return [];
  }
  // Get the values for the metric
  const values = bankRow.slice(start, start + 6).map(v => {
    if (typeof v === 'string') {
      const cleaned = v.replace(/,/g, '').trim();
      const num = Number(cleaned);
      return isNaN(num) ? 0 : num;
    }
    if (typeof v === 'number') return v;
    return 0;
  });
  // Return array of { year, value }
  return years.map((year, i) => ({ year, value: values[i] }));
}

function MiniMetricChart({ data, label, color }) {
  return (
    <div className="bg-white/80 rounded-lg shadow p-4 flex flex-col items-center">
      <span className="font-semibold text-xs mb-2">{label}</span>
      <ResponsiveContainer width="100%" height={100}>
        <ComposedChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine tickLine label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} axisLine tickLine label={{ value: label, angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip formatter={v => Number(v).toFixed(2)} labelFormatter={l => l} />
          <Bar dataKey="value" fill={color} barSize={16} radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="value" stroke={color} dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ValuationGrid() {
  const [data, setData] = useState<any>({});
  useEffect(() => {
    fetch('/Valuation.csv')
      .then(res => res.text())
      .then(text => {
        const rows = Papa.parse(text, { skipEmptyLines: false }).data;
        // Find the row indices for each metric
        const bankRows: Record<string, any> = {};
        // EPS, DPS, P/E, P/B, Dividend yield rows start after the header row with the metric name
        const metricStartRow = rows.findIndex(r => r[0] === 'EPS');
        if (metricStartRow === -1) return;
        // Each metric block is 6 rows (header + 5 banks)
        METRICS.forEach((metric, i) => {
          const start = metricStartRow + i * 6 + 1;
          for (let b = 0; b < BANKS.length; b++) {
            const row = rows[start + b];
            if (!row) continue;
            if (!bankRows[BANKS[b].id]) bankRows[BANKS[b].id] = {};
            bankRows[BANKS[b].id][metric.key] = row[1]; // 1st col is year, 2nd col is value
          }
        });
        setData(bankRows);
      });
  }, []);
  return (
    <div className="mb-8 mt-8">
     
    </div>
  );
}

// Add a helper to extract summary values from Valuation.csv for the selected bank
function getSummaryMetricsForBank(rows, bankName) {
  // Find the row for the summary section (first bank row after the header)
  const bankRow = rows.find(r => r[0] && r[0].toString().trim().toLowerCase() === bankName.trim().toLowerCase());
  if (!bankRow) return {};
  // Find the header row (should be row 2)
  const headerRow = rows.find(r => r[0] && r[0].toString().trim().toLowerCase() === 'bank');
  if (!headerRow) return {};
  // Find indices for the required metrics
  const getCol = (label) => headerRow.findIndex(h => h && h.toString().toLowerCase().includes(label));
  const intrinsicIdx = getCol('intrinsic');
  const stockIdx = getCol('stock price');
  const volIdx = getCol('volumn');
  const waccIdx = getCol('wacc');
  const decisionIdx = getCol('decission');
  const statusIdx = getCol('status');
  const riskIdx = getCol('risk level');
  return {
    intrinsic: bankRow[intrinsicIdx] || '-',
    stock: bankRow[stockIdx] || '-',
    vol: bankRow[volIdx] || '-',
    wacc: bankRow[waccIdx] || '-',
    decision: bankRow[decisionIdx] || '-',
    status: bankRow[statusIdx] || '-',
    risk: bankRow[riskIdx] || '-',
  };
}

function getForecastPriceForBank(rows, bankId, targetDate) {
  const { dateCol, priceCol } = BANK_FORECAST_COLS[bankId] || {};
  if (dateCol === undefined || priceCol === undefined) return null;
  for (const row of rows) {
    if (row[dateCol] && row[dateCol].trim() === targetDate) {
      return row[priceCol] || null;
    }
  }
  return null;
}

// Helper to get pie chart data for a bank from Valuation.csv
function getPieChartDataForBank(rows, bankName) {
  const bankRow = rows.find(r => r[0] && r[0].toString().trim().toLowerCase() === bankName.trim().toLowerCase());
  if (!bankRow) return { group1: [], group2: [] };
  const headerRow = rows.find(r => r[0] && r[0].toString().trim().toLowerCase() === 'bank');
  if (!headerRow) return { group1: [], group2: [] };
  const getCol = (label) => headerRow.findIndex(h => h && h.toString().toLowerCase().includes(label));
  // Group 1: Net Interest Income, Total Cost, PBT
  const niiIdx = getCol('net interest income');
  const tcIdx = getCol('total cost');
  const pbtIdx = getCol('pbt');
  // Group 2: Total Asset, Total Liability, Total Equity
  const taIdx = getCol('total asset');
  const tlIdx = getCol('total liability');
  const teIdx = getCol('total equity');
  const group1 = [
    { name: 'Net Interest Income', value: Number((bankRow[niiIdx] || '0').replace(/,/g, '')) },
    { name: 'Total Cost', value: Math.abs(Number((bankRow[tcIdx] || '0').replace(/,/g, ''))) },
    { name: 'PBT', value: Number((bankRow[pbtIdx] || '0').replace(/,/g, '')) },
  ];
  const group2 = [
    { name: 'Total Asset', value: Number((bankRow[taIdx] || '0').replace(/,/g, '')) },
    { name: 'Total Liability', value: Math.abs(Number((bankRow[tlIdx] || '0').replace(/,/g, ''))) },
    { name: 'Total Equity', value: Number((bankRow[teIdx] || '0').replace(/,/g, '')) },
  ];
  return { group1, group2 };
}

const BankDetails = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const [bankData, setBankData] = useState(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [chartType, setChartType] = useState('area');
  const [granularity, setGranularity] = useState('daily');
  const [insValue, setInsValue] = useState('');
  const contentRef = useRef(null);
  const [candleData, setCandleData] = useState<any[]>([]);
  const [valuationRows, setValuationRows] = useState([]);
  const [forecastRows, setForecastRows] = useState([]);
  const [forecastPriceEnd, setForecastPriceEnd] = useState(null);
  const [forecastPriceStart, setForecastPriceStart] = useState(null);
  const [forecastChange, setForecastChange] = useState(null);

  useEffect(() => {
    fetch('/forcastnew.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        const map = BANK_COLUMN_MAP[bankId as keyof typeof BANK_COLUMN_MAP];
        if (!map) {
          setPriceHistory([]);
          setMeta(null);
          setLoading(false);
          return;
        }
        // Extract price history for the selected bank
        const priceHistoryArr: PriceData[] = [];
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
          symbol: bankId!.toUpperCase(),
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

  useEffect(() => {
    fetch('/handle.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        const map = BANK_HANDLE_MAP[bankId as keyof typeof BANK_HANDLE_MAP];
        if (!map) {
          setCandleData([]);
          return;
        }
        const dataArr: any[] = [];
        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          const date = row[map.startCol];
          const open = parseFloat(row[map.startCol + 2]);
          const high = parseFloat(row[map.startCol + 3]);
          const low = parseFloat(row[map.startCol + 4]);
          const close = parseFloat(row[map.startCol + 1]);
          if (date && !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
            // Convert date to JS Date
            const [month, day, year] = date.split('/');
            dataArr.push({
              date: new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`),
              open, high, low, close
            });
          }
        }
        setCandleData(dataArr.reverse()); // reverse for chronological order
      });
  }, [bankId]);

  useEffect(() => {
    fetch('/Valuation.csv')
      .then(res => res.text())
      .then(text => {
        const rows = Papa.parse(text, { skipEmptyLines: false }).data;
        setValuationRows(rows);
      });
  }, []);

  useEffect(() => {
    fetch('/forcastnew.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        setForecastRows(rows);
        const priceEnd = getForecastPriceForBank(rows, bankId, '12/31/2024');
        const priceStart = getForecastPriceForBank(rows, bankId, '12/3/2024');
        setForecastPriceEnd(priceEnd);
        setForecastPriceStart(priceStart);
        if (priceEnd && priceStart && !isNaN(Number(priceEnd)) && !isNaN(Number(priceStart))) {
          const change = ((Number(priceEnd) - Number(priceStart)) / Number(priceStart)) * 100;
          setForecastChange(change);
        } else {
          setForecastChange(null);
        }
      });
  }, [bankId]);

  const miniMetricData = useMemo(() => {
    if (!valuationRows.length) return {};
    const csvBankName = BANK_CSV_SECTION_MAP[bankId] || bankId;
    return METRIC_KEYS.reduce((acc, { key }) => {
      acc[key] = getMetricDataForBank(valuationRows, csvBankName, key);
      return acc;
    }, {});
  }, [valuationRows, bankId]);

  const summaryMetrics = useMemo(() => {
    if (!valuationRows.length) return {};
    const csvBankName = BANK_CSV_SECTION_MAP[bankId] || bankId;
    const base = getSummaryMetricsForBank(valuationRows, csvBankName);
    // Dynamically and robustly calculate decision and status
    const findFirstNumber = (row, idx) => {
      // Look for the first non-empty, non-null, non-NaN value at or after idx
      for (let i = idx; i < row.length; i++) {
        const val = row[i];
        if (val && !isNaN(parseFloat(val))) return parseFloat(val);
      }
      return NaN;
    };
    const intrinsic = findFirstNumber(Object.values(base), Object.keys(base).indexOf('intrinsic'));
    const stock = findFirstNumber(Object.values(base), Object.keys(base).indexOf('stock'));
    // Debug log
    console.log('Bank:', csvBankName, 'Intrinsic:', base.intrinsic, 'Parsed:', intrinsic, 'Stock:', base.stock, 'Parsed:', stock);
    let decision = base.decision;
    let status = base.status;
    if (!isNaN(intrinsic) && !isNaN(stock)) {
      if (intrinsic > stock) {
        decision = 'Buy';
        status = 'Undervalued';
      } else if (intrinsic < stock) {
        decision = 'Sell';
        status = 'Overvalued';
      } else {
        decision = 'Hold';
        status = 'Fairly valued';
      }
    }
    return {
      ...base,
      decision,
      status,
    };
  }, [valuationRows, bankId]);

  // Aggregate priceHistory based on granularity
  const aggregatedData = useMemo(() => {
    if (granularity === 'daily') return priceHistory;
    if (granularity === 'monthly') {
      const map: { [key: string]: MonthlyData } = {};
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
      const map: { [key: string]: MonthlyData } = {};
      priceHistory.forEach(({ date, price }) => {
        const year = date.split('/').pop() as string;
        if (!map[year]) map[year] = { date: year, price: 0, count: 0 };
        map[year].price += price;
        map[year].count += 1;
      });
      return Object.values(map).map(d => ({ date: d.date, price: d.price / d.count }));
    }
    return priceHistory;
  }, [granularity, priceHistory]);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
            <Line type="monotone" dataKey="price" stroke="#2ec4b6" strokeWidth={3} dot={{ fill: '#2ec4b6', strokeWidth: 2, r: 3 }} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey="price" fill="#2ec4b6" />
          </BarChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} />
            <Area type="monotone" dataKey="price" stroke="#2ec4b6" fill="#e6f9f7" strokeWidth={3} />
          </AreaChart>
        );
    }
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${meta?.name || 'report'}.pdf`);
  };

  const pieChartData = useMemo(() => {
    if (!valuationRows.length) return { group1: [], group2: [] };
    const csvBankName = BANK_CSV_SECTION_MAP[bankId] || bankId;
    return getPieChartDataForBank(valuationRows, csvBankName);
  }, [valuationRows, bankId]);

  const PIE_COLORS1 = ['#2ec4b6', '#e4572e', '#3a86ff'];
  const PIE_COLORS2 = ['#ffbe0b', '#8338ec', '#3a86ff'];

  // Custom label outside the pie
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={13}>
        {name} ({(percent * 100).toFixed(1)}%)
      </text>
    ) : null;
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

  let chartData = candleData;
  let xScale, xAccessor, displayXAccessor, xExtents;
  if (candleData.length > 0) {
    const timeProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
    const result = timeProvider(candleData);
    chartData = result.data;
    xScale = result.xScale;
    // Wrap xAccessor to always return a number (timestamp)
    const rawXAccessor = result.xAccessor;
    xAccessor = (d) => {
      const x = rawXAccessor(d);
      if (x !== null && typeof x === 'object' && 'getTime' in x) return x.getTime();
      return x;
    };
    displayXAccessor = result.displayXAccessor;
    let x0 = xAccessor(chartData[0]);
    let x1 = xAccessor(chartData[chartData.length - 1]);
    xExtents = [x0, x1];
  }

  // Add debug log before rendering mini-graphs
  console.log('valuationRows', valuationRows, 'miniMetricData', miniMetricData);

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 8px' }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24}>
            <Chatbot />
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card bordered={false} style={{ marginBottom: 24 }}>
              <Row align="middle" justify="space-between" gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <Row align="middle" gutter={[16, 16]}>
                    <Col>
                      <img src={`/logos/${bankId}.png`} alt={meta?.name} style={{ width: 64, height: 64, objectFit: 'contain', background: '#fff', border: '1px solid #eee', boxShadow: '0 2px 8px #eee' }} />
                    </Col>
                    <Col>
                      <Title level={2} style={{ margin: 0 }}>{meta?.name}</Title>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AntBadge count={meta?.symbol} style={{ backgroundColor: '#f0f0f0', color: '#333', fontWeight: 500 }} />
                        <span style={{ color: '#888' }}>{meta?.description}</span>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Statistic title="Current Price" value={forecastPriceEnd ? `LKR ${forecastPriceEnd}` : 'N/A'} valueStyle={{ fontSize: 32, fontWeight: 700 }} />
                  <div style={{ fontSize: 18, fontWeight: 600, color: forecastChange !== null ? (forecastChange > 0 ? '#52c41a' : '#f5222d') : '#888' }}>
                    {forecastChange !== null ? `${forecastChange > 0 ? '+' : ''}${forecastChange.toFixed(2)}%` : 'N/A'}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card bordered={false} style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                {METRIC_KEYS.map(({ key, label, color }) => (
                  <Col xs={24} sm={12} md={4} key={key}>
                    <Card size="small" bordered style={{ background: '#fafafa', borderColor: color }}>
                      <Statistic title={label} value={miniMetricData[key]?.[0]?.value ?? '-'} valueStyle={{ color }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ marginBottom: 24 }}>
              <Title level={4}>Stock Price Historical & Forecast</Title>
              <div style={{ width: '100%', overflowX: 'auto', minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={300}>
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ marginBottom: 24 }}>
              <Title level={4}>Key Metrics</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Statistic title="Risk Level" value={summaryMetrics.risk ?? '-'} />
                <Statistic title="Wacc" value={summaryMetrics.wacc ?? '-'} />
                <Statistic title="Volumn" value={summaryMetrics.vol ?? '-'} />
                <Statistic title="Intrinsic Value" value={summaryMetrics.intrinsic ?? '-'} />
                <Statistic title="Stock Price" value={summaryMetrics.stock ?? '-'} />
                <Statistic title="Status" value={summaryMetrics.status ?? '-'} valueStyle={{ color: summaryMetrics.status && summaryMetrics.status.toLowerCase() === 'undervalued' ? '#52c41a' : summaryMetrics.status && summaryMetrics.status.toLowerCase() === 'overvalued' ? '#f5222d' : '#888' }} />
                <Statistic title="Decision" value={summaryMetrics.decision ?? '-'} valueStyle={{ color: summaryMetrics.decision && summaryMetrics.decision.toLowerCase() === 'buy' ? '#52c41a' : summaryMetrics.decision && summaryMetrics.decision.toLowerCase() === 'sell' ? '#f5222d' : '#888' }} />
              </div>
            </Card>
          </Col>
        </Row>
        {/* Add more antd Cards/Rows/Cols for candlestick chart, pie charts, and FinancialMetrics as needed */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <FinancialMetrics bankName={BANK_CSV_SECTION_MAP[bankId as string] || meta?.name} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default BankDetails;
