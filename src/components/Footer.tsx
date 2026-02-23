import React from 'react';

export function Footer() {
  return (
    <footer className="py-8 border-t border-white/5 mt-auto ml-64 bg-bg">
      <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Tubeboard. All rights reserved.
        </p>
        
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <p>
            Powered by <span className="text-primary font-bold">Gemini</span>
          </p>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <p>
            Engineered by <a href="https://susantswain.com" target="_blank" rel="noreferrer" className="text-white hover:text-secondary transition-colors font-medium">Susant Swain</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
