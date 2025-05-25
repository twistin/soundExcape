
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../constants';
import Button from './Button';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBackButton = false, backPath, actions }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="p-4 bg-brand-dark-card dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2 p-1">
              <ArrowLeftIcon className="w-5 h-5 text-brand-text-light dark:text-gray-300" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-brand-text-light dark:text-white">{title}</h1>
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
    