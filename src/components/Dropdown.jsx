import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (opt) => (opt.value !== undefined ? opt.value : opt) === value
  );
  
  const selectedLabel = selectedOption 
    ? (selectedOption.label || selectedOption.value || selectedOption) 
    : 'Select...';

  const handleSelect = (opt) => {
    const val = opt.value !== undefined ? opt.value : opt;
    // Simulate a native event for the onChange handler
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 rounded-md pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none hover:border-indigo-300 focus:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
      >
        <span className="truncate">{selectedLabel}</span>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar py-1"
          >
            {options.map((opt, idx) => {
              const val = opt.value !== undefined ? opt.value : opt;
              const label = opt.label || opt;
              const isSelected = val === value;

              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  {isSelected && <Check size={14} className="text-indigo-600 flex-shrink-0 ml-2" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
