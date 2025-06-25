import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const banks = [
  { id: 'commercial', name: 'Commercial Bank' },
  { id: 'sampath', name: 'Sampath Bank' },
  { id: 'hnb', name: 'Hatton National Bank' },
  { id: 'panasia', name: 'Pan Asia Banking' },
  { id: 'dfcc', name: 'DFCC Bank' },
  { id: 'ndb', name: 'National Development Bank' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showBanks, setShowBanks] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBanks(false);
      }
    }
    if (showBanks) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBanks]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 p-1">
              <img src="/aia.png" alt="AIA Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AIA Investments</h1>
              <p className="text-white/80 mt-1">Professional Trading Platform</p>
            </div>
          </div>
          <nav className="flex items-center gap-6 relative">
            <Link to="/" className="text-white/90 hover:text-white font-medium transition">Home</Link>
            <div className="relative" ref={dropdownRef}>
              <button
                className="text-white/90 hover:text-white font-medium transition focus:outline-none"
                onClick={() => setShowBanks(v => !v)}
                aria-haspopup="true"
                aria-expanded={showBanks}
              >
                Banks
              </button>
              {showBanks && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-white text-gray-900 rounded shadow-lg z-50"
                >
                  {banks.map(bank => (
                    <Link
                      key={bank.id}
                      to={`/bank/${bank.id}`}
                      className="block px-4 py-2 hover:bg-primary hover:text-white transition rounded"
                      onClick={() => setShowBanks(false)}
                    >
                      {bank.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
      <footer className="bg-primary text-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/80">
            © {new Date().getFullYear()} AIA Investments. Professional trading platform for Sri Lankan banking sector.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 