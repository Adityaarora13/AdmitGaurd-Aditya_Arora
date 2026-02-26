/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  User, 
  GraduationCap, 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  Hash,
  Award,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Qualification = 'B.Tech' | 'B.E.' | 'B.Sc' | 'BCA' | 'M.Tech' | 'M.Sc' | 'MCA' | 'MBA';
type InterviewStatus = 'Cleared' | 'Waitlisted' | 'Rejected';
type ScoreMode = 'percentage' | 'cgpa';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  aadhaar: string;
  qualification: Qualification | '';
  graduationYear: string;
  scoreMode: ScoreMode;
  score: string;
  screeningScore: string;
  interviewStatus: InterviewStatus | '';
  offerLetterSent: boolean;
}

const INITIAL_DATA: FormData = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  aadhaar: '',
  qualification: '',
  graduationYear: '',
  scoreMode: 'percentage',
  score: '',
  screeningScore: '',
  interviewStatus: '',
  offerLetterSent: false,
};

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Academic Details', icon: GraduationCap },
    { id: 3, title: 'Admission Status', icon: ClipboardCheck },
  ];

  // Basic validation for button state (as requested, structure only, no heavy logic yet)
  const isStepValid = useMemo(() => {
    if (step === 1) {
      return formData.fullName && formData.email && formData.phone.length === 10 && formData.aadhaar.length === 12;
    }
    if (step === 2) {
      return formData.qualification && formData.graduationYear && formData.score;
    }
    if (step === 3) {
      return formData.screeningScore && formData.interviewStatus;
    }
    return false;
  }, [step, formData]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid && step === 3) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Admission Submitted</h2>
          <p className="text-zinc-500 mb-8">The candidate profile for <span className="font-medium text-zinc-900">{formData.fullName}</span> has been successfully recorded.</p>
          <button 
            onClick={() => { setIsSubmitted(false); setStep(1); setFormData(INITIAL_DATA); }}
            className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
          >
            Register Another Candidate
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Candidate Admission</h1>
          <p className="text-zinc-500">Complete the enrollment process for new applicants</p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-10 flex justify-between relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive ? 'bg-zinc-900 text-white scale-110 shadow-lg' : 
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-zinc-200 text-zinc-400'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-xs font-medium uppercase tracking-wider ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Full Name" icon={User}>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Email Address" icon={Mail}>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Phone Number" icon={Phone}>
                      <input 
                        type="tel" 
                        placeholder="10-digit number"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Date of Birth" icon={Calendar}>
                      <input 
                        type="date" 
                        value={formData.dob}
                        onChange={(e) => updateField('dob', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="Aadhaar Number" icon={Hash}>
                        <input 
                          type="text" 
                          placeholder="12-digit Aadhaar"
                          maxLength={12}
                          value={formData.aadhaar}
                          onChange={(e) => updateField('aadhaar', e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                        />
                      </FormField>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Highest Qualification" icon={GraduationCap}>
                      <select 
                        value={formData.qualification}
                        onChange={(e) => updateField('qualification', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all appearance-none"
                      >
                        <option value="">Select Qualification</option>
                        {['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'M.Tech', 'M.Sc', 'MCA', 'MBA'].map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Graduation Year" icon={Calendar}>
                      <input 
                        type="number" 
                        min="2015" 
                        max="2025"
                        placeholder="2015 - 2025"
                        value={formData.graduationYear}
                        onChange={(e) => updateField('graduationYear', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                          <Award className="w-4 h-4 text-zinc-400" />
                          Academic Performance
                        </label>
                        <div className="flex bg-zinc-100 p-1 rounded-lg">
                          <button 
                            type="button"
                            onClick={() => updateField('scoreMode', 'percentage')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${formData.scoreMode === 'percentage' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                          >
                            Percentage
                          </button>
                          <button 
                            type="button"
                            onClick={() => updateField('scoreMode', 'cgpa')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${formData.scoreMode === 'cgpa' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                          >
                            CGPA
                          </button>
                        </div>
                      </div>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder={formData.scoreMode === 'percentage' ? 'e.g. 85.5' : 'e.g. 8.5'}
                        value={formData.score}
                        onChange={(e) => updateField('score', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                      <div className="mt-1 h-5 text-[10px] text-zinc-400 uppercase tracking-widest">
                        Validation message area
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Screening Test Score" icon={ClipboardCheck}>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        placeholder="0 - 100"
                        value={formData.screeningScore}
                        onChange={(e) => updateField('screeningScore', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Interview Status" icon={Award}>
                      <select 
                        value={formData.interviewStatus}
                        onChange={(e) => updateField('interviewStatus', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all appearance-none"
                      >
                        <option value="">Select Status</option>
                        {['Cleared', 'Waitlisted', 'Rejected'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FormField>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${formData.offerLetterSent ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-200 text-zinc-500'}`}>
                            <Send className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">Offer Letter Sent</p>
                            <p className="text-xs text-zinc-500">Has the formal offer been dispatched?</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField('offerLetterSent', !formData.offerLetterSent)}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
                            ${formData.offerLetterSent ? 'bg-zinc-900' : 'bg-zinc-200'}
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                              ${formData.offerLetterSent ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-10 pt-8 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-zinc-600 hover:bg-zinc-50'}
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid}
                  className={`
                    flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-xl font-medium transition-all
                    ${!isStepValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800 shadow-lg shadow-zinc-900/10'}
                  `}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid}
                  className={`
                    flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium transition-all
                    ${!isStepValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 shadow-lg shadow-emerald-600/10'}
                  `}
                >
                  Complete Enrollment
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
        
        <p className="mt-6 text-center text-xs text-zinc-400 uppercase tracking-widest">
          Internal Use Only • EduEnroll v1.0
        </p>
      </div>
    </div>
  );
}

function FormField({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        {label}
      </label>
      {children}
      <div className="h-5 text-[10px] text-zinc-400 uppercase tracking-widest">
        {/* Placeholder for validation messages */}
      </div>
    </div>
  );
}
