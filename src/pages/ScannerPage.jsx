// Uso de la camara
import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import { getPokemonDetails } from '../services/pokeApi';
import PokemonCard from '../components/PokemonCard';
import { Camera, CameraOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

// Enlace con el modelo de teachable machine
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/wewjrhGxi/";

export default function ScannerPage() {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [status, setStatus] = useState('Cargando modelo de visión artificial...');
  
  const [predictions, setPredictions] = useState([]);
  const [scannedPokemon, setScannedPokemon] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const lastDetectedRef = useRef(null);
  const isPredictingRef = useRef(false);

  // Cargar el modelo
  useEffect(() => {
    async function loadModel() {
      try {
        const checkpointURL = MODEL_URL + 'model.json';
        const metadataURL = MODEL_URL + 'metadata.json';
        const loadedModel = await tmImage.load(checkpointURL, metadataURL);
        setModel(loadedModel);
        setStatus('Modelo listo. Inicia la cámara para escanear.');
      } catch (err) {
        setStatus('Error al cargar modelo. Revisa la URL en ScannerPage.jsx');
      }
    }
    loadModel();

    return () => {
      stopCamera();
    };
  }, []);

  // Encender cámara web
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        isPredictingRef.current = true;
        setStatus('Analizando imagen en tiempo real...');
      }
    } catch (err) {
      setCameraError('Permiso denegado o dispositivo sin cámara disponible.');
      setCameraActive(false);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    isPredictingRef.current = false;
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setPredictions([]);
    setStatus('Cámara detenida.');
  };

  // Bucle de predicción
  useEffect(() => {
    let animationId;

    const predictLoop = async () => {
      if (
        isPredictingRef.current &&
        model &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        try {
          const preds = await model.predict(videoRef.current);
          setPredictions(preds);

          const best = preds.reduce((prev, curr) => 
            (prev.probability > curr.probability) ? prev : curr
          );

          const ignoredClasses = ['vacio', 'fondo', 'background', 'nada'];
          const classNameLower = best.className.toLowerCase().trim();

          // Umbral de certeza del 60%
          if (best.probability >= 0.60 && !ignoredClasses.includes(classNameLower)) {
            if (lastDetectedRef.current !== classNameLower) {
              lastDetectedRef.current = classNameLower;
              fetchScannedPokemon(classNameLower);
            }
          }
        } catch (e) {
          // Ignorar frames intermedios
        }
      }

      if (isPredictingRef.current) {
        animationId = requestAnimationFrame(predictLoop);
      }
    };

    if (cameraActive && model) {
      predictLoop();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [cameraActive, model]);

  // Consulta a la PokéAPI
  const fetchScannedPokemon = async (name) => {
    setApiLoading(true);
    setApiError(null);
    setStatus(`¡Detectado: ${name.toUpperCase()}! Consultando PokéAPI...`);
    try {
      const data = await getPokemonDetails(name);
      setScannedPokemon(data);
      setStatus(`Identificación completada: ${data.name.toUpperCase()}`);
    } catch (err) {
      setApiError(`No se encontraron datos para "${name}" en PokéAPI.`);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Hanken Grotesk', fontSize: '1.5rem', fontWeight: 800 }}>
          Reconocimiento Visual IA
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status}</p>
      </div>

      {/* Visor de Cámara */}
      <div className="scanner-viewfinder">
        <video ref={videoRef} className="camera-feed" playsInline muted />
        
        {cameraActive && (
          <div className="scanner-brackets">
            <div className="bracket-tl"></div>
            <div className="bracket-tr"></div>
            <div className="bracket-bl"></div>
            <div className="bracket-br"></div>
            <div className="scan-line"></div>
          </div>
        )}

        {!cameraActive && (
          <div style={{ color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Camera size={44} />
            <span style={{ fontSize: '0.85rem' }}>Cámara Inactiva</span>
          </div>
        )}
      </div>

      {/* Botón de Cámara */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {!cameraActive ? (
          <button onClick={startCamera} className="btn-scan">
            <Camera size={18} /> Iniciar Cámara
          </button>
        ) : (
          <button onClick={stopCamera} className="btn-scan" style={{ background: '#2a1614' }}>
            <CameraOff size={18} /> Detener Cámara
          </button>
        )}
      </div>

      {cameraError && (
        <div className="state-container state-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={24} />
          <p>{cameraError}</p>
        </div>
      )}

      {/* Monitor de Confianza en Tiempo Real */}
      {cameraActive && predictions.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
            CONFIANZA DEL MODELO EN TIEMPO REAL:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {predictions.map((p) => {
              const pct = (p.probability * 100).toFixed(1);
              return (
                <div key={p.className} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '90px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {p.className}:
                  </span>
                  <div style={{ flexGrow: 1, height: '8px', background: 'var(--meter-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: p.probability >= 0.6 ? 'var(--primary)' : '#888' }}></div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', width: '45px', textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tarjeta de Resultado del Escaneo */}
      <div>
        <h3 style={{ fontFamily: 'Hanken Grotesk', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
          Resultado del Reconocimiento
        </h3>

        {apiLoading && (
          <div className="state-container">
            <div className="pokeball-spinner"></div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Descargando espécimen oficial desde PokéAPI...
            </p>
          </div>
        )}

        {apiError && (
          <div className="state-container state-error">
            <AlertCircle size={28} />
            <p>{apiError}</p>
          </div>
        )}

        {scannedPokemon && !apiLoading && (
          <div style={{ maxWidth: '340px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', justifyContent: 'center' }}>
              <CheckCircle2 size={16} /> POKÉMON RECONOCIDO CON ÉXITO
            </div>
            <PokemonCard pokemon={scannedPokemon} />
          </div>
        )}

        {!scannedPokemon && !apiLoading && !apiError && (
          <div className="state-container">
            <Sparkles size={30} color="var(--primary)" style={{ marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Apunta a Pikachu, Charmander o Squirtle para registrarlo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}