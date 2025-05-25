
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import Button from './Button';
import { 
    ArrowLeftIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon 
} from '../constants';
import { Photo, Recording, Project } from '../types';

interface ModalItem {
  photo: Photo;
  recording?: Recording;
  project?: Project;
}

interface ImageModalProps {
  item: ModalItem;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ item, onClose }) => {
  const { photo, recording, project } = item;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const voiceNoteToPlay = recording?.voiceNotes?.[0]; // Play the first voice note

  // Initialize Audio
  useEffect(() => {
    if (audioRef.current && voiceNoteToPlay?.audioBase64) {
      audioRef.current.src = voiceNoteToPlay.audioBase64;
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
    // Cleanup audio on unmount or if voiceNoteToPlay changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src'); 
        audioRef.current.load();
      }
    };
  }, [voiceNoteToPlay, volume, isMuted]);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && project?.technicalSheet.latitude && project?.technicalSheet.longitude) {
      const lat = project.technicalSheet.latitude;
      const lon = project.technicalSheet.longitude;
      
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 13,
        zoomControl: false, // Disable zoom control for a cleaner look
        attributionControl: false, // Disable attribution for cleaner look
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([lat, lon]).addTo(map);
      mapInstanceRef.current = map;

      // Invalidate size after a short delay to ensure proper rendering in modal
      setTimeout(() => map.invalidateSize(), 100);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [project]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const toggleFullScreen = () => {
    if (!modalContentRef.current) return;
    if (!document.fullscreenElement) {
      modalContentRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(err => console.error(err));
    }
  };
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  return (
    <div 
      ref={modalContentRef}
      className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-0 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Main Image as Background */}
      <img 
        src={photo.url} 
        alt={photo.caption} 
        className="absolute inset-0 w-full h-full object-contain z-0" // object-contain to see whole image
      />

      {/* Overlay Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {/* Top Bar: Close Button and Map */}
        <div className="w-full p-3 flex justify-between items-start">
          <Button onClick={onClose} variant="ghost" size="sm" className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full" aria-label="Cerrar modal">
            <ArrowLeftIcon className="w-6 h-6 text-white"/>
          </Button>
          
          {project?.technicalSheet.latitude && project?.technicalSheet.longitude && (
            <div 
              ref={mapContainerRef} 
              className="w-40 h-28 md:w-48 md:h-32 border-2 border-white/50 rounded-md shadow-lg bg-gray-700"
              aria-label="Mapa de ubicación de la grabación"
            >
              {/* Leaflet map will render here */}
            </div>
          )}
        </div>

        {/* Photo Info (Optional, can be placed centrally if image is not full bleed) */}
        <div className="text-center p-2 bg-black/30 backdrop-blur-sm">
            <p className="text-sm font-medium text-white truncate" id="imageModalCaption">{photo.caption}</p>
            {recording && <p className="text-xs text-gray-300 truncate">Grabación: {recording.title}</p>}
            {project && <p className="text-xs text-gray-300 truncate">Proyecto: {project.name}</p>}
        </div>


        {/* Bottom Bar: Controls */}
        <div className="w-full p-3 bg-black/50 backdrop-blur-sm flex justify-between items-center">
          <Button onClick={toggleFullScreen} variant="ghost" size="sm" className="p-1.5" aria-label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}>
            <ArrowsPointingOutIcon className="w-6 h-6 text-white"/>
          </Button>
          
          {voiceNoteToPlay && (
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button onClick={togglePlay} variant="ghost" size="sm" className="p-1.5" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
                {isPlaying ? <PauseIcon className="w-6 h-6 text-white"/> : <PlayIcon className="w-6 h-6 text-white"/>}
              </Button>
              <Button onClick={toggleMute} variant="ghost" size="sm" className="p-1.5" aria-label={isMuted ? "Activar sonido" : "Silenciar"}>
                {isMuted ? <SpeakerXMarkIcon className="w-6 h-6 text-white"/> : <SpeakerWaveIcon className="w-6 h-6 text-white"/>}
              </Button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                className="w-16 md:w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                aria-label="Control de volumen"
                disabled={isMuted}
              />
            </div>
          )}
          <div className="w-10 h-10"> {/* Spacer for balance if no audio */}
            {!voiceNoteToPlay && <span>&nbsp;</span>}
          </div>
        </div>
      </div>
      <audio 
        ref={audioRef} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onVolumeChange={() => {
            if (audioRef.current) {
                setVolume(audioRef.current.volume);
                setIsMuted(audioRef.current.muted);
            }
        }}
        className="hidden"
      />
    </div>
  );
};

export default ImageModal;
