
import React, { useState } from 'react';
import { Search, Building2, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const banks = [
  { id: 'commercial', name: 'Commercial Bank', symbol: 'COMB', price: 125.50, change: '+2.3%' },
  { id: 'sampath', name: 'Sampath Bank', symbol: 'SAMP', price: 98.75, change: '+1.8%' },
  { id: 'hnb', name: 'Hatton National Bank', symbol: 'HNB', price: 156.20, change: '-0.5%' },
  { id: 'panasia', name: 'Pan Asia Banking', symbol: 'PAB', price: 32.40, change: '+3.2%' },
  { id: 'dfcc', name: 'DFCC Bank', symbol: 'DFCC', price: 67.80, change: '+1.1%' },
  { id: 'ndb', name: 'National Development Bank', symbol: 'NDB', price: 89.30, change: '+0.9%' },
];

const BankSelector = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBankSelect = (bankId: string) => {
    navigate(`/bank/${bankId}`);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search trading banks..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
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
                className="w-full justify-between p-4 h-auto hover:bg-primary/10 rounded-lg mb-1"
                onClick={() => handleBankSelect(bank.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{bank.name}</div>
                    <div className="text-sm text-gray-500">{bank.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">LKR {bank.price}</div>
                  <div className={`text-sm font-medium ${
                    bank.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {bank.change}
                  </div>
                </div>
              </Button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No banks found matching "{searchTerm}"
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
