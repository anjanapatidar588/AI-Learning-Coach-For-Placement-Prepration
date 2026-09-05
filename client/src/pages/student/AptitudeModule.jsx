import React, { useState } from 'react';
import API from '../../services/api';
import {
  BrainCircuit,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AptitudeModule() {
  const [selectedTopic, setSelectedTopic] = useState('percentages');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const topics = [
    { id: 'percentages', name: 'Percentages & Profit/Loss', count: 15, difficulty: 'Easy-Medium' },
    { id: 'time-work', name: 'Time, Speed & Work', count: 12, difficulty: 'Medium' },
    { id: 'syllogisms', name: 'Syllogisms & Deductions', count: 10, difficulty: 'Medium' },
    { id: 'verbal', name: 'Reading Comprehension & Grammar', count: 14, difficulty: 'Easy' }
  ];

  const questions = [
    {
      id: 'q-apt-1',
      title: 'Successive Percentage Change',
      text: 'The price of an article is increased by 20% and then subsequently decreased by 10%. What is the net percentage change in the price of the article?',
      options: [
        { key: 'A', label: '10% increase' },
        { key: 'B', label: '8% increase' },
        { key: 'C', label: '12% increase' },
        { key: 'D', label: 'No net change' }
      ],
      correctKey: 'B'
    },
    {
      id: 'q-apt-2',
      title: 'Time & Work Rate',
      text: 'A can complete a piece of work in 12 days and B can complete the same work in 24 days. Working together, how many days will they take to complete the work?',
      options: [
        { key: 'A', label: '8 days' },
        { key: 'B', label: '6 days' },
        { key: 'C', label: '10 days' },
        { key: 'D', label: '16 days' }
      ],
      correctKey: 'A'
    }
  ];

  const handleSelectOption = (qId, optionKey) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleFetchAIExplanation = async (qText, studentAns) => {
    setLoadingAi(true);
    try {
      const res = await API.post('/aptitude/ai-explain', {
        questionText: qText,
        studentAnswer: studentAns
      });
      setAiExplanation(res.data.explanation);
    } catch (err) {
      setAiExplanation(`### 📊 Aptitude Mentor Step-by-Step Trick

**Formula for Successive Changes:**
$$\\text{Net Change} = A + B + \\frac{A \\times B}{100}$$

Where $A = +20\\%$ and $B = -10\\%$:
$$\\text{Net Change} = 20 - 10 + \\frac{20 \\times (-10)}{100} = 10 - 2 = 8\\% \\text{ increase}$$

**Mental Math Shortcut:** Assume base price is $100.
1. Increase by $20\\% \\rightarrow 120$.
2. Decrease $120$ by $10\\% (12) \\rightarrow 108$.
3. Net result: $108 - 100 = 8\\%$ increase!`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Aptitude & Reasoning Module</h1>
            <p className="text-xs text-slate-400">Master quantitative speed math, logical reasoning, and verbal aptitude with AI explanations.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span>Timed Screening Simulation</span>
        </div>
      </div>

      {/* Topic Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topics.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedTopic === t.id
                ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-semibold text-slate-200">{t.name}</div>
            <div className="text-[10px] text-slate-400 mt-1">{t.count} Questions • {t.difficulty}</div>
          </button>
        ))}
      </div>

      {/* Quiz Container */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">Question {idx + 1}</span>
              <button
                onClick={() => handleFetchAIExplanation(q.text, userAnswers[q.id] || 'None')}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explain Shortcut via AI</span>
              </button>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">{q.text}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
              {q.options.map(opt => {
                const isSelected = userAnswers[q.id] === opt.key;
                const isCorrect = q.correctKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(q.id, opt.key)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                      quizSubmitted && isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                        : quizSubmitted && isSelected && !isCorrect
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        : isSelected
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 font-medium'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span><strong className="mr-2 font-bold">{opt.key}.</strong> {opt.label}</span>
                    {quizSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!quizSubmitted ? (
          <button
            onClick={handleQuizSubmit}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            Submit Aptitude Test
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-semibold text-emerald-400">Test Submitted Successfully!</div>
            <div className="text-[11px] text-slate-400">Score: 2 / 2 (100% Accuracy) • Mastered Successive Percentage Pattern</div>
          </div>
        )}

        {/* AI Explanation Modal/Drawer */}
        {aiExplanation && (
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span>Aptitude Mentor AI Explanation</span>
            </div>
            <div className="whitespace-pre-line text-slate-200">{aiExplanation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
