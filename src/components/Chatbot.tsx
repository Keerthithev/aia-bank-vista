import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Database } from 'lucide-react';
import Papa from 'papaparse';
// Use Vite environment variable for API key
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const SYSTEM_PROMPT = `You are a professional financial assistant specializing in Sri Lankan banks. Always provide clear, concise, and expert-level answers about bank performance, financial ratios, and economic indicators. Do not mention data sources, CSV files, or how you obtained the data. Focus on delivering actionable insights and professional analysis in your responses.`;

// Helper to normalize bank names
const BANK_MAP = {
  commercial: 'Commercial',
  hnb: 'HNB',
  sampath: 'Sampath',
  seylan: 'Seylan',
  'pan asia': 'Pan Asia',
  ntb: 'NTB',
};

const PREDEFINED_QUESTIONS = [
  'What is the latest stock price of HNB?',
  'Should I buy Commercial Bank stock this month?',
  'Show me the ROE of Sampath in 2024.',
  'What is the inflation rate in 2023-06?',
  'Rank the banks by ROE.',
  'What is the decision for NTB on 2/07/2025?'
];

function normalizeDate(str) {
  // Accepts many formats, returns M/D/YYYY
  str = str.replace(/(st|nd|rd|th)/gi, '').replace(/-/g, '/').replace(/\s+/g, '/');
  // Try DD/MM/YYYY or YYYY/MM/DD or MM/DD/YYYY
  const d = str.split('/');
  if (d.length === 3) {
    if (d[0].length === 4) return `${parseInt(d[1])}/${parseInt(d[2])}/${d[0]}`; // YYYY/MM/DD
    if (d[2].length === 4) {
      // Could be DD/MM/YYYY or MM/DD/YYYY
      if (parseInt(d[0]) > 12) return `${parseInt(d[1])}/${parseInt(d[0])}/${d[2]}`; // DD/MM/YYYY
      return `${parseInt(d[0])}/${parseInt(d[1])}/${d[2]}`; // MM/DD/YYYY
    }
  }
  return str;
}

function extractDate(text) {
  // Try to extract a date in various formats
  // 2025/06/27, 2025-06-27, 27/06/2025, 06/27/2025, 27 June 2025, June 27 2025, etc.
  const patterns = [
    /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/, // YYYY/MM/DD
    /(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i, // 27 June 2025
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i // June 27 2025
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      if (pat === patterns[0]) return `${parseInt(m[2])}/${parseInt(m[3])}/${m[1]}`;
      if (pat === patterns[1]) return `${parseInt(m[1])}/${parseInt(m[2])}/${m[3]}`;
      if (pat === patterns[2]) return `${parseInt(m[2])}/${parseInt(m[1])}/${m[3]}`;
      if (pat === patterns[3]) return `${parseInt(m[2])}/${parseInt(m[1])}/${m[3]}`;
    }
  }
  return null;
}

function extractBank(text) {
  // Try to extract a bank name from the text
  const lower = text.toLowerCase();
  for (const key of Object.keys(BANK_MAP)) {
    if (lower.includes(key)) return BANK_MAP[key];
  }
  return null;
}

function isStockPriceQuestion(text) {
  // Only treat as stock price if the message contains 'stock price' or 'price' and a bank or date
  return /stock price|price/i.test(text);
}

function isDecisionQuestion(text) {
  return /should i buy|should i sell|should i hold|can i buy|decision|buy|sell|hold/i.test(text);
}

function extractDecisionFromValuation(csv, bank, date, useLatestIfNoDate = false) {
  if (!csv || !bank) return null;
  let foundBank = false;
  let headerRow = null;
  let latestDate = null;
  let latestDecision = null;
  for (let i = 0; i < csv.length; i++) {
    const row = csv[i];
    if (row[0] && row[0].toLowerCase().includes(bank.toLowerCase())) {
      foundBank = true;
      headerRow = csv[i+1];
      // Now look for the date in the next rows
      for (let j = i+2; j < csv.length; j++) {
        const dataRow = csv[j];
        if (dataRow[0] && headerRow) {
          // Track latest date/decision
          if (!latestDate || new Date(normalizeDate(dataRow[0])) > new Date(normalizeDate(latestDate))) {
            latestDate = dataRow[0];
            const decisionIdx = headerRow.findIndex(h => h && h.toLowerCase().includes('decision'));
            if (decisionIdx !== -1) {
              latestDecision = dataRow[decisionIdx];
            }
          }
        }
        if (dataRow[0] && date && normalizeDate(dataRow[0]) === normalizeDate(date)) {
          const decisionIdx = headerRow.findIndex(h => h && h.toLowerCase().includes('decision'));
          if (decisionIdx !== -1) {
            const decision = dataRow[decisionIdx];
            if (decision) {
              return { decision, date: dataRow[0] };
            }
          }
        }
        if (!dataRow[0]) break;
      }
    }
  }
  if (useLatestIfNoDate && latestDecision && latestDate) {
    return { decision: latestDecision, date: latestDate };
  }
  return null;
}

function DataBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold ml-2">
      <Database className="w-3 h-3" />
      from your data
    </span>
  );
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your banking assistant. Ask me anything about Sri Lankan banks, their performance, or economic indicators.', fromCSV: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [csvs, setCSVs] = useState({});
  const [csvLoading, setCSVLoading] = useState(true);
  const [lastBank, setLastBank] = useState(null);
  const [lastDate, setLastDate] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const [showNeedHelp, setShowNeedHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCSVs() {
      setCSVLoading(true);
      const files = [
        { key: 'forcast', url: '/forcastnew.csv' },
        { key: 'valuation', url: '/Valuation.csv' },
        { key: 'ratio', url: '/Copy of ratio edited.csv' },
        { key: 'env', url: '/environmental.csv' },
      ];
      const results = {};
      for (const file of files) {
        const text = await fetch(file.url).then(r => r.text());
        results[file.key] = Papa.parse(text, { header: false }).data;
      }
      setCSVs(results);
      setCSVLoading(false);
    }
    loadCSVs();
  }, []);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setShowNeedHelp(true);
      const timer = setTimeout(() => setShowNeedHelp(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  function answerFromCSVs(question, context, pendingTypeOverride) {
    // Decision logic
    if (isDecisionQuestion(question) || pendingTypeOverride === 'decision') {
      let bank = extractBank(question);
      let date = extractDate(question);
      if (!bank && context.lastBank) bank = context.lastBank;
      if (!date && context.lastDate) date = context.lastDate;
      // If user says 'this month', 'now', or omits date, use latest available
      const wantsLatest = /this month|now|latest|current/i.test(question) || !date;
      if (!bank) {
        return { content: "Could you please specify which bank's decision you are interested in?", fromCSV: true, context: { lastBank: null, lastDate: date }, pendingType: 'decision' };
      }
      const result = extractDecisionFromValuation(csvs.valuation, bank, date, wantsLatest);
      if (result && result.decision) {
        return { content: `Based on the available data (${normalizeDate(result.date)}), the decision for ${bank} is: ${result.decision}.`, fromCSV: true, context: { lastBank: bank, lastDate: result.date }, pendingType: null };
      }
      if (!date) {
        return { content: "Could you please specify the date for the decision of " + bank + "?", fromCSV: true, context: { lastBank: bank, lastDate: null }, pendingType: 'decision' };
      }
      // If not found, let it fall through to LLM
    }
    // Only use context for stock price questions
    if (!isStockPriceQuestion(question) && pendingTypeOverride !== 'stock_price') return null;
    let bank = extractBank(question);
    let date = extractDate(question);
    if (!bank && context.lastBank) bank = context.lastBank;
    if (!date && context.lastDate) date = context.lastDate;
    if ((question.toLowerCase().includes('stock price') || question.toLowerCase().includes('price') || pendingTypeOverride === 'stock_price') && (!bank || !date)) {
      if (!bank && !date) {
        return { content: "Could you please specify both the bank and the date you are interested in?", fromCSV: true, context: { lastBank: null, lastDate: null }, pendingType: 'stock_price' };
      } else if (!bank) {
        return { content: "Could you please specify which bank's stock price you are interested in?", fromCSV: true, context: { lastBank: null, lastDate: date }, pendingType: 'stock_price' };
      } else if (!date) {
        return { content: "Could you please specify the date for the stock price of " + bank + "?", fromCSV: true, context: { lastBank: bank, lastDate: null }, pendingType: 'stock_price' };
      }
    }
    if (bank && date && csvs.forcast) {
      const rows = csvs.forcast;
      const headerRow = rows[0];
      let colIdx = -1;
      for (let i = 0; i < headerRow.length; i++) {
        if (headerRow[i] && headerRow[i].toLowerCase().includes(bank.toLowerCase())) {
          colIdx = i;
          break;
        }
      }
      if (colIdx !== -1) {
        const priceCol = colIdx + 1;
        const normDate = normalizeDate(date);
        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          if (row[colIdx] && row[colIdx].replace(/\s/g, '') === normDate.replace(/\s/g, '')) {
            const price = row[priceCol];
            if (price) {
              return { content: `Certainly! The closing stock price of ${bank} on ${normDate} was LKR ${price}. If you need more details or want to compare with other banks, just ask!`, fromCSV: true, context: { lastBank: bank, lastDate: date }, pendingType: null };
            }
          }
        }
        return null;
      }
    }
    return null;
  }

  async function sendMessage(msgOverride) {
    const msg = msgOverride || input;
    if (!msg.trim()) return;
    const userMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMessage]);
    if (!msgOverride) setInput('');
    setLoading(true);

    if (csvLoading) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Please wait, loading data...', fromCSV: false }]);
      setLoading(false);
      return;
    }

    // Determine if this is a follow-up to a pending clarification
    let pendingTypeOverride = null;
    if (!isStockPriceQuestion(msg) && !isDecisionQuestion(msg) && pendingType) {
      pendingTypeOverride = pendingType;
    }

    let csvAnswer = null;
    const context = { lastBank, lastDate };
    csvAnswer = answerFromCSVs(msg, context, pendingTypeOverride);
    if (csvAnswer) {
      setMessages(prev => [...prev, { ...csvAnswer }]);
      if (csvAnswer.context) {
        setLastBank(csvAnswer.context.lastBank !== undefined ? csvAnswer.context.lastBank : lastBank);
        setLastDate(csvAnswer.context.lastDate !== undefined ? csvAnswer.context.lastDate : lastDate);
      }
      setPendingType(csvAnswer.pendingType !== undefined ? csvAnswer.pendingType : null);
      setLoading(false);
      return;
    } else {
      setPendingType(null);
    }
    // If user message contains a new bank or date, update context
    const newBank = extractBank(msg);
    const newDate = extractDate(msg);
    if (newBank) setLastBank(newBank);
    if (newDate) setLastDate(newDate);

    // Otherwise, use LLM
    let chatHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
      userMessage
    ];
    // Filter out any invalid messages and strip extra properties
    chatHistory = chatHistory
      .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string' && m.content.trim().length > 0)
      .map(m => ({ role: m.role, content: m.content }));
    // Debug log for payload
    console.log('LLM payload:', JSON.stringify({
      model: 'llama3-8b-8192',
      messages: chatHistory,
      temperature: 0.2
    }, null, 2));
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
         model: 'llama-3.3-70b-versatile',
          messages: chatHistory,
          temperature: 0.2,
        })
      });
       let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Failed to parse Groq API response as JSON:', jsonErr);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not get a response (invalid API response).', fromCSV: false }]);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        console.error('Groq API error:', data);
        setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I could not get a response. (API error: ${data.error?.message || JSON.stringify(data)})`, fromCSV: false }]);
        setLoading(false);
        return;
      }
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply, fromCSV: false }]);
    } catch (e) {
       console.error('Groq API fetch error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not connect to the AI assistant at the moment. Please check your internet connection or try again in a few seconds.', fromCSV: false }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !loading && !csvLoading) {
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Icon Button */}
      {!open && (
        <Button
          className="rounded-full shadow-lg p-4 bg-gradient-to-br from-primary to-blue-400 hover:from-primary hover:to-blue-500 focus:outline-none focus:ring animate-fade-in"
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
          size="icon"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      )}
      {/* Chat Window */}
      {open && (
        <div className="w-96 max-w-full bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200 flex flex-col h-[500px] animate-scale-fade-in transition-all duration-500" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'}}>
          <div className="flex items-center justify-between px-4 py-3 border-b font-bold text-lg bg-primary text-white rounded-t-2xl">
            <span className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/aia.png" alt="AIA Assistant" />
                <AvatarFallback>AIA</AvatarFallback>
              </Avatar>
              Banking Chatbot
            </span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="ml-2 p-1 rounded hover:bg-white/20 focus:outline-none">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-transparent">
            {csvLoading && (
              <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 mb-2 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Loading data...
              </div>
            )}
            {/* Predefined Questions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PREDEFINED_QUESTIONS.map((q, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  className="rounded-full px-4 py-1 text-sm shadow card-hover"
                  onClick={() => sendMessage(q)}
                  disabled={loading || csvLoading}
                >
                  {q}
                </Button>
              ))}
            </div>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}>
                <Card className={`max-w-[80%] ${msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white/90 mr-auto'} shadow-md mb-1`}>
                  <CardContent className="flex items-end gap-2 p-3">
                    {msg.role === 'assistant' && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src="/aia.png" alt="AIA Assistant" />
                        <AvatarFallback>AIA</AvatarFallback>
                      </Avatar>
                    )}
                    <span className="whitespace-pre-line text-base leading-relaxed">{msg.content}</span>
                    {msg.role === 'user' && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src="/user-avatar.png" alt="You" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t flex flex-col gap-2 bg-white/80 rounded-b-2xl">
            {showNeedHelp && (
              <div className="flex justify-center mb-2 animate-bounce-in">
                <span className="inline-block bg-primary text-white px-4 py-2 rounded-full shadow text-lg font-semibold animate-fade-in">Need help?</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring bg-white/90"
                type="text"
                placeholder={csvLoading ? "Loading data..." : "Ask about banks, ratios, economy..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || csvLoading}
              />
              <Button
                className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 shadow"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim() || csvLoading}
              >
                {loading ? '...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot; 