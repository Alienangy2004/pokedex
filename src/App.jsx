// Modo noche y dia
import React, { useState, useEffect } from 'react';
import CatalogPage from './pages/CatalogPage';
import ScannerPage from './pages/ScannerPage';
import { Grid, Scan, Sparkles, Sun, Moon } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('catalog'); // Alternar catalogo y escanner
  // Estado para el modo Día / Noche
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app">
      {/* Top Header */}
      <header className="top-header">
        <div className="brand-area">
          <Sparkles size={22} color="var(--primary)" />
          <h1>PokéDex OS</h1>
        </div>

        <div className="header-actions">
          {/* Botón interactivo de Modo Día / Noche */}
          <button 
            onClick={toggleTheme} 
            className="icon-btn" 
            title={theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo día'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#FFD166" />}
          </button>
        </div>
      </header>

      {/* Vistas principales */}
      <main>
        {currentPage === 'catalog' ? <CatalogPage /> : <ScannerPage />}
      </main>

      {/* Barra de Navegación Inferior (Stitch Layout) */}
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
          <span>Escáner IA</span>
        </button>
      </nav>
    </div>
  );
}