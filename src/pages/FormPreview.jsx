import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, CheckSquare, X, Users, Link, Copy, Star, Upload, Calendar, ChevronDown, ChevronRight, ChevronLeft, Layers, AlertCircle, Check, Lock } from 'lucide-react';
import templatesData from '../data/templates.json';

const FormPreview = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Partition navigation
  const [currentPartitionIndex, setCurrentPartitionIndex] = useState(0); // 0 = before first partition (or all if no partitions)
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [starHover, setStarHover] = useState({});
  const topRef = useRef(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(`form_draft_${id}`);
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    } else {
      const template = templatesData.find(t => t.id === id);
      if (template) {
        setFormData(JSON.parse(JSON.stringify(template)));
      } else {
        setFormData({ name: 'Form Not Found', description: '', schema: [] });
      }
    }
    setLoading(false);
  }, [id]);

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Build partition segments: each segment = { partitionId?, partitionLabel?, fields[] }
  const buildSegments = (schema) => {
    const segments = [];
    let currentSegment = { partitionId: null, partitionLabel: null, fields: [] };

    for (const item of schema) {
      if (item.type === '__partition__') {
        // Push current segment if it has fields (or it's the initial empty one)
        if (currentSegment.fields.length > 0 || segments.length === 0) {
          segments.push(currentSegment);
        }
        currentSegment = { partitionId: item.id, partitionLabel: item.label, allowBack: item.allowBack !== false, fields: [] };
      } else {
        currentSegment.fields.push(item);
      }
    }
    // Push last segment
    segments.push(currentSegment);
    return segments;
  };

  const segments = buildSegments(formData.schema);
  const hasPartitions = formData.schema.some(f => f.type === '__partition__');
  const totalSegments = segments.length;
  const currentSegment = segments[currentPartitionIndex] || segments[0];
  const isLastSegment = currentPartitionIndex === totalSegments - 1;
  // Back is allowed only if the current section has allowBack enabled (first section always shows back if index > 0)
  const showBackButton = currentPartitionIndex > 0 && currentSegment.allowBack !== false;

  // Count total required fields answered
  const allFields = formData.schema.filter(f => f.type !== '__partition__');
  const requiredFields = allFields.filter(f => f.required);
  const answeredRequired = requiredFields.filter(f => {
    const ans = answers[f.id];
    return ans !== undefined && ans !== '' && ans !== null && !(Array.isArray(ans) && ans.length === 0);
  });
  const progressPct = requiredFields.length === 0 
    ? Math.round((currentPartitionIndex / Math.max(totalSegments - 1, 1)) * 100)
    : Math.round((answeredRequired.length / requiredFields.length) * 100);

  const setAnswer = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
    }
  };

  // Validate current segment's required fields
  const validateCurrentSegment = () => {
    const newErrors = {};
    for (const field of currentSegment.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = 'This field is required';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentSegment()) return;
    if (!isLastSegment) {
      setCurrentPartitionIndex(i => i + 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Submit
      setSubmitted(true);
    }
  };

  const goPrev = () => {
    if (currentPartitionIndex > 0) {
      setCurrentPartitionIndex(i => i - 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderField = (field) => {
    const hasError = !!errors[field.id];

    switch (field.type) {
      case 'short_answer':
      case 'email':
      case 'number':
        return (
          <div>
            <input 
              type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
              placeholder={field.placeholder || 'Your answer'}
              value={answers[field.id] || ''}
              onChange={e => setAnswer(field.id, e.target.value)}
              className={`w-full rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 transition-all placeholder:text-[#3C3C43]/40 ${hasError ? 'bg-rose-50 ring-2 ring-rose-400/50 border border-rose-300' : 'bg-[#767680]/10 focus:ring-blue-500/50'}`}
            />
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'long_answer':
        return (
          <div>
            <textarea 
              placeholder={field.placeholder || 'Your answer'}
              rows={4}
              value={answers[field.id] || ''}
              onChange={e => setAnswer(field.id, e.target.value)}
              className={`w-full rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 transition-all resize-y placeholder:text-[#3C3C43]/40 ${hasError ? 'bg-rose-50 ring-2 ring-rose-400/50 border border-rose-300' : 'bg-[#767680]/10 focus:ring-blue-500/50'}`}
            />
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'multiple_choice':
        return (
          <div>
            <div className={`space-y-2 mt-2 rounded-[14px] ${hasError ? 'ring-2 ring-rose-400/40 bg-rose-50/30 p-2' : ''}`}>
              {(field.options || ['Option 1']).map((opt, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer p-3 rounded-[10px] hover:bg-[#767680]/5 transition-colors">
                  <input 
                    type="radio" 
                    name={field.id} 
                    value={opt}
                    checked={answers[field.id] === opt}
                    onChange={() => setAnswer(field.id, opt)}
                    className="w-5 h-5 accent-blue-500" 
                  />
                  <span className="text-[17px] text-black">{opt}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'checkboxes':
        return (
          <div>
            <div className={`space-y-2 mt-2 rounded-[14px] ${hasError ? 'ring-2 ring-rose-400/40 bg-rose-50/30 p-2' : ''}`}>
              {(field.options || ['Option 1']).map((opt, i) => {
                const checked = (answers[field.id] || []).includes(opt);
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer p-3 rounded-[10px] hover:bg-[#767680]/5 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-500 rounded-[4px]" 
                      checked={checked}
                      onChange={e => {
                        const prev = answers[field.id] || [];
                        if (e.target.checked) {
                          setAnswer(field.id, [...prev, opt]);
                        } else {
                          setAnswer(field.id, prev.filter(v => v !== opt));
                        }
                      }}
                    />
                    <span className="text-[17px] text-black">{opt}</span>
                  </label>
                );
              })}
            </div>
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'dropdown':
        return (
          <div>
            <div className="relative mt-2">
              <select 
                className={`w-full rounded-[10px] py-3 pl-4 pr-10 appearance-none focus:outline-none focus:ring-2 text-[17px] cursor-pointer transition-all ${hasError ? 'bg-rose-50 ring-2 ring-rose-400/50 text-rose-400' : 'bg-[#767680]/10 focus:ring-blue-500/50 text-black'}`}
                value={answers[field.id] || ''}
                onChange={e => setAnswer(field.id, e.target.value)}
              >
                <option value="" disabled>Select an option</option>
                {(field.options || ['Option 1']).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C3C43]/60 pointer-events-none" />
            </div>
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'date':
        return (
          <div className="mt-2">
            <input 
              type="date" 
              className={`w-full rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 transition-all ${hasError ? 'bg-rose-50 ring-2 ring-rose-400/50' : 'bg-[#767680]/10 focus:ring-blue-500/50'}`}
              value={answers[field.id] || ''}
              onChange={e => setAnswer(field.id, e.target.value)}
            />
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'rating':
        return (
          <div>
            <div className="flex gap-2 mt-2">
              {[...Array(field.maxRating || 5)].map((_, i) => {
                const val = i + 1;
                const currentVal = answers[field.id] || 0;
                const hoverVal = starHover[field.id] || 0;
                const filled = hoverVal ? val <= hoverVal : val <= currentVal;
                return (
                  <Star 
                    key={i} 
                    size={32} 
                    className={`cursor-pointer transition-all ${filled ? 'text-amber-400 fill-amber-400' : 'text-[#3C3C43]/20 hover:text-amber-300'}`}
                    onMouseEnter={() => setStarHover(prev => ({ ...prev, [field.id]: val }))}
                    onMouseLeave={() => setStarHover(prev => ({ ...prev, [field.id]: 0 }))}
                    onClick={() => setAnswer(field.id, val)}
                  />
                );
              })}
            </div>
            {hasError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-sm">
                <AlertCircle size={14} />
                <span>{errors[field.id]}</span>
              </div>
            )}
          </div>
        );
      case 'file_upload':
        return (
          <div className="mt-2 border-2 border-dashed border-[#3C3C43]/20 rounded-[14px] p-6 flex flex-col items-center justify-center hover:bg-[#767680]/5 transition-colors cursor-pointer bg-white">
            <Upload size={28} className="text-blue-500 mb-2" />
            <span className="font-semibold text-[15px] text-black">Upload File</span>
            <span className="text-[13px] mt-1 text-[#3C3C43]/60">Tap to select a file</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Response Submitted!</h1>
          <p className="text-slate-500 text-base">
            {formData.settings?.confirmationMessage || 'Your response has been recorded.'}
          </p>
          <button
            onClick={() => { setSubmitted(false); setCurrentPartitionIndex(0); setAnswers({}); setErrors({}); }}
            className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Submit Another Response
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-black selection:bg-blue-500/30 flex">

      {/* Left Progress Bar Panel */}
      {hasPartitions && (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#3C3C43]/10 z-30 shadow-sm">
          {/* Header */}
          <div className="px-5 py-6 border-b border-[#3C3C43]/10">
            <p className="text-[11px] font-bold text-[#3C3C43]/50 uppercase tracking-widest mb-1">Your Progress</p>
            <h2 className="text-base font-bold text-slate-900 leading-snug truncate">{formData.name}</h2>
          </div>

          {/* Progress Bar */}
          <div className="px-5 py-4 border-b border-[#3C3C43]/8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Completion</span>
              <span className="text-xs font-bold text-indigo-600">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {answeredRequired.length} of {requiredFields.length} required answered
            </p>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-[10px] font-bold text-[#3C3C43]/40 uppercase tracking-widest mb-3 px-1">Sections</p>
            <div className="space-y-1">
              {segments.map((seg, i) => {
                const isActive = i === currentPartitionIndex;
                const isDone = i < currentPartitionIndex;
                // Sidebar back-navigation is blocked if the current section disallows going back
                const sidebarBackBlocked = !showBackButton;
                const isClickable = isDone && !sidebarBackBlocked;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isClickable) setCurrentPartitionIndex(i);
                    }}
                    disabled={i > currentPartitionIndex || (isDone && sidebarBackBlocked)}
                    title={isDone && sidebarBackBlocked ? 'Backward navigation is disabled for this section' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 border border-indigo-200'
                        : isClickable
                          ? 'bg-green-50/60 hover:bg-green-50 cursor-pointer'
                          : isDone && sidebarBackBlocked
                            ? 'bg-slate-100 opacity-50 cursor-not-allowed'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isClickable
                          ? 'bg-green-500 text-white'
                          : isDone && sidebarBackBlocked
                            ? 'bg-slate-300 text-slate-500'
                            : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isClickable ? <Check size={14} /> : isDone && sidebarBackBlocked ? <Lock size={12} /> : i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-indigo-700' : isClickable ? 'text-green-700' : 'text-slate-500'}`}>
                        {seg.partitionLabel || (i === 0 && !seg.partitionId ? formData.name : `Section ${i + 1}`)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isDone && sidebarBackBlocked && !isActive
                          ? 'Navigation locked'
                          : `${seg.fields.length} field${seg.fields.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[#3C3C43]/8">
            <div className="flex items-center gap-2 text-[12px] text-slate-400">
              <div className="w-4 h-4 rounded bg-rose-100 border border-rose-200 flex items-center justify-center">
                <span className="text-rose-500 text-[9px] font-bold">*</span>
              </div>
              Required fields must be filled
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${hasPartitions ? 'md:ml-64' : ''} pb-24`}>
        {/* Action Bar */}
        <div className="fixed top-0 right-0 left-0 h-[60px] bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-[#3C3C43]/10 z-20 flex items-center justify-between px-4 sm:px-6" style={{ left: hasPartitions ? undefined : 0 }}>
          <div className={`text-[13px] font-semibold tracking-wide text-[#3C3C43]/50 ${hasPartitions ? 'md:ml-64' : ''}`}>
            PREVIEW MODE
          </div>
          <button onClick={() => setIsPublishModalOpen(true)} className="text-blue-500 font-semibold text-[17px] hover:text-blue-600 transition-colors active:opacity-70">
            Publish
          </button>
        </div>

        {/* Mobile Progress Bar (top) */}
        {hasPartitions && (
          <div className="md:hidden fixed top-[60px] left-0 right-0 z-10 bg-white border-b border-[#3C3C43]/10 px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500">
                {currentSegment.partitionLabel || formData.name} — Section {currentPartitionIndex + 1} of {totalSegments}
              </span>
              <span className="text-xs font-bold text-indigo-600">{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <div ref={topRef} className={`max-w-2xl mx-auto px-4 sm:px-6 relative ${hasPartitions ? 'mt-[120px] md:mt-[100px]' : 'mt-[100px]'}`}>
          
          {/* Form Title (first segment or always) */}
          {currentPartitionIndex === 0 && (
            <div className="mb-8 px-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
                {formData.name}
              </h1>
              {formData.description && (
                <p className="text-[17px] leading-relaxed text-[#3C3C43]/70">{formData.description}</p>
              )}
            </div>
          )}

          {/* Partition Header (for subsequent sections) */}
          {currentPartitionIndex > 0 && currentSegment.partitionLabel && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPartitionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-8 px-2"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Layers size={16} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
                    Section {currentPartitionIndex + 1} of {totalSegments}
                  </p>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-black">
                  {currentSegment.partitionLabel}
                </h1>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Email collect field */}
          {formData.settings?.collectEmails && currentPartitionIndex === 0 && (
            <div className="bg-white rounded-[20px] p-6 mb-6 shadow-sm">
              <label className="block text-[15px] font-semibold text-black mb-3">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input 
                type="email" 
                placeholder="name@example.com"
                value={answers['__email__'] || ''}
                onChange={e => setAnswer('__email__', e.target.value)}
                className="w-full bg-[#767680]/10 rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#3C3C43]/40"
              />
            </div>
          )}

          {/* Fields for current segment */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPartitionIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {currentSegment.fields.length === 0 ? (
                <div className="text-center py-12 text-[#3C3C43]/40">
                  <p>No fields in this section.</p>
                </div>
              ) : (
                currentSegment.fields.map((field) => (
                  <motion.div 
                    key={field.id} 
                    layout
                    className={`bg-white rounded-[20px] p-6 shadow-sm transition-all ${errors[field.id] ? 'ring-2 ring-rose-400/30' : ''}`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[17px] font-semibold text-black leading-snug">
                          {field.label || 'Untitled Question'}
                          {field.required && <span className="text-rose-500 ml-1 text-[17px]">*</span>}
                        </h3>
                        {field.helpText && (
                          <p className="text-[15px] text-[#3C3C43]/60 mt-1">{field.helpText}</p>
                        )}
                      </div>
                      {formData.settings?.isQuiz && field.points > 0 && (
                        <div className="text-[13px] font-semibold text-[#3C3C43]/60 whitespace-nowrap bg-[#767680]/10 px-2.5 py-1 rounded-[6px]">
                          {field.points} {field.points === 1 ? 'pt' : 'pts'}
                        </div>
                      )}
                    </div>
                    <div>
                      {renderField(field)}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {/* Back button — only shown when allowed by the section setting */}
            <div>
              {showBackButton && (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-2 px-5 py-3 border border-[#3C3C43]/20 text-black rounded-[14px] font-semibold text-[17px] transition-colors hover:bg-[#767680]/10 focus:outline-none"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              )}
            </div>

            {/* Next / Submit — right-aligned, auto width */}
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-[14px] font-semibold text-[17px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#F2F2F7] ml-auto"
            >
              {isLastSegment ? 'Submit Form' : (
                <>Next <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
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

export default FormPreview;
