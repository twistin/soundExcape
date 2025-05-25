import React, { useState, useContext, useEffect, ChangeEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Project, TechnicalSheet } from '../types';
import FormField from '../components/FormField';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { getCoordinatesFromLocationName } from '../services/geolocationService';
import { LocationMarkerIcon } from '../constants';
import L from 'leaflet'; // Import Leaflet

const ProjectFormScreen: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const context = useContext(AppContext);

  const isEditing = Boolean(projectId);
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [technicalSheet, setTechnicalSheet] = useState<TechnicalSheet>({
    microphone: '',
    recorder: '',
    settings: '',
    latitude: undefined,
    longitude: undefined,
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Refs for Leaflet map and marker
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null); // Ref for the map container

  useEffect(() => {
    if (isEditing && projectId && context) {
      const existingProject = context.projects.find(p => p.id === projectId);
      if (existingProject) {
        setName(existingProject.name);
        setLocation(existingProject.location);
        setTheme(existingProject.theme);
        setDate(existingProject.date);
        setNotes(existingProject.notes);
        setTechnicalSheet(existingProject.technicalSheet);
      } else {
        navigate('/');
      }
    }
  }, [projectId, isEditing, context?.projects, navigate]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) { // Initialize only once
      const initialLat = technicalSheet.latitude ?? 51.505; // Default to London or existing lat
      const initialLng = technicalSheet.longitude ?? -0.09; // Default to London or existing lng
      const initialZoom = (technicalSheet.latitude && technicalSheet.longitude) ? 13 : 2;

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Map click event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setTechnicalSheet(prevSheet => ({
          ...prevSheet,
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
        }));
      });
    }

    // Cleanup map instance on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [technicalSheet.latitude, technicalSheet.longitude]); // Rerun if coords change to re-center, but init only once. The main init is guarded.

  // Update map marker and view when latitude/longitude change in form
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      const { latitude, longitude } = technicalSheet;
      if (latitude !== undefined && longitude !== undefined) {
        const latLng = L.latLng(latitude, longitude);
        if (!markerInstanceRef.current) {
          const marker = L.marker(latLng, { draggable: true }).addTo(map);
          marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            setTechnicalSheet(prevSheet => ({
              ...prevSheet,
              latitude: parseFloat(lat.toFixed(6)),
              longitude: parseFloat(lng.toFixed(6)),
            }));
          });
          markerInstanceRef.current = marker;
        } else {
          markerInstanceRef.current.setLatLng(latLng);
        }
        map.setView(latLng, map.getZoom() < 5 ? 13 : map.getZoom()); // Zoom in if map is too zoomed out
      } else {
        // If no coords, remove marker
        if (markerInstanceRef.current) {
          markerInstanceRef.current.remove();
          markerInstanceRef.current = null;
        }
      }
    }
  }, [technicalSheet.latitude, technicalSheet.longitude]);


  if (!context) return <p>Cargando contexto...</p>;
  const { addProject, updateProject } = context;

  const handleTechSheetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value;
    
    setTechnicalSheet(prevSheet => ({
      ...prevSheet,
      [name]: parsedValue
    }));
  };

  const handleFetchCoordinates = async () => {
    if (!location.trim()) {
      setGeocodingError("Por favor, ingresa un nombre de ubicación primero.");
      return;
    }
    setIsGeocoding(true);
    setGeocodingError(null);
    const coords = await getCoordinatesFromLocationName(location);
    setIsGeocoding(false);
    if (coords) {
      setTechnicalSheet(prevSheet => ({
        ...prevSheet,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } else {
      // Error messages are handled by getCoordinatesFromLocationName via alerts for now.
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !theme || !date) {
        alert("Por favor, completa todos los campos obligatorios: Nombre, Ubicación, Tema y Fecha.");
        return;
    }

    const projectData: Project = {
      id: projectId || `proj_${Date.now()}`,
      name,
      location,
      theme,
      date,
      notes,
      technicalSheet,
    };

    if (isEditing) {
      updateProject(projectData);
    } else {
      addProject(projectData);
    }
    navigate(isEditing ? `/project/${projectId}` : `/project/${projectData.id}`);
  };

  return (
    <div>
      <PageHeader title={isEditing ? "Editar Proyecto" : "Nuevo Proyecto"} showBackButton />
      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-2xl mx-auto">
        <FormField id="name" label="Nombre del Proyecto" value={name} onChange={e => setName(e.target.value)} required />
        
        <div>
          <FormField id="location" label="Ubicación" value={location} onChange={e => setLocation(e.target.value)} required />
          <Button 
            type="button" 
            onClick={handleFetchCoordinates} 
            variant="secondary" 
            size="sm" 
            className="mt-1 text-sm"
            disabled={isGeocoding || !location.trim()}
          >
            <LocationMarkerIcon className="w-4 h-4 mr-1 inline-block" />
            {isGeocoding ? "Buscando..." : "Obtener Coordenadas desde Ubicación"}
          </Button>
          {geocodingError && <p className="text-red-500 text-xs mt-1">{geocodingError}</p>}
        </div>

        <FormField id="theme" label="Tema" value={theme} onChange={e => setTheme(e.target.value)} required />
        <FormField id="date" label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <FormField id="notes" label="Notas" type="textarea" value={notes} onChange={e => setNotes(e.target.value)} />

        <div className="pt-4 mt-4 border-t border-brand-dark-border dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-brand-text-light dark:text-gray-200">Ficha Técnica y Coordenadas</h2>
          
          <p className="text-sm text-brand-text-dim mb-2">
            Haz clic en el mapa para seleccionar la ubicación o ingresa las coordenadas manualmente. El marcador es arrastrable.
          </p>
          <div 
            id="map-container-project" 
            ref={mapContainerRef} 
            className="h-72 w-full rounded-lg shadow-md mb-4 bg-brand-dark-card border border-brand-dark-border"
            aria-label="Mapa para seleccionar ubicación del proyecto"
          >
            {/* Leaflet map will be rendered here */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormField 
              id="latitude" 
              name="latitude" 
              label="Latitud" 
              type="number" 
              value={technicalSheet.latitude === undefined ? '' : technicalSheet.latitude} 
              onChange={handleTechSheetChange} 
              placeholder="Ej: 40.7128" 
              step="any"
            />
            <FormField 
              id="longitude" 
              name="longitude" 
              label="Longitud" 
              type="number" 
              value={technicalSheet.longitude === undefined ? '' : technicalSheet.longitude} 
              onChange={handleTechSheetChange} 
              placeholder="Ej: -74.0060" 
              step="any"
            />
          </div>
          <FormField id="microphone" name="microphone" label="Micrófono" value={technicalSheet.microphone} onChange={handleTechSheetChange} />
          <FormField id="recorder" name="recorder" label="Grabadora" value={technicalSheet.recorder} onChange={handleTechSheetChange} />
          <FormField id="settings" name="settings" label="Configuración" value={technicalSheet.settings} onChange={handleTechSheetChange} />
        </div>
        
        <Button type="submit" variant="primary" size="lg" className="w-full">
          {isEditing ? "Guardar Cambios" : "Crear Proyecto"}
        </Button>
      </form>
    </div>
  );
};

export default ProjectFormScreen;