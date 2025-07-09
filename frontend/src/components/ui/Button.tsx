import React from 'react';

/**
 * Reusable Button component
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 * @param {string} [variant] - 'primary' | 'secondary' | 'danger'
 * @param {boolean} [loading] - Show loading spinner
 */
export const Button: React.FC<{
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  variant = 'primary',
  loading = false,
  children,
  ...props
}) => {
  let color = 'bg-blue-500 hover:bg-blue-600 text-white';
  if (variant === 'secondary') color = 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  if (variant === 'danger') color = 'bg-red-500 hover:bg-red-600 text-white';
  return (
    <button
      className={`px-4 py-2 rounded ${color} disabled:opacity-50`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="loader mr-2" /> : null}
      {children}
    </button>
  );
}; 