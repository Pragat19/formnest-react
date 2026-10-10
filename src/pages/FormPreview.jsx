import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, CheckSquare, X, Users, Link, Copy, Star, Upload, Calendar, ChevronDown } from 'lucide-react';
import templatesData from '../data/templates.json';

const FormPreview = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Attempt to load from draft first, then template
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderField = (field) => {
    switch (field.type) {
      case 'short_answer':
      case 'email':
      case 'number':
        return (
          <input 
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            placeholder="Your answer"
            className="w-full bg-[#767680]/10 rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#3C3C43]/40"
          />
        );
      case 'long_answer':
        return (
          <textarea 
            placeholder="Your answer"
            rows={4}
            className="w-full bg-[#767680]/10 rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y placeholder:text-[#3C3C43]/40"
          />
        );
      case 'multiple_choice':
        return (
          <div className="space-y-2 mt-2">
            {(field.options || ['Option 1']).map((opt, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer p-3 rounded-[10px] hover:bg-[#767680]/5 transition-colors">
                <input type="radio" name={field.id} className="w-5 h-5 accent-blue-500" />
                <span className="text-[17px] text-black">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkboxes':
        return (
          <div className="space-y-2 mt-2">
            {(field.options || ['Option 1']).map((opt, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer p-3 rounded-[10px] hover:bg-[#767680]/5 transition-colors">
                <input type="checkbox" className="w-5 h-5 accent-blue-500 rounded-[4px]" />
                <span className="text-[17px] text-black">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <div className="relative mt-2">
            <select className="w-full bg-[#767680]/10 rounded-[10px] py-3 pl-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[17px] text-black cursor-pointer transition-all">
              <option value="" disabled defaultValue>Select an option</option>
              {(field.options || ['Option 1']).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C3C43]/60 pointer-events-none" />
          </div>
        );
      case 'date':
        return (
          <div className="mt-2">
            <input type="date" className="w-full bg-[#767680]/10 rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>
        );
      case 'rating':
        return (
          <div className="flex gap-2 mt-2">
            {[...Array(field.maxRating || 5)].map((_, i) => (
              <Star key={i} size={32} className="text-[#3C3C43]/20 hover:text-amber-400 hover:fill-amber-400 cursor-pointer transition-all" />
            ))}
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

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-black pb-20 selection:bg-blue-500/30">
      {/* iOS Style Action Bar */}
      <div className="fixed top-0 left-0 right-0 h-[60px] bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-[#3C3C43]/10 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="text-[13px] font-semibold tracking-wide text-[#3C3C43]/50">
          PREVIEW MODE
        </div>
        <button onClick={() => setIsPublishModalOpen(true)} className="text-blue-500 font-semibold text-[17px] hover:text-blue-600 transition-colors active:opacity-70">
          Publish
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative mt-[100px]">
        {/* Title Section */}
        <div className="mb-8 px-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
            {formData.name}
          </h1>
          {formData.description && (
            <p className="text-[17px] leading-relaxed text-[#3C3C43]/70">{formData.description}</p>
          )}
        </div>

        {formData.settings?.collectEmails && (
          <div className="bg-white rounded-[20px] p-6 mb-6 shadow-sm">
            <label className="block text-[15px] font-semibold text-black mb-3">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="w-full bg-[#767680]/10 rounded-[10px] py-3 px-4 text-[17px] text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#3C3C43]/40"
            />
          </div>
        )}

        {/* Form Fields Section */}
        <div className="space-y-6">
          {formData.schema.map((field, index) => (
            <div key={field.id} className="bg-white rounded-[20px] p-6 shadow-sm">
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
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-3.5 rounded-[14px] font-semibold text-[17px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#F2F2F7]">
            Submit Form
          </button>
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
