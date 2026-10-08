import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { APP_NAME } from '../constants/config';

// Dummy data for templates
const TEMPLATES = [
  { id: 1, name: 'Blank', image: 'https://ssl.gstatic.com/docs/templates/thumbnails/forms-blank-googlecolors.png' },
  { id: 2, name: 'Contact Information', image: 'contact' },
  { id: 3, name: 'RSVP', image: 'rsvp' },
  { id: 4, name: 'Party Invite', image: 'party' },
];

// Dummy data for recent forms
const RECENT_FORMS = [
  { id: 101, name: 'Customer Feedback', lastOpened: 'Opened 10:32 AM', color: 'bg-purple-100' },
  { id: 102, name: 'Event Registration', lastOpened: 'Opened yesterday', color: 'bg-blue-100' },
  { id: 103, name: 'Onboarding Questionnaire', lastOpened: 'Opened Oct 1', color: 'bg-green-100' },
];

const Dashboard = () => {
  const { user } = useAppContext();
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center space-x-4">

          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-9 h-9 bg-primary-500 rounded text-white flex items-center justify-center font-bold text-xl shadow-sm">F</div>
            <span className="text-xl font-semibold text-gray-700 tracking-tight">{APP_NAME}</span>
          </div>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-2xl px-12">
          <div className="w-full relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-4">
               <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </span>
             <input 
               type="text" 
               placeholder="Search" 
               className="w-full bg-[#f1f3f4] py-3 pl-12 pr-4 rounded-xl text-base text-gray-700 focus:outline-none focus:bg-white focus:shadow-md transition-all border border-transparent focus:border-gray-200" 
             />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="w-9 h-9 rounded-full bg-purple-600 text-white font-semibold flex items-center justify-center cursor-pointer shadow-sm hover:shadow transition-shadow">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </button>
        </div>
      </header>

      {/* Template Gallery */}
      <section className="bg-[#f1f3f4] py-6 border-b border-gray-200">
        <div className="max-w-[70rem] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base text-gray-800 font-medium">Start a new form</h2>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 rounded hover:bg-gray-200/50 transition-colors cursor-pointer">
              <span>Template gallery</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
            {TEMPLATES.map(template => (
              <div key={template.id} className="flex flex-col flex-shrink-0 cursor-pointer group">
                <div className={`w-36 h-28 sm:w-44 sm:h-32 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden hover:border-primary-500 transition-colors shadow-sm group-hover:shadow relative`}>
                  {template.name === 'Blank' ? (
                     <img src={template.image} alt="Blank" className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center relative">
                         <div className="w-24 h-16 bg-white border border-gray-200 rounded shadow-sm flex flex-col p-2 space-y-1.5">
                            <div className="w-3/4 h-2 bg-gray-200 rounded-sm"></div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-sm"></div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-sm"></div>
                            <div className="w-1/2 h-1.5 bg-gray-100 rounded-sm"></div>
                         </div>
                     </div>
                  )}
                </div>
                <span className="mt-3 text-sm text-gray-700 font-medium">{template.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Forms */}
      <section className="py-8 bg-white min-h-[50vh]">
        <div className="max-w-[70rem] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600 font-medium">
            <h2 className="text-base text-gray-800">Recent forms</h2>
            <div className="flex items-center space-x-6 hidden sm:flex">
              <span className="cursor-pointer hover:text-gray-900 py-1 border-b-2 border-transparent hover:border-gray-300">Owned by anyone</span>
              <span className="cursor-pointer hover:text-gray-900 py-1 border-b-2 border-transparent hover:border-gray-300">Last opened by me</span>
              <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer" title="Sort options">
                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
              </button>
              <button 
                onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                title={viewMode === 'grid' ? "List view" : "Grid view"}
              >
                {viewMode === 'grid' ? (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                )}
              </button>
            </div>
          </div>
          
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5" : "flex flex-col space-y-3"}>
            {RECENT_FORMS.map(form => (
              viewMode === 'grid' ? (
                <div key={form.id} className="border border-gray-200 rounded-lg hover:border-primary-500 cursor-pointer transition-colors flex flex-col group bg-white shadow-sm hover:shadow">
                  <div className={`h-36 ${form.color} rounded-t-lg overflow-hidden relative border-b border-gray-100 flex items-start p-3`}>
                     <div className="w-full bg-white/90 backdrop-blur rounded p-2 shadow-sm space-y-2 mt-2">
                         <div className="h-3 w-1/2 bg-gray-200 rounded-sm"></div>
                         <div className="h-2 w-full bg-gray-100 rounded-sm"></div>
                         <div className="h-2 w-3/4 bg-gray-100 rounded-sm"></div>
                     </div>
                  </div>
                  <div className="p-4 bg-white rounded-b-lg flex flex-col">
                    <span className="text-sm text-gray-800 font-medium truncate mb-2" title={form.name}>{form.name}</span>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1.5">
                        <svg className="w-4 h-4 text-[#7248b9]" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                        <span>{form.lastOpened}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 p-1.5 rounded-full transition-opacity">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={form.id} className="border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors flex items-center p-3 px-5 group bg-white shadow-sm hover:shadow">
                  <div className={`w-10 h-10 rounded shadow-sm flex flex-col items-center justify-center mr-4 flex-shrink-0 ${form.color} border border-gray-100`}>
                    <svg className="w-5 h-5 text-gray-700 opacity-60" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                  </div>
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{form.name}</span>
                  <span className="w-48 text-xs text-gray-500 font-medium flex-shrink-0 hidden sm:block">{form.lastOpened}</span>
                  <button className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 p-2 rounded-full transition-opacity ml-4 flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                  </button>
                </div>
              )
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
