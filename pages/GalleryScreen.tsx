
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Photo, VoiceNote, Project, Recording } from '../types';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ImageModal from '../components/ImageModal'; 
import { MusicalNoteIcon, CameraIcon, SparklesIcon } from '../constants';

// Enhanced MediaItem structure
type EnhancedPhotoItem = Photo & { type: 'photo'; recordingId: string; projectId: string; recordingTitle: string; project?: Project; };
type EnhancedAudioItem = VoiceNote & { type: 'audio'; recordingId: string; projectId: string; recordingTitle: string; project?: Project; };
type MediaItem = EnhancedPhotoItem | EnhancedAudioItem;

// Modal data structure
interface ModalItem {
  photo: Photo;
  recording?: Recording;
  project?: Project;
}

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const GalleryScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [filter, setFilter] = useState<'all' | 'photos' | 'audio'>('all');
  // State for the new immersive modal
  const [selectedItemForModal, setSelectedItemForModal] = useState<ModalItem | null>(null);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const allMediaItems = useMemo((): MediaItem[] => {
    if (!context) return [];
    const { projects, recordings } = context;
    let items: MediaItem[] = [];

    recordings.forEach(rec => {
      const project = projects.find(p => p.id === rec.projectId);
      rec.photos.forEach(photo => {
        items.push({ 
            ...photo, 
            type: 'photo', 
            recordingId: rec.id, 
            projectId: rec.projectId, 
            recordingTitle: rec.title, 
            project 
        });
      });
      rec.voiceNotes.forEach(vn => {
        items.push({ 
            ...vn, 
            type: 'audio', 
            recordingId: rec.id, 
            projectId: rec.projectId, 
            recordingTitle: rec.title, 
            project 
        });
      });
    });
    return items.sort((a, b) => (b.id.split('_')[1] || 0) > (a.id.split('_')[1] || 0) ? 1 : -1);
  }, [context]);

  const filteredMediaItems = useMemo(() => {
    if (filter === 'all') return allMediaItems;
    return allMediaItems.filter(item => item.type === filter);
  }, [allMediaItems, filter]);

  const handleOpenModal = (photoItem: EnhancedPhotoItem) => {
    if (!context) return;
    const recording = context.recordings.find(r => r.id === photoItem.recordingId);
    const project = context.projects.find(p => p.id === photoItem.projectId);
    setSelectedItemForModal({ photo: photoItem, recording, project });
  };

  const handlePlayVoiceNote = (voiceNote: VoiceNote) => {
    if (voiceNote.audioBase64) {
      const audioSrc = voiceNote.audioBase64;
      if (audioRef.current) {
        if (playingVoiceNoteId === voiceNote.id) {
          audioRef.current.pause();
          setPlayingVoiceNoteId(null);
        } else {
          audioRef.current.src = audioSrc;
          audioRef.current.play().then(() => setPlayingVoiceNoteId(voiceNote.id)).catch(e => console.error("Error playing audio:", e));
        }
      }
    }
  };
  
   useEffect(() => {
    const currentAudio = audioRef.current;
    const handleAudioEnd = () => setPlayingVoiceNoteId(null);
    if (currentAudio) {
      currentAudio.addEventListener('ended', handleAudioEnd);
    }
    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, [playingVoiceNoteId]);

  if (!context) {
    return (
      <>
        <PageHeader title="Galería Multimedia" />
        <p className="p-4 text-center text-brand-text-dim">Cargando...</p>
      </>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader title="Galería Multimedia" />
      <div className="p-4">
        <div className="flex space-x-2 mb-6 sticky top-[65px] bg-brand-dark-bg py-2 z-10">
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>Todo</Button>
          <Button variant={filter === 'photos' ? 'primary' : 'secondary'} onClick={() => setFilter('photos')}>Fotos</Button>
          <Button variant={filter === 'audio' ? 'primary' : 'secondary'} onClick={() => setFilter('audio')}>Audio</Button>
        </div>

        {filteredMediaItems.length === 0 && (
          <p className="text-center text-brand-text-dim">No hay {filter !== 'all' ? (filter === 'photos' ? 'fotos' : 'notas de voz') : 'elementos multimedia'} para mostrar.</p>
        )}

        <div className="space-y-6">
          { (filter === 'all' || filter === 'photos') && 
            (filteredMediaItems.filter(item => item.type === 'photo') as EnhancedPhotoItem[]).length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-brand-text-light mb-3 flex items-center"><CameraIcon className="w-6 h-6 mr-2 text-brand-primary"/> Fotos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredMediaItems.filter(item => item.type === 'photo').map(item => {
                  const photoItem = item as EnhancedPhotoItem;
                  return (
                    <div 
                      key={photoItem.id} 
                      className="aspect-square bg-brand-dark-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                      onClick={() => handleOpenModal(photoItem)}
                      role="button"
                      aria-label={`Ver foto: ${photoItem.caption}`}
                    >
                      <img 
                        src={photoItem.url} 
                        alt={photoItem.caption} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          { (filter === 'all' || filter === 'audio') && 
             (filteredMediaItems.filter(item => item.type === 'audio') as EnhancedAudioItem[]).length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-brand-text-light mb-3 flex items-center"><MusicalNoteIcon className="w-6 h-6 mr-2 text-brand-primary"/> Notas de Voz</h2>
              <div className="space-y-3">
                {filteredMediaItems.filter(item => item.type === 'audio').map(item => {
                  const audioItem = item as EnhancedAudioItem;
                  return (
                    <div key={audioItem.id} className="bg-brand-dark-card p-3 rounded-lg shadow">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-medium text-brand-text-light">{audioItem.title}</h3>
                        {audioItem.audioBase64 && (
                            <Button onClick={() => handlePlayVoiceNote(audioItem)} variant="ghost" size="sm" className="p-1">
                                {playingVoiceNoteId === audioItem.id ? "❚❚" : "►"} <span className="sr-only">Reproducir/Pausar</span>
                            </Button>
                        )}
                      </div>
                      <p className="text-xs text-brand-text-dim">
                        En: "{audioItem.recordingTitle}" {audioItem.project ? `(Proyecto: ${audioItem.project.name})` : ''}
                      </p>
                      {audioItem.duration !== undefined && <p className="text-xs text-brand-text-dim">Duración: {formatDuration(audioItem.duration)}</p>}
                      {audioItem.transcription && (
                        <p className="mt-1 text-xs italic text-brand-text-dim border-l-2 border-brand-primary/50 pl-1.5">
                            <SparklesIcon className="w-3 h-3 mr-0.5 inline-block opacity-70"/> AI: {audioItem.transcription}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
      {selectedItemForModal && (
        <ImageModal 
          item={selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)} 
        />
      )}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default GalleryScreen;
