import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_NAME, ROUTES } from '../constants/config';
import { useAppContext } from '../context/AppContext';
import templatesData from '../data/templates.json';
import { 
  ArrowLeft, Search, Plus, LayoutTemplate, 
  Clock, BookOpen, User, Calendar, FolderHeart
} from 'lucide-react';

const CATEGORIES = [
  { id: 'recent', name: 'Recently Used', icon: Clock },
  { id: 'education', name: 'Education', icon: BookOpen },
  { id: 'personal', name: 'Personal', icon: User },
  { id: 'event', name: 'Event', icon: Calendar },
  { id: 'my-templates', name: 'My templates', icon: FolderHeart },
];

const TEMPLATES = [
  // JSON Templates
  ...templatesData.map((t, idx) => ({
    id: t.id,
    category: t.category,
    name: t.name,
    isBlank: t.isBlank || false,
    gradient: t.gradient || 'from-indigo-500 to-purple-500'
  })),
  // Recently Used
  { id: 'recent_1', category: 'recent', name: 'Customer Feedback', isBlank: false, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'recent_2', category: 'recent', name: 'Event RSVP', isBlank: false, gradient: 'from-emerald-500 to-teal-500' },
  // Education
  { id: 4, category: 'education', name: 'Quiz Assignment', isBlank: false, gradient: 'from-orange-500 to-amber-500' },
  { id: 5, category: 'education', name: 'Class Registration', isBlank: false, gradient: 'from-blue-500 to-cyan-500' },
  // Personal
  { id: 6, category: 'personal', name: 'Contact Information', isBlank: false, gradient: 'from-rose-500 to-pink-500' },
  { id: 7, category: 'personal', name: 'Find a Time', isBlank: false, gradient: 'from-violet-500 to-purple-500' },
  // Event
  { id: 8, category: 'event', name: 'Party Invite', isBlank: false, gradient: 'from-fuchsia-500 to-pink-500' },
  { id: 9, category: 'event', name: 'T-Shirt Sign Up', isBlank: false, gradient: 'from-yellow-400 to-orange-500' },
  // My Templates
  { id: 10, category: 'my-templates', name: 'Onboarding V2', isBlank: false, gradient: 'from-slate-600 to-slate-800' },
];

const TemplateGallery = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter(t => 
    (activeCategory === 'all' || t.category === activeCategory) &&
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
                  F
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                  Template Gallery
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-medium flex items-center justify-center shadow-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Search and Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Find the perfect template</h1>
            <p className="text-slate-500">Choose from our professionally designed templates or start from scratch.</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white py-3 pl-11 pr-4 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 border border-slate-200 shadow-sm" 
            />
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            All Templates
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <cat.icon size={16} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {/* Always show Blank Form first if "all" or "my-templates" is selected and no search query */}
          {(activeCategory === 'all' || activeCategory === 'my-templates') && !searchQuery && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group cursor-pointer flex flex-col gap-3"
              onClick={() => window.open('/form-builder/blank', '_blank')}
            >
              <div className="aspect-[4/3] rounded-2xl p-0.5 transition-all duration-300 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30">
                <div className="w-full h-full rounded-[14px] flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <Plus size={36} className="text-white mb-2" />
                  <span className="text-white font-medium text-sm">Blank Form</span>
                </div>
              </div>
            </motion.div>
          )}

          {filteredTemplates.map((template, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={template.id} 
              className="group cursor-pointer flex flex-col gap-3"
              onClick={() => window.open(`/form-builder/${template.id}`, '_blank')}
            >
              <div className="aspect-[4/3] rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${template.gradient}`}></div>
                <div className="w-full h-full bg-slate-50 group-hover:bg-indigo-50/30 transition-colors flex items-center justify-center p-6">
                  <div className="w-full h-full max-h-32 bg-white rounded-lg shadow-sm border border-slate-200/60 p-3 space-y-2.5 flex flex-col relative group-hover:shadow transition-shadow">
                     <div className="w-1/2 h-2 bg-slate-200 rounded-full"></div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                     <div className="w-3/4 h-1.5 bg-slate-100 rounded-full mt-auto"></div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                     
                     <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                       <div className="bg-white text-indigo-600 font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm">
                         Use Template
                       </div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{template.name}</h3>
                <span className="text-xs text-slate-500 font-medium capitalize mt-0.5 block">
                  {CATEGORIES.find(c => c.id === template.category)?.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No templates found</h3>
            <p className="text-slate-500 mt-1 max-w-sm">We couldn't find any templates matching your search criteria. Try a different term or category.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default TemplateGallery;
