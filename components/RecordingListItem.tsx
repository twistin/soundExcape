import React, { useState, useEffect } from 'react';
import { Recording, VoiceNote } from '../types';
import { MusicalNoteIcon, CameraIcon, TrashIcon, PencilIcon, SparklesIcon } from '../constants'; // Added icons
import Button from './Button'; // Assuming Button component is available
import { isAIAvailable, generateText } from '../services/geminiService'; // For potential future AI actions here

// Helper to format duration (can be moved to a utils file)
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

interface RecordingListItemProps {
  recording: Recording;
  onEdit: () => void;
  onDelete: () => void;
  // For potential AI summary directly from list item if needed
  onUpdateVoiceNote?: (updatedVoiceNote: VoiceNote) => void; 
}

const RecordingListItem: React.FC<RecordingListItemProps> = ({ recording, onEdit, onDelete, onUpdateVoiceNote }) => {
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayVoiceNote = (voiceNote: VoiceNote) => {
    if (voiceNote.audioBase64 && voiceNote.audioType) {
      if (playingVoiceNoteId === voiceNote.id && audioRef.current) {
        audioRef.current.pause();
        setPlayingVoiceNoteId(null);
      } else {
        const audioSrc = voiceNote.audioBase64; // data URL
        if (audioRef.current) {
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


  return (
    <div className="bg-brand-dark-card dark:bg-slate-700 p-3 rounded-lg mb-3 shadow-md transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-brand-text-light dark:text-gray-100 text-lg">{recording.title}</h4>
          <p className="text-xs text-brand-text-dim dark:text-gray-400 mb-1">{new Date(recording.timestamp).toLocaleString()}</p>
          {recording.description && <p className="text-sm text-brand-text-dim dark:text-gray-300 mb-2 text-ellipsis line-clamp-2">{recording.description}</p>}
        </div>
        <div className="flex space-x-1">
          <Button onClick={onEdit} variant="ghost" size="sm" className="p-1" aria-label="Editar grabación">
            <PencilIcon className="w-4 h-4 text-brand-primary" />
          </Button>
          <Button onClick={onDelete} variant="ghost" size="sm" className="p-1" aria-label="Eliminar grabación">
            <TrashIcon className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {recording.tags && recording.tags.length > 0 && (
         <div className="mt-1 mb-2 flex flex-wrap gap-1">
            {recording.tags.map(tag => (
                <span key={tag} className="text-xs bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
         </div>
      )}
      
      <div className="mt-2 space-y-2">
        {recording.photos.length > 0 && (
          <div className="flex items-center text-xs text-brand-text-dim dark:text-gray-400">
            <CameraIcon className="w-3.5 h-3.5 mr-1.5 text-brand-secondary" /> {recording.photos.length} foto{recording.photos.length > 1 ? 's' : ''}
             {/* Optional: Show tiny thumbnails
             <div className="flex gap-1 ml-2">
                {recording.photos.slice(0,3).map(p => <img key={p.id} src={p.url} alt="thumbnail" className="w-6 h-6 object-cover rounded"/>)}
             </div>
            */}
          </div>
        )}
        {recording.voiceNotes.map(vn => (
          <div key={vn.id} className="text-xs text-brand-text-dim dark:text-gray-400 bg-brand-dark-bg/50 p-2 rounded">
            <div className="flex items-center justify-between">
                <span className="flex items-center font-medium text-brand-text-light/90">
                    <MusicalNoteIcon className="w-3.5 h-3.5 mr-1.5 text-brand-secondary" /> 
                    {vn.title} {vn.duration ? `(${formatDuration(vn.duration)})` : ''}
                </span>
                {vn.audioBase64 && (
                    <Button onClick={() => handlePlayVoiceNote(vn)} variant="ghost" size="sm" className="p-0.5">
                        {playingVoiceNoteId === vn.id ? "❚❚" : "►"}
                    </Button>
                )}
            </div>
            {vn.transcription && (
                <p className="mt-1 italic text-brand-text-dim text-[11px] border-l-2 border-brand-primary/50 pl-1.5">
                    <SparklesIcon className="w-3 h-3 mr-0.5 inline-block opacity-70"/> AI: {vn.transcription.length > 100 ? vn.transcription.substring(0,97) + "..." : vn.transcription}
                </p>
            )}
          </div>
        ))}
        {/* Hidden audio element for playback */}
        <audio ref={audioRef} className="hidden" onEnded={() => setPlayingVoiceNoteId(null)} />
      </div>
    </div>
  );
};

export default RecordingListItem;
