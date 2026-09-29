import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  Sparkles,
  ArrowRight,
  Play,
  Target,
  Globe,
  TrendingUp,
  Compass,
  Brain,
  BarChart2,
  Star,
  BookOpen,
  Code2,
  Cpu,
  Calculator,
  Bot,
  Check,
  X,
  Send,
  RefreshCw,
  Zap,
  Award,
  Layers,
  ChevronRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const PathPilotLanding = () => {
  // ==========================================
  // 1. INTERACTIVE STATE: 3D ROBOT MASCOT TIPS
  // ==========================================
  const robotTips = [
    { title: "Keep going!", subtitle: "You're doing great! ✨", emoji: "✨" },
    { title: "DSA Pro Tip:", subtitle: "Two pointers turn O(N²) to O(N) ⚡", emoji: "⚡" },
    { title: "Interview Insight:", subtitle: "Binary Trees are in 72% of OA tests! 🌳", emoji: "🌳" },
    { title: "DBMS Reminder:", subtitle: "Review ACID & B+ Tree Indexing! 💾", emoji: "💾" },
    { title: "Consistency Wins!", subtitle: "2 problems a day = 60/month! 🚀", emoji: "🚀" }
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isRobotBouncing, setIsRobotBouncing] = useState(false);

  const handleRobotClick = () => {
    setIsRobotBouncing(true);
    setCurrentTipIndex((prev) => (prev + 1) % robotTips.length);
    setTimeout(() => setIsRobotBouncing(false), 600);
  };

  // ==========================================
  // 2. INTERACTIVE STATE: PROGRESS RING WIDGET
  // ==========================================
  const progressTracks = [
    { label: "Overall Progress", value: 78, change: "+12%", note: "Placement Ready", color: "text-cyan-400", stroke: "#22d3ee" },
    { label: "DSA & Problem Solving", value: 85, change: "+18%", note: "42 Solved", color: "text-emerald-400", stroke: "#34d399" },
    { label: "CS Core Fundamentals", value: 72, change: "+9%", note: "DBMS & OS Strong", color: "text-indigo-400", stroke: "#818cf8" },
    { label: "Quantitative Aptitude", value: 81, change: "+15%", note: "Speed Math Mastery", color: "text-purple-400", stroke: "#c084fc" }
  ];
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const currentTrack = progressTracks[activeTrackIndex];

  const handleProgressClick = () => {
    setActiveTrackIndex((prev) => (prev + 1) % progressTracks.length);
  };

  // ==========================================
  // 3. INTERACTIVE STATE: NEXT TOPIC WIDGET
  // ==========================================
  const upcomingTopics = [
    { title: "Binary Trees", category: "Data Structures & Algorithms", link: "/dsa", icon: BookOpen, gradient: "from-indigo-500 to-purple-600" },
    { title: "SQL Normalization", category: "DBMS Core Fundamentals", link: "/core", icon: Cpu, gradient: "from-cyan-500 to-blue-600" },
    { title: "Time & Distance", category: "Quantitative Aptitude", link: "/aptitude", icon: Calculator, gradient: "from-purple-500 to-pink-600" },
    { title: "Dynamic Programming", category: "Advanced DSA (LIS & Knapsack)", link: "/dsa", icon: Code2, gradient: "from-emerald-500 to-teal-600" }
  ];
  const [topicIndex, setTopicIndex] = useState(0);
  const currentTopic = upcomingTopics[topicIndex];

  const handleNextTopicCycle = () => {
    setTopicIndex((prev) => (prev + 1) % upcomingTopics.length);
  };

  // ==========================================
  // 4. INTERACTIVE STATE: "EXPLORE HOW IT WORKS" MODAL
  // ==========================================
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      step: "01",
      title: "Baseline Diagnostics",
      subtitle: "Pinpoint your current readiness across DSA, CS Core, and Aptitude.",
      description: "Our adaptive AI assessment takes just 15 minutes to evaluate your conceptual strengths, speed, and gap areas. No generic tests — targeted discovery.",
      badge: "Step 1: Discover",
      action: "Test Your Baseline"
    },
    {
      step: "02",
      title: "Tailored Placement Roadmap",
      subtitle: "Custom day-by-day roadmap targeting your dream company tier.",
      description: "Whether targeting FAANG (Tier 1), Product Unicorns, or IT Services, PathPilot arranges high-frequency interview patterns in optimal learning order.",
      badge: "Step 2: Guide",
      action: "View Roadmaps"
    },
    {
      step: "03",
      title: "Socratic AI Code Practice",
      subtitle: "Never get stuck on TLE or edge cases with progressive hints.",
      description: "Instead of dumping full solutions, the AI Coach guides you through dry-running test cases, time complexity analysis, and pattern recognition.",
      badge: "Step 3: Understand",
      action: "Open Code Editor"
    },
    {
      step: "04",
      title: "Offer-Ready Execution",
      subtitle: "Mistake journal, ATS resume audit, and AI mock interviews.",
      description: "Turn failures into strengths with the Mistake Journal, verify your resume against actual job descriptions, and practice live behavioral & technical rounds.",
      badge: "Step 4: Conquer",
      action: "Launch Dashboard"
    }
  ];

  // ==========================================
  // 5. INTERACTIVE STATE: FEATURE DETAIL MODAL (BOTTOM DOCK)
  // ==========================================
  const [selectedFeature, setSelectedFeature] = useState(null);

  const featureDetails = {
    roadmap: {
      title: "Personalized Roadmap",
      icon: Compass,
      color: "text-teal-400",
      bg: "bg-teal-500/15 border-teal-400/40",
      summary: "A customized preparation trajectory built specifically around your target graduation date, placement targets, and daily practice hours.",
      points: [
        "Company Tier filters (Tier 1 Product, High-Growth Startups, IT Services)",
        "Spaced repetition schedule dynamically adjusted as you solve questions",
        "Pre-requisite dependency mapping so you master Recursion before DP"
      ],
      link: "/roadmap",
      actionLabel: "Explore Your Roadmap"
    },
    clarity: {
      title: "Concept Clarity & Mistake Journal",
      icon: Brain,
      color: "text-purple-400",
      bg: "bg-purple-500/15 border-purple-400/40",
      summary: "Move beyond memorization with visual intuition, step-by-step logic breakdowns, and automatic edge-case failure tracking.",
      points: [
        "Mistake Journal automatically logs runtime exceptions, TLE, and forgotten constraints",
        "Visual diagrams for trees, graphs, and OSI layer communication",
        "Similar-question retries to ensure you understand the core pattern"
      ],
      link: "/revision",
      actionLabel: "Open Mistake Journal"
    },
    practice: {
      title: "Practice & Improve Workspace",
      icon: BarChart2,
      color: "text-blue-400",
      bg: "bg-blue-500/15 border-blue-400/40",
      summary: "Real assessment environment with Monaco code editor, timed mode, multi-language execution, and live hint assistance.",
      points: [
        "Language support for C++, Java, Python, and JavaScript",
        "Hidden company-specific test cases and edge cases testing",
        "Socratic hint levels: (1) Approach, (2) Dry run, (3) Complexity tip"
      ],
      link: "/practice",
      actionLabel: "Start Coding Practice"
    },
    mentor: {
      title: "24/7 AI Placement Mentor",
      icon: Star,
      color: "text-amber-400",
      bg: "bg-amber-500/15 border-amber-400/40",
      summary: "An always-available AI mentor ready to break down complex algorithms, conduct mock interviews, and critique your resume.",
      points: [
        "Instant code review with Big-O time and space complexity explanations",
        "Voice & text mock interviews with realistic follow-up questions",
        "ATS resume scanning that highlights missing technical keywords"
      ],
      link: "#ai-coach",
      actionLabel: "Chat with AI Mentor"
    }
  };

  // ==========================================
  // 6. INTERACTIVE STATE: LIVE AI COACH CHATBOX
  // ==========================================
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'user',
      text: "I'm getting TLE on LeetCode 300 (Longest Increasing Subsequence). Can you give me a hint without giving away the full answer?"
    },
    {
      sender: 'bot',
      text: "Great question! Your current approach is likely O(N²) dynamic programming.\n\n💡 Hint: Maintain an array of the smallest tail elements of increasing subsequences found so far. Can you replace a linear search with Binary Search (bisect_left) to drop the complexity to O(N log N)?"
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const quickPrompts = [
    "💡 Hint for Two Sum without the code",
    "🧠 Explain DP Memoization like I'm 10",
    "🎯 Top 3 SQL interview questions for tech rounds",
    "⏱️ Shortcut for Time & Work problems"
  ];

  const handleSendPrompt = (promptText) => {
    const textToSend = promptText || userInput;
    if (!textToSend.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: textToSend }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let botReply = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("two sum")) {
        botReply = "💡 Two Sum Hint:\nInstead of checking every pair in O(N²), store each number's complement (target - current) in a Hash Map. That lets you find the answer in a single O(N) pass with O(N) space!";
      } else if (lower.includes("memoization") || lower.includes("dp")) {
        botReply = "🧠 DP Memoization in simple terms:\nImagine doing 1+1+1+1+1 on paper. If I add another '+ 1', you don't recalculate from scratch — you just take 5 and add 1 = 6! Memoization is just writing down answers so you never solve the exact same sub-problem twice.";
      } else if (lower.includes("sql") || lower.includes("dbms")) {
        botReply = "🎯 Top 3 DBMS Interview Questions:\n1. Difference between Index Seek vs Index Scan.\n2. How ACID properties are enforced (WAL / Undo Logs).\n3. 2nd vs 3rd Normal Form with real eCommerce schema example.";
      } else if (lower.includes("time & work") || lower.includes("shortcut")) {
        botReply = "⏱️ Time & Work Pro Tip:\nAlways find the LCM of total days to represent 'Total Units of Work'. Example: A takes 10 days, B takes 15 days → LCM is 30 units. Efficiency of A = 3 units/day, B = 2 units/day. Together = 5 units/day → Total days = 30 / 5 = 6 days!";
      } else {
        botReply = `🤖 PathPilot Coach:\nGreat inquiry! To tackle "${textToSend.slice(0, 35)}...", start by defining the baseline constraints and edge cases. In technical assessments, recruiters evaluate your clarity of logic first before syntax. Ready to test this in the practice workspace?`;
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
      setIsAiTyping(false);
    }, 900);
  };

  // ==========================================
  // 7. INTERACTIVE STATE: DAILY PLACEMENT QUIZ
  // ==========================================
  const quizQuestions = [
    {
      q: "Which data structure is primarily used to implement Breadth-First Search (BFS)?",
      options: ["Stack", "Queue", "Priority Queue", "Hash Map"],
      correct: 1,
      explanation: "Correct! 🎉 BFS explores level-by-level using FIFO (First-In, First-Out) ordering provided by a Queue."
    },
    {
      q: "What is the average time complexity of searching an element in a Balanced BST (AVL/Red-Black)?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      correct: 1,
      explanation: "Spot on! 🎯 A balanced Binary Search Tree halves the search space at each depth level, resulting in O(log N)."
    },
    {
      q: "In Relational Databases, which property ensures that a transaction is either completely executed or not executed at all?",
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      correct: 0,
      explanation: "Exactly! 🌟 Atomicity (the 'A' in ACID) ensures the all-or-nothing execution of transactions."
    }
  ];
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
    setHasAnswered(true);
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setCurrentQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  // Parallax subtle tilt effect on hero container
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    setMousePos({ x, y });
  };

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Floating Glass Navbar */}
      <Navbar />

      {/* ==========================================================================
         HERO SECTION — FULL VIEWPORT CINEMATIC STUDENT WORKSPACE BACKGROUND
         ========================================================================== */}
      <section 
        onMouseMove={handleMouseMove}
        className="relative min-h-[90vh] lg:min-h-[94vh] hero-full-bg pt-28 pb-10 lg:pt-34 lg:pb-12 flex flex-col justify-between overflow-hidden"
      >
        
        {/* Soft Ambient Radial Glows (Reactive to mouse) */}
        <div 
          style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none transition-transform duration-300" 
        />
        <div 
          style={{ transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)` }}
          className="absolute bottom-1/3 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none transition-transform duration-300" 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* HERO LEFT CONTENT — Over subtle backdrop gradient */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Glass Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card-floating border-cyan-400/35 text-slate-200 text-xs font-medium shadow-lg shadow-cyan-500/10 cursor-pointer hover:border-cyan-300 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Your Personal AI-Powered Learning Partner</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                Smarter Learning.<br />
                <span className="gradient-text-blue-cyan block mt-1.5">
                  Better Placements.
                </span>
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                PathPilot helps you prepare for your dreams with personalized roadmaps, AI guidance and real-world practice — all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link to="/dashboard" className="btn-pathpilot-primary text-sm px-6 py-3 font-semibold flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Start Preparing</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setIsTourModalOpen(true)}
                  className="btn-pathpilot-secondary text-sm px-6 py-3 font-medium flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded-full border border-cyan-400/50 bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-2.5 h-2.5 text-cyan-300 fill-cyan-300 ml-0.5" />
                  </div>
                  <span>Explore How It Works</span>
                </button>
              </div>

              {/* 3 Bullet Features (Interactive Quick Jump) */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-300">
                <Link to="/roadmap" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>Personalized Learning Path</span>
                </Link>

                <a href="#ai-coach" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>AI-Powered Guidance</span>
                </a>

                <Link to="/progress" className="flex items-center gap-2 hover:text-cyan-300 transition-colors">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <span>Track Progress</span>
                </Link>
              </div>

            </div>

            {/* HERO RIGHT AREA — INDEPENDENT FLOATING AI GLASS UI OVERLAYS */}
            <div className="lg:col-span-5 relative min-h-[380px] lg:min-h-[440px]">
              
              {/* FLOATING CARD 1: Overall Progress Ring (Interactive click to cycle topics) */}
              <div 
                onClick={handleProgressClick}
                title="Click to cycle subject progress!"
                style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }}
                className="absolute top-2 left-0 sm:left-4 glass-card-floating p-3.5 sm:p-4 flex items-center gap-3.5 border-cyan-400/40 shadow-2xl animate-float z-20 cursor-pointer hover:border-cyan-300 hover:scale-105 transition-all group"
              >
                <div className="relative w-13 h-13 flex items-center justify-center shrink-0">
                  <svg className="w-13 h-13 transform -rotate-90">
                    <circle cx="26" cy="26" r="21" stroke="currentColor" strokeWidth="3.5" className="text-slate-800" fill="transparent" />
                    <circle 
                      cx="26" 
                      cy="26" 
                      r="21" 
                      stroke={currentTrack.stroke} 
                      strokeWidth="3.5" 
                      className="transition-all duration-700 ease-out" 
                      strokeDasharray={132} 
                      strokeDashoffset={132 * (1 - currentTrack.value / 100)} 
                      strokeLinecap="round" 
                      fill="transparent" 
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">{currentTrack.value}%</span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-semibold text-slate-200 block group-hover:text-cyan-300 transition-colors">
                    {currentTrack.label}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                      ▲ {currentTrack.change}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({currentTrack.note})</span>
                    <div className="flex items-end gap-0.5 h-3 ml-1">
                      <div className="w-0.5 h-1.5 bg-cyan-400/70 rounded-xs animate-pulse" />
                      <div className="w-0.5 h-2 bg-cyan-400 rounded-xs animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-0.5 h-3 bg-cyan-300 rounded-xs animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 2: Next Topic Card (Interactive click to preview next module) */}
              <div 
                onClick={handleNextTopicCycle}
                title="Click to preview next upcoming topic!"
                style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }}
                className="absolute top-2 right-12 sm:right-16 glass-card-floating p-3.5 sm:p-4 border-cyan-400/40 shadow-2xl animate-float-delayed z-20 text-left w-52 sm:w-56 cursor-pointer hover:border-cyan-300 hover:scale-105 transition-all group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] text-slate-300 font-medium">Next Topic (Click to flip)</span>
                  <RefreshCw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentTopic.gradient} flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform`}>
                    <currentTopic.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
                      {currentTopic.title} <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{currentTopic.category}</p>
                  </div>
                </div>
              </div>

              {/* FLOATING 3D AI ROBOT MASCOT (Interactive Clickable) */}
              <div 
                onClick={handleRobotClick}
                title="Click me for helpful placement tips!"
                style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
                className="absolute top-8 -right-2 sm:right-0 z-20 animate-float cursor-pointer"
              >
                <div className={`relative group ${isRobotBouncing ? 'animate-bounce' : 'hover:scale-115'} transition-all duration-300`}>
                  <div className="w-13 h-13 rounded-2xl overflow-hidden border border-cyan-400/60 shadow-xl shadow-cyan-500/30 bg-slate-900/90 flex items-center justify-center p-0.5">
                    <img 
                      src="/ai-robot.png" 
                      alt="PathPilot AI Mascot" 
                      className="w-full h-full object-cover rounded-xl" 
                    />
                  </div>
                  <div className="absolute -inset-1.5 bg-cyan-400/35 rounded-2xl blur-md -z-10 animate-pulse" />
                </div>
              </div>

              {/* FLOATING SPEECH BUBBLE (Interactive message updates on click) */}
              <div 
                onClick={handleRobotClick}
                style={{ transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px)` }}
                className="absolute top-26 right-2 sm:right-6 glass-card-floating px-4 py-2.5 rounded-2xl border-cyan-400/40 shadow-xl text-left z-20 animate-float-delayed cursor-pointer hover:border-cyan-300 transition-all max-w-[210px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{robotTips[currentTipIndex].title}</span>
                  <span className="text-xs">{robotTips[currentTipIndex].emoji}</span>
                </div>
                <span className="text-[11px] text-slate-300 block leading-tight mt-0.5">
                  {robotTips[currentTipIndex].subtitle}
                </span>
                <span className="text-[9px] text-cyan-400 font-mono block mt-1 opacity-75">Click for next tip →</span>
                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-slate-900 border-t border-l border-cyan-400/40 rotate-45" />
              </div>

            </div>

          </div>
        </div>

        {/* ==========================================================================
           BOTTOM FEATURE BAR (INTERACTIVE DOCKED GLASS PANEL)
           ========================================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 relative z-20">
          <div className="glass-panel-bottom-feature p-6 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1: Personalized Roadmap */}
              <div 
                onClick={() => setSelectedFeature(featureDetails.roadmap)}
                className="space-y-2.5 text-left group cursor-pointer hover:-translate-y-1.5 transition-all p-2 rounded-xl hover:bg-slate-800/30"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-400/40 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-teal-500/10">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-teal-300 transition-colors">
                    Personalized Roadmap
                  </h3>
                  <ChevronRight className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get a custom study plan based on your goals and strengths.
                </p>
                <span className="text-[10px] text-teal-400 font-medium inline-block">Click to preview →</span>
              </div>

              {/* Feature 2: Concept Clarity */}
              <div 
                onClick={() => setSelectedFeature(featureDetails.clarity)}
                className="space-y-2.5 text-left group cursor-pointer hover:-translate-y-1.5 transition-all p-2 rounded-xl hover:bg-slate-800/30"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-purple-500/10">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                    Concept Clarity
                  </h3>
                  <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Learn with simple explanations and real-world examples.
                </p>
                <span className="text-[10px] text-purple-400 font-medium inline-block">Click to preview →</span>
              </div>

              {/* Feature 3: Practice & Improve */}
              <div 
                onClick={() => setSelectedFeature(featureDetails.practice)}
                className="space-y-2.5 text-left group cursor-pointer hover:-translate-y-1.5 transition-all p-2 rounded-xl hover:bg-slate-800/30"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/40 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/10">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                    Practice & Improve
                  </h3>
                  <ChevronRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Solve questions, track progress and build confidence.
                </p>
                <span className="text-[10px] text-blue-400 font-medium inline-block">Click to preview →</span>
              </div>

              {/* Feature 4: AI Mentor */}
              <div 
                onClick={() => setSelectedFeature(featureDetails.mentor)}
                className="space-y-2.5 text-left group cursor-pointer hover:-translate-y-1.5 transition-all p-2 rounded-xl hover:bg-slate-800/30"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-amber-500/10">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    AI Mentor
                  </h3>
                  <ChevronRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get instant help, tips and strategies anytime.
                </p>
                <span className="text-[10px] text-amber-400 font-medium inline-block">Click to preview →</span>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ==========================================================================
         INTERACTIVE FEATURE PREVIEW MODAL (Triggered from bottom dock)
         ========================================================================== */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop animate-in fade-in duration-200">
          <div className="glass-modal-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl relative text-left space-y-6">
            <button 
              onClick={() => setSelectedFeature(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${selectedFeature.bg} ${selectedFeature.color}`}>
                <selectedFeature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedFeature.title}</h3>
                <span className="text-xs text-cyan-400 font-mono">Platform Deep Dive</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedFeature.summary}
            </p>

            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block font-mono">Key Capabilities:</span>
              {selectedFeature.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button 
                onClick={() => setSelectedFeature(null)}
                className="px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
              {selectedFeature.link.startsWith('#') ? (
                <a
                  href={selectedFeature.link}
                  onClick={() => setSelectedFeature(null)}
                  className="btn-pathpilot-primary text-xs py-2 px-5"
                >
                  {selectedFeature.actionLabel} →
                </a>
              ) : (
                <Link
                  to={selectedFeature.link}
                  className="btn-pathpilot-primary text-xs py-2 px-5"
                >
                  {selectedFeature.actionLabel} →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         INTERACTIVE "EXPLORE HOW IT WORKS" GUIDED TOUR MODAL
         ========================================================================== */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop animate-in fade-in duration-200">
          <div className="glass-modal-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl relative text-left space-y-6">
            <button 
              onClick={() => setIsTourModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Stepper Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  {tourSteps[tourStep].badge}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">Step {tourStep + 1} of {tourSteps.length}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {tourSteps[tourStep].title}
              </h3>
            </div>

            {/* Step Tabs */}
            <div className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-3">
              {tourSteps.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setTourStep(idx)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all text-center cursor-pointer ${
                    tourStep === idx 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {s.step}. {s.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Interactive Step Card Content */}
            <div className="glass-card-floating p-5 rounded-2xl border-cyan-500/20 space-y-3">
              <h4 className="text-sm font-bold text-cyan-300">
                {tourSteps[tourStep].subtitle}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tourSteps[tourStep].description}
              </p>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={tourStep === 0}
                onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-3">
                {tourStep < tourSteps.length - 1 ? (
                  <button
                    onClick={() => setTourStep((prev) => prev + 1)}
                    className="btn-pathpilot-primary text-xs py-2 px-5 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsTourModalOpen(false)}
                    className="btn-pathpilot-primary text-xs py-2 px-5"
                  >
                    <span>Start Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         HOW IT WORKS (LEARNING PHILOSOPHY: PRACTICE -> UNDERSTAND -> IMPROVE -> CONTINUE)
         ========================================================================== */}
      <section id="how-it-works" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Learning Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Solving Questions to <span className="gradient-text-blue-cyan">Understanding Logic</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              PathPilot transforms traditional memorization into adaptive understanding using a 4-step feedback loop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            <div className="glass-panel-dark p-6 space-y-3 border-indigo-500/20 relative interactive-card cursor-pointer group">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono group-hover:scale-110 inline-block transition-transform">01</span>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">Practice</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attempt questions in DSA, Aptitude, and CS Core within an environment styled for hiring assessments.
              </p>
            </div>

            <div className="glass-panel-dark p-6 space-y-3 border-purple-500/20 relative interactive-card cursor-pointer group">
              <span className="text-2xl font-extrabold text-purple-400 font-mono group-hover:scale-110 inline-block transition-transform">02</span>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Understand</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When an attempt fails, get instant contextual hints and concept explanations instead of raw solution dumps.
              </p>
            </div>

            <div className="glass-panel-dark p-6 space-y-3 border-cyan-500/20 relative interactive-card cursor-pointer group">
              <span className="text-2xl font-extrabold text-indigo-400 font-mono group-hover:scale-110 inline-block transition-transform">03</span>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">Improve</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log edge case errors into your Mistake Journal and retry similar-logic questions to verify understanding.
              </p>
            </div>

            <div className="glass-panel-dark p-6 space-y-3 border-emerald-500/20 relative interactive-card cursor-pointer group">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono group-hover:scale-110 inline-block transition-transform">04</span>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Continue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your personalized roadmap dynamically updates as your readiness score improves toward placement readiness.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
         SUBJECTS BREAKDOWN (DSA, APTITUDE, CORE CS)
         ========================================================================== */}
      <section id="subjects" className="py-20 relative bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Comprehensive Curriculum</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Master the Three Pillars of <span className="gradient-text-blue-cyan">Tech Placements</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything required to clear online assessments (OA) and technical interview rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Card 1: DSA */}
            <div className="glass-panel-glow p-6 space-y-5 border-cyan-500/30 flex flex-col justify-between text-left interactive-card">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Data Structures & Algorithms</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Arrays, Hash Maps, Two Pointers, Trees, Graphs, Dynamic Programming, and Greedy Algorithms.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pattern-recognition training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Multi-language code execution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Time & Space complexity breakdowns</span>
                  </div>
                </div>
              </div>

              <Link to="/dsa" className="btn-pathpilot-primary text-xs w-full text-center">
                Explore DSA Modules →
              </Link>
            </div>

            {/* Card 2: Aptitude */}
            <div className="glass-panel-glow p-6 space-y-5 border-purple-500/30 flex flex-col justify-between text-left interactive-card">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Quantitative & Logical Aptitude</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Speed math shortcuts, Percentages, Time & Distance, Permutations, and Data Interpretation.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mental math formulas & shortcuts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                    <span>Time-bound quiz simulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                    <span>Step-by-step formula explanations</span>
                  </div>
                </div>
              </div>

              <Link to="/aptitude" className="btn-pathpilot-primary text-xs w-full text-center">
                Explore Aptitude Modules →
              </Link>
            </div>

            {/* Card 3: Core CS */}
            <div className="glass-panel-glow p-6 space-y-5 border-indigo-500/30 flex flex-col justify-between text-left interactive-card">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">CS Core Fundamentals</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  OOPS, DBMS Normalization, Operating Systems Mutex/Paging, Computer Networks & Architecture.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>SQL query playground & Normalization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Visual OSI/TCP network diagrams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Interview scenario case studies</span>
                  </div>
                </div>
              </div>

              <Link to="/core" className="btn-pathpilot-primary text-xs w-full text-center">
                Explore CS Core Modules →
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
         INTERACTIVE DAILY PLACEMENT CHALLENGE (MINI-QUIZ WIDGET)
         ========================================================================== */}
      <section className="py-14 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel-glow p-7 sm:p-9 text-left border-cyan-500/30 relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  Live Placement Mini-Challenge
                </span>
              </div>
              <button 
                onClick={handleNextQuiz}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Question</span>
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">
              {quizQuestions[currentQuizIdx].q}
            </h3>

            {/* Quiz Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {quizQuestions[currentQuizIdx].options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === quizQuestions[currentQuizIdx].correct;

                let optClass = "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:border-cyan-500/40";
                if (hasAnswered) {
                  if (isCorrect) {
                    optClass = "border-emerald-500 bg-emerald-950/70 text-emerald-200 shadow-lg shadow-emerald-500/20";
                  } else if (isSelected) {
                    optClass = "border-rose-500 bg-rose-950/70 text-rose-200";
                  } else {
                    optClass = "border-slate-800/40 opacity-40 text-slate-500";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(i)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${optClass}`}
                  >
                    <span>{opt}</span>
                    {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                    {hasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & CTA */}
            {hasAnswered && (
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {quizQuestions[currentQuizIdx].explanation}
                </p>
                <Link to="/practice" className="btn-pathpilot-primary text-xs py-2 px-5 shrink-0">
                  <span>Take Full Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================================================
         CORE FEATURES SECTION (#features)
         ========================================================================== */}
      <section id="features" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for <span className="gradient-text-blue-cyan">Placement Success</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything an engineering candidate needs from day 1 of preparation to the final offer letter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-panel-glow p-6 space-y-4 border-cyan-500/25 text-left interactive-card">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-400/40 text-teal-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Dynamic Roadmaps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Custom structured timelines tailored to your target company tier (Product, Service, or High-Frequency Trading).
              </p>
              <Link to="/roadmap" className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 gap-1">
                <span>View Roadmap</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel-glow p-6 space-y-4 border-purple-500/25 text-left interactive-card">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Mistake Journal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically logs tricky edge cases, forgotten constraints, and recurring syntax mistakes for smart spaced repetition.
              </p>
              <Link to="/revision" className="inline-flex items-center text-xs font-semibold text-purple-400 hover:text-purple-300 gap-1">
                <span>Review Journal</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel-glow p-6 space-y-4 border-indigo-500/25 text-left interactive-card">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/40 text-blue-400 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Online Code Workspace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monaco code editor with Python, C++, Java, and JavaScript support, hidden test case execution, and complexity analysis.
              </p>
              <Link to="/practice" className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 gap-1">
                <span>Open Workspace</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel-glow p-6 space-y-4 border-amber-500/25 text-left interactive-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">ATS Resume & Mocks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI resume parser scoring bullet points against real JDs, and interactive conversational technical & HR mock interviews.
              </p>
              <Link to="/resume" className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 gap-1">
                <span>Check Resume</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================================================
         INTERACTIVE AI COACH SANDBOX (#ai-coach)
         ========================================================================== */}
      <section id="ai-coach" className="py-20 relative bg-slate-950/70 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>Real-Time AI Guidance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test Your <span className="gradient-text-blue-cyan">AI Placement Mentor</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Try asking real interview questions or choose a quick prompt below to see how PathPilot explains concepts:
            </p>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(p)}
                className="text-xs px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-cyan-400/60 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* AI Coach Live Interactive Chat Box */}
          <div className="glass-panel-glow p-6 sm:p-8 max-w-3xl mx-auto border-cyan-500/30 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">PathPilot AI Coach</h4>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live • Ready to coach
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800/80 text-cyan-300 border border-slate-700">
                Gemini 2.5 Pro
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2.5'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-lg leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md' 
                      : 'glass-card-floating rounded-tl-xs border-cyan-500/20 text-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex justify-start items-center gap-2 text-slate-400 text-xs py-1">
                  <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span className="animate-pulse">PathPilot AI is analyzing and writing...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                placeholder="Ask anything: e.g. How does Hash collision work in Java?"
                className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition-colors"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={isAiTyping || !userInput.trim()}
                className="btn-pathpilot-primary p-2.5 rounded-full disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================================================
         FINAL CTA BANNER
         ========================================================================== */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel-glow p-10 sm:p-14 text-center space-y-6 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your <span className="gradient-text-pathpilot">Placement Strategy?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of engineering students preparing smarter with personalized roadmaps and AI-driven guidance.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup" className="btn-pathpilot-primary text-sm px-8 py-3.5">
                <span>Create Your Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/dashboard" className="btn-pathpilot-secondary text-sm px-8 py-3.5">
                <span>View Live Demo Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PathPilotLanding;
