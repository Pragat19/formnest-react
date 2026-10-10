import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { APP_NAME, ROUTES } from '../constants/config';
import { useAppContext } from '../context/AppContext';
import Dropdown from '../components/Dropdown';
import templatesData from '../data/templates.json';
import { 
  ArrowLeft, Eye, Save, Settings, Share2, Type, 
  Hash, Mail, Phone, ChevronDown, CheckSquare, 
  Calendar, Upload, Star, AlignLeft, Grid, MoreVertical, Plus, Trash2, Copy, GripVertical, ArrowUp, ArrowDown,
  X, Users, Link
} from 'lucide-react';

const FIELD_TYPES = [
  { id: 'short_answer', label: 'Short Answer', icon: Type },
  { id: 'long_answer', label: 'Paragraph', icon: AlignLeft },
  { id: 'multiple_choice', label: 'Multiple Choice', icon: Grid },
  { id: 'checkboxes', label: 'Checkboxes', icon: CheckSquare },
  { id: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'file_upload', label: 'File Upload', icon: Upload },
  { id: 'rating', label: 'Rating', icon: Star },
];

const FormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [formData, setFormData] = useState(null);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const savedDraft = localStorage.getItem(`form_draft_${id}`);
      if (savedDraft) {
        setFormData(JSON.parse(savedDraft));
      } else if (id === 'blank') {
        setFormData({
          name: 'Untitled Form',
          description: 'Form description',
          schema: [
            { id: 'field_' + Date.now(), type: 'short_answer', label: 'Untitled Question', required: false }
          ]
        });
      } else {
        const template = templatesData.find(t => t.id === id);
        if (template) {
          setFormData(JSON.parse(JSON.stringify(template)));
        } else {
          setFormData({ name: 'New Form', description: '', schema: [] });
        }
      }
      setLoading(false);
    }, 400);
  }, [id]);

  useEffect(() => {
    if (!formData || loading) return;
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      localStorage.setItem(`form_draft_${id}`, JSON.stringify(formData));
      setSaveStatus('Draft Saved');
      setTimeout(() => setSaveStatus(''), 2500);
    }, 800);
    return () => clearTimeout(timer);
  }, [formData, id, loading]);

  if (loading || !formData) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeField = formData.schema.find(f => f.id === activeFieldId);

  const updateActiveField = (updates) => {
    const newSchema = formData.schema.map(f => f.id === activeFieldId ? { ...f, ...updates } : f);
    setFormData({ ...formData, schema: newSchema });
  };

  const addField = (type, insertIndex = null) => {
    const newField = {
      id: 'field_' + Date.now(),
      type: type,
      label: 'New Question',
      required: false,
      ...( ['multiple_choice', 'checkboxes', 'dropdown'].includes(type) ? { options: ['Option 1'] } : {} )
    };
    
    if (insertIndex !== null) {
      const newSchema = [...formData.schema];
      newSchema.splice(insertIndex, 0, newField);
      setFormData({ ...formData, schema: newSchema });
    } else {
      setFormData({ ...formData, schema: [...formData.schema, newField] });
    }
    setActiveFieldId(newField.id);
  };

  const deleteField = (fieldId) => {
    setFormData({ ...formData, schema: formData.schema.filter(f => f.id !== fieldId) });
    if (activeFieldId === fieldId) setActiveFieldId(null);
  };

  const updateFormSettings = (updates) => {
    setFormData({
      ...formData,
      settings: {
        ...(formData.settings || {}),
        ...updates
      }
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSchema = [...formData.schema];
    const draggedItem = newSchema[draggedIndex];
    
    newSchema.splice(draggedIndex, 1);
    newSchema.splice(targetIndex, 0, draggedItem);
    
    setFormData({ ...formData, schema: newSchema });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrag = (e) => {
    if (!scrollContainerRef.current) return;
    const { clientY } = e;
    if (clientY === 0) return; // Ignore final drop coordinate where clientY is 0

    const container = scrollContainerRef.current;
    const { top, bottom } = container.getBoundingClientRect();
    
    // Auto-scroll threshold from edge (pixels)
    const threshold = 100;
    const scrollSpeed = 15;
    
    if (clientY - top < threshold) {
      container.scrollTop -= scrollSpeed;
    } else if (bottom - clientY < threshold) {
      container.scrollTop += scrollSpeed;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 h-14 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(ROUTES.TEMPLATES)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">F</div>
             <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors px-1"
              />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            {saveStatus && (
              <span className={`text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1.5 transition-all ${saveStatus === 'Draft Saved' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                <Save size={12} className={saveStatus === 'Saving...' ? 'animate-pulse' : ''} />
                {saveStatus}
              </span>
            )}
          </div>
          <button 
            onClick={() => window.open(ROUTES.FORM_PREVIEW.replace(':id', id), '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors"
          >
            <Eye size={16} /> Preview
          </button>
          <button onClick={() => setIsPublishModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors">
            <Share2 size={16} /> Publish
          </button>
        </div>
      </header>

      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Elements Panel */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Form Elements</h2>
          </div>
          <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map(ft => (
                <div 
                  key={ft.id}
                  onClick={() => addField(ft.id)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors group"
                >
                  <ft.icon size={20} className="text-slate-500 group-hover:text-indigo-600" />
                  <span className="text-[11px] font-medium text-center leading-tight">{ft.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-10 custom-scrollbar relative" onClick={(e) => { if (e.target === e.currentTarget) setActiveFieldId(null); }}>
          <div className="max-w-2xl mx-auto space-y-4 pb-32">
            
            {/* Form Header Block */}
            <div 
              className={`bg-white p-8 rounded-xl shadow-sm border transition-all cursor-pointer ${!activeFieldId ? 'border-indigo-400 ring-1 ring-indigo-400/20' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => setActiveFieldId(null)}
            >
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full text-3xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 p-0 mb-3 bg-transparent placeholder-slate-300"
                placeholder="Form Title"
              />
              <textarea 
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full text-slate-500 border-none focus:outline-none focus:ring-0 p-0 bg-transparent resize-none placeholder-slate-300"
                placeholder="Add a description for your form..."
                rows={2}
              />
            </div>

            {/* Fields List */}
            <div className="space-y-4">
              <AnimatePresence>
                {formData.schema.map((field, index) => {
                  const isActive = activeFieldId === field.id;
                  const isDragged = draggedIndex === index;
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
                      key={field.id}
                      onClick={(e) => { e.stopPropagation(); setActiveFieldId(field.id); }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrag={handleDrag}
                      className={`bg-white rounded-xl shadow-sm border transition-all group relative cursor-grab active:cursor-grabbing ${isActive ? 'border-indigo-400 ring-1 ring-indigo-400/20' : 'border-slate-200 hover:border-slate-300'} ${isDragged ? 'opacity-50 scale-[0.98]' : 'opacity-100'}`}
                    >
                      {/* Drag Handle */}
                      <div className="absolute left-1/2 -top-3 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 z-10 pointer-events-none">
                        <GripVertical size={16} />
                      </div>

                      {isActive && <div className="absolute -left-px top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>}
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                              {field.label || 'Untitled Question'}
                              {field.required && <span className="text-rose-500 ml-1">*</span>}
                            </h3>
                          </div>

                          {/* Actions */}
                          <div className={`flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                      {/* Canvas Preview of Input */}
                      <div className="pointer-events-none opacity-80">
                        {(field.type === 'short_answer' || field.type === 'email' || field.type === 'number') && (
                          <div className="border-b border-slate-300 pb-2 w-2/3 text-slate-400 text-sm">
                            {field.placeholder || `Enter ${field.type.replace('_', ' ')}...`}
                          </div>
                        )}
                        {field.type === 'long_answer' && (
                          <div className="border border-slate-300 rounded-md p-3 h-24 text-slate-400 text-sm w-full bg-slate-50/50">
                            {field.placeholder || 'Long answer text...'}
                          </div>
                        )}
                        {(field.type === 'multiple_choice' || field.type === 'checkboxes') && (
                          <div className="space-y-3">
                            {(field.options || ['Option 1']).map((opt, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className={`w-4 h-4 border border-slate-300 ${field.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`}></div>
                                <span className="text-sm text-slate-700">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {field.type === 'dropdown' && (
                          <div className="border border-slate-300 rounded-md px-4 py-2 w-2/3 flex items-center justify-between text-slate-400 text-sm">
                            <span>Select an option</span>
                            <ChevronDown size={16} />
                          </div>
                        )}
                        {field.type === 'date' && (
                          <div className="border-b border-slate-300 pb-2 w-1/3 flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar size={16} /> MM/DD/YYYY
                          </div>
                        )}
                        {field.type === 'rating' && (
                          <div className="flex gap-2">
                            {[...Array(field.maxRating || 5)].map((_, i) => <Star key={i} size={24} className="text-slate-200" />)}
                          </div>
                        )}
                        {field.type === 'file_upload' && (
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Upload size={24} />
                            <span className="text-sm font-medium">Click to upload file</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Add Button between fields */}
                    <div className="absolute -bottom-[24px] left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="w-full h-px bg-indigo-300 absolute pointer-events-none"></div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addField('short_answer', index + 1); }} 
                        className="relative bg-white border border-indigo-300 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full p-1.5 transition-colors shadow-sm pointer-events-auto"
                        title="Add question here"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            </div>
            
            {formData.schema.length === 0 && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500 font-medium">Your form is empty.</p>
                <p className="text-slate-400 text-sm mt-1">Click a field type on the left to add it here.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 flex-shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{!activeField ? 'Form Settings' : 'Properties'}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {!activeField ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Collect Email Addresses</label>
                  <Dropdown 
                    value={formData.settings?.collectEmails || 'do_not_collect'}
                    onChange={(e) => updateFormSettings({ collectEmails: e.target.value })}
                    options={[
                      { value: 'do_not_collect', label: 'Do not collect' },
                      { value: 'verified', label: 'Verified' },
                      { value: 'responder_input', label: 'Responder input' }
                    ]}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block">Make this a quiz</label>
                    <span className="text-xs text-slate-500">Assign points, set answers</span>
                  </div>
                  <button 
                    onClick={() => updateFormSettings({ isQuiz: !(formData.settings?.isQuiz) })}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${formData.settings?.isQuiz ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${formData.settings?.isQuiz ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block">Limit to 1 response</label>
                    <span className="text-xs text-slate-500">Requires sign-in</span>
                  </div>
                  <button 
                    onClick={() => updateFormSettings({ limitOneResponse: !(formData.settings?.limitOneResponse) })}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${formData.settings?.limitOneResponse ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${formData.settings?.limitOneResponse ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700">Allow response editing</label>
                  <button 
                    onClick={() => updateFormSettings({ allowEdit: !(formData.settings?.allowEdit) })}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${formData.settings?.allowEdit ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${formData.settings?.allowEdit ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700">Show progress bar</label>
                  <button 
                    onClick={() => updateFormSettings({ showProgressBar: !(formData.settings?.showProgressBar) })}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${formData.settings?.showProgressBar ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${formData.settings?.showProgressBar ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}></div>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirmation Message</label>
                  <textarea 
                    value={formData.settings?.confirmationMessage || 'Your response has been recorded.'}
                    onChange={(e) => updateFormSettings({ confirmationMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Field Label */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Field Label</label>
                  <textarea 
                    value={activeField.label}
                    onChange={(e) => updateActiveField({ label: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                    rows={2}
                  />
                </div>

                {/* Field Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Field Type</label>
                  <Dropdown 
                    value={activeField.type}
                    onChange={(e) => updateActiveField({ type: e.target.value })}
                    options={FIELD_TYPES.map(ft => ({ value: ft.id, label: ft.label }))}
                  />
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <label className="text-sm font-semibold text-slate-700">Required Field</label>
                  <button 
                    onClick={() => updateActiveField({ required: !activeField.required })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${activeField.required ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${activeField.required ? 'translate-x-[22px]' : 'translate-x-[3px]'}`}></div>
                  </button>
                </div>

                {/* Points (if quiz) */}
                {formData.settings?.isQuiz && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Points</label>
                    <input 
                      type="number" 
                      min="0"
                      value={activeField.points || 0}
                      onChange={(e) => updateActiveField({ points: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                )}

                {/* Placeholder (if applicable) */}
                {['short_answer', 'long_answer', 'email', 'number'].includes(activeField.type) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Placeholder text</label>
                    <input 
                      type="text" 
                      value={activeField.placeholder || ''}
                      onChange={(e) => updateActiveField({ placeholder: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                )}

                {/* Options (if applicable) */}
                {['multiple_choice', 'checkboxes', 'dropdown'].includes(activeField.type) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Options {formData.settings?.isQuiz && <span className="text-indigo-500 ml-1 font-medium capitalize">(Select Correct)</span>}
                    </label>
                    <div className="space-y-2">
                      {(activeField.options || []).map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {formData.settings?.isQuiz && (
                            <input 
                              type={activeField.type === 'checkboxes' ? 'checkbox' : 'radio'}
                              name={`correct_${activeField.id}`}
                              checked={
                                activeField.type === 'checkboxes'
                                  ? (activeField.correctAnswers || []).includes(opt)
                                  : activeField.correctAnswer === opt
                              }
                              onChange={(e) => {
                                if (activeField.type === 'checkboxes') {
                                  const current = activeField.correctAnswers || [];
                                  if (e.target.checked) {
                                    updateActiveField({ correctAnswers: [...current, opt] });
                                  } else {
                                    updateActiveField({ correctAnswers: current.filter(ans => ans !== opt) });
                                  }
                                } else {
                                  updateActiveField({ correctAnswer: opt });
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 cursor-pointer"
                              title="Mark as correct"
                            />
                          )}
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...activeField.options];
                              const oldVal = newOptions[idx];
                              const newVal = e.target.value;
                              newOptions[idx] = newVal;
                              
                              const updates = { options: newOptions };
                              if (formData.settings?.isQuiz) {
                                if (activeField.type === 'checkboxes') {
                                  if ((activeField.correctAnswers || []).includes(oldVal)) {
                                    updates.correctAnswers = (activeField.correctAnswers || []).map(ans => ans === oldVal ? newVal : ans);
                                  }
                                } else {
                                  if (activeField.correctAnswer === oldVal) {
                                    updates.correctAnswer = newVal;
                                  }
                                }
                              }
                              updateActiveField(updates);
                            }}
                            className={`flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 ${(formData.settings?.isQuiz && (activeField.type === 'checkboxes' ? (activeField.correctAnswers || []).includes(opt) : activeField.correctAnswer === opt)) ? 'border-indigo-300 bg-indigo-50/30' : ''}`}
                          />
                          <button 
                            onClick={() => {
                              const newOptions = activeField.options.filter((_, i) => i !== idx);
                              const updates = { options: newOptions.length ? newOptions : [''] };
                              if (formData.settings?.isQuiz) {
                                if (activeField.type === 'checkboxes') {
                                  updates.correctAnswers = (activeField.correctAnswers || []).filter(ans => ans !== opt);
                                } else if (activeField.correctAnswer === opt) {
                                  updates.correctAnswer = null;
                                }
                              }
                              updateActiveField(updates);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => updateActiveField({ options: [...(activeField.options || []), `Option ${(activeField.options?.length || 0) + 1}`] })}
                        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Rating Max (if applicable) */}
                {activeField.type === 'rating' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maximum Rating</label>
                    <Dropdown 
                      value={activeField.maxRating || 5}
                      onChange={(e) => updateActiveField({ maxRating: parseInt(e.target.value) })}
                      options={[
                        { value: 3, label: '3 Stars' },
                        { value: 5, label: '5 Stars' },
                        { value: 10, label: '10 Stars' }
                      ]}
                    />
                  </div>
                )}

              </div>
            )}
          </div>
        </aside>

      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsPublishModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Publish Form</h3>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Link size={16} className="text-indigo-500" /> Share Link
                  </h4>
                  <p className="text-sm text-slate-500 mb-3">Copy this link to collect responses.</p>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value={`https://formnest.app/f/${id}`} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://formnest.app/f/${id}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[90px] justify-center"
                    >
                      {copied ? <><CheckSquare size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Users size={16} className="text-indigo-500" /> Manage Access
                  </h4>
                  <p className="text-sm text-slate-500 mb-3">Add collaborators to help edit this form.</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="email" 
                      placeholder="Email address..." 
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Invite
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                          {user?.displayName ? user.displayName.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{user?.displayName || 'You'}</p>
                          <p className="text-xs text-slate-500">{user?.email || 'owner@example.com'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Owner</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsPublishModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormEditor;
