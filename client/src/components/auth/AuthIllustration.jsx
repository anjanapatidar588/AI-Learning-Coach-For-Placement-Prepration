import React from 'react';

const AuthIllustration = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      <svg
        viewBox="0 0 600 480"
        className="w-full h-auto drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdf2f8" />
            <stop offset="100%" stopColor="#fce7f3" />
          </linearGradient>
          <linearGradient id="hoodieGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="laptopGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="glowWindow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient Room & Window Backing */}
        <rect x="0" y="0" width="600" height="480" rx="32" fill="url(#wallGrad)" />
        <rect x="180" y="20" width="240" height="340" rx="20" fill="url(#glowWindow)" stroke="#e2e8f0" strokeWidth="2" />

        {/* PINBOARD ON LEFT WALL */}
        <g transform="translate(10, 160)">
          {/* Corkboard back */}
          <rect x="0" y="0" width="130" height="150" rx="8" fill="#cbd5e1" opacity="0.6" />
          <rect x="5" y="5" width="120" height="140" rx="6" fill="#94a3b8" opacity="0.4" />

          {/* Yellow Sticky Note */}
          <rect x="18" y="20" width="85" height="95" rx="4" fill="#fef08a" stroke="#fde047" strokeWidth="1" className="drop-shadow-xs" />
          {/* Red pin */}
          <circle cx="60" cy="26" r="3" fill="#ef4444" />
          {/* Note Checklist */}
          <text x="26" y="50" fill="#1e293b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">✓ Learn</text>
          <text x="26" y="68" fill="#1e293b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">✓ Practice</text>
          <text x="26" y="86" fill="#1e293b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">✓ Get Placed</text>
          <text x="54" y="104" fill="#475569" fontSize="14" fontFamily="sans-serif">😊</text>
        </g>

        {/* FAINT SKETCHED STAIRWAY TO DREAM JOB (Behind laptop in center/right) */}
        <g transform="translate(240, 60)" opacity="0.85">
          {/* Stairs */}
          <path
            d="M20 180 L45 180 L45 150 L80 150 L80 115 L120 115 L120 75 L165 75"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            fill="none"
          />
          {/* Step Labels */}
          <text x="20" y="200" fill="#6366f1" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Grow</text>
          <text x="50" y="140" fill="#6366f1" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Learn</text>
          <text x="85" y="105" fill="#6366f1" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Practice</text>
          <text x="80" y="45" fill="#4f46e5" fontSize="14" fontFamily="sans-serif" fontWeight="black">Dream Job</text>

          {/* Victory Flag at Top */}
          <line x1="165" y1="75" x2="165" y2="40" stroke="#4f46e5" strokeWidth="2.5" />
          <polygon points="165,40 190,48 165,56" fill="#6366f1" />

          {/* Mini Student Climber Figure */}
          <circle cx="52" cy="115" r="5" fill="#6366f1" />
          <line x1="52" y1="120" x2="52" y2="135" stroke="#6366f1" strokeWidth="2.5" />
          <line x1="52" y1="125" x2="44" y2="132" stroke="#6366f1" strokeWidth="2" />
          <line x1="52" y1="125" x2="60" y2="130" stroke="#6366f1" strokeWidth="2" />
          <line x1="52" y1="135" x2="46" y2="148" stroke="#6366f1" strokeWidth="2" />
          <line x1="52" y1="135" x2="58" y2="148" stroke="#6366f1" strokeWidth="2" />
        </g>

        {/* DESK SURFACE */}
        <path d="M0 360 L600 360 L600 480 L0 480 Z" fill="url(#deskGrad)" />
        <line x1="0" y1="360" x2="600" y2="360" stroke="#fbcfe8" strokeWidth="3" />

        {/* STACK OF 4 TEXTBOOKS ON LEFT OF DESK */}
        <g transform="translate(15, 300)">
          {/* Bottom Book 4: Interview Prep (Purple) */}
          <rect x="0" y="90" width="165" height="24" rx="5" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
          <text x="24" y="106" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Interview Prep</text>

          {/* Book 3: System Design (Teal/Emerald) */}
          <rect x="5" y="66" width="160" height="24" rx="5" fill="#0d9488" stroke="#0f766e" strokeWidth="1" />
          <text x="24" y="82" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold">System Design</text>

          {/* Book 2: Aptitude (Blue) */}
          <rect x="10" y="42" width="150" height="24" rx="5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <text x="26" y="58" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Aptitude</text>

          {/* Top Book 1: DSA (Deep Navy Blue) */}
          <rect x="15" y="18" width="140" height="24" rx="5" fill="#1e1b4b" stroke="#0f172a" strokeWidth="1" />
          <text x="32" y="34" fill="#ffffff" fontSize="11" fontFamily="sans-serif" fontWeight="black">DSA</text>
        </g>

        {/* NOTEBOOK & PEN ON DESK */}
        <g transform="translate(180, 395)">
          {/* Open Notebook */}
          <rect x="0" y="0" width="130" height="45" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" className="drop-shadow-xs" />
          <line x1="65" y1="0" x2="65" y2="45" stroke="#cbd5e1" strokeWidth="1" />
          {/* Text lines */}
          <line x1="12" y1="12" x2="55" y2="12" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="12" y1="22" x2="48" y2="22" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="12" y1="32" x2="52" y2="32" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="75" y1="12" x2="118" y2="12" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="75" y1="22" x2="110" y2="22" stroke="#e2e8f0" strokeWidth="2" />
          {/* Pen lying on notebook */}
          <line x1="50" y1="4" x2="115" y2="22" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* COFFEE MUG WITH MOTIVATIONAL TEXT */}
        <g transform="translate(435, 345)">
          <path d="M5 25 L45 25 L40 95 L10 95 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          {/* Cup Handle */}
          <path d="M43 35 C 55 35, 55 75, 40 75" stroke="#e2e8f0" strokeWidth="3.5" fill="none" />
          {/* Coffee lid */}
          <rect x="2" y="20" width="46" height="7" rx="3" fill="#1e293b" />
          {/* Text */}
          <text x="14" y="52" fill="#1e1b4b" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Future</text>
          <text x="16" y="64" fill="#1e1b4b" fontSize="8" fontFamily="sans-serif" fontWeight="bold">You</text>
          <text x="12" y="76" fill="#1e1b4b" fontSize="7" fontFamily="sans-serif" fontWeight="semibold">Got This</text>
          <text x="22" y="88" fill="#f43f5e" fontSize="9" fontFamily="sans-serif">♥</text>
        </g>

        {/* POTTED GREEN PLANT ON RIGHT */}
        <g transform="translate(460, 270)">
          {/* Leaves */}
          <path d="M40 70 Q 20 20 40 0 Q 60 20 40 70 Z" fill="#10b981" />
          <path d="M35 70 Q 10 35 15 15 Q 35 30 35 70 Z" fill="#059669" />
          <path d="M45 70 Q 70 35 65 15 Q 45 30 45 70 Z" fill="#34d399" />
          <path d="M38 70 Q 0 50 10 40 Q 30 55 38 70 Z" fill="#047857" />
          <path d="M42 70 Q 80 50 70 40 Q 50 55 42 70 Z" fill="#10b981" />
          {/* Pot */}
          <path d="M22 65 L58 65 L52 100 L28 100 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>

        {/* THE STUDENT (FEMALE WITH HIGH BUN IN PURPLE HOODIE) */}
        <g transform="translate(110, 180)">
          {/* Hair Bun */}
          <circle cx="115" cy="55" r="28" fill="url(#hairGrad)" />
          {/* Hair strands & bangs */}
          <path d="M85 85 Q 115 50 145 85 Q 160 115 150 145 Q 130 160 90 145 Z" fill="url(#hairGrad)" />

          {/* Face */}
          <path d="M98 105 Q 100 155 125 158 Q 150 155 152 105 Z" fill="#fed7aa" />
          {/* Smiling Eyes */}
          <path d="M112 118 Q 118 114 124 118" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M136 118 Q 142 114 148 118" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Eyebrows */}
          <path d="M110 110 Q 118 106 124 110" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M136 110 Q 142 106 148 110" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Cute Smile */}
          <path d="M125 136 Q 133 144 140 136" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Cheek blush */}
          <circle cx="110" cy="130" r="6" fill="#f43f5e" opacity="0.3" />
          <circle cx="150" cy="130" r="6" fill="#f43f5e" opacity="0.3" />

          {/* Chin resting on left hand */}
          <path d="M142 152 Q 155 150 160 165 L 160 190 L 140 180 Z" fill="#fed7aa" />

          {/* Purple Hoodie & Body */}
          <path d="M75 180 Q 125 160 175 180 L 195 240 L 55 240 Z" fill="url(#hoodieGrad)" />
          {/* Hoodie Strings */}
          <line x1="115" y1="175" x2="112" y2="215" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="135" y1="175" x2="138" y2="215" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

          {/* Left Arm up to chin */}
          <path d="M170 185 Q 185 220 160 230" stroke="url(#hoodieGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />

          {/* Right Arm typing on laptop */}
          <path d="M85 190 Q 110 215 150 215" stroke="url(#hoodieGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />
          {/* Right hand on laptop keyboard */}
          <ellipse cx="160" cy="216" rx="10" ry="6" fill="#fed7aa" />
        </g>

        {/* MODERN SLIM LAPTOP */}
        <g transform="translate(230, 275)">
          {/* Laptop Screen (angled open) */}
          <polygon points="20,130 110,40 190,40 120,130" fill="url(#laptopGrad)" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="28,125 112,45 182,45 118,125" fill="#f8fafc" />
          {/* Glowing Apple/PathPilot logo on back of screen */}
          <circle cx="115" cy="80" r="7" fill="#ffffff" opacity="0.8" />

          {/* Laptop Base & Keyboard */}
          <polygon points="15,130 125,130 155,145 40,145" fill="#94a3b8" />
          <polygon points="30,132 120,132 145,142 50,142" fill="#475569" />
          {/* Trackpad */}
          <polygon points="75,138 105,138 108,143 78,143" fill="#cbd5e1" />
        </g>
      </svg>
    </div>
  );
};

export default AuthIllustration;
