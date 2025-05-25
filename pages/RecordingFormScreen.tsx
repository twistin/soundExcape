
import React, { useState, useContext, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Recording, Photo, VoiceNote, ActiveRecordingFormTab, CameraAccessStatus, MicrophoneAccessStatus } from '../types';
import FormField from '../components/FormField';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { PlusIcon, CameraIcon, MusicalNoteIcon, ICON_SIZE, TrashIcon, SparklesIcon, MicrophoneIcon, ArrowUpTrayIcon } from '../constants';
import { generateJson, generateText, isAIAvailable } from '../services/geminiService';

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const RecordingFormScreen: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, recordingId } = useParams<{ projectId: string; recordingId?: string }>();
  const context = useContext(AppContext);

  const isEditing = Boolean(recordingId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveRecordingFormTab>(ActiveRecordingFormTab.METADATA);

  // Media capture states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraAccess, setCameraAccess] = useState<CameraAccessStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null); // Ref for photo file input

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [microphoneAccess, setMicrophoneAccess] = useState<MicrophoneAccessStatus>('idle');
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);
  const [newVoiceNoteTitle, setNewVoiceNoteTitle] = useState('');
  
  // Audio Upload States
  const [uploadedVoiceNoteTitle, setUploadedVoiceNoteTitle] = useState('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [aiTagSuggestions, setAiTagSuggestions] = useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [transcribingNoteId, setTranscribingNoteId] = useState<string | null>(null);


  useEffect(() => {
    setAiFeaturesEnabled(isAIAvailable());
    if (!projectId) {
        navigate('/'); 
        return;
    }
    if (isEditing && recordingId && context) {
      const existingRecording = context.recordings.find(r => r.id === recordingId && r.projectId === projectId);
      if (existingRecording) {
        setTitle(existingRecording.title);
        setDescription(existingRecording.description);
        setLocation(existingRecording.location);
        setTags(existingRecording.tags);
        setTimestamp(existingRecording.timestamp);
        setPhotos(existingRecording.photos);
        setVoiceNotes(existingRecording.voiceNotes);
      } else {
        navigate(`/project/${projectId}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, recordingId, isEditing, context?.recordings, navigate]);

  if (!context) return <p>Cargando contexto...</p>;
  const { addRecording, updateRecording } = context;

  // Tag Management
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

  // Photo Capture
  const requestCameraAccess = async () => {
    setCameraAccess('pending');
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraAccess('granted');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
      setCameraAccess('denied');
    }
  };

  const openCameraModal = () => {
    setShowCameraModal(true);
    requestCameraAccess();
  };

  const closeCameraModal = () => {
    setShowCameraModal(false);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraAccess('idle');
    setCameraError(null);
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraAccess === 'granted') {
      setIsCapturingPhoto(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        const newPhoto: Photo = { 
            id: `photo_${Date.now()}`, 
            url: dataUrl, 
            caption: `Foto capturada ${photos.length + 1}` 
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
      setIsCapturingPhoto(false);
      closeCameraModal();
    }
  };
  const handleRemovePhoto = (photoId: string) => setPhotos(photos.filter(p => p.id !== photoId));

  const handlePhotoFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Optional: Add loading state for photo upload if needed
    // setIsUploadingPhoto(true); 

    try {
      const photoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const newPhoto: Photo = {
        id: `photo_upload_${Date.now()}`,
        url: photoBase64,
        caption: file.name || `Foto subida ${photos.length + 1}`,
      };
      setPhotos(prev => [...prev, newPhoto]);
      
    } catch (error) {
      console.error("Error processing uploaded photo file:", error);
      alert(`Error al subir la foto: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      // setIsUploadingPhoto(false);
      if (photoFileInputRef.current) { // Reset file input
        photoFileInputRef.current.value = '';
      }
    }
  };


  // Audio Recording
  const requestMicrophoneAccess = async () => {
    setMicrophoneAccess('pending');
    setMicrophoneError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneAccess('granted');
      return stream;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMicrophoneError("No se pudo acceder al micrófono. Verifica los permisos.");
      setMicrophoneAccess('denied');
      return null;
    }
  };

  const startRecordingAudio = async () => {
    if (!newVoiceNoteTitle.trim()) {
        alert("Por favor, ingresa un título para la nota de voz.");
        return;
    }
    const stream = await requestMicrophoneAccess();
    if (stream && microphoneAccess !== 'denied') {
      const recorder = new MediaRecorder(stream);
      setAudioRecorder(recorder);
      recorder.ondataavailable = (event) => setAudioChunks(prev => [...prev, event.data]);
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop()); 
        const audioBlob = new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Audio = reader.result as string;
            const newVoiceNote: VoiceNote = {
                id: `vn_${Date.now()}`,
                title: newVoiceNoteTitle.trim() || `Nota de Voz ${voiceNotes.length + 1}`,
                audioBase64: base64Audio,
                audioType: audioBlob.type,
                duration: recordingDuration,
            };
            setVoiceNotes(prev => [...prev, newVoiceNote]);
            setNewVoiceNoteTitle(''); 
        };
        reader.readAsDataURL(audioBlob);
        setAudioChunks([]);
      };
      recorder.start();
      setIsRecordingAudio(true);
      setRecordingDuration(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecordingAudio = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };
  const handleRemoveVoiceNote = (vnId: string) => setVoiceNotes(voiceNotes.filter(vn => vn.id !== vnId));

  const handleAudioFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!uploadedVoiceNoteTitle.trim()) {
      setUploadError("Por favor, ingresa un título para la nota de voz subida.");
      event.target.value = ''; 
      return;
    }

    setIsUploadingAudio(true);
    setUploadError(null); 

    try {
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const audioType = file.type;
      
      const durationResult = await new Promise<{ duration: number; error?: string }>((resolve) => {
        const audioElement = document.createElement('audio');
        audioElement.onloadedmetadata = () => resolve({ duration: audioElement.duration });
        audioElement.onerror = (errorEvent) => {
            let technicalErrorMessage = "Unknown error loading audio metadata.";
            const mediaError = audioElement.error;
            if (mediaError) {
                switch (mediaError.code) {
                    case MediaError.MEDIA_ERR_ABORTED: technicalErrorMessage = "The fetching process for the media was aborted by the user."; break;
                    case MediaError.MEDIA_ERR_NETWORK: technicalErrorMessage = "A network error occurred while fetching the media."; break;
                    case MediaError.MEDIA_ERR_DECODE: technicalErrorMessage = "An error occurred while decoding the media. The format might be corrupted or unsupported."; break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: technicalErrorMessage = "The media source is not supported by this browser or the format is invalid."; break;
                    default: technicalErrorMessage = `An unknown media error occurred (code: ${mediaError.code}).`;
                }
            } else if (typeof errorEvent === 'string') {
                technicalErrorMessage = errorEvent;
            } else if (errorEvent instanceof Event && errorEvent.type) {
                technicalErrorMessage = `Media loading failed with event type: ${errorEvent.type}.`;
            }
            
            const consoleMsg = `Error loading audio metadata for duration: ${technicalErrorMessage}${mediaError ? ` (MediaError code: ${mediaError.code}, message: "${mediaError.message}")` : ''}`;
            console.error(consoleMsg);
            
            let userFacingError: string | undefined;
            if (mediaError && mediaError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                 userFacingError = `El formato de este archivo de audio ("${file.name}") podría no ser totalmente compatible con tu navegador. La duración podría ser incorrecta y la reproducción podría no funcionar como se espera. Detalles: ${technicalErrorMessage}`;
            }
            resolve({ duration: 0, error: userFacingError });
        };
        audioElement.src = audioBase64;
      });

      const { duration, error: durationError } = durationResult;
      if (durationError) {
          setUploadError(durationError); 
      }

      const newVoiceNote: VoiceNote = {
        id: `vn_upload_${Date.now()}`,
        title: uploadedVoiceNoteTitle.trim(),
        audioBase64,
        audioType,
        duration,
      };
      setVoiceNotes(prev => [...prev, newVoiceNote]);
      setUploadedVoiceNoteTitle(''); 
      event.target.value = ''; 
    } catch (error) {
      console.error("Error processing uploaded audio file (general):", error instanceof Error ? error.message : String(error));
      setUploadError(`Error al procesar el archivo: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setIsUploadingAudio(false);
    }
  };


  // AI Features
  const handleSuggestTags = async () => {
    if (!aiFeaturesEnabled) {
      alert("Las funciones de IA no están disponibles. Verifica la configuración de la API Key de Gemini.");
      return;
    }
    setIsSuggestingTags(true);
    setAiTagSuggestions([]);
    try {
      const prompt = `Basado en el título de la grabación de sonido "${title}" y su descripción "${description}", sugiere hasta 5 etiquetas relevantes. La grabación es parte de un proyecto de paisajes sonoros. Prioriza etiquetas concisas y descriptivas. Devuelve un array JSON de strings. Ejemplo: ["naturaleza", "ambiente", "urbano"]`;
      const suggestions = await generateJson<string[]>(prompt);
      if (suggestions) {
        setAiTagSuggestions(suggestions.filter(s => s.trim() !== ""));
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
      alert(`Error al sugerir etiquetas: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
        setTags(prev => [...prev, tag]);
    }
    setAiTagSuggestions(prev => prev.filter(s => s !== tag));
  };

  const handleAiTranscribe = async (voiceNote: VoiceNote) => {
    if (!aiFeaturesEnabled) {
      alert("Las funciones de IA no están disponibles. Verifica la configuración de la API Key de Gemini.");
      return;
    }
    setTranscribingNoteId(voiceNote.id);
    try {
      const prompt = `Para una nota de voz titulada "${voiceNote.title}" con una duración de ${formatDuration(voiceNote.duration || 0)}, dentro de un proyecto de paisajes sonoros:
      1. Proporciona una breve transcripción imaginada o un resumen conciso de lo que podría tratar.
      2. Si la nota es muy corta (ej. menos de 5 segundos), podría ser un sonido específico en lugar de una narración.
      Mantén la respuesta breve y relevante al contexto de una nota de voz para un proyecto de sonido.`;
      const transcription = await generateText(prompt);
      if (transcription) {
        setVoiceNotes(prev => prev.map(vn => vn.id === voiceNote.id ? {...vn, transcription: transcription.trim()} : vn));
      }
    } catch (error) {
       console.error("Error transcribing/summarizing voice note:", error);
       alert(`Error al procesar nota de voz: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setTranscribingNoteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) {
        alert("Por favor, completa el título.");
        return;
    }
    const recordingData: Recording = {
      id: recordingId || `rec_${Date.now()}`,
      projectId,
      title,
      description,
      location,
      tags,
      timestamp,
      photos,
      voiceNotes,
    };
    if (isEditing) updateRecording(recordingData);
    else addRecording(recordingData);
    navigate(`/project/${projectId}`);
  };

  const TabButton: React.FC<{tab: ActiveRecordingFormTab, label: string}> = ({tab, label}) => (
    <Button variant={activeTab === tab ? 'primary' : 'secondary'} onClick={() => setActiveTab(tab)} className="flex-1">
        {label}
    </Button>
  );

  return (
    <div>
      <PageHeader title={isEditing ? "Editar Grabación" : "Nueva Grabación"} showBackButton backPath={projectId ? `/project/${projectId}` : '/'} />
      
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex space-x-2 mb-6">
            <TabButton tab={ActiveRecordingFormTab.METADATA} label="Metadatos" />
            <TabButton tab={ActiveRecordingFormTab.MEDIA} label="Multimedia" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          {activeTab === ActiveRecordingFormTab.METADATA && (
            <>
              <FormField id="title" label="Título" value={title} onChange={e => setTitle(e.target.value)} required />
              <FormField id="description" label="Descripción" type="textarea" value={description} onChange={e => setDescription(e.target.value)} />
              <FormField id="location" label="Ubicación Específica (opcional)" value={location} onChange={e => setLocation(e.target.value)} placeholder="ej., Bajo el viejo roble" />
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-brand-text-dim mb-1">Etiquetas</label>
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Añadir una etiqueta"
                    className="flex-grow p-3 bg-brand-dark-card border border-brand-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-brand-text-light"
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                  />
                  <Button type="button" onClick={handleAddTag} variant="secondary" size="md">Añadir</Button>
                </div>
                {aiFeaturesEnabled && (
                    <Button type="button" onClick={handleSuggestTags} variant="ghost" size="sm" className="mb-2 text-sm" disabled={isSuggestingTags || !title.trim()}>
                        <SparklesIcon className="w-4 h-4 mr-1 inline"/> {isSuggestingTags ? "Sugiriendo..." : "Sugerir Etiquetas (AI)"}
                    </Button>
                )}
                {aiTagSuggestions.length > 0 && (
                    <div className="mb-2 p-2 border border-brand-dark-border rounded-md bg-brand-dark-bg">
                        <p className="text-xs text-brand-text-dim mb-1">Sugerencias AI:</p>
                        <div className="flex flex-wrap gap-1">
                        {aiTagSuggestions.map(tag => (
                            <button type="button" key={tag} onClick={() => handleAddSuggestedTag(tag)} className="text-xs bg-brand-primary/30 text-brand-primary px-1.5 py-0.5 rounded-full hover:bg-brand-primary/50">
                            {tag} +
                            </button>
                        ))}
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="bg-brand-primary text-white px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-xs text-blue-200 hover:text-white">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
              <FormField id="timestamp" label="Hora de Grabación" type="datetime-local" 
                value={timestamp.substring(0,16)} 
                onChange={e => setTimestamp(new Date(e.target.value).toISOString())} 
              />
            </>
          )}

          {activeTab === ActiveRecordingFormTab.MEDIA && (
            <>
              {/* Photos Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-brand-text-light">Fotos</h3>
                    <div className="flex space-x-2">
                        <Button type="button" onClick={openCameraModal} variant="secondary" size="sm">
                            <CameraIcon className={`${ICON_SIZE} mr-1 inline-block`} /> Añadir Foto (Cámara)
                        </Button>
                        <Button type="button" onClick={() => photoFileInputRef.current?.click()} variant="secondary" size="sm">
                            <ArrowUpTrayIcon className={`${ICON_SIZE} mr-1 inline-block`} /> Subir Foto (Equipo)
                        </Button>
                        <input 
                            type="file" 
                            ref={photoFileInputRef} 
                            accept="image/*" 
                            onChange={handlePhotoFileUpload} 
                            className="hidden"
                            aria-label="Subir foto desde el equipo"
                        />
                    </div>
                </div>
                {cameraError && <p className="text-red-400 text-sm">{cameraError}</p>}
                {photos.length === 0 && <p className="text-brand-text-dim">Aún no se han añadido fotos.</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative group">
                            <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg shadow"/>
                            <Button type="button" onClick={() => handleRemovePhoto(photo.id)} variant="danger" size="sm" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-xs">
                                <TrashIcon className="w-3 h-3"/>
                            </Button>
                        </div>
                    ))}
                </div>
              </div>

              {/* Voice Notes Section */}
              <div className="space-y-3 pt-4 mt-4 border-t border-brand-dark-border">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-brand-text-light">Notas de Voz</h3>
                </div>
                {microphoneError && <p className="text-red-400 text-sm mb-2">{microphoneError}</p>}
                
                <div className="bg-brand-dark-card p-3 rounded-lg space-y-2">
                    <FormField id="newVoiceNoteTitle" label="Título para Nueva Nota de Voz" value={newVoiceNoteTitle} onChange={(e) => setNewVoiceNoteTitle(e.target.value)} placeholder="Ej: Ambiente matutino"/>
                    {!isRecordingAudio ? (
                        <Button type="button" onClick={startRecordingAudio} variant="secondary" size="sm" disabled={microphoneAccess === 'pending' || !newVoiceNoteTitle.trim()} className="w-full">
                            <MicrophoneIcon className={`${ICON_SIZE} mr-1 inline-block`} /> {microphoneAccess === 'pending' ? 'Accediendo Mic...' : 'Comenzar Grabación'}
                        </Button>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Button type="button" onClick={stopRecordingAudio} variant="danger" size="sm" className="flex-1">
                                Detener ({formatDuration(recordingDuration)})
                            </Button>
                            <div className="text-sm text-red-400 animate-pulse">Grabando...</div>
                        </div>
                    )}
                </div>

                <div className="bg-brand-dark-card p-3 rounded-lg space-y-2 mt-4">
                    <h4 className="text-md font-semibold text-brand-text-light flex items-center">
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-brand-secondary" /> Subir Nota de Voz Existente
                    </h4>
                    <FormField 
                        id="uploadedVoiceNoteTitle" 
                        label="Título para Nota de Voz Subida" 
                        value={uploadedVoiceNoteTitle} 
                        onChange={(e) => setUploadedVoiceNoteTitle(e.target.value)}
                        placeholder="Ej: Sonido del viento (archivo)"
                    />
                    <div>
                        <label htmlFor="audioFileUpload" className="sr-only">Seleccionar archivo de audio</label>
                        <input 
                            type="file" 
                            id="audioFileUpload"
                            accept="audio/*" 
                            onChange={handleAudioFileUpload}
                            className="block w-full text-sm text-brand-text-dim file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30 cursor-pointer"
                            aria-label="Seleccionar archivo de audio para subir"
                            disabled={isUploadingAudio}
                        />
                    </div>
                     {uploadError && <p className={`text-xs mt-1 ${uploadError.toLowerCase().includes("compatible") ? 'text-yellow-400' : 'text-red-400'}`}>{uploadError}</p>}
                    {isUploadingAudio && <p className="text-brand-text-dim text-xs mt-1">Procesando archivo, por favor espera...</p>}
                </div>

                {(voiceNotes.length === 0 && !isRecordingAudio && !isUploadingAudio) && <p className="text-brand-text-dim mt-2">Aún no se han añadido notas de voz.</p>}
                {voiceNotes.map(vn => (
                    <div key={vn.id} className="bg-brand-dark-card dark:bg-slate-700 p-3 rounded-md shadow">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-brand-text-light font-medium">{vn.title} {vn.duration && <span className="text-xs text-brand-text-dim">({formatDuration(vn.duration)})</span>}</p>
                            <Button type="button" onClick={() => handleRemoveVoiceNote(vn.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 p-0"><TrashIcon className="w-4 h-4"/></Button>
                        </div>
                        {vn.audioBase64 && vn.audioType && (
                            <audio controls src={vn.audioBase64} className="w-full h-10 my-1">
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        )}
                        {vn.transcription && <p className="text-xs italic text-brand-text-dim my-1 p-1 bg-brand-dark-bg rounded">AI: {vn.transcription}</p>}
                        {aiFeaturesEnabled && !vn.transcription && vn.audioBase64 && ( 
                             <Button 
                                type="button" 
                                onClick={() => handleAiTranscribe(vn)} 
                                variant="ghost" size="sm" 
                                className="text-xs mt-1"
                                disabled={transcribingNoteId === vn.id}
                            >
                                <SparklesIcon className="w-3 h-3 mr-1 inline"/> {transcribingNoteId === vn.id ? "Procesando..." : "Resumir (AI)"}
                            </Button>
                        )}
                        {!vn.audioBase64 && vn.placeholder && <p className="text-xs text-brand-text-dim">{vn.placeholder}</p>}
                    </div>
                ))}
              </div>
            </>
          )}
          
          <Button type="submit" variant="primary" size="lg" className="w-full mt-8">
            {isEditing ? "Guardar Cambios" : "Crear Grabación"}
          </Button>
        </form>
      </div>

      {showCameraModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-dark-card p-4 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-3 text-brand-text-light">Capturar Foto</h3>
            {cameraAccess === 'pending' && <p className="text-brand-text-dim">Solicitando acceso a la cámara...</p>}
            {cameraAccess === 'denied' && <p className="text-red-400">{cameraError || "Acceso a cámara denegado."}</p>}
            {cameraAccess === 'granted' && (
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[60vh] rounded bg-black mb-3"></video>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="flex justify-end space-x-2">
              <Button onClick={closeCameraModal} variant="secondary">Cancelar</Button>
              <Button onClick={handleCapturePhoto} disabled={cameraAccess !== 'granted' || isCapturingPhoto}>
                {isCapturingPhoto ? "Capturando..." : "Tomar Foto"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingFormScreen;
