import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { APP_NAME } from '../constants/config';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/config';
import { 
  Search, Plus, LayoutTemplate, Clock, MoreVertical, 
  BarChart2, Users, FileText, ChevronDown, Bell, Settings,
  Grid, List as ListIcon, Filter
} from 'lucide-react';

const STATS = [
  { id: 1, name: 'Total Forms', value: '24', icon: FileText, change: '+12%', changeType: 'positive', color: 'bg-indigo-500/10 text-indigo-600' },
  { id: 2, name: 'Total Responses', value: '1,429', icon: Users, change: '+28%', changeType: 'positive', color: 'bg-emerald-500/10 text-emerald-600' },
  { id: 3, name: 'Completion Rate', value: '68%', icon: BarChart2, change: '-4%', changeType: 'negative', color: 'bg-rose-500/10 text-rose-600' },
];

const TEMPLATES = [
  { id: 1, name: 'Blank Form', icon: Plus, isBlank: true, gradient: 'from-violet-500 to-fuchsia-500' },
  { id: 2, name: 'Customer Feedback', icon: LayoutTemplate, gradient: 'from-blue-500 to-cyan-500' },
  { id: 3, name: 'Event RSVP', icon: LayoutTemplate, gradient: 'from-emerald-500 to-teal-500' },
  { id: 4, name: 'Job Application', icon: LayoutTemplate, gradient: 'from-orange-500 to-amber-500' },
];

const RECENT_FORMS = [
  { id: 101, name: 'Q3 Customer Satisfaction Survey', responses: 142, status: 'Active', lastOpened: '2 hours ago', color: 'bg-violet-100 text-violet-600 border-violet-200' },
  { id: 102, name: 'Annual Tech Conference Registration', responses: 89, status: 'Active', lastOpened: 'Yesterday', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 103, name: 'Employee Onboarding Q4', responses: 12, status: 'Draft', lastOpened: 'Oct 1', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 104, name: 'Product Feedback v2.1', responses: 432, status: 'Closed', lastOpened: 'Sep 28', color: 'bg-rose-100 text-rose-600 border-rose-200' },
];

const Dashboard = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                F
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                {APP_NAME}
              </span>
            </div>
            
            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-2xl px-12">
              <div className="relative w-full group">
                <div className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors duration-300 ${isSearchFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search forms, responses, or templates..." 
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full bg-slate-100/80 py-2.5 pl-11 pr-4 rounded-full text-sm text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 border border-transparent shadow-inner group-hover:bg-slate-100" 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
                <Settings size={20} />
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <button className="flex items-center gap-2 p-1 pl-2 pr-4 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-medium flex items-center justify-center shadow-sm">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 hidden sm:block">
                  {user?.username || 'User'}
                </span>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Welcome & Stats */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.username?.split(' ')[0] || 'User'}!</h1>
              <p className="text-slate-500 mt-1">Here's what's happening with your forms today.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
            >
              <Plus size={18} />
              <span>Create New Form</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {STATS.map((stat, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={stat.id} 
                className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${stat.color} transition-colors`}>
                    <stat.icon size={22} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Start from a Template</h2>
            <button 
              onClick={() => navigate(ROUTES.TEMPLATES)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              View Gallery <ChevronDown size={14} className="-rotate-90 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEMPLATES.map((template, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.05) }}
                key={template.id} 
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className={`aspect-video rounded-2xl p-0.5 transition-all duration-300 ${template.isBlank ? 'bg-gradient-to-br ' + template.gradient + ' shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30' : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}>
                  <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${template.isBlank ? 'bg-white/10 backdrop-blur-sm' : 'bg-slate-50 group-hover:bg-slate-100 transition-colors'}`}>
                    {template.isBlank ? (
                      <Plus size={32} className="text-white" />
                    ) : (
                      <div className="w-16 h-20 bg-white rounded-lg shadow-sm border border-slate-200 p-2 space-y-2 flex flex-col items-center justify-center">
                        <div className="w-3/4 h-1.5 bg-slate-200 rounded-full"></div>
                        <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                        <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 px-1">{template.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Forms */}
        <section className="space-y-4 pb-12">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Forms</h2>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <div className="h-4 w-px bg-slate-300 mx-1"></div>
              <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-3"}
            >
              {RECENT_FORMS.map((form) => (
                viewMode === 'grid' ? (
                  <div key={form.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group cursor-pointer flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${form.color}`}>
                        {form.status}
                      </div>
                      <button className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 -mr-2 -mt-2">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{form.name}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} /> {form.responses} responses
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {form.lastOpened}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div key={form.id} className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-slate-300 transition-all duration-300 group cursor-pointer flex items-center gap-4">
                    <div className={`p-3 rounded-lg border ${form.color} bg-white flex-shrink-0`}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{form.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Users size={14} /> {form.responses} responses</span>
                        <span className="hidden sm:flex items-center gap-1.5"><Clock size={14} /> {form.lastOpened}</span>
                      </div>
                    </div>
                    <div className={`hidden sm:flex px-2.5 py-1 rounded-full text-xs font-semibold border ${form.color}`}>
                      {form.status}
                    </div>
                    <button className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors flex-shrink-0">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                )
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
