import React from 'react';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`py-3 px-8 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-full shadow-[0_8px_20px_-6px_rgba(66,133,244,0.6)] transition-all tracking-wide ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
