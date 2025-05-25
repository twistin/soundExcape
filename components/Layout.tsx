import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, FolderIcon, PhotoIcon, MapIcon, CogIcon, ICON_SIZE } from '../constants';

interface BottomNavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean; // To handle exact match for Home
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ to, icon, label, exact = false }) => {
  const location = useLocation();
  
  // isActive for NavLink considers end={true} by default for paths like "/".
  // For "Proyectos", we want it active if it starts with /projects or /project/:id etc.
  // For "Inicio", we want it active only for "/"
  let isActiveManual = false;
  if (exact) {
    isActiveManual = location.pathname === to;
  } else {
    isActiveManual = location.pathname === to || location.pathname.startsWith(`${to}/`);
  }


  return (
    <NavLink
      to={to}
      end={exact} // Ensure exact match for "/"
      className={({ isActive: navLinkIsActive }) => // Use NavLink's isActive prop, combined with manual check if needed
        `flex flex-col items-center justify-center flex-1 p-2 rounded-lg transition-colors
         ${(isActiveManual || navLinkIsActive) ? 'text-brand-primary bg-brand-dark-card dark:bg-brand-dark-border' : 'text-brand-text-dim hover:bg-brand-dark-card dark:hover:bg-brand-dark-border'}`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};


const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen antialiased">
      <main className="flex-1 overflow-y-auto pb-20 bg-brand-dark-bg dark:bg-brand-dark-bg text-brand-text-light dark:text-brand-text-light">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-dark-bg dark:bg-slate-800 border-t border-brand-dark-border dark:border-slate-700 shadow-md p-2">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          <BottomNavItem to="/" icon={<HomeIcon className={ICON_SIZE} />} label="Inicio" exact={true} />
          <BottomNavItem to="/projects" icon={<FolderIcon className={ICON_SIZE} />} label="Proyectos" />
          <BottomNavItem to="/gallery" icon={<PhotoIcon className={ICON_SIZE} />} label="Galería" />
          <BottomNavItem to="/map" icon={<MapIcon className={ICON_SIZE} />} label="Mapa" />
          <BottomNavItem to="/utilities" icon={<CogIcon className={ICON_SIZE} />} label="Utilidades" />
        </div>
      </nav>
    </div>
  );
};

export default Layout;