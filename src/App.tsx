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
  AlertCircle,
  AlertTriangle // Added for soft warnings
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
  dobException: boolean;
  dobRationale: string;
  aadhaar: string;
  qualification: Qualification | '';
  graduationYear: string;
  graduationYearException: boolean;
  graduationYearRationale: string;
  scoreMode: ScoreMode;
  score: string;
  scoreException: boolean;
  scoreRationale: string;
  screeningScore: string;
  screeningScoreException: boolean;
  screeningScoreRationale: string;
  interviewStatus: InterviewStatus | '';
  offerLetterSent: boolean;
}

type ValidationResult = { type: 'strict' | 'soft', message: string } | undefined;

interface SoftRuleState {
  isExcepted: boolean;
  rationale: string;
  rationaleError?: string;
}

type SoftRuleStates = { [field: string]: SoftRuleState };

const INITIAL_DATA: FormData = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  dobException: false,
  dobRationale: '',
  aadhaar: '',
  qualification: '',
  graduationYear: '',
  graduationYearException: false,
  graduationYearRationale: '',
  scoreMode: 'percentage',
  score: '',
  scoreException: false,
  scoreRationale: '',
  screeningScore: '',
  screeningScoreException: false,
  screeningScoreRationale: '',
  interviewStatus: '',
  offerLetterSent: false,
};

const RATIONALE_PHRASES = ["approved by", "special case", "documentation pending", "waiver granted"];





type FormErrors = { [key in keyof FormData]?: string };



export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [softRuleStates, setSoftRuleStates] = useState<SoftRuleStates>({
    dob: { isExcepted: INITIAL_DATA.dobException, rationale: INITIAL_DATA.dobRationale },
    graduationYear: { isExcepted: INITIAL_DATA.graduationYearException, rationale: INITIAL_DATA.graduationYearRationale },
    score: { isExcepted: INITIAL_DATA.scoreException, rationale: INITIAL_DATA.scoreRationale },
    screeningScore: { isExcepted: INITIAL_DATA.screeningScoreException, rationale: INITIAL_DATA.screeningScoreRationale },
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const { strictErrors, softErrors } = validateAllFields();
    setValidationErrors({ ...strictErrors, ...softErrors });
  }, [formData, softRuleStates]);

  // Validation functions
  const validateField = (field: keyof FormData, value: any): ValidationResult => {
    switch (field) {
      case 'fullName':
        if (!value) return { type: 'strict', message: 'Full Name cannot be blank.' };
        if (value.length < 2) return { type: 'strict', message: 'Full Name must be at least 2 characters.' };
        if (/\d/.test(value)) return { type: 'strict', message: 'Full Name cannot contain numbers.' };
        return undefined;
      case 'email':
        if (!value) return { type: 'strict', message: 'Email cannot be blank.' };
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return { type: 'strict', message: 'Invalid email format.' };
        return undefined;
      case 'phone':
        if (!value) return { type: 'strict', message: 'Phone number cannot be blank.' };
        if (!/^[6-9]\d{9}$/.test(value)) return { type: 'strict', message: 'Must be exactly 10 digits and start with 6, 7, 8, or 9.' };
        return undefined;
      case 'dob':
        if (!value) return { type: 'strict', message: 'Date of Birth cannot be blank.' };
        const dobDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 18 || age > 35) return { type: 'soft', message: 'Candidate must be between 18 and 35 years old.' };
        return undefined;
      case 'aadhaar':
        if (!value) return { type: 'strict', message: 'Aadhaar Number cannot be blank.' };
        if (!/^\d{12}$/.test(value)) return { type: 'strict', message: 'Aadhaar Number must be exactly 12 digits.' };
        return undefined;
      case 'qualification':
        if (!value) return { type: 'strict', message: 'Highest Qualification must be selected.' };
        return undefined;
      case 'graduationYear':
        if (!value) return { type: 'strict', message: 'Graduation Year cannot be blank.' };
        const year = parseInt(value);
        if (isNaN(year) || year < 2015 || year > 2025) return { type: 'soft', message: 'Graduation Year must be between 2015 and 2025.' };
        return undefined;
      case 'score':
        if (!value) return { type: 'strict', message: 'Academic performance score cannot be blank.' };
        const scoreValue = parseFloat(value);
        if (isNaN(scoreValue) || scoreValue <= 0) return { type: 'strict', message: 'Score must be a positive number.' };
        if (formData.scoreMode === 'percentage') {
          if (scoreValue > 100) return { type: 'strict', message: 'Percentage cannot exceed 100.' };
          if (scoreValue < 60) return { type: 'soft', message: 'Percentage must be at least 60%.' };
        } else if (formData.scoreMode === 'cgpa') {
          if (scoreValue > 10) return { type: 'strict', message: 'CGPA cannot exceed 10.' };
          if (scoreValue < 6.0) return { type: 'soft', message: 'CGPA must be at least 6.0.' };
        }
        return undefined;
      case 'screeningScore':
        if (!value) return { type: 'strict', message: 'Screening Test Score cannot be blank.' };
        const screening = parseInt(value);
        if (isNaN(screening) || screening < 0 || screening > 100) return { type: 'strict', message: 'Score must be between 0 and 100.' };
        if (screening < 40) return { type: 'soft', message: 'Screening Test Score must be at least 40.' };
        return undefined;
      case 'interviewStatus':
        if (!value) return { type: 'strict', message: 'Interview Status must be selected.' };
        return undefined;
      case 'offerLetterSent':
        if (value === true && formData.interviewStatus === 'Rejected') {
          return { type: 'strict', message: 'Offer Letter cannot be sent if Interview Status is Rejected.' };
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const validateRationale = (rationale: string): string | undefined => {
    if (rationale.length < 30) return 'Rationale must be at least 30 characters long.';
    if (!RATIONALE_PHRASES.some(phrase => rationale.toLowerCase().includes(phrase))) {
      return `Rationale must contain one of: ${RATIONALE_PHRASES.join(', ')}.`;
    }
    return undefined;
  };

  const validateAllFields = (): { strictErrors: FormErrors, softErrors: FormErrors } => {
    const strictErrors: FormErrors = {};
    const softErrors: FormErrors = {};

    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const result = validateField(field, formData[field]);
      if (result) {
        if (result.type === 'strict') {
          strictErrors[field] = result.message;
        } else {
          const softState = softRuleStates[field];
          if (!softState?.isExcepted || validateRationale(softState.rationale)) {
            softErrors[field] = result.message;
          }
        }
      }
    });
    return { strictErrors, softErrors };
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const result = validateField(field, value);
    if (result) {
      if (result.type === 'strict') {
        setValidationErrors(prev => ({ ...prev, [field]: result.message }));
        setSoftRuleStates(prev => ({ ...prev, [field]: { ...prev[field], rationaleError: undefined } }));
      } else { // Soft validation
        setValidationErrors(prev => ({ ...prev, [field]: undefined })); // Clear strict error if it was there
        setSoftRuleStates(prev => {
          const newSoftState = { ...prev[field], rationaleError: undefined };
          // If soft rule is violated and not excepted, set the soft error
          if (!newSoftState.isExcepted) {
            setValidationErrors(currentErrors => ({ ...currentErrors, [field]: result.message }));
          } else {
            // If excepted, validate rationale
            const rationaleError = validateRationale(newSoftState.rationale);
            newSoftState.rationaleError = rationaleError;
            if (rationaleError) {
              setValidationErrors(currentErrors => ({ ...currentErrors, [field]: rationaleError }));
            } else {
              setValidationErrors(currentErrors => ({ ...currentErrors, [field]: undefined }));
            }
          }
          return { ...prev, [field]: newSoftState };
        });
      }
    } else {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      setSoftRuleStates(prev => ({ ...prev, [field]: { ...prev[field], rationaleError: undefined } }));
    }

    // Special handling for dependent validations
    if (field === 'interviewStatus' || field === 'offerLetterSent') {
      const interviewStatusResult = validateField('interviewStatus', field === 'interviewStatus' ? value : formData.interviewStatus);
      const offerLetterSentResult = validateField('offerLetterSent', field === 'offerLetterSent' ? value : formData.offerLetterSent);

      setValidationErrors(prev => ({
        ...prev,
        interviewStatus: interviewStatusResult?.type === 'strict' ? interviewStatusResult.message : undefined,
        offerLetterSent: offerLetterSentResult?.type === 'strict' ? offerLetterSentResult.message : undefined,
      }));
    }
  };

  const handleSoftRuleToggle = (field: keyof FormData, isExcepted: boolean) => {
    setSoftRuleStates(prev => ({
      ...prev,
      [field]: { ...prev[field], isExcepted, rationale: isExcepted ? prev[field].rationale : '' },
    }));
    // Re-validate field to update error display based on new exception status
    updateField(field, formData[field]);
  };

  const handleRationaleChange = (field: keyof FormData, rationale: string) => {
    setSoftRuleStates(prev => ({
      ...prev,
      [field]: { ...prev[field], rationale },
    }));
    // Re-validate field to update error display based on new rationale
    updateField(field, formData[field]);
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Academic Details', icon: GraduationCap },
    { id: 3, title: 'Admission Status', icon: ClipboardCheck },
  ];

  const currentStepErrors = useMemo(() => {
    const { strictErrors, softErrors } = validateAllFields();
    const allErrors = { ...strictErrors, ...softErrors };
    const errors: FormErrors = {};
    const currentStepFields: (keyof FormData)[] = [];
    if (step === 1) {
      currentStepFields.push('fullName', 'email', 'phone', 'dob', 'aadhaar');
    } else if (step === 2) {
      currentStepFields.push('qualification', 'graduationYear', 'score');
    } else if (step === 3) {
      currentStepFields.push('screeningScore', 'interviewStatus', 'offerLetterSent');
    }
    currentStepFields.forEach(field => {
      if (allErrors[field]) {
        errors[field] = allErrors[field];
      }
    });
    return errors;
  }, [step, formData, softRuleStates]);

  const isFormValid = useMemo(() => {
    const { strictErrors, softErrors } = validateAllFields();
    return Object.keys(strictErrors).length === 0 && Object.keys(softErrors).length === 0;
  }, [formData, softRuleStates]); // Re-evaluate when formData or softRuleStates changes

  const isStepValid = useMemo(() => {
    const { strictErrors, softErrors } = validateAllFields();
    const currentStepFields: (keyof FormData)[] = [];
    if (step === 1) {
      currentStepFields.push('fullName', 'email', 'phone', 'dob', 'aadhaar');
    } else if (step === 2) {
      currentStepFields.push('qualification', 'graduationYear', 'score');
    } else if (step === 3) {
      currentStepFields.push('screeningScore', 'interviewStatus', 'offerLetterSent');
    }

    const hasStrictErrors = currentStepFields.some(field => strictErrors[field]);
    const hasSoftErrors = currentStepFields.some(field => softErrors[field]);

    // Additionally check if all required fields for the step have values
    const allFieldsFilled = currentStepFields.every(field => {
      const value = formData[field];
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return true; // Toggles are always "filled"
      return value !== null && value !== undefined;
    });

    return !hasStrictErrors && !hasSoftErrors && allFieldsFilled;
  }, [step, formData, softRuleStates]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { strictErrors, softErrors } = validateAllFields();
    setValidationErrors({ ...strictErrors, ...softErrors });
    if (Object.keys(strictErrors).length === 0 && Object.keys(softErrors).length === 0 && step === 3) {
      setIsSubmitted(true);
    }
  };

  const isRejected = formData.interviewStatus === 'Rejected';
  const canSubmit = isFormValid && !isRejected;
  const activeExceptionsCount = useMemo(() => {
    return (Object.keys(softRuleStates) as Array<keyof SoftRuleStates>).filter(key => 
      softRuleStates[key].isExcepted && !softRuleStates[key].rationaleError
    ).length;
  }, [softRuleStates]);

  const isFlaggedForReview = activeExceptionsCount > 2;

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
          <p className="text-zinc-500 mb-2">The candidate profile for <span className="font-medium text-zinc-900">{formData.fullName}</span> has been successfully recorded.</p>
          {isFlaggedForReview && (
            <p className="text-red-500 font-medium mb-6">Flagged for Manager Review</p>
          )}
          <p className="text-zinc-500 mb-8"></p>
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
                    <FormField
                      label="Date of Birth"
                      icon={Calendar}
                      error={validationErrors.dob}
                      isSoftRule
                      fieldKey="dob"
                      softRuleState={softRuleStates.dob}
                      onSoftRuleToggle={handleSoftRuleToggle}
                      onRationaleChange={handleRationaleChange}
                    >
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
                    <FormField
                      label="Graduation Year"
                      icon={Calendar}
                      error={validationErrors.graduationYear}
                      isSoftRule
                      fieldKey="graduationYear"
                      softRuleState={softRuleStates.graduationYear}
                      onSoftRuleToggle={handleSoftRuleToggle}
                      onRationaleChange={handleRationaleChange}
                    >
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
                      {(validationErrors.score || softRuleStates.score.rationaleError) && (
                        <div className={`mt-1 h-5 text-[10px] uppercase tracking-widest flex items-center gap-1 ${softRuleStates.score.rationaleError ? 'text-red-500' : 'text-amber-600'}`}>
                          {(softRuleStates.score.rationaleError || (validationErrors.score && validateField('score', formData.score)?.type === 'soft' && !softRuleStates.score.isExcepted)) && <AlertTriangle className="w-3 h-3" />}
                          {validationErrors.score || softRuleStates.score.rationaleError}
                        </div>
                      )}
                      {validateField('score', formData.score)?.type === 'soft' && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <label htmlFor="score-exception" className="text-xs font-medium text-amber-800 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="score-exception"
                                checked={softRuleStates.score.isExcepted}
                                onChange={(e) => handleSoftRuleToggle('score', e.target.checked)}
                                className="form-checkbox h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                              />
                              Request Exception
                            </label>
                          </div>
                          {softRuleStates.score.isExcepted && (
                            <div className="flex flex-col gap-2">
                              <label htmlFor="score-rationale" className="text-xs font-medium text-amber-800">Exception Rationale</label>
                              <textarea
                                id="score-rationale"
                                rows={3}
                                value={softRuleStates.score.rationale}
                                onChange={(e) => handleRationaleChange('score', e.target.value)}
                                className={`w-full px-3 py-2 text-sm bg-amber-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 ${softRuleStates.score.rationaleError ? 'border-red-400' : 'border-amber-200'}`}
                                placeholder="e.g., Waiver granted by Dean, documentation pending..."
                              />
                              {softRuleStates.score.rationaleError && (
                                <div className="text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {softRuleStates.score.rationaleError}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
                    <FormField
                      label="Screening Test Score"
                      icon={ClipboardCheck}
                      error={validationErrors.screeningScore}
                      isSoftRule
                      fieldKey="screeningScore"
                      softRuleState={softRuleStates.screeningScore}
                      onSoftRuleToggle={handleSoftRuleToggle}
                      onRationaleChange={handleRationaleChange}
                    >
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

            {/* Active Exceptions Count */}
            <div className="text-sm text-zinc-600 mb-4 text-center">
              Active Exceptions: {activeExceptionsCount}/4
            </div>

            {/* Flagged for Review Banner */}
            <AnimatePresence>
              {isFlaggedForReview && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-amber-100 text-amber-800 p-4 rounded-xl mb-6 flex items-center gap-3 shadow-md"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium">This candidate has more than 2 exceptions. Entry will be flagged for manager review.</p>
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

function FormField({
  label,
  icon: Icon,
  children,
  error,
  isSoftRule = false,
  fieldKey,
  softRuleState,
  onSoftRuleToggle,
  onRationaleChange,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
  error?: string;
  isSoftRule?: boolean;
  fieldKey?: keyof FormData;
  softRuleState?: SoftRuleState;
  onSoftRuleToggle?: (field: keyof FormData, isExcepted: boolean) => void;
  onRationaleChange?: (field: keyof FormData, rationale: string) => void;
}) {
  const isError = !!error;
  const isSoftError = isError && isSoftRule && softRuleState && !softRuleState.isExcepted;
  const isRationaleError = isError && isSoftRule && softRuleState?.isExcepted && softRuleState.rationaleError;
  const isValid = !isError && children && (children as React.ReactElement).props.value !== '';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        {label}
      </label>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${isError ? 'border-red-300 focus:ring-red-200/50' : isValid ? 'border-emerald-300 focus:ring-emerald-200/50' : ''}`
          });
        }
        return child;
      })}
      {(isError || isSoftError || isRationaleError) && (
        <div className={`mt-1 h-5 text-[10px] uppercase tracking-widest flex items-center gap-1 ${isSoftError || isRationaleError ? 'text-amber-600' : 'text-red-500'}`}>
          {(isSoftError || isRationaleError) && <AlertTriangle className="w-3 h-3" />}
          {error}
        </div>
      )}

      {isSoftRule && isError && fieldKey && onSoftRuleToggle && onRationaleChange && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor={`${fieldKey}-exception`} className="text-xs font-medium text-amber-800 flex items-center gap-2">
              <input
                type="checkbox"
                id={`${fieldKey}-exception`}
                checked={softRuleState?.isExcepted || false}
                onChange={(e) => onSoftRuleToggle(fieldKey, e.target.checked)}
                className="form-checkbox h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              Request Exception
            </label>
          </div>
          {softRuleState?.isExcepted && (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${fieldKey}-rationale`} className="text-xs font-medium text-amber-800">Exception Rationale</label>
              <textarea
                id={`${fieldKey}-rationale`}
                rows={3}
                value={softRuleState.rationale}
                onChange={(e) => onRationaleChange(fieldKey, e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-amber-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 ${softRuleState.rationaleError ? 'border-red-400' : 'border-amber-200'}`}
                placeholder="e.g., Waiver granted by Dean, documentation pending..."
              />
              {softRuleState.rationaleError && (
                <div className="text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {softRuleState.rationaleError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
