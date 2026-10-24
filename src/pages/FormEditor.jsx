import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_NAME, ROUTES } from '../constants/config';
import { useAppContext } from '../context/AppContext';
import Dropdown from '../components/Dropdown';
import templatesData from '../data/templates.json';
import { 
  ArrowLeft, Eye, Save, Settings, Share2, Type, 
  Hash, Mail, Phone, ChevronDown, ChevronLeft, CheckSquare, 
  Calendar, Upload, Star, AlignLeft, Grid, MoreVertical, Plus, Trash2, Copy, GripVertical, ArrowUp, ArrowDown,
  X, Users, Link, Layers, Pencil, Check, SplitSquareVertical
} from 'lucide-react';

const FIELD_TYPES = [
  { id: 'short_answer', label: 'Short Answer', icon: Type },
  { id: 'long_answer', label: 'Paragraph', icon: AlignLeft },
  { id: 'multiple_choice', label: 'Multiple Choice', icon: Grid },
  { id: 'checkboxes', label: 'Checkboxes', icon: CheckSquare },
  { id: 'multiple_choice_grid', label: 'MC Grid', icon: Grid },
  { id: 'tick_box_grid', label: 'Tick Box Grid', icon: CheckSquare },
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
  const [editingPartitionId, setEditingPartitionId] = useState(null);
  const [partitionNameDraft, setPartitionNameDraft] = useState('');
  // For add-partition-at-position modal
  const [addPartitionAt, setAddPartitionAt] = useState(null); // index to insert after, or null
  const [partitionModalOpen, setPartitionModalOpen] = useState(false);
  const [newPartitionName, setNewPartitionName] = useState('');
  const [newPartitionAllowBack, setNewPartitionAllowBack] = useState(true);
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
      ...( ['multiple_choice', 'checkboxes', 'dropdown'].includes(type) ? { options: ['Option 1'] } : {} ),
      ...( ['multiple_choice_grid', 'tick_box_grid'].includes(type) ? { rows: ['Row 1', 'Row 2'], columns: ['Column 1', 'Column 2', 'Column 3'] } : {} )
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

  // Open modal to add partition at a specific position
  const openAddPartitionModal = (insertAfterIndex) => {
    setAddPartitionAt(insertAfterIndex);
    setNewPartitionName('');
    setNewPartitionAllowBack(true);
    setPartitionModalOpen(true);
  };

  const confirmAddPartition = () => {
    const name = newPartitionName.trim() || 'New Section';
    const newPartition = {
      id: 'partition_' + Date.now(),
      type: '__partition__',
      label: name,
      allowBack: newPartitionAllowBack,
    };
    const insertIndex = addPartitionAt === null ? formData.schema.length : addPartitionAt + 1;
    const newSchema = [...formData.schema];
    newSchema.splice(insertIndex, 0, newPartition);
    setFormData({ ...formData, schema: newSchema });
    setPartitionModalOpen(false);
    setNewPartitionName('');
    setNewPartitionAllowBack(true);
    setAddPartitionAt(null);
  };

  const deleteField = (fieldId) => {
    setFormData({ ...formData, schema: formData.schema.filter(f => f.id !== fieldId) });
    if (activeFieldId === fieldId) setActiveFieldId(null);
  };

  const updatePartitionName = (partitionId, name) => {
    const newSchema = formData.schema.map(f =>
      f.id === partitionId ? { ...f, label: name } : f
    );
    setFormData({ ...formData, schema: newSchema });
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
    if (clientY === 0) return;
    const container = scrollContainerRef.current;
    const { top, bottom } = container.getBoundingClientRect();
    const threshold = 100;
    const scrollSpeed = 15;
    if (clientY - top < threshold) {
      container.scrollTop -= scrollSpeed;
    } else if (bottom - clientY < threshold) {
      container.scrollTop += scrollSpeed;
    }
  };

  // Count partitions for display
  const partitionCount = formData.schema.filter(f => f.type === '__partition__').length;

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
            {/* Add Partition Button */}
            <div className="mb-4">
              <button
                onClick={() => openAddPartitionModal(null)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 rounded-lg cursor-pointer hover:from-violet-100 hover:to-indigo-100 hover:border-indigo-300 transition-all text-indigo-700 font-medium text-sm group"
              >
                <SplitSquareVertical size={16} className="text-indigo-500 group-hover:text-indigo-600" />
                Add Section / Partition
              </button>
              {partitionCount > 0 && (
                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  {partitionCount} partition{partitionCount > 1 ? 's' : ''} in form
                </p>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Fields</div>
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

                  // --- Partition Divider ---
                  if (field.type === '__partition__') {
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        key={field.id}
                        className="relative group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrag={handleDrag}
                      >
                        {/* Partition Header Card */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md px-6 py-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                              <Layers size={16} className="text-white" />
                            </div>
                            {editingPartitionId === field.id ? (
                              <input
                                autoFocus
                                value={partitionNameDraft}
                                onChange={e => setPartitionNameDraft(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updatePartitionName(field.id, partitionNameDraft || 'New Section');
                                    setEditingPartitionId(null);
                                  }
                                  if (e.key === 'Escape') setEditingPartitionId(null);
                                }}
                                className="flex-1 bg-white/20 text-white placeholder-white/60 font-bold text-base rounded-md px-3 py-1 focus:outline-none focus:bg-white/30 border border-white/30"
                                placeholder="Section name..."
                              />
                            ) : (
                              <span className="font-bold text-white text-base truncate">{field.label || 'New Section'}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {editingPartitionId === field.id ? (
                              <button
                                onClick={() => {
                                  updatePartitionName(field.id, partitionNameDraft || 'New Section');
                                  setEditingPartitionId(null);
                                }}
                                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
                                title="Save name"
                              >
                                <Check size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingPartitionId(field.id);
                                  setPartitionNameDraft(field.label || '');
                                }}
                                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Rename section"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteField(field.id)}
                              className="p-1.5 bg-white/20 hover:bg-red-400/40 text-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete section"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div className="p-1.5 text-white/60 cursor-grab" title="Drag to reorder">
                              <GripVertical size={14} />
                            </div>
                          </div>
                        </div>

                        {/* Add field or partition below this partition */}
                        <div className="absolute -bottom-[24px] left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                          <div className="w-full h-px bg-indigo-300 absolute pointer-events-none"></div>
                          <div className="flex gap-2 relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); addField('short_answer', index + 1); }} 
                              className="bg-white border border-indigo-300 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full p-1.5 transition-colors shadow-sm pointer-events-auto"
                              title="Add question here"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openAddPartitionModal(index); }} 
                              className="bg-white border border-violet-300 text-violet-500 hover:bg-violet-50 hover:text-violet-600 rounded-full p-1.5 transition-colors shadow-sm pointer-events-auto"
                              title="Add section here"
                            >
                              <SplitSquareVertical size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  // --- Regular Field ---
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
                        {(field.type === 'multiple_choice_grid' || field.type === 'tick_box_grid') && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr>
                                  <th className="text-left py-1.5 pr-3 text-slate-400 font-medium w-36"></th>
                                  {(field.columns || ['Col 1']).map((col, ci) => (
                                    <th key={ci} className="text-center py-1.5 px-2 text-slate-500 font-medium">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(field.rows || ['Row 1']).map((row, ri) => (
                                  <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-50/60' : ''}>
                                    <td className="py-2 pr-3 text-slate-600 text-xs">{row}</td>
                                    {(field.columns || ['Col 1']).map((_, ci) => (
                                      <td key={ci} className="text-center py-2 px-2">
                                        <div className={`w-3.5 h-3.5 border border-slate-300 mx-auto ${ field.type === 'tick_box_grid' ? 'rounded' : 'rounded-full'}`}></div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

                    {/* Inline Add Buttons between fields */}
                    <div className="absolute -bottom-[24px] left-0 right-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className="w-full h-px bg-indigo-300 absolute pointer-events-none"></div>
                      <div className="flex gap-2 relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addField('short_answer', index + 1); }} 
                          className="bg-white border border-indigo-300 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full p-1.5 transition-colors shadow-sm pointer-events-auto"
                          title="Add question here"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openAddPartitionModal(index); }} 
                          className="bg-white border border-violet-300 text-violet-500 hover:bg-violet-50 hover:text-violet-600 rounded-full p-1.5 transition-colors shadow-sm pointer-events-auto"
                          title="Add section/partition here"
                        >
                          <SplitSquareVertical size={16} />
                        </button>
                      </div>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirmation Message</label>
                  <textarea 
                    value={formData.settings?.confirmationMessage || 'Your response has been recorded.'}
                    onChange={(e) => updateFormSettings({ confirmationMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                    rows={3}
                  />
                </div>

                {/* Sections Overview */}
                {partitionCount > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sections ({partitionCount})</label>
                    <div className="space-y-2">
                      {formData.schema.filter(f => f.type === '__partition__').map((p, i) => (
                        <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                          <span className="text-sm font-medium text-indigo-800 truncate">{p.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

                {/* Grid Rows & Columns (multiple_choice_grid / tick_box_grid) */}
                {['multiple_choice_grid', 'tick_box_grid'].includes(activeField.type) && (
                  <div className="space-y-5">
                    {/* Help Text */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Help Text</label>
                      <textarea
                        value={activeField.helpText || ''}
                        onChange={(e) => updateActiveField({ helpText: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                        rows={2}
                        placeholder="Optional sub-label..."
                      />
                    </div>

                    {/* Rows */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Rows <span className="text-indigo-500 normal-case ml-1">({(activeField.rows || []).length})</span>
                      </label>
                      <div className="space-y-2">
                        {(activeField.rows || []).map((row, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={row}
                              onChange={(e) => {
                                const newRows = [...(activeField.rows || [])];
                                newRows[idx] = e.target.value;
                                updateActiveField({ rows: newRows });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                              placeholder={`Row ${idx + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newRows = (activeField.rows || []).filter((_, i) => i !== idx);
                                updateActiveField({ rows: newRows.length ? newRows : ['Row 1'] });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateActiveField({ rows: [...(activeField.rows || []), `Row ${(activeField.rows?.length || 0) + 1}`] })}
                          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-1"
                        >
                          <Plus size={14} /> Add Row
                        </button>
                      </div>
                    </div>

                    {/* Columns */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Columns <span className="text-indigo-500 normal-case ml-1">({(activeField.columns || []).length})</span>
                      </label>
                      <div className="space-y-2">
                        {(activeField.columns || []).map((col, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={col}
                              onChange={(e) => {
                                const newCols = [...(activeField.columns || [])];
                                newCols[idx] = e.target.value;
                                updateActiveField({ columns: newCols });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                              placeholder={`Column ${idx + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newCols = (activeField.columns || []).filter((_, i) => i !== idx);
                                updateActiveField({ columns: newCols.length ? newCols : ['Column 1'] });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateActiveField({ columns: [...(activeField.columns || []), `Column ${(activeField.columns?.length || 0) + 1}`] })}
                          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-1"
                        >
                          <Plus size={14} /> Add Column
                        </button>
                      </div>
                    </div>

                    {/* Grid Type Badge */}
                    <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2.5 flex items-center gap-2 text-xs text-indigo-700">
                      {activeField.type === 'tick_box_grid' ? <CheckSquare size={13} /> : <Grid size={13} />}
                      <span className="font-medium">
                        {activeField.type === 'tick_box_grid' ? 'Tick Box Grid — multiple selections per row' : 'Multiple Choice Grid — single selection per row'}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </aside>

      </div>

      {/* Add Partition Modal */}
      <AnimatePresence>
        {partitionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setPartitionModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <SplitSquareVertical size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Add Section</h3>
                    <p className="text-white/70 text-sm">Create a new partition in your form</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Section Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={newPartitionName}
                    onChange={e => setNewPartitionName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmAddPartition(); if (e.key === 'Escape') setPartitionModalOpen(false); }}
                    placeholder="e.g. Personal Details, Work Experience..."
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-xs text-slate-400 mt-2">Leave blank to use "New Section"</p>
                </div>

                {/* Allow Backward Navigation Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${newPartitionAllowBack ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-slate-50'}`}
                  onClick={() => setNewPartitionAllowBack(v => !v)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${newPartitionAllowBack ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                      <ChevronLeft size={18} className={newPartitionAllowBack ? 'text-indigo-600' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Allow Backward Navigation</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {newPartitionAllowBack ? 'Back button will be visible to responders' : 'Responders cannot go back from this section'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-3 ${newPartitionAllowBack ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${newPartitionAllowBack ? 'translate-x-[26px]' : 'translate-x-1'}`} />
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setPartitionModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddPartition}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Add Section
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
