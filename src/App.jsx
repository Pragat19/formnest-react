import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ROUTES } from './constants/config';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TemplateGallery from './pages/TemplateGallery';
import FormEditor from './pages/FormEditor';
import FormPreview from './pages/FormPreview';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.TEMPLATES} element={<TemplateGallery />} />
          <Route path={ROUTES.FORM_BUILDER} element={<FormEditor />} />
          <Route path={ROUTES.FORM_PREVIEW} element={<FormPreview />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
