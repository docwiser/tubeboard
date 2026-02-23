import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { Coins } from 'lucide-react';

export function Header() {
  const { totalCost } = useApp();

  return (
    <header className="h-16 border-b border-white/5 bg-bg/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30 ml-64">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs or Title could go here */}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
          <Coins size={14} className="text-primary" />
          <span className="text-xs font-mono text-text-muted">
            Usage: <span className="text-white font-bold">{formatCurrency(totalCost)}</span>
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
