/**
 * Curated preset covers and avatars for students and admins.
 * Uses high-performance SVG data URIs with rich gradients and crisp vector shapes.
 */

export interface PresetItem {
  id: string;
  nameBn: string;
  nameEn: string;
  url: string;
}

export const PRESET_COVERS: PresetItem[] = [
  {
    id: "cover-cyber-emerald",
    nameBn: "শখেরটেক নিয়ন এমারেল্ড",
    nameEn: "Cyber Emerald",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00180f" />
            <stop offset="50%" stop-color="#003522" />
            <stop offset="100%" stop-color="#02140a" />
          </linearGradient>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#99fe00" stop-opacity="0.35" />
            <stop offset="50%" stop-color="#00ffcc" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#006633" stop-opacity="0" />
          </linearGradient>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(153,254,0,0.08)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="900" height="300" fill="url(#bg)" />
        <rect width="900" height="300" fill="url(#grid)" />
        <circle cx="800" cy="50" r="180" fill="url(#glow)" filter="blur(40px)" />
        <circle cx="150" cy="280" r="140" fill="rgba(0,255,204,0.15)" filter="blur(50px)" />
        <path d="M0,220 Q250,140 500,210 T900,160" fill="none" stroke="#99fe00" stroke-opacity="0.3" stroke-width="2"/>
        <path d="M0,240 Q300,170 600,230 T900,180" fill="none" stroke="#00ffcc" stroke-opacity="0.2" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: "cover-deep-space",
    nameBn: "গভীর গ্যালাক্সি নেবুলা",
    nameEn: "Deep Galaxy",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="space" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#070714" />
            <stop offset="40%" stop-color="#140c28" />
            <stop offset="80%" stop-color="#1e1035" />
            <stop offset="100%" stop-color="#0b0817" />
          </linearGradient>
        </defs>
        <rect width="900" height="300" fill="url(#space)" />
        <circle cx="200" cy="80" r="130" fill="#a855f7" fill-opacity="0.25" filter="blur(60px)" />
        <circle cx="700" cy="180" r="160" fill="#3b82f6" fill-opacity="0.25" filter="blur(70px)" />
        <circle cx="450" cy="50" r="90" fill="#ec4899" fill-opacity="0.2" filter="blur(50px)" />
        <!-- Constellation dots -->
        <circle cx="120" cy="60" r="2" fill="#ffffff" fill-opacity="0.8" />
        <circle cx="280" cy="120" r="1.5" fill="#ffffff" fill-opacity="0.6" />
        <circle cx="400" cy="80" r="2" fill="#ffffff" fill-opacity="0.9" />
        <circle cx="550" cy="140" r="1.5" fill="#ffffff" fill-opacity="0.7" />
        <circle cx="720" cy="90" r="2.5" fill="#ffffff" fill-opacity="0.8" />
        <circle cx="820" cy="210" r="1.5" fill="#ffffff" fill-opacity="0.5" />
        <line x1="120" y1="60" x2="280" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <line x1="280" y1="120" x2="400" y2="80" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <line x1="550" y1="140" x2="720" y2="90" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      </svg>
    `),
  },
  {
    id: "cover-golden-scholar",
    nameBn: "গোল্ডেন স্কলার ক্যাম্পাস",
    nameEn: "Golden Scholar",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="goldbg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#141103" />
            <stop offset="50%" stop-color="#2a2007" />
            <stop offset="100%" stop-color="#120c01" />
          </linearGradient>
        </defs>
        <rect width="900" height="300" fill="url(#goldbg)" />
        <circle cx="750" cy="80" r="170" fill="#f59e0b" fill-opacity="0.25" filter="blur(60px)" />
        <circle cx="200" cy="220" r="140" fill="#fbbf24" fill-opacity="0.18" filter="blur(50px)" />
        <polygon points="650,20 670,60 710,60 680,85 690,125 650,100 610,125 620,85 590,60 630,60" fill="rgba(245,158,11,0.1)" />
        <path d="M0,260 Q350,180 700,240 T900,200" fill="none" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2" />
      </svg>
    `),
  },
  {
    id: "cover-sunset-campus",
    nameBn: "রঙিন গোধূলি ক্যাম্পাস",
    nameEn: "Sunset Campus",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="sunset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1f0814" />
            <stop offset="45%" stop-color="#3b112c" />
            <stop offset="85%" stop-color="#4a1525" />
            <stop offset="100%" stop-color="#1c0714" />
          </linearGradient>
        </defs>
        <rect width="900" height="300" fill="url(#sunset)" />
        <circle cx="650" cy="110" r="140" fill="#f43f5e" fill-opacity="0.3" filter="blur(55px)" />
        <circle cx="300" cy="180" r="150" fill="#fb923c" fill-opacity="0.25" filter="blur(60px)" />
        <circle cx="800" cy="70" r="60" fill="#fb7185" fill-opacity="0.35" />
      </svg>
    `),
  },
  {
    id: "cover-quantum-blue",
    nameBn: "কোয়ান্টাম সায়েন্স ল্যাব",
    nameEn: "Quantum Blue",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="qblue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#021424" />
            <stop offset="50%" stop-color="#052846" />
            <stop offset="100%" stop-color="#02111f" />
          </linearGradient>
        </defs>
        <rect width="900" height="300" fill="url(#qblue)" />
        <circle cx="700" cy="120" r="180" fill="#0ea5e9" fill-opacity="0.25" filter="blur(60px)" />
        <circle cx="200" cy="100" r="120" fill="#06b6d4" fill-opacity="0.2" filter="blur(50px)" />
        <ellipse cx="650" cy="150" rx="140" ry="40" fill="none" stroke="rgba(14,165,233,0.3)" stroke-width="2" transform="rotate(-20 650 150)" />
        <ellipse cx="650" cy="150" rx="140" ry="40" fill="none" stroke="rgba(6,182,212,0.3)" stroke-width="2" transform="rotate(20 650 150)" />
      </svg>
    `),
  },
  {
    id: "cover-obsidian-carbon",
    nameBn: "ডার্ক কার্বন মিনিমাল",
    nameEn: "Dark Carbon",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
        <defs>
          <linearGradient id="carbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d10" />
            <stop offset="50%" stop-color="#111822" />
            <stop offset="100%" stop-color="#05080b" />
          </linearGradient>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="900" height="300" fill="url(#carbon)" />
        <rect width="900" height="300" fill="url(#dots)" />
        <circle cx="800" cy="100" r="120" fill="#99fe00" fill-opacity="0.1" filter="blur(70px)" />
        <line x1="0" y1="280" x2="900" y2="280" stroke="#99fe00" stroke-opacity="0.3" stroke-width="1.5" />
      </svg>
    `),
  },
];

export const PRESET_AVATARS: PresetItem[] = [
  {
    id: "avatar-student-pro",
    nameBn: "স্মার্ট স্কলার",
    nameEn: "Smart Scholar",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="av1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#042e1b" />
            <stop offset="100%" stop-color="#001a10" />
          </linearGradient>
          <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#99fe00" />
            <stop offset="100%" stop-color="#00d68f" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#av1)" />
        <circle cx="120" cy="120" r="114" fill="none" stroke="url(#glow1)" stroke-width="4" />
        <!-- Graduation Cap & Face vector -->
        <path d="M120 55 L180 85 L120 115 L60 85 Z" fill="#99fe00" />
        <path d="M85 100 L85 140 Q120 165 155 140 L155 100" fill="none" stroke="#99fe00" stroke-width="5" stroke-linecap="round" />
        <circle cx="120" cy="145" r="30" fill="#ffffff" fill-opacity="0.9" />
        <path d="M70 205 C70 180, 170 180, 170 205" fill="#99fe00" fill-opacity="0.8" />
      </svg>
    `),
  },
  {
    id: "avatar-science-explorer",
    nameBn: "বিজ্ঞান এক্সপ্লোরার",
    nameEn: "Science Explorer",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="av2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06283d" />
            <stop offset="100%" stop-color="#03131d" />
          </linearGradient>
          <linearGradient id="glow2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#av2)" />
        <circle cx="120" cy="120" r="114" fill="none" stroke="url(#glow2)" stroke-width="4" />
        <!-- Atom orbits -->
        <ellipse cx="120" cy="120" rx="60" ry="22" fill="none" stroke="#38bdf8" stroke-width="4" transform="rotate(30 120 120)" />
        <ellipse cx="120" cy="120" rx="60" ry="22" fill="none" stroke="#38bdf8" stroke-width="4" transform="rotate(-30 120 120)" />
        <ellipse cx="120" cy="120" rx="60" ry="22" fill="none" stroke="#38bdf8" stroke-width="4" transform="rotate(90 120 120)" />
        <circle cx="120" cy="120" r="16" fill="#38bdf8" />
        <circle cx="120" cy="120" r="8" fill="#ffffff" />
      </svg>
    `),
  },
  {
    id: "avatar-coder-pro",
    nameBn: "কোডার ও টেক জিনিয়াস",
    nameEn: "Tech Genius",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="av3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b" />
            <stop offset="100%" stop-color="#09090b" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#av3)" />
        <circle cx="120" cy="120" r="114" fill="none" stroke="#a855f7" stroke-width="4" />
        <!-- Code tag symbols -->
        <path d="M85 90 L55 120 L85 150" fill="none" stroke="#a855f7" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M155 90 L185 120 L155 150" fill="none" stroke="#a855f7" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
        <line x1="135" y1="80" x2="105" y2="160" stroke="#ec4899" stroke-width="7" stroke-linecap="round" />
      </svg>
    `),
  },
  {
    id: "avatar-top-performer",
    nameBn: "গোল্ডেন চ্যাম্পিয়ন",
    nameEn: "Gold Champion",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="av4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2a1f05" />
            <stop offset="100%" stop-color="#120c02" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#av4)" />
        <circle cx="120" cy="120" r="114" fill="none" stroke="#fbbf24" stroke-width="4" />
        <!-- Trophy & Star -->
        <path d="M80 80 L160 80 L145 130 Q120 150 95 130 Z" fill="#f59e0b" />
        <path d="M80 88 H60 Q60 115 85 115" fill="none" stroke="#fbbf24" stroke-width="5" />
        <path d="M160 88 H180 Q180 115 155 115" fill="none" stroke="#fbbf24" stroke-width="5" />
        <rect x="112" y="145" width="16" height="22" fill="#fbbf24" />
        <rect x="90" y="167" width="60" height="12" rx="4" fill="#f59e0b" />
      </svg>
    `),
  },
  {
    id: "avatar-admin-shield",
    nameBn: "অ্যাডমিন শিল্ড",
    nameEn: "Admin Shield",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="av5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#002417" />
            <stop offset="100%" stop-color="#02140a" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#av5)" />
        <circle cx="120" cy="120" r="114" fill="none" stroke="#99fe00" stroke-width="4" />
        <!-- Shield with checkmark -->
        <path d="M120 55 L175 80 V130 C175 165 120 190 120 190 C120 190 65 165 65 130 V80 Z" fill="#99fe00" fill-opacity="0.2" stroke="#99fe00" stroke-width="6" stroke-linejoin="round" />
        <path d="M100 120 L115 135 L145 105" fill="none" stroke="#99fe00" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `),
  },
  {
    id: "avatar-minimal-gemini",
    nameBn: "মডার্ন নিয়ন স্পার্ক",
    nameEn: "Neon Spark",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="av6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#av6)" />
        <circle cx="120" cy="120" r="114" fill="none" stroke="#10b981" stroke-width="4" />
        <!-- Four-point Sparkle Star -->
        <path d="M120 50 Q120 120 50 120 Q120 120 120 190 Q120 120 190 120 Q120 120 120 50 Z" fill="#10b981" />
        <circle cx="120" cy="120" r="14" fill="#ffffff" />
      </svg>
    `),
  },
];
