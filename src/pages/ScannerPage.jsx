import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import { getPokemonDetails } from '../services/pokeApi';
import PokemonCard from '../components/PokemonCard';
import { Camera, CameraOff, Sparkles, AlertCircle } from 'lucide-react';

// URL de tu modelo exportado de Teachable Machine (debe terminar en /)
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/wewjrhGxi/";

export default function ScannerPage() {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [status, setStatus] = useState('Esperando inicio de cámara');
  
  const [scannedPokemon, setScannedPokemon] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Ref para evitar spam de consultas continuas al mismo Pokémon
  const lastDetectedRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 1. Cargar modelo Teachable Machine
  useEffect(() => {
    async function loadModel() {
      try {
        setStatus('Cargando modelo de visión artificial...');
        const checkpointURL = MODEL_URL + 'model.json';
        const metadataURL = MODEL_URL + 'metadata.json';
        const loadedModel = await tmImage.load(checkpointURL, metadataURL);
        setModel(loadedModel);
        setStatus('Modelo listo. Inicia la cámara para escanear.');
      } catch {
        setStatus('Modo manual: Proporciona una URL válida de Teachable Machine.');
      }
    }
    loadModel();
    return () => {
      stopCamera();
    };
  }, []);

  // 2. Encender Cámara
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setStatus('Analizando imagen...');
      }
    } catch (err) {
      setCameraError('No se pudo acceder a la cámara. Verifica permisos.');
      setCameraActive(false);
    }
  };

  // 3. Detener Cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
    setStatus('Cámara detenida');
  };

  // 4. Bucle de predicción
  useEffect(() => {
    let active = true;

    const predictLoop = async () => {
      if (model && videoRef.current && cameraActive && videoRef.current.readyState === 4) {
        const predictions = await model.predict(videoRef.current);
        // Filtrar clase con mayor confianza (> 85%)
        const best = predictions.reduce((prev, current) => 
          (prev.probability > current.probability) ? prev : current
        );

        if (best.probability > 0.85 && best.className.toLowerCase() !== 'vacio' && best.className.toLowerCase() !== 'fondo') {
          const detectedName = best.className.toLowerCase().trim();
          
          if (lastDetectedRef.current !== detectedName) {
            lastDetectedRef.current = detectedName;
            fetchScannedPokemon(detectedName);
          }
        }
      }
      if (active && cameraActive) {
        animationFrameRef.current = requestAnimationFrame(predictLoop);
      }
    };

    if (cameraActive && model) {
      predictLoop();
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, model]);

  const fetchScannedPokemon = async (name) => {
    setApiLoading(true);
    setApiError(null);
    setStatus(`¡Pokémon detectado: ${name}! Consultando PokéAPI...`);
    try {
      const data = await getPokemonDetails(name);
      setScannedPokemon(data);
      setStatus(`Identificación completada: ${data.name.toUpperCase()}`);
    } catch (err) {
      setApiError(`Detectado "${name}", pero ocurrió un error en PokéAPI.`);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <main className="container scanner-layout">
      <div className="scanner-card">
        <h2>Reconocimiento Visual de Pokémon</h2>
        <p className="scanner-status">{status}</p>

        <div className="video-container">
          <video 
            ref={videoRef} 
            className={`video-preview ${!cameraActive ? 'video-preview--off' : ''}`}
            playsInline 
            muted 
          />
          {!cameraActive && (
            <div className="video-placeholder">
              <Camera size={48} />
              <span>Cámara inactiva</span>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="state-box state-box--error">
            <AlertCircle size={20} />
            <p>{cameraError}</p>
          </div>
        )}

        <div className="scanner-buttons">
          {!cameraActive ? (
            <button onClick={startCamera} className="btn-primary">
              <Camera size={18} /> Activar Cámara
            </button>
          ) : (
            <button onClick={stopCamera} className="btn-danger">
              <CameraOff size={18} /> Detener Cámara
            </button>
          )}
        </div>
      </div>

      <div className="result-area">
        <h3>Resultado del Escáner</h3>
        {apiLoading && (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Descargando datos del espécimen...</p>
          </div>
        )}

        {apiError && (
          <div className="state-box state-box--error">
            <AlertCircle size={24} />
            <p>{apiError}</p>
          </div>
        )}

        {scannedPokemon && !apiLoading && (
          <PokemonCard pokemon={scannedPokemon} isScanned={true} />
        )}

        {!scannedPokemon && !apiLoading && !apiError && (
          <div className="state-box state-box--empty">
            <Sparkles size={32} />
            <p>Apunta a uno de los 3 Pokémon entrenados para ver su información en tiempo real.</p>
          </div>
        )}
      </div>
    </main>
  );
}