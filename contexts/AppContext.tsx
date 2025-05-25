
import React, { createContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Project, Recording, Reminder } from '../types';

interface AppContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  hasVisitedWelcome: boolean;
  markWelcomeAsVisited: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addRecording: (recording: Recording) => void;
  updateRecording: (recording: Recording) => void;
  deleteRecording: (recordingId: string) => void;
  getRecordingsForProject: (projectId: string) => Recording[];
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('soundscape_projects', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('soundscape_recordings', []);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('soundscape_reminders', [
    { id: '1', text: 'Volver al bosque', time: '10:00 AM', date: new Date().toISOString().split('T')[0] },
    { id: '2', text: 'Revisitar el parque de la ciudad', time: '2:00 PM', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  ]);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('soundscape_darkMode', true);
  const [hasVisitedWelcome, setHasVisitedWelcome] = useLocalStorage<boolean>('soundxcape_hasVisitedWelcome', false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const markWelcomeAsVisited = () => setHasVisitedWelcome(true);

  const addProject = (project: Project) => setProjects(prev => [...prev, project]);
  const updateProject = (updatedProject: Project) => setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setRecordings(prev => prev.filter(r => r.projectId !== projectId)); // Also delete associated recordings
  }

  const addRecording = (recording: Recording) => setRecordings(prev => [...prev, recording]);
  const updateRecording = (updatedRecording: Recording) => setRecordings(prev => prev.map(r => r.id === updatedRecording.id ? updatedRecording : r));
  const deleteRecording = (recordingId: string) => setRecordings(prev => prev.filter(r => r.id !== recordingId));
  
  const getRecordingsForProject = (projectId: string) => recordings.filter(r => r.projectId === projectId);

  return (
    <AppContext.Provider value={{ 
      projects, setProjects, 
      recordings, setRecordings, 
      reminders, setReminders,
      darkMode, toggleDarkMode,
      hasVisitedWelcome, markWelcomeAsVisited,
      addProject, updateProject, deleteProject,
      addRecording, updateRecording, deleteRecording,
      getRecordingsForProject
    }}>
      {children}
    </AppContext.Provider>
  );
};