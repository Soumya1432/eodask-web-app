import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={`w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${className}`}
            {...props}
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {label}
          </span>
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
