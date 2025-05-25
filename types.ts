export interface TechnicalSheet {
  microphone: string;
  recorder: string;
  settings: string;
  latitude?: number;
  longitude?: number;
}

export interface Photo {
  id: string;
  url: string; // Will store base64 data URL for captured photos, or remote URL for placeholders
  caption: string;
}

export interface VoiceNote {
  id: string;
  title: string;
  audioBase64?: string; // Base64 encoded audio data
  audioType?: string;   // e.g., 'audio/webm' or 'audio/mp4'
  duration?: number;    // in seconds
  transcription?: string; // AI-generated transcription or summary
  placeholder?: string; // Original placeholder, can be phased out
}

export interface Recording {
  id: string;
  projectId: string;
  title: string;
  description: string;
  location: string;
  tags: string[];
  timestamp: string; // ISO date string
  photos: Photo[];
  voiceNotes: VoiceNote[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  theme: string;
  date: string; // ISO date string
  notes: string;
  technicalSheet: TechnicalSheet;
}

export interface Reminder {
  id:string;
  text: string;
  time: string; // e.g., "10:00 AM"
  date: string; // ISO date string
}

export enum ActiveRecordingFormTab {
  METADATA = 'metadata',
  MEDIA = 'media',
}

export type CameraAccessStatus = 'idle' | 'pending' | 'granted' | 'denied';
export type MicrophoneAccessStatus = 'idle' | 'pending' | 'granted' | 'denied';

export interface AISuggestion<T> {
  id: string;
  value: T;
  isLoading?: boolean;
  error?: string;
}