/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  Send,
  AlertCircle
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

type FormErrors = { [key in keyof FormData]?: string };

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
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validation functions
  const validateField = (field: keyof FormData, value: any): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value) return 'Full Name cannot be blank.';
        if (value.length < 2) return 'Full Name must be at least 2 characters.';
        if (/\d/.test(value)) return 'Full Name cannot contain numbers.';
        return undefined;
      case 'email':
        if (!value) return 'Email cannot be blank.';
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'Invalid email format.';
        return undefined;
      case 'phone':
        if (!value) return 'Phone number cannot be blank.';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Must be exactly 10 digits and start with 6, 7, 8, or 9.';
        return undefined;
      case 'aadhaar':
        if (!value) return 'Aadhaar Number cannot be blank.';
        if (!/^\d{12}$/.test(value)) return 'Aadhaar Number must be exactly 12 digits.';
        return undefined;
      case 'qualification':
        if (!value) return 'Highest Qualification must be selected.';
        return undefined;
      case 'graduationYear':
        if (!value) return 'Graduation Year cannot be blank.';
        const year = parseInt(value);
        if (isNaN(year) || year < 2015 || year > 2025) return 'Graduation Year must be between 2015 and 2025.';
        return undefined;
      case 'score':
        if (!value) return 'Academic performance score cannot be blank.';
        const scoreValue = parseFloat(value);
        if (isNaN(scoreValue) || scoreValue <= 0) return 'Score must be a positive number.';
        if (formData.scoreMode === 'percentage' && (scoreValue > 100)) return 'Percentage cannot exceed 100.';
        if (formData.scoreMode === 'cgpa' && (scoreValue > 10)) return 'CGPA cannot exceed 10.';
        return undefined;
      case 'screeningScore':
        if (!value) return 'Screening Test Score cannot be blank.';
        const screening = parseInt(value);
        if (isNaN(screening) || screening < 0 || screening > 100) return 'Score must be between 0 and 100.';
        return undefined;
      case 'interviewStatus':
        if (!value) return 'Interview Status must be selected.';
        return undefined;
      case 'offerLetterSent':
        if (value === true && formData.interviewStatus === 'Rejected') {
          return 'Offer Letter cannot be sent if Interview Status is Rejected.';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAllFields = (): FormErrors => {
    const errors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    return errors;
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validate immediately after field update
    setValidationErrors(prev => ({ ...prev, [field]: validateField(field, value) }));

    // Special handling for dependent validations
    if (field === 'interviewStatus' || field === 'offerLetterSent') {
      setValidationErrors(prev => ({
        ...prev,
        interviewStatus: validateField('interviewStatus', formData.interviewStatus),
        offerLetterSent: validateField('offerLetterSent', field === 'offerLetterSent' ? value : formData.offerLetterSent),
      }));
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Academic Details', icon: GraduationCap },
    { id: 3, title: 'Admission Status', icon: ClipboardCheck },
  ];

  const currentStepErrors = useMemo(() => {
    const errors: FormErrors = {};
    if (step === 1) {
      if (validationErrors.fullName) errors.fullName = validationErrors.fullName;
      if (validationErrors.email) errors.email = validationErrors.email;
      if (validationErrors.phone) errors.phone = validationErrors.phone;
      if (validationErrors.aadhaar) errors.aadhaar = validationErrors.aadhaar;
    } else if (step === 2) {
      if (validationErrors.qualification) errors.qualification = validationErrors.qualification;
      if (validationErrors.graduationYear) errors.graduationYear = validationErrors.graduationYear;
      if (validationErrors.score) errors.score = validationErrors.score;
    } else if (step === 3) {
      if (validationErrors.screeningScore) errors.screeningScore = validationErrors.screeningScore;
      if (validationErrors.interviewStatus) errors.interviewStatus = validationErrors.interviewStatus;
      if (validationErrors.offerLetterSent) errors.offerLetterSent = validationErrors.offerLetterSent;
    }
    return errors;
  }, [step, validationErrors]);

  const isFormValid = useMemo(() => {
    const errors = validateAllFields();
    return Object.keys(errors).length === 0;
  }, [formData]); // Re-evaluate when formData changes

  const isStepValid = useMemo(() => {
    if (step === 1) {
      return !validationErrors.fullName && !validationErrors.email && !validationErrors.phone && !validationErrors.aadhaar &&
             formData.fullName && formData.email && formData.phone.length === 10 && formData.aadhaar.length === 12;
    }
    if (step === 2) {
      return !validationErrors.qualification && !validationErrors.graduationYear && !validationErrors.score &&
             formData.qualification && formData.graduationYear && formData.score;
    }
    if (step === 3) {
      return !validationErrors.screeningScore && !validationErrors.interviewStatus && !validationErrors.offerLetterSent &&
             formData.screeningScore && formData.interviewStatus;
    }
    return false;
  }, [step, formData, validationErrors]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAllFields();
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0 && step === 3) {
      setIsSubmitted(true);
    }
  };

  const isRejected = formData.interviewStatus === 'Rejected';
  const canSubmit = isFormValid && !isRejected;

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
            onClick={() => { setIsSubmitted(false); setStep(1); setFormData(INITIAL_DATA); setValidationErrors({}); }}
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

        {/* Rejected Banner */}
        <AnimatePresence>
          {isRejected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500 text-white p-4 rounded-xl mb-8 flex items-center gap-3 shadow-md"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Rejected candidates cannot be enrolled.</p>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <FormField label="Full Name" icon={User} error={validationErrors.fullName}>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Email Address" icon={Mail} error={validationErrors.email}>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Phone Number" icon={Phone} error={validationErrors.phone}>
                      <input 
                        type="tel" 
                        placeholder="10-digit number"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <FormField label="Date of Birth" icon={Calendar} error={validationErrors.dob}>
                      <input 
                        type="date" 
                        value={formData.dob}
                        onChange={(e) => updateField('dob', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="Aadhaar Number" icon={Hash} error={validationErrors.aadhaar}>
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
                    <FormField label="Highest Qualification" icon={GraduationCap} error={validationErrors.qualification}>
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
                    <FormField label="Graduation Year" icon={Calendar} error={validationErrors.graduationYear}>
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
                        className="w-full px-4 py-3 bg-zinc-500 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                      />
                      <div className="mt-1 h-5 text-[10px] text-red-500 uppercase tracking-widest">
                        {validationErrors.score}
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
                    <FormField label="Screening Test Score" icon={ClipboardCheck} error={validationErrors.screeningScore}>
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
                    <FormField label="Interview Status" icon={Award} error={validationErrors.interviewStatus}>
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
                      <div className="mt-1 h-5 text-[10px] text-red-500 uppercase tracking-widest">
                        {validationErrors.offerLetterSent}
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
                  disabled={!canSubmit}
                  className={`
                    flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium transition-all
                    ${!canSubmit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 shadow-lg shadow-emerald-600/10'}
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

function FormField({ label, icon: Icon, children, error }: { label: string, icon: any, children: React.ReactNode, error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        {label}
      </label>
      {children}
      <div className="h-5 text-[10px] text-red-500 uppercase tracking-widest">
        {error}
      </div>
    </div>
  );
}
