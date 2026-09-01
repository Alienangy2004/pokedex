import React, { useState } from 'react';
import CatalogPage from './pages/CatalogPage';
import ScannerPage from './pages/ScannerPage';
import { Grid, Scan, Sparkles, Settings } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('catalog');

  return (
    <div>
      {/* Top Header */}
      <header className="top-header">
        <button className="icon-btn" aria-label="Pokeball">
          <Sparkles size={22} />
        </button>
        <h1>PokéDex OS</h1>
        <button className="icon-btn" aria-label="Settings">
          <Settings size={22} />
        </button>
      </header>

      {/* Vista Actual */}
      <main>
        {currentPage === 'catalog' ? <CatalogPage /> : <ScannerPage />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentPage === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentPage('catalog')}
        >
          <Grid size={20} style={{ marginBottom: '2px' }} />
          <span>Catálogo</span>
        </button>
        
        <button 
          className={`nav-item ${currentPage === 'scanner' ? 'active' : ''}`}
          onClick={() => setCurrentPage('scanner')}
        >
          <Scan size={20} style={{ marginBottom: '2px' }} />
          <span>Escáner</span>
        </button>
      </nav>
    </div>
  );
}