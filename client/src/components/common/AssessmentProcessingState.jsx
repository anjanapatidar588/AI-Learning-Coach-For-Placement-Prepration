import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Brain, MapPin, BarChart3 } from 'lucide-react';

export const AssessmentProcessingState = ({ currentStep = 3, message = 'Analyzing your preparation profile...' }) => {
  const [activeStep, setActiveStep] = useState(currentStep);

  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  const steps = [
    { label: 'Assessment completed', icon: CheckCircle2 },
    { label: 'Performance analyzed', icon: BarChart3 },
    { label: 'Identifying knowledge gaps', icon: Brain },
    { label: 'Building personalized roadmap', icon: MapPin },
    { label: 'Preparing your dashboard', icon: Sparkles }
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 space-y-7 text-center relative overflow-hidden font-sans">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-md shadow-indigo-100 relative z-10">
          <Brain className="w-8 h-8 animate-pulse" />
        </div>

        {/* Heading */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <span>AI Evaluation Engine</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {message}
          </h2>
          <p className="text-xs text-slate-500">
            Evaluating your diagnostic performance and structuring your custom readiness plan.
          </p>
        </div>

        {/* Steps List */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3.5 text-left relative z-10">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < activeStep;
            const isCurrent = stepNum === activeStep;
            const StepIcon = step.icon;

            return (
              <div key={idx} className="flex items-center space-x-3 text-xs">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold">{stepNum}</span>
                  </div>
                )}

                <span
                  className={`font-semibold ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-indigo-900 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 font-medium relative z-10">
          Scoring is authoritative and calculated by the backend grading engine.
        </div>
      </div>
    </div>
  );
};

export default AssessmentProcessingState;
