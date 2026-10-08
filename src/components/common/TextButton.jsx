import React from 'react';
import { Link } from 'react-router-dom';

const TextButton = ({ to, children, className = '', onClick }) => {
  const baseClasses = "hover:text-primary-500 transition-colors cursor-pointer text-[11px] text-gray-400 font-medium";
  
  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`}>
        {children}
      </Link>
    );
  }
  
  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

export default TextButton;
