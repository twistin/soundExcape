import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogoFullIcon, PhotoIcon, FolderIcon } from '../constants';
import Button from '../components/Button';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 md:p-8 bg-gradient-to-b from-brand-dark-bg via-slate-900 to-brand-dark-bg text-brand-text-light">
      <header className="mb-8 md:mb-12">
        <AppLogoFullIcon className="w-64 h-auto md:w-80 mx-auto mb-2" />
        {/* The h1 below was removed as it's redundant with AppLogoFullIcon */}
        <p className="text-md md:text-lg text-brand-text-dim mt-3 max-w-2xl mx-auto">
          Tu compañero digital para la exploración sonora. Captura, organiza, enriquece con IA y redescubre el universo auditivo que te rodea.
        </p>
      </header>

      <section className="mb-10 md:mb-12 max-w-3xl w-full">
        <h2 className="text-2xl font-semibold text-brand-primary mb-4">¿Qué es soundXcape?</h2>
        <p className="text-brand-text-dim text-left md:text-center leading-relaxed space-y-3">
          <span>
            soundXcape te permite crear proyectos detallados para tus expediciones de grabación de sonido. Documenta cada captura con notas, fotos tomadas en el momento o subidas desde tu equipo, y grabaciones de voz (directas o importadas).
          </span>
          <span>
            Organiza tus hallazgos con etiquetas, información técnica y coordenadas geográficas. Potencia tu creatividad con sugerencias de IA, y visualiza tus proyectos en un mapa interactivo.
          </span>
        </p>
      </section>

      <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-md">
        <Button 
          onClick={() => navigate('/projects')}
          variant="primary"
          size="lg"
          className="flex items-center justify-center py-3 md:py-4 text-lg"
        >
          <FolderIcon className="w-6 h-6 mr-2" />
          Ver Mis Proyectos
        </Button>
        <Button 
          onClick={() => navigate('/gallery')}
          variant="secondary"
          size="lg"
          className="flex items-center justify-center py-3 md:py-4 text-lg"
        >
          <PhotoIcon className="w-6 h-6 mr-2" />
          Explorar Galería Multimedia
        </Button>
      </nav>

      <footer className="mt-12 md:mt-16 text-xs text-brand-text-dim opacity-70">
        <p>&copy; {new Date().getFullYear()} soundXcape. Redescubre el sonido.</p>
      </footer>
    </div>
  );
};

export default HomeScreen;