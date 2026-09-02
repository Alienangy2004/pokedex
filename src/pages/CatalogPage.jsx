import React, { useEffect, useState } from 'react';
import { getPokemonList } from '../services/pokeApi';
import PokemonCard from '../components/PokemonCard';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function CatalogPage() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      // Se solicita los primeros 24 Pokemones
      const data = await getPokemonList(24);
      setPokemons(data);
    } catch (err) {
      setError('Connection Lost: No se pudo establecer conexión con la PokéAPI.');
    } finally {
      setLoading(false);
    }
  };
// Se ejecuta una sola vez justo cuando el componente 
// Se monta por primera vez en la pantalla del usuario
  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div className="app-container">
      {/* 1. Estado de Carga (Pokéball Spinner de Stitch) */}
      {loading && (
        <div className="state-container state-loading">
          <div className="pokeball-spinner"></div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Syncing Dex Data...
          </p>
        </div>
      )}

      {/* 2. Estado de Error con botón de Reintentar */}
      {error && (
        <div className="state-container state-error">
          <AlertTriangle size={36} color="#ba1a1a" style={{ marginBottom: '8px' }} />
          <h4 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
            Connection Lost
          </h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={fetchCatalog} 
            className="btn-scan" 
            style={{ fontSize: '0.9rem', padding: '8px 20px' }}
          >
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      )}

      {/* 3. Cuadrícula de Pokémon */}
      {!loading && !error && (
        <div className="pokemon-grid">
          {pokemons.map(pokemon => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}