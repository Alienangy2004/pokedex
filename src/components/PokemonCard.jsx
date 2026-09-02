// Tarjetas individuales
import React, { useState } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';

const typeColors = {
  grass: '#78C850',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  poison: '#A040A0',
  bug: '#A8B820',
  normal: '#A8A878',
  flying: '#A890F0',
  ground: '#E0C068',
  fairy: '#EE99AC'
};

export default function PokemonCard({ pokemon }) {
    // Control de reproduccion
  const [isPlaying, setIsPlaying] = useState(false);
   // En caso de fallo del sonido
  const [audioError, setAudioError] = useState(false);

  const mainType = pokemon.types[0] || 'normal';
  const badgeColor = typeColors[mainType] || '#A8A878';

  const handlePlayCry = (e) => {
    e.stopPropagation(); // Evitar que se pulse por accidente
    if (!pokemon.cry) {
      setAudioError(true);
      return;
    }

    setAudioError(false);
    setIsPlaying(true);
    //Ajuste del volumen a 60%
    const audio = new Audio(pokemon.cry);
    audio.volume = 0.6;
    
    audio.play()
      .then(() => {
        audio.onended = () => setIsPlaying(false);
      })
      //En caso de error del audio
      .catch(() => {
        setIsPlaying(false);
        setAudioError(true);
      });
  };

  return (
    <article className="pokemon-card">
      <div className="avatar-wrapper" style={{ backgroundColor: `${badgeColor}25` }}>
        {pokemon.image ? (
          <img src={pokemon.image} alt={pokemon.name} className="avatar-img" loading="lazy" />
        ) : (
          <span style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center' }}>Sin imagen</span>
        )}

        {/* Botón de reproducción de sonido (Cry) */}
        <button 
          onClick={handlePlayCry} 
          className="btn-cry"
          title={pokemon.cry ? "Reproducir grito" : "Audio no disponible"}
          aria-label={`Reproducir grito de ${pokemon.name}`}
        >
          <Volume2 size={15} color={isPlaying ? '#bc0007' : '#ffffff'} />
        </button>
      </div>

      <div className="card-info">
        <div className="card-number">#{String(pokemon.id).padStart(3, '0')}</div>
        <h2 className="card-name">{pokemon.name}</h2>

        <div className="card-types">
          {pokemon.types.map(t => (
            <span key={t} className={`type-pill type--${t}`}>
              {t}
            </span>
          ))}
        </div>

        {audioError && (
          <p style={{ fontSize: '0.7rem', color: '#ba1a1a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <AlertCircle size={11} /> Audio no disponible
          </p>
        )}
      </div>
    </article>
  );
}