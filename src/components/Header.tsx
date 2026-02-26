import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDualCurrency } from '../lib/utils';
import { Coins, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { totalCost, exchangeRate } = useApp();

  return (
    <header className="h-16 border-b border-white/5 bg-bg/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
          <Coins size={14} className="text-primary" aria-hidden="true" />
          <span className="text-xs font-mono text-text-muted">
            <span className="text-white font-bold">{formatDualCurrency(totalCost, exchangeRate)}</span>
          </span>
        </div>

        <img
          src="https://storage.susantswain.com/photos/susant-profile-photo.jpg"
          alt="Profile"
          className="w-8 h-8 rounded-full border border-white/10 object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </header>
  );
}
