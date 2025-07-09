import React from 'react';

/**
 * Reusable Modal component
 * @param {boolean} open - Whether the modal is open
 * @param {() => void} onClose - Close handler
 * @param {React.ReactNode} children - Modal content
 */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}; 