import React from 'react';

/**
 * Reusable Input component
 * @param {string} label - Input label
 * @param {string} [error] - Error message
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props
 */
export const Input: React.FC<{
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  error,
  ...props
}) => (
  <div className="flex flex-col mb-2">
    <label className="mb-1 font-medium">{label}</label>
    <input className="border px-2 py-1 rounded" {...props} />
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
); 