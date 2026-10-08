import React from 'react';
import { APP_NAME } from '../../constants/config';
import loginImg from '../../assets/login-page-img.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, logoText = "FormNEST", imagePosition = "right" }) => {
  const isImageRight = imagePosition === "right";
  const location = useLocation();

  return (
    <div className="min-h-screen w-full font-sans overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: isImageRight ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isImageRight ? 50 : -50 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col min-h-screen ${isImageRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}
        >
          {/* Left Side: Form (or right side if reversed) */}
          <div className="w-full md:w-5/12 p-8 md:p-14 lg:p-20 flex flex-col justify-center relative z-20 bg-white min-h-screen">
            <div className={`absolute top-8 ${isImageRight ? 'left-8 md:left-14 lg:left-20' : 'right-8 md:right-14 lg:right-20'} font-bold text-gray-800 tracking-widest text-lg`}>
              {logoText}
            </div>
            
            <div className="w-full max-w-sm mx-auto flex flex-col justify-center mt-12 md:mt-0">
              <h2 className="text-[2.5rem] font-bold text-[#112a46] mb-3 leading-tight tracking-tight">{title}</h2>
              {subtitle && (
                <p className="text-[15px] text-gray-400 mb-10 max-w-[350px] leading-relaxed">
                  {subtitle}
                </p>
              )}
              
              {children}
            </div>
          </div>

          {/* Right Side: Illustration (or left side if reversed) */}
          <div className="w-full md:w-7/12 min-h-screen relative flex items-center justify-center hidden md:flex bg-gradient-to-br from-[#f0f5fc] to-[#e4eff9]">
              <img 
                src={loginImg} 
                alt="Login Illustration" 
                className="w-full h-full object-cover object-center" 
              />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
