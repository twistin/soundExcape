import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { 
  DocumentTextIcon, CloudArrowUpIcon, ArrowDownTrayIcon, BellIcon, MagnifyingGlassIcon, SunIcon, MoonIcon, CogIcon, UsersIcon, SparklesIcon
} from '../constants'; // Added UsersIcon, SparklesIcon
import { Reminder } from '../types';
import { generateJson, isAIAvailable } from '../services/geminiService';


const UtilityCard: React.FC<{title: string, children: React.ReactNode, icon?: React.ReactNode, className?: string}> = ({title, children, icon, className=""}) => (
    <div className={`bg-brand-dark-card dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6 ${className}`}>
        <div className="flex items-center mb-3">
            {icon && <span className="mr-3 text-brand-primary">{icon}</span>}
            <h2 className="text-lg font-semibold text-brand-text-light dark:text-gray-200">{title}</h2>
        </div>
        {children}
    </div>
);

const UtilitiesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(false);
  const [aiSearchSuggestions, setAiSearchSuggestions] = useState<string[]>([]);
  const [isFetchingAiSuggestions, setIsFetchingAiSuggestions] = useState(false);
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);

  useEffect(() => {
    setAiFeaturesEnabled(isAIAvailable());
  }, []);

  if (!context) return <p>Cargando contexto...</p>;
  const { darkMode, toggleDarkMode, reminders } = context;

  const handleGenerateReport = () => {
    alert('Simulacro: Generando informe... Esta función exportaría los datos del proyecto en PDF o CSV.');
  };

  const handleExportMetadata = () => {
    alert('Simulacro: Exportando metadatos... Compatible con software de audio profesional.');
  };

  const handleToggleCloudSync = () => {
    setIsCloudSyncEnabled(prev => !prev);
    if (!isCloudSyncEnabled) {
        alert("Sincronización en la nube (simulada): Activada. En una aplicación real, esto requeriría configuración de backend y servicios en la nube.");
    } else {
        alert("Sincronización en la nube (simulada): Desactivada.");
    }
  };
  
  const handleSearchChange = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim() || !aiFeaturesEnabled) {
      setAiSearchSuggestions([]);
      return;
    }

    setIsFetchingAiSuggestions(true);
    try {
      const prompt = `El usuario está buscando "${term}" en la aplicación soundXcape (grabación de paisajes sonoros). Sugiere 3-4 consultas de búsqueda más específicas o tipos de contenido relacionados que podrían estar buscando (proyectos, grabaciones, ubicaciones, temas de audio). Devuelve un array JSON de strings. Ejemplo: ["grabaciones de aves en el bosque", "proyectos en la costa", "sonidos urbanos nocturnos"]`;
      const suggestions = await generateJson<string[]>(prompt);
      setAiSearchSuggestions(suggestions || []);
    } catch (error) {
      console.error("Error fetching AI search suggestions:", error);
      setAiSearchSuggestions([]);
    } finally {
      setIsFetchingAiSuggestions(false);
    }
  };


  return (
    <div>
      <PageHeader title="Utilidades y Configuración" />
      <div className="p-4 space-y-8 pb-20"> {/* Added pb-20 for nav bar */}
        
        {/* Reports & Export */}
        <UtilityCard title="Informes y Exportación" icon={<DocumentTextIcon className="w-6 h-6"/>}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-brand-dark-bg rounded-md">
              <div>
                <h3 className="font-medium text-brand-text-light">Generar Informe Completo</h3>
                <p className="text-xs text-brand-text-dim">Crear informes detallados (PDF/CSV) - Simulacro.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleGenerateReport}>Generar</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-brand-dark-bg rounded-md">
              <div>
                <h3 className="font-medium text-brand-text-light">Exportar Metadatos</h3>
                <p className="text-xs text-brand-text-dim">Compatible con software de audio profesional - Simulacro.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportMetadata}><ArrowDownTrayIcon className="w-5 h-5"/></Button>
            </div>
          </div>
        </UtilityCard>
        
        {/* Cloud & Collaboration - Placeholders */}
        <UtilityCard title="Nube y Colaboración" icon={<CloudArrowUpIcon className="w-6 h-6"/>}>
            <div className="flex items-center justify-between p-3 bg-brand-dark-bg rounded-md mb-3">
              <div>
                <h3 className="font-medium text-brand-text-light">Sincronización en la Nube</h3>
                <p className="text-xs text-brand-text-dim">Guarda y accede a tus proyectos desde cualquier lugar.</p>
              </div>
              <label htmlFor="cloudSyncToggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="cloudSyncToggle" className="sr-only" checked={isCloudSyncEnabled} onChange={handleToggleCloudSync} />
                    <div className={`block w-10 h-6 rounded-full ${isCloudSyncEnabled ? 'bg-brand-primary' : 'bg-slate-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isCloudSyncEnabled ? 'transform translate-x-full' : ''}`}></div>
                </div>
              </label>
            </div>
             <p className="text-xs text-brand-text-dim px-3 py-1 mb-3">
                {isCloudSyncEnabled ? "Sincronización activada (simulacro)." : "Activa la sincronización para copias de seguridad (simulacro)."}
             </p>
            <div className="flex items-center justify-between p-3 bg-brand-dark-bg rounded-md opacity-50 cursor-not-allowed">
              <div>
                <h3 className="font-medium text-brand-text-light">Colaboración en Proyectos</h3>
                <p className="text-xs text-brand-text-dim">Invita a otros a tus proyectos (Próximamente).</p>
              </div>
              <UsersIcon className="w-6 h-6 text-brand-text-dim" />
            </div>
            <p className="text-xs text-brand-text-dim px-3 pt-2">La colaboración requiere una infraestructura de backend.</p>
        </UtilityCard>


        {/* Field Notes - Reminders & Search */}
        <UtilityCard title="Notas de Campo y Búsqueda" icon={<BellIcon className="w-6 h-6"/>}>
            <h3 className="text-md font-semibold text-brand-text-light mb-2">Recordatorios</h3>
            {reminders.length === 0 && <p className="text-sm text-brand-text-dim mb-4">No hay recordatorios configurados.</p>}
            <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {reminders.map((reminder: Reminder) => (
                    <li key={reminder.id} className="p-2 bg-brand-dark-bg rounded-md text-sm">
                        <span className="text-brand-text-light">{reminder.text}</span> - <span className="text-brand-text-dim">{reminder.time}, {new Date(reminder.date).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>

            <h3 className="text-md font-semibold text-brand-text-light mb-2">Búsqueda Inteligente</h3>
             <div className="flex items-center bg-brand-dark-bg p-2 rounded-lg shadow mb-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-brand-text-dim mr-2" />
                <input 
                    type="search" 
                    placeholder="Buscar proyectos, grabaciones, notas..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="bg-transparent text-brand-text-light placeholder-brand-text-dim outline-none w-full"
                />
            </div>
            {aiFeaturesEnabled && searchTerm && (isFetchingAiSuggestions || aiSearchSuggestions.length > 0) && (
                <div className="mt-2 p-2 border border-brand-dark-border rounded-md bg-brand-dark-bg/30">
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
                    {!isFetchingAiSuggestions && aiSearchSuggestions.length === 0 && searchTerm && <p className="text-xs text-brand-text-dim">No se encontraron sugerencias para "{searchTerm}".</p>}
                </div>
            )}
            {/* Placeholder for actual search results if implemented locally */}
            {/* {searchTerm && !aiFeaturesEnabled && <p className="text-sm text-brand-text-dim mt-2">Resultados de búsqueda local para "{searchTerm}" aparecerían aquí.</p>} */}
        </UtilityCard>
        
        <UtilityCard title="Configuración de Aplicación" icon={<CogIcon className="w-6 h-6"/>}>
            <div className="flex items-center justify-between p-3 bg-brand-dark-bg rounded-md">
                <h3 className="font-medium text-brand-text-light">Modo Oscuro</h3>
                <Button onClick={toggleDarkMode} variant="secondary" size="sm" className="p-2" aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </Button>
            </div>
            {!aiFeaturesEnabled && (
                <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-300 text-xs">
                    <p><strong className="font-semibold">Funciones de IA desactivadas:</strong> No se encontró la API Key de Gemini (<code>process.env.API_KEY</code>). Por favor, configura esta variable de entorno para habilitar las funciones de IA.</p>
                </div>
            )}
        </UtilityCard>

      </div>
    </div>
  );
};

export default UtilitiesScreen;
