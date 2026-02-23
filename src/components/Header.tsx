import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDualCurrency, GEMINI_MODELS, MODEL_LABELS } from '../lib/utils';
import { Coins, ChevronDown, DollarSign } from 'lucide-react';

export function Header() {
  const { totalCost, selectedModel, setSelectedModel, exchangeRate, setExchangeRate } = useApp();

  return (
    <header className="h-16 border-b border-white/5 bg-bg/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30 ml-64">
      <div className="flex items-center gap-4">
        {/* Model Selector */}
        <div className="relative group">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-white/10 transition-colors"
            aria-label="Select Gemini Model"
          >
            {Object.values(GEMINI_MODELS).map((model) => (
              <option key={model} value={model} className="bg-card text-white">
                {Object.entries(MODEL_LABELS).find(([k, v]) => k === model)?.[1] || model}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
        </div>

        {/* Exchange Rate Spinbox */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5" title="USD to INR Exchange Rate">
          <DollarSign size={14} className="text-green-400" aria-hidden="true" />
          <span className="text-xs text-text-muted">1 USD = ₹</span>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0"
            className="w-16 bg-transparent text-xs font-mono text-white focus:outline-none text-right"
            aria-label="Exchange Rate (USD to INR)"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
          <Coins size={14} className="text-primary" aria-hidden="true" />
          <span className="text-xs font-mono text-text-muted">
            Usage: <span className="text-white font-bold">{formatDualCurrency(totalCost, exchangeRate)}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Susant Swain</p>
            <p className="text-xs text-text-muted">Engineer</p>
          </div>
          <img
            src="https://storage.susantswain.com/photos/susant-profile-photo.jpg"
            alt="Susant Swain"
            className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
