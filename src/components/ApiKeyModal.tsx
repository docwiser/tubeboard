import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Key } from 'lucide-react';

export function ApiKeyModal() {
  const { apiKey, setApiKey } = useApp();
  const [inputKey, setInputKey] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!apiKey) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
    }
  };

  // Prevent closing by Escape if no key is set
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !apiKey) {
      e.preventDefault();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="backdrop:bg-black/80 backdrop:backdrop-blur-sm bg-transparent p-0 open:animate-in open:fade-in open:zoom-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-card p-6 border border-white/10 shadow-2xl text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/20 text-primary">
            <Key size={24} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">Enter Gemini API Key</h2>
        </div>
        
        <p className="text-text-muted mb-6">
          To use Tubeboard, you need a Google Gemini API key. 
          Your key is stored locally in your browser.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-text-muted mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 rounded-xl bg-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
              aria-required="true"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors"
            aria-label="Save API Key"
          >
            Save API Key
          </button>
        </form>
        
        <p className="mt-4 text-xs text-center text-text-muted">
          Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Get one here</a>
        </p>
      </div>
    </dialog>
  );
}
