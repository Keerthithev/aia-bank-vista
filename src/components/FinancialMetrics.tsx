import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface MetricData {
  year: string;
  value: number | null;
}

interface MetricCardProps {
  title: string;
  unit?: string;
  data: MetricData[];
  color: string;
  lineColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, unit, data, color, lineColor }) => {
  const latest = data[data.length - 1]?.value;
  const growth3Y = data.length > 3 && data[data.length - 4]?.value && latest && typeof latest === 'number' && typeof data[data.length - 4].value === 'number'
    ? (((latest - data[data.length - 4].value!) / Math.abs(data[data.length - 4].value!)) * 100).toFixed(0) + '%'
    : 'N/A';
  const growth5Y = data.length > 5 && data[data.length - 6]?.value && latest && typeof latest === 'number' && typeof data[data.length - 6].value === 'number'
    ? (((latest - data[data.length - 6].value!) / Math.abs(data[data.length - 6].value!)) * 100).toFixed(0) + '%'
    : 'N/A';
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-bold text-blue-700">
            {latest !== null && latest !== undefined && !isNaN(latest as number) ? latest : 'N/A'}{unit}
          </span>
          <span className="text-green-600 text-sm font-semibold">3Y {growth3Y}</span>
          <span className="text-green-600 text-sm font-semibold">5Y {growth5Y}</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="year" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const COLOR_PALETTE = [
  '#2ec4b6', // teal
  '#e4572e', // orange
  '#17b978', // green
  '#3a86ff', // blue
  '#ffbe0b', // yellow
  '#8338ec', // purple
  '#ff006e', // pink
  '#fb5607', // orange2
  '#43aa8b', // green2
  '#ff6f59', // coral
  '#4361ee', // blue2
  '#f15bb5', // magenta
  '#9d4edd', // violet
  '#ffb4a2', // peach
  '#00b4d8', // cyan
];
const LINE_PALETTE = [
  '#e4572e',
  '#2ec4b6',
  '#8338ec',
  '#17b978',
  '#ffbe0b',
  '#3a86ff',
  '#ff006e',
  '#43aa8b',
  '#fb5607',
  '#4361ee',
  '#ff6f59',
  '#f15bb5',
  '#00b4d8',
  '#9d4edd',
  '#ffb4a2',
];

const CHART_TYPE_MAP: Record<string, 'bar' | 'line'> = {
  'ROE': 'line',
  'ROA': 'line',
  'NIM': 'line',
  'Operation efficiency': 'bar',
  'Temporary investment ': 'bar',
  'Volatile liability dependancy ': 'bar',
  'Burden': 'bar',
  'Non interest margin': 'line',
  'Efficiency ': 'bar',
  'Assets per employee': 'bar',
  'Net income per employee': 'bar',
  'Loans per employee': 'bar',
  'Provision for loan loses ': 'bar',
  'Loan': 'bar',
  'NPL': 'line',
};

const UNIT_MAP: Record<string, string> = {
  'ROE': '%',
  'ROA': '%',
  'NIM': '%',
  'Operation efficiency': '%',
  'Temporary investment ': '%',
  'Volatile liability dependancy ': '%',
  'Burden': '%',
  'Non interest margin': '%',
  'Efficiency ': '',
  'Assets per employee': '',
  'Net income per employee': '',
  'Loans per employee': '',
  'Provision for loan loses ': '%',
  'Loan': '%',
  'NPL': '%',
};

const FinancialMetrics: React.FC<{ bankName: string }> = ({ bankName }) => {
  const [metrics, setMetrics] = useState<Record<string, MetricData[]>>({});
  const [metricKeys, setMetricKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch('/ratio.csv')
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
        const rows = parsed.data;
        // Find the section for the selected bank
        let bankStart = -1;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i][0]?.toLowerCase().includes(bankName.toLowerCase())) {
            bankStart = i;
            break;
          }
        }
        if (bankStart === -1) return;
        // Find the header row (should be next row)
        const headerRow = rows[bankStart + 1].map(h => h.trim());
        // Dynamically find the 15 ratio columns between 'ROE' and 'NPL' (inclusive)
        const startIdx = headerRow.indexOf('ROE');
        const endIdx = headerRow.indexOf('NPL');
        const metricKeys = headerRow.slice(startIdx, endIdx + 1);
        setMetricKeys(metricKeys);
        // Find the data rows (until next empty or next bank)
        const dataRows: string[][] = [];
        for (let i = bankStart + 2; i < rows.length; i++) {
          if (!rows[i][0] || rows[i][0].trim() === '' || isNaN(Number(rows[i][0]))) break;
          dataRows.push(rows[i]);
        }
        // Extract metrics
        const metrics: Record<string, MetricData[]> = {};
        metricKeys.forEach((key, idx) => {
          const colIdx = headerRow.indexOf(key);
          metrics[key] = dataRows.map(row => ({
            year: row[0],
            value: colIdx !== -1 && row[colIdx] && row[colIdx] !== 'N/A' && row[colIdx] !== 'NaN' ? parseFloat(row[colIdx].replace(/,/g, '')) : null
          }));
        });
        setMetrics(metrics);
      });
  }, [bankName]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {metricKeys.map((key, idx) => (
        <MetricCard
          key={key}
          title={key}
          unit={UNIT_MAP[key] || ''}
          data={metrics[key] || []}
          color={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
          lineColor={LINE_PALETTE[idx % LINE_PALETTE.length]}
        />
      ))}
    </div>
  );
};

export default FinancialMetrics; 