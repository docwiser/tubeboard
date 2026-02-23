import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ApiKeyModal } from './ApiKeyModal';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-primary/30">
      <ApiKeyModal />
      <Sidebar />
      <Header />
      <main className="ml-64 min-h-[calc(100vh-4rem-5rem)] p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
