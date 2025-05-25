

import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import Button from '../components/Button';

// New Thematic Icon: Combines sound waves and a map pin/exploration concept
const SoundscapeExploreIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8.5s.5-1 1.5-1s1.5 1 1.5 1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 12.5s-.5 1-1.5 1s-1.5-1-1.5-1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8V7M15 13v-1" /> {/* Simplified sound elements */}
  </svg>
);


const WelcomeScreen: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    return <div className="flex items-center justify-center h-screen bg-brand-dark-bg text-brand-text-light">Cargando contexto...</div>;
  }
  const { markWelcomeAsVisited } = context;

  const handleGetStarted = () => {
    markWelcomeAsVisited();
    // App.tsx will re-render and show the main application
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-brand-dark-bg via-slate-800 to-brand-dark-card text-brand-text-light p-8 antialiased">
      <div className="text-center max-w-xl">
        <SoundscapeExploreIcon className="w-28 h-28 mx-auto mb-6 text-brand-primary opacity-90" />
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          sound<span className="text-brand-primary">X</span>cape
        </h1>
        <p className="text-lg md:text-xl text-brand-text-dim mb-10">
          Tu Pasaporte al Universo Sonoro. Captura, Organiza, Explora.
        </p>
        {/* Fix: Removed custom `animate-pulse-slow` and used Tailwind's `animate-pulse`. Removed <style jsx global> tag. */}
        <Button 
            onClick={handleGetStarted} 
            size="lg" 
            variant="primary" 
            className="px-10 py-3 text-xl shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
            aria-label="Explorar soundXcape"
        >
          Descubrir soundXcape
        </Button>
        <p className="mt-16 text-xs text-brand-text-dim opacity-70">
          Presiona el botón para iniciar tu aventura auditiva.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;