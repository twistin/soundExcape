
import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'date' | 'textarea' | 'number' | 'datetime-local';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  name?: string; // Allow 'name' prop
  // Add step for number inputs, useful for decimal coordinates
  step?: string | number; 
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  name, // Use name prop
  step,
}) => {
  const commonClasses = "w-full p-3 bg-brand-dark-card dark:bg-slate-700 border border-brand-dark-border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-colors text-brand-text-light dark:text-gray-200 placeholder-brand-text-dim";

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-dim dark:text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name || id} // Use provided name or fallback to id
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={commonClasses}
        />
      ) : (
        <input
          id={id}
          name={name || id} // Use provided name or fallback to id
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          step={type === 'number' ? step || "any" : undefined} // Apply step for number inputs
          className={commonClasses}
        />
      )}
    </div>
  );
};

export default FormField;