/**
 * Shokher Tech's own spot illustrations: flat duotone shapes in the brand
 * palette (lime #99FE00, leaf #19CC61, amber, deep greens) on a soft blob.
 * Pure SVG, so they stay crisp at any size and cost nothing to load.
 */

type Props = { className?: string; title?: string };

const LIME = "#99FE00";
const LEAF = "#19CC61";
const DEEP = "#065136";
const PANEL = "#0A3C26";
const LINE = "#29473C";
const AMBER = "#FBBF24";
const ROSE = "#FB7185";
const INK = "#E6FFC2";

function Frame({ className, title, children, id }: Props & { children: React.ReactNode; id: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`${id}-blob`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={LEAF} stopOpacity="0.28" />
          <stop offset="100%" stopColor={LEAF} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-lime`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={LIME} />
          <stop offset="100%" stopColor={LEAF} />
        </linearGradient>
      </defs>
      <path d="M60 8c26 0 50 14 52 42s-14 58-48 62S6 98 8 64 34 8 60 8z" fill={`url(#${id}-blob)`} />
      {children}
    </svg>
  );
}

/** Practice: a stack of question cards with a tick and a light bulb. */
export function PracticeArt(p: Props) {
  return (
    <Frame {...p} id="ill-practice">
      <rect x="30" y="36" width="58" height="60" rx="10" fill={PANEL} stroke={LINE} strokeWidth="2" transform="rotate(-8 59 66)" />
      <rect x="28" y="30" width="60" height="62" rx="10" fill={DEEP} stroke={LINE} strokeWidth="2" />
      <rect x="38" y="42" width="34" height="5" rx="2.5" fill={INK} opacity="0.9" />
      <rect x="38" y="52" width="24" height="5" rx="2.5" fill={INK} opacity="0.45" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="42" cy={66 + i * 9} r="3.5" fill="none" stroke={i === 1 ? LIME : LINE} strokeWidth="2" />
          {i === 1 && <circle cx="42" cy={66 + i * 9} r="1.6" fill={LIME} />}
          <rect x="50" y={64 + i * 9} width={i === 1 ? 26 : 20} height="4" rx="2" fill={INK} opacity={i === 1 ? 0.85 : 0.35} />
        </g>
      ))}
      <circle cx="88" cy="34" r="13" fill={`url(#ill-practice-lime)`} />
      <path d="M82 34l4 4 8-8" fill="none" stroke={DEEP} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(14 74)">
        <path d="M8 0a8 8 0 0 1 5 14v3H3v-3A8 8 0 0 1 8 0z" fill={AMBER} />
        <rect x="3.5" y="18" width="9" height="3" rx="1.5" fill={AMBER} opacity="0.7" />
      </g>
    </Frame>
  );
}

/** Live exam: a stopwatch sending out signal waves. */
export function LiveArt(p: Props) {
  return (
    <Frame {...p} id="ill-live">
      <path d="M22 40a40 40 0 0 0 0 44" fill="none" stroke={ROSE} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M30 46a30 30 0 0 0 0 32" fill="none" stroke={ROSE} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <path d="M98 40a40 40 0 0 1 0 44" fill="none" stroke={ROSE} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M90 46a30 30 0 0 1 0 32" fill="none" stroke={ROSE} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <rect x="54" y="20" width="12" height="8" rx="3" fill={LINE} />
      <circle cx="60" cy="64" r="30" fill={DEEP} stroke={LINE} strokeWidth="2.5" />
      <circle cx="60" cy="64" r="22" fill="none" stroke={`url(#ill-live-lime)`} strokeWidth="5" strokeDasharray="100 140" strokeLinecap="round" transform="rotate(-90 60 64)" />
      <path d="M60 64V50" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M60 64l9 6" stroke={LIME} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="64" r="3.5" fill={INK} />
      <circle cx="86" cy="36" r="6" fill={ROSE} />
      <circle cx="86" cy="36" r="10" fill="none" stroke={ROSE} strokeWidth="2" opacity="0.4" />
    </Frame>
  );
}

/** Model test: a marked answer sheet with an A+ seal. */
export function ModelTestArt(p: Props) {
  return (
    <Frame {...p} id="ill-model">
      <rect x="30" y="22" width="56" height="74" rx="9" fill={DEEP} stroke={LINE} strokeWidth="2" />
      <rect x="46" y="18" width="24" height="10" rx="4" fill={LINE} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="38" y={40 + i * 12} width="7" height="7" rx="2" fill={i === 2 ? "none" : LEAF} stroke={i === 2 ? LINE : "none"} strokeWidth="2" />
          <rect x="50" y={41.5 + i * 12} width={i % 2 ? 18 : 26} height="4" rx="2" fill={INK} opacity="0.5" />
        </g>
      ))}
      <circle cx="84" cy="84" r="17" fill={`url(#ill-model-lime)`} />
      <circle cx="84" cy="84" r="12" fill="none" stroke={DEEP} strokeWidth="1.5" strokeDasharray="3 2.5" />
      <text x="84" y="89" textAnchor="middle" fontSize="13" fontWeight="800" fill={DEEP} fontFamily="system-ui, sans-serif">
        A+
      </text>
    </Frame>
  );
}

/** Mistakes: a notebook where a cross turns into a tick. */
export function MistakesArt(p: Props) {
  return (
    <Frame {...p} id="ill-mistakes">
      <rect x="26" y="26" width="64" height="70" rx="10" fill={DEEP} stroke={LINE} strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx="26" cy={36 + i * 13} r="3" fill={LINE} />
      ))}
      <circle cx="46" cy="52" r="10" fill={ROSE} opacity="0.2" />
      <path d="M41 47l10 10M51 47L41 57" stroke={ROSE} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M58 52c8 0 12 4 12 12" fill="none" stroke={AMBER} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="1 5" />
      <path d="M66 62l4 4 4-4" fill="none" stroke={AMBER} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="70" cy="78" r="11" fill={`url(#ill-mistakes-lime)`} />
      <path d="M64.5 78l4 4 7-7" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

/** Leaderboard: a podium with a crown on top. */
export function LeaderboardArt(p: Props) {
  return (
    <Frame {...p} id="ill-board">
      <rect x="20" y="66" width="26" height="30" rx="5" fill={PANEL} stroke={LINE} strokeWidth="2" />
      <rect x="47" y="52" width="26" height="44" rx="5" fill={DEEP} stroke={LINE} strokeWidth="2" />
      <rect x="74" y="74" width="26" height="22" rx="5" fill={PANEL} stroke={LINE} strokeWidth="2" />
      <text x="33" y="86" textAnchor="middle" fontSize="12" fontWeight="800" fill={INK} opacity="0.7" fontFamily="system-ui, sans-serif">2</text>
      <text x="60" y="78" textAnchor="middle" fontSize="15" fontWeight="800" fill={LIME} fontFamily="system-ui, sans-serif">1</text>
      <text x="87" y="90" textAnchor="middle" fontSize="12" fontWeight="800" fill={INK} opacity="0.7" fontFamily="system-ui, sans-serif">3</text>
      <path d="M46 40l5-14 9 9 9-9 5 14z" fill={AMBER} />
      <circle cx="51" cy="25" r="3" fill={AMBER} />
      <circle cx="60" cy="33" r="3" fill={AMBER} />
      <circle cx="69" cy="25" r="3" fill={AMBER} />
      <path d="M20 30l3 3M100 30l-3 3M28 18l2 4M92 18l-2 4" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" />
    </Frame>
  );
}

/** Empty states: an open book with sparkles. */
export function EmptyArt(p: Props) {
  return (
    <Frame {...p} id="ill-empty">
      <path d="M60 42c-10-8-24-10-36-8v52c12-2 26 0 36 8z" fill={DEEP} stroke={LINE} strokeWidth="2" />
      <path d="M60 42c10-8 24-10 36-8v52c-12-2-26 0-36 8z" fill={PANEL} stroke={LINE} strokeWidth="2" />
      <path d="M32 50c8-1 15 0 21 3M32 60c8-1 15 0 21 3M67 53c6-3 13-4 21-3M67 63c6-3 13-4 21-3" stroke={INK} strokeWidth="2.4" strokeLinecap="round" opacity="0.4" />
      <path d="M86 18l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill={LIME} />
      <path d="M30 22l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill={AMBER} />
    </Frame>
  );
}
