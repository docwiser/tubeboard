import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ApiKeyModal } from './ApiKeyModal';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-primary/30">
      <ApiKeyModal />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
      <main className="min-h-[calc(100vh-4rem-5rem)] p-4 md:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
