
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { MapIcon, MusicalNoteIcon } from '../constants'; 

interface ProjectCardProps {
  project: Project;
  projectImageUrl?: string; // Optional image URL for the project
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, projectImageUrl }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-brand-dark-card dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden group"
      onClick={() => navigate(`/project/${project.id}`)}
      aria-label={`Ver proyecto ${project.name}`}
    >
      {projectImageUrl ? (
        <img 
          src={projectImageUrl} 
          alt={`Imagen representativa de ${project.name}`} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-48 bg-brand-dark-bg dark:bg-slate-700 flex items-center justify-center rounded-t-lg">
          <MusicalNoteIcon className="w-16 h-16 text-brand-text-dim opacity-30" />
        </div>
      )}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-text-light dark:text-white mb-1 truncate" title={project.name}>
            {project.name}
          </h3>
          <p className="text-sm text-brand-text-dim dark:text-gray-400 mb-0.5 truncate flex items-center" title={project.location}>
            <MapIcon className="w-4 h-4 mr-1.5 opacity-70 flex-shrink-0" /> {project.location || "Ubicación no especificada"}
          </p>
        </div>
        <p className="text-xs text-brand-text-dim dark:text-gray-500 mt-2">
          {new Date(project.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;
