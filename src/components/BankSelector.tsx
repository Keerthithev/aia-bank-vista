import React, { useState } from 'react';
import { Search, Building2, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BankSelector = () => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const banks = [
    { id: 'commercial', name: 'Commercial Bank', symbol: 'COMB' },
    { id: 'sampath', name: 'Sampath Bank', symbol: 'SAMP' },
    { id: 'hnb', name: 'Hatton National Bank', symbol: 'HNB' },
    { id: 'panasia', name: 'Pan Asia Bank', symbol: 'PAB' },
    { id: 'seylan', name: 'Seylan Bank', symbol: 'SEYB' },
    { id: 'ntb', name: 'Nations Trust Bank', symbol: 'NTB' },
  ];

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(search.toLowerCase()) ||
    bank.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleBankSelect = (bankId: string) => {
    navigate(`/bank/${bankId}`);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search trading banks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-12 text-lg border-2 border-primary/20 focus:border-primary rounded-xl bg-white/80 backdrop-blur-sm"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-2 bg-white/95 backdrop-blur-sm border-2 border-primary/20 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank) => (
              <Button
                key={bank.id}
                variant="ghost"
                className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-blue-50"
                onClick={() => handleBankSelect(bank.id)}
              >
                <div className="flex items-center gap-3">
                  <img src={`/logos/${bank.id}.png`} alt={bank.name} className="w-10 h-10 object-contain bg-white border border-gray-200 p-1" />
                  <span className="font-semibold text-gray-900">{bank.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{bank.symbol}</span>
                </div>
              </Button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No banks found matching "{search}"
            </div>
          )}
        </Card>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default BankSelector;
