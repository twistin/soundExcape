import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import { PlusIcon } from '../constants';
import PageHeader from '../components/PageHeader'; // Import PageHeader

const ProjectListScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) return <p className="p-4 text-center">Cargando contexto...</p>;
  const { projects, getRecordingsForProject } = context;

  return (
    <div className="min-h-screen">
      <PageHeader title="Mis Proyectos" /> 
      
      {/* Stylized Gallery Title - Replaced by PageHeader, but keeping visual separation for project list */}
      <div className="flex items-center justify-center mt-1 mb-4 md:mb-6 px-4">
        <hr className="w-1/4 border-t border-brand-dark-border dark:border-slate-700 opacity-50" />
        <h2 className="mx-4 text-xl md:text-2xl font-light tracking-wider text-brand-text-dim dark:text-brand-text-dim uppercase">
          Explora Tus Proyectos
        </h2>
        <hr className="w-1/4 border-t border-brand-dark-border dark:border-slate-700 opacity-50" />
      </div>


      <div className="p-4 md:p-6">
        {projects.length === 0 ? (
          <div className="text-center py-10">
            <img 
              src="https://picsum.photos/seed/soundscapeprojects/400/250" 
              alt="Inspiración para paisajes sonoros" 
              className="mx-auto rounded-lg mb-6 opacity-60 shadow-xl" 
            />
            <h2 className="text-2xl font-semibold text-brand-text-light mb-3">No Tienes Proyectos Aún</h2>
            <p className="text-brand-text-dim dark:text-gray-400 mb-6 max-w-md mx-auto">
              Comienza tu aventura sonora. Crea tu primer proyecto y empieza a capturar el mundo en sonidos y imágenes.
            </p>
            <Button onClick={() => navigate('/new-project')} size="lg">
              <PlusIcon className="w-5 h-5 mr-2 inline-block" />
              Crear Nuevo Proyecto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(project => {
              const projectRecordings = getRecordingsForProject(project.id);
              const projectImageUrl = projectRecordings.length > 0 && projectRecordings[0].photos.length > 0 
                                    ? projectRecordings[0].photos[0].url 
                                    : undefined;
              return (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  projectImageUrl={projectImageUrl} 
                />
              );
            })}
          </div>
        )}
      </div>
      <Button 
        onClick={() => navigate('/new-project')}
        className="fixed bottom-24 right-4 bg-brand-primary hover:bg-brand-primary-hover text-white p-4 rounded-full shadow-xl z-20"
        aria-label="Añadir nuevo proyecto"
      >
        <PlusIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default ProjectListScreen;