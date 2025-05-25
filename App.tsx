import React, { useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomeScreen from './pages/HomeScreen'; // This will be the new informational Home
import ProjectListScreen from './pages/ProjectListScreen'; // New: for listing projects
import GalleryScreen from './pages/GalleryScreen'; // New: for media gallery
import ProjectFormScreen from './pages/ProjectFormScreen';
import ProjectDetailScreen from './pages/ProjectDetailScreen';
import RecordingFormScreen from './pages/RecordingFormScreen';
import MapScreen from './pages/MapScreen';
import UtilitiesScreen from './pages/UtilitiesScreen';
import { AppContext } from './contexts/AppContext';
import WelcomeScreen from './pages/WelcomeScreen';

const App: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    return <div className="flex items-center justify-center h-screen bg-brand-dark-bg text-brand-text-light">Cargando contexto inicial...</div>;
  }
  const { darkMode, hasVisitedWelcome } = appContext;

  useEffect(() => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (darkMode) {
      htmlElement.classList.add('dark');
      htmlElement.style.backgroundColor = '#1E2A3B'; // brand-dark-bg

      if (hasVisitedWelcome) {
        bodyElement.classList.add('bg-brand-dark-bg', 'text-brand-text-light');
        bodyElement.classList.remove('bg-white', 'text-gray-900');
      } else {
        bodyElement.classList.add('text-brand-text-light');
        bodyElement.classList.remove('bg-white', 'text-gray-900', 'bg-brand-dark-bg');
      }
    } else { // Light Mode
      htmlElement.classList.remove('dark');
      htmlElement.style.backgroundColor = '#FFFFFF'; 

      if (hasVisitedWelcome) {
        bodyElement.classList.add('bg-white', 'text-gray-900');
        bodyElement.classList.remove('bg-brand-dark-bg', 'text-brand-text-light');
      } else {
        bodyElement.classList.add('text-brand-text-light'); 
        bodyElement.classList.remove('bg-white', 'text-gray-900', 'bg-brand-dark-bg');
      }
    }
  }, [darkMode, hasVisitedWelcome]);


  if (!hasVisitedWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeScreen />} /> {/* Informational Home */}
          <Route path="/projects" element={<ProjectListScreen />} /> {/* Project Grid */}
          <Route path="/gallery" element={<GalleryScreen />} /> {/* Media Gallery */}
          <Route path="/new-project" element={<ProjectFormScreen />} />
          <Route path="/edit-project/:projectId" element={<ProjectFormScreen />} />
          <Route path="/project/:projectId" element={<ProjectDetailScreen />} />
          <Route path="/project/:projectId/new-recording" element={<RecordingFormScreen />} />
          <Route path="/project/:projectId/edit-recording/:recordingId" element={<RecordingFormScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/utilities" element={<UtilitiesScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;