import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Phone, 
  Hash, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon, 
  BrainCircuit,
  Loader2,
  Send
} from 'lucide-react';
import { generateMascot, editMascot, brainstormProject } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface RegistrationProps {
  onBack: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    teamName: '',
    leadName: '',
    leadUSN: '',
    leadPhone: '',
    members: [
      { name: '', usn: '' },
      { name: '', usn: '' },
      { name: '', usn: '' },
      { name: '', usn: '' },
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index: number, field: 'name' | 'usn', value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const base = typeof import.meta.env.VITE_API_BASE === 'string' ? import.meta.env.VITE_API_BASE : '';
      const res = await fetch(`${base}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        const msg =
          data.error ||
          (res.status === 503
            ? 'Server not configured. Add MONGODB_URI in Vercel → Project → Settings → Environment Variables.'
            : res.status === 500
              ? 'Server error. Check Vercel logs and ensure MONGODB_URI is set.'
              : res.statusText || 'Registration failed');
        throw new Error(msg);
      }
      setIsRegistered(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-12 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 rounded-full bg-neon-blue/20 flex items-center justify-center mx-auto mb-8 border border-neon-blue/50 shadow-neon-blue/30 shadow-2xl">
            <CheckCircle2 size={48} className="text-neon-blue" />
          </div>
          <h2 className="text-4xl font-bold neon-text mb-4 uppercase tracking-tighter">TEAM REGISTERED</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Your data has been uploaded to the mainframe. Welcome to the Wired Weekend, <span className="text-neon-blue font-bold">{formData.teamName}</span>.
          </p>
          <button onClick={onBack} className="btn-futuristic w-full">RETURN TO BASE</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center">
      <div className="system-activity-indicator" />
      <div className="max-w-4xl w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-12 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-sm flex items-center justify-center border transition-all duration-500 ${
                  step >= s ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-neon-green/20 shadow-lg' : 'border-white/5 text-white/20'
                }`}
              >
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 md:w-24 h-[1px] mx-2 transition-all duration-500 ${step > s ? 'bg-neon-green/50' : 'bg-white/5'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Hash size={120} className="text-neon-green" />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Users className="text-neon-green" />
                  <h2 className="text-2xl font-bold uppercase tracking-widest">Team Identity</h2>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs uppercase tracking-widest text-white/40">Team Name</label>
                  <input 
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    placeholder="ENTER TEAM DESIGNATION..."
                    className="futuristic-input"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-8">
                  <User className="text-neon-green" />
                  <h2 className="text-2xl font-bold uppercase tracking-widest">Team Lead</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-white/40">Full Name</label>
                    <input 
                      name="leadName"
                      value={formData.leadName}
                      onChange={handleInputChange}
                      placeholder="LEAD NAME..."
                      className="futuristic-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-white/40">USN</label>
                    <input 
                      name="leadUSN"
                      value={formData.leadUSN}
                      onChange={handleInputChange}
                      placeholder="LEAD USN..."
                      className="futuristic-input"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs uppercase tracking-widest text-white/40">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input 
                        name="leadPhone"
                        value={formData.leadPhone}
                        onChange={handleInputChange}
                        placeholder="LEAD PHONE..."
                        className="futuristic-input pl-12"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="text-neon-green" />
                  <h2 className="text-2xl font-bold uppercase tracking-widest">Team Members</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formData.members.map((member, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neon-green uppercase tracking-widest">Member {idx + 1}</span>
                        {idx < 1 && <span className="text-[10px] text-neon-violet uppercase font-bold">Required</span>}
                      </div>
                      <input 
                        value={member.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        placeholder="NAME..."
                        className="futuristic-input text-sm"
                      />
                      <input 
                        value={member.usn}
                        onChange={(e) => handleMemberChange(idx, 'usn', e.target.value)}
                        placeholder="USN..."
                        className="futuristic-input text-sm"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
            <button 
              onClick={step === 1 ? onBack : prevStep}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase text-xs tracking-widest"
            >
              <ChevronLeft size={18} />
              {step === 1 ? 'ABORT' : 'PREVIOUS'}
            </button>
            
            {step < 3 ? (
              <button 
                onClick={nextStep}
                className="btn-futuristic flex items-center gap-2"
              >
                <span>CONTINUE</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-futuristic flex items-center gap-2 bg-neon-green/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>UPLOADING...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>SUBMIT REGISTRATION</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
