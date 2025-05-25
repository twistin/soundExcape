import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import PageHeader from '../components/PageHeader';
import { AppContext } from '../contexts/AppContext';
import { Project } from '../types';
import { MagnifyingGlassIcon, SparklesIcon } from '../constants';
import { isAIAvailable, generateJson } from '../services/geminiService';

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(AppContext);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null); // Layer group for markers

  const [searchTerm, setSearchTerm] = useState('');
  const [aiSearchSuggestions, setAiSearchSuggestions] = useState<string[]>([]);
  const [isFetchingAiSuggestions, setIsFetchingAiSuggestions] = useState(false);
  const [aiFeaturesAvailable, setAiFeaturesAvailable] = useState(false);

  useEffect(() => {
    setAiFeaturesAvailable(isAIAvailable());
  }, []);

  useEffect(() => {
    if (!context) return;
    const { projects } = context;

    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Default view (Europe) or based on available projects
      let initialCenter: L.LatLngTuple = [50.8503, 4.3517]; // Brussels as a generic center
      let initialZoom = 4;

      const projectsWithCoords = projects.filter(p => 
        p.technicalSheet.latitude !== undefined && 
        p.technicalSheet.longitude !== undefined
      );

      if (projectsWithCoords.length > 0) {
        initialCenter = [projectsWithCoords[0].technicalSheet.latitude!, projectsWithCoords[0].technicalSheet.longitude!];
        initialZoom = 6;
      }
      
      const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);
      mapInstanceRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    // Update markers when projects change or map initializes
    if (mapInstanceRef.current && markersRef.current) {
      markersRef.current.clearLayers(); // Clear existing markers
      const boundsArray: L.LatLngExpression[] = [];

      projects.forEach((project: Project) => {
        if (project.technicalSheet.latitude !== undefined && project.technicalSheet.longitude !== undefined) {
          const latLng = L.latLng(project.technicalSheet.latitude, project.technicalSheet.longitude);
          boundsArray.push(latLng);
          const marker = L.marker(latLng);
          
          // Using navigate for SPA navigation in popup
          const popupContent = document.createElement('div');
          popupContent.innerHTML = `<b>${project.name}</b><br/>`;
          const link = document.createElement('a');
          link.href = `#/project/${project.id}`; // HashRouter link
          link.innerText = 'Ver Detalles';
          link.className = 'text-brand-primary hover:underline';
          link.onclick = (e) => {
            e.preventDefault(); // Prevent default link behavior
            navigate(`/project/${project.id}`);
          };
          popupContent.appendChild(link);
          marker.bindPopup(popupContent);

          markersRef.current?.addLayer(marker);
        }
      });

      // Focus on a specific project if its ID is in the route state
      const state = location.state as { projectId?: string };
      const focusedProjectId = state?.projectId;

      if (focusedProjectId) {
        const focusedProject = projects.find(p => p.id === focusedProjectId);
        if (focusedProject && focusedProject.technicalSheet.latitude !== undefined && focusedProject.technicalSheet.longitude !== undefined) {
          const focusedLatLng = L.latLng(focusedProject.technicalSheet.latitude, focusedProject.technicalSheet.longitude);
          mapInstanceRef.current.setView(focusedLatLng, 13); // Zoom in on the focused project
          
          // Open its popup
          markersRef.current.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                const markerLatLng = layer.getLatLng();
                if (markerLatLng.equals(focusedLatLng)) {
                    layer.openPopup();
                }
            }
          });
        }
      } else if (boundsArray.length > 0) {
        // If no specific project, fit bounds to all projects with coordinates
        // mapInstanceRef.current.fitBounds(boundsArray, { padding: [50, 50] });
      }
    }
    
    // Cleanup
    return () => {
      // Map instance is not removed here to persist across navigations to this screen
      // If full re-init is desired on each visit, uncomment .remove()
      // if (mapInstanceRef.current) {
      //   mapInstanceRef.current.remove();
      //   mapInstanceRef.current = null;
      // }
    };
  }, [context, location.state, navigate]); // Rerun if context (projects) or location state changes

  const handleSearchChange = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim() || !aiFeaturesAvailable) {
      setAiSearchSuggestions([]);
      return;
    }

    setIsFetchingAiSuggestions(true);
    try {
      const prompt = `El usuario está buscando "${term}" en el mapa de proyectos de soundXcape. Sugiere 3-4 consultas de búsqueda relacionadas con ubicaciones de proyectos o temas que podrían encontrar en un mapa. Devuelve un array JSON de strings. Ejemplo: ["proyectos cerca de la costa", "grabaciones en parques nacionales", "sonidos urbanos en el centro"]`;
      const suggestions = await generateJson<string[]>(prompt);
      setAiSearchSuggestions(suggestions || []);
    } catch (error) {
      console.error("Error fetching AI map search suggestions:", error);
      setAiSearchSuggestions([]);
    } finally {
      setIsFetchingAiSuggestions(false);
    }
  };

  if (!context) {
    return (
      <div>
        <PageHeader title="Mapa de Proyectos" />
        <p className="p-4 text-center">Cargando datos del mapa...</p>
      </div>
    );
  }
  const { projects } = context;
  const projectsWithCoordsCount = projects.filter(p => p.technicalSheet.latitude !== undefined && p.technicalSheet.longitude !== undefined).length;


  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Mapa de Proyectos" />
      <div className="relative flex-grow p-4">
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-brand-dark-card dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg shadow">
            <div className="flex items-center">
                <MagnifyingGlassIcon className="w-5 h-5 text-brand-text-dim dark:text-gray-400 mr-2" />
                <input 
                    type="search" 
                    placeholder="Buscar (sugerencias AI)..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="bg-transparent text-brand-text-light dark:text-gray-200 placeholder-brand-text-dim outline-none w-full"
                    aria-label="Buscar ubicaciones o proyectos con IA"
                />
            </div>
            {aiFeaturesAvailable && searchTerm && (isFetchingAiSuggestions || aiSearchSuggestions.length > 0) && (
                <div className="mt-2 p-2 border border-brand-dark-border rounded-md">
                    <p className="text-xs text-brand-text-dim mb-1 flex items-center"><SparklesIcon className="w-3 h-3 mr-1 text-brand-primary"/> Sugerencias AI:</p>
                    {isFetchingAiSuggestions && <p className="text-xs text-brand-text-dim">Buscando...</p>}
                    {!isFetchingAiSuggestions && aiSearchSuggestions.length > 0 && (
                        <ul className="space-y-1">
                            {aiSearchSuggestions.map((sug, index) => (
                                <li key={index} className="text-xs text-brand-text-light hover:text-brand-primary cursor-pointer" onClick={() => setSearchTerm(sug)}>
                                    {sug}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>

        <div 
          ref={mapContainerRef} 
          className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] w-full rounded-lg shadow-md bg-brand-dark-card border border-brand-dark-border"
          aria-label="Mapa interactivo de proyectos"
        >
          {/* Leaflet map will render here */}
        </div>
        {projectsWithCoordsCount === 0 && (
             <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <p className="text-brand-text-dim bg-brand-dark-card/80 p-3 rounded-md">
                    No hay proyectos con coordenadas para mostrar en el mapa.
                </p>
            </div>
        )}
        <p className="text-center text-sm text-brand-text-dim dark:text-gray-400 mt-2">
          Proyectos con coordenadas se muestran en el mapa. Haz clic en un marcador para más detalles.
        </p>
      </div>
    </div>
  );
};

export default MapScreen;