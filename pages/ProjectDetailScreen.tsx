import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import RecordingListItem from '../components/RecordingListItem';
import Button from '../components/Button';
import { PlusIcon, MapIcon, MicrophoneIcon, SparklesIcon, PencilIcon } from '../constants'; // Added SparklesIcon, PencilIcon
import PageHeader from '../components/PageHeader';
import { VoiceNote } from '../types';
import { generateJson, isAIAvailable } from '../services/geminiService';

const ProjectDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const context = useContext(AppContext);

  const [aiContentIdeas, setAiContentIdeas] = useState<string[]>([]);
  const [isLoadingAiIdeas, setIsLoadingAiIdeas] = useState(false);
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);

  useEffect(() => {
    setAiFeaturesEnabled(isAIAvailable());
  }, []);

  if (!context) return <p>Cargando contexto...</p>;
  const { projects, getRecordingsForProject, deleteProject, deleteRecording, updateRecording: contextUpdateRecording } = context;

  const project = projects.find(p => p.id === projectId);
  const projectRecordings = projectId ? getRecordingsForProject(projectId) : [];

  if (!project) {
    return (
      <div>
        <PageHeader title="Proyecto No Encontrado" showBackButton />
        <p className="p-4 text-center text-brand-text-dim">El proyecto solicitado no pudo ser encontrado.</p>
      </div>
    );
  }
  
  const handleDeleteProject = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}" y todas sus grabaciones?`)) {
        if (projectId) {
            deleteProject(projectId);
            navigate('/');
        }
    }
  }

  const handleDeleteRecording = (recordingId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta grabación?")) {
        deleteRecording(recordingId);
    }
  }
  
  const handleUpdateVoiceNoteInRecording = (recordingId: string, updatedVoiceNote: VoiceNote) => {
    const recordingToUpdate = projectRecordings.find(r => r.id === recordingId);
    if (recordingToUpdate) {
      const updatedVoiceNotes = recordingToUpdate.voiceNotes.map(vn => vn.id === updatedVoiceNote.id ? updatedVoiceNote : vn);
      contextUpdateRecording({...recordingToUpdate, voiceNotes: updatedVoiceNotes});
    }
  };


  const fetchAiContentIdeas = async () => {
    if (!aiFeaturesEnabled) {
        alert("Las funciones de IA no están disponibles. Verifica la configuración de la API Key de Gemini.");
        return;
    }
    setIsLoadingAiIdeas(true);
    setAiContentIdeas([]);
    try {
      const prompt = `Para un proyecto de grabación de paisajes sonoros titulado "${project.name}", que se desarrolla en "${project.location}" y cuyo tema es "${project.theme}", sugiere 3 ideas creativas y específicas para grabaciones de sonido. Considera aspectos únicos que se podrían capturar. Formatea la respuesta como un array JSON de strings. Ejemplo: ["El eco dentro del viejo molino abandonado al amanecer", "Los sonidos de la fauna nocturna cerca del arroyo escondido", "La atmósfera del mercado local durante la hora pico"]`;
      const ideas = await generateJson<string[]>(prompt);
      if (ideas) {
        setAiContentIdeas(ideas);
      }
    } catch (error) {
      console.error("Error fetching AI content ideas:", error);
      alert(`Error al generar ideas con IA: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingAiIdeas(false);
    }
  };

  const hasCoordinates = project.technicalSheet.latitude !== undefined && project.technicalSheet.longitude !== undefined;

  return (
    <div className="pb-20"> {/* Added padding for FAB */}
      <PageHeader 
        title={project.name} 
        showBackButton 
        actions={
            <Button onClick={() => navigate(`/edit-project/${project.id}`)} variant="ghost" size="sm" aria-label="Editar proyecto">
                <PencilIcon className="w-5 h-5 text-brand-primary"/>
            </Button>
        }
      />
      
      <div className="p-4 space-y-4">
        <div className="bg-brand-dark-card dark:bg-slate-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-brand-primary mb-2">{project.name}</h2>
          <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Ubicación:</span> {project.location}</p>
          <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Tema:</span> {project.theme}</p>
          <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Fecha:</span> {new Date(project.date).toLocaleDateString()}</p>
          {project.notes && <p className="mt-2 text-sm text-brand-text-light whitespace-pre-wrap">{project.notes}</p>}
        </div>

        <div className="bg-brand-dark-card dark:bg-slate-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-brand-text-light mb-2">Ficha Técnica</h3>
          <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Micrófono:</span> {project.technicalSheet.microphone || 'N/D'}</p>
          <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Grabadora:</span> {project.technicalSheet.recorder || 'N/D'}</p>
          <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Configuración:</span> {project.technicalSheet.settings || 'N/D'}</p>
          {project.technicalSheet.latitude !== undefined && (
            <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Latitud:</span> {project.technicalSheet.latitude}</p>
          )}
          {project.technicalSheet.longitude !== undefined && (
            <p className="text-sm text-brand-text-dim"><span className="font-medium text-brand-text-light">Longitud:</span> {project.technicalSheet.longitude}</p>
          )}
        </div>

        {/* AI Content Ideas Section */}
        {aiFeaturesEnabled && (
            <div className="bg-brand-dark-card dark:bg-slate-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-brand-text-light">Ideas de Grabación (AI)</h3>
                    <Button onClick={fetchAiContentIdeas} variant="secondary" size="sm" disabled={isLoadingAiIdeas}>
                        <SparklesIcon className="w-4 h-4 mr-1 inline"/> {isLoadingAiIdeas ? "Generando..." : "Nuevas Ideas"}
                    </Button>
                </div>
                {isLoadingAiIdeas && <p className="text-brand-text-dim text-sm">Buscando inspiración...</p>}
                {aiContentIdeas.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-text-light">
                        {aiContentIdeas.map((idea, index) => <li key={index}>{idea}</li>)}
                    </ul>
                )}
                {!isLoadingAiIdeas && aiContentIdeas.length === 0 && <p className="text-brand-text-dim text-sm">Haz clic en "Nuevas Ideas" para obtener sugerencias de la IA.</p>}
            </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-brand-text-light">Grabaciones ({projectRecordings.length})</h3>
            <Button onClick={() => navigate(`/project/${projectId}/new-recording`)} variant="secondary" size="sm">
              <PlusIcon className="w-4 h-4 mr-1 inline"/> Añadir Grabación
            </Button>
          </div>
          {projectRecordings.length === 0 ? (
            <p className="text-brand-text-dim text-center py-4">Aún no hay grabaciones para este proyecto.</p>
          ) : (
            <div className="space-y-3">
              {projectRecordings.map(rec => (
                <RecordingListItem 
                  key={rec.id} 
                  recording={rec} 
                  onEdit={() => navigate(`/project/${projectId}/edit-recording/${rec.id}`)}
                  onDelete={() => handleDeleteRecording(rec.id)}
                  onUpdateVoiceNote={(vn) => handleUpdateVoiceNoteInRecording(rec.id, vn)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-col space-y-2">
            <Button 
                onClick={() => navigate('/map', { state: { projectId: project.id } })} 
                variant="secondary" 
                className="w-full flex items-center justify-center"
                disabled={!hasCoordinates}
                aria-label={hasCoordinates ? "Ver proyecto en mapa" : "Ver proyecto en mapa (coordenadas no disponibles)"}
            >
                <MapIcon className="w-5 h-5 mr-2"/> Ver Proyecto en Mapa
            </Button>
            {!hasCoordinates && <p className="text-xs text-center text-brand-text-dim">Añade coordenadas al proyecto para verlo en el mapa.</p>}
             <Button onClick={handleDeleteProject} variant="danger" size="sm" className="w-full mt-4">
                Eliminar Proyecto
            </Button>
        </div>
      </div>
       <Button 
        onClick={() => navigate(`/project/${projectId}/new-recording`)}
        className="fixed bottom-20 right-4 bg-brand-primary hover:bg-brand-primary-hover text-white p-4 rounded-full shadow-xl z-20"
        aria-label="Añadir nueva grabación"
      >
        <MicrophoneIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default ProjectDetailScreen;