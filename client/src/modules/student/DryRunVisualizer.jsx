import React, { useState } from 'react';

const DryRunVisualizer = ({ steps = [], title = 'Interactive Dry Run' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        No interactive dry-run steps available for this example.
      </div>
    );
  }

  const currentStep = steps[currentStepIndex] || steps[0];
  const stateObj = currentStep.state || {};
  const arrayData = Array.isArray(stateObj.array) ? stateObj.array : [];
  const pointers = stateObj.pointers || {};
  const variables = stateObj.variables || {};

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/20 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {title}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Step {currentStepIndex + 1} of {steps.length}: <span className="text-cyan-300 font-semibold">{currentStep.label || `Step ${currentStepIndex + 1}`}</span>
          </p>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Reset
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next Step →
          </button>
        </div>
      </div>

      {/* Array Pointer Visualization */}
      {arrayData.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Array Bounds & Pointers</h5>
          <div className="overflow-x-auto py-4">
            <div className="flex items-center justify-center gap-2 min-w-max">
              {arrayData.map((val, idx) => {
                const isMid = pointers.mid === idx;
                const isLow = pointers.low === idx;
                const isHigh = pointers.high === idx;
                const isPointerHere = isMid || isLow || isHigh;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    {/* Pointer Labels */}
                    <div className="h-6 flex items-center justify-center gap-1 text-[10px] font-bold">
                      {isLow && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 rounded">low</span>}
                      {isMid && <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1 rounded">mid</span>}
                      {isHigh && <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 rounded">high</span>}
                    </div>

                    {/* Array Cell */}
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border text-sm font-mono font-bold transition-all duration-300 ${
                        isMid
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20 scale-105 ring-2 ring-cyan-500/40'
                          : isPointerHere
                          ? 'bg-slate-800 border-indigo-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {val}
                    </div>

                    {/* Array Index */}
                    <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Variables & State Inspector */}
      {Object.keys(variables).length > 0 && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
          <h5 className="text-xs uppercase tracking-wider font-semibold text-slate-400">State Inspector</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(variables).map(([k, v]) => (
              <div key={k} className="bg-slate-900 border border-slate-800/80 rounded-md p-2.5">
                <div className="text-[10px] text-slate-400 font-mono uppercase">{k}</div>
                <div className="text-sm font-bold font-mono text-indigo-300">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Explanation */}
      <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-300">Execution Analysis:</span>
          {currentStep.output && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
              Output: {currentStep.output}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {currentStep.explanation}
        </p>
      </div>
    </div>
  );
};

export default DryRunVisualizer;
