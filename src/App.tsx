import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProjectView } from './pages/ProjectView';
import { CostPage } from './pages/CostPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectView />} />
            <Route path="/cost" element={<CostPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
