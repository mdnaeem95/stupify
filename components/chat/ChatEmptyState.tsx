import { SimplicityLevel } from '@/lib/prompts';

interface ChatEmptyStateProps {
  simplicityLevel: SimplicityLevel;
  greeting?: string | null;
}

export function ChatEmptyState({ simplicityLevel, greeting }: ChatEmptyStateProps) {
  return (
    <div className="text-center space-y-8 py-12">
      {/* Personalized Greeting */}
      {greeting && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{greeting}</h2>
        </div>
      )}

      {/* Blinky Mascot */}
      <div className="mx-auto w-48">
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>
          <circle cx="100" cy="80" r="55" fill="url(#glowGradient)" opacity="0.3">
            <animate attributeName="r" values="55;60;55" dur="2s" repeatCount="indefinite" />
          </circle>
          <path
            d="M 100 30 C 75 30, 60 45, 60 70 C 60 85, 65 95, 70 105 L 70 115 L 130 115 L 130 105 C 135 95, 140 85, 140 70 C 140 45, 125 30, 100 30 Z"
            fill="url(#bulbGradient)"
            stroke="#6366f1"
            strokeWidth="2"
          />
          <ellipse cx="85" cy="55" rx="15" ry="20" fill="white" opacity="0.4" />
          <ellipse cx="90" cy="50" rx="8" ry="10" fill="white" opacity="0.6" />
          <rect x="75" y="115" width="50" height="8" fill="#cbd5e1" rx="2" />
          <rect x="75" y="125" width="50" height="8" fill="#94a3b8" rx="2" />
          <rect x="75" y="135" width="50" height="8" fill="#cbd5e1" rx="2" />
          <rect x="80" y="145" width="40" height="12" fill="#64748b" rx="3" />
          <g>
            <circle cx="85" cy="75" r="5" fill="#1e293b" />
            <circle cx="87" cy="73" r="2" fill="white" />
            <circle cx="115" cy="75" r="5" fill="#1e293b" />
            <circle cx="117" cy="73" r="2" fill="white" />
            <path d="M 80 90 Q 100 105, 120 90" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="70" cy="85" r="6" fill="#f472b6" opacity="0.4" />
            <circle cx="130" cy="85" r="6" fill="#f472b6" opacity="0.4" />
          </g>
          <path d="M 60 90 Q 45 85, 35 95" stroke="#6366f1" strokeWidth="6" fill="none" strokeLinecap="round">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 90"
              to="15 60 90"
              dur="0.5s"
              repeatCount="indefinite"
              direction="alternate"
            />
          </path>
          <circle cx="35" cy="95" r="5" fill="#6366f1">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 90"
              to="15 60 90"
              dur="0.5s"
              repeatCount="indefinite"
              direction="alternate"
            />
          </circle>
          <g>
            <path d="M 145 45 L 147 50 L 152 52 L 147 54 L 145 59 L 143 54 L 138 52 L 143 50 Z" fill="#fbbf24">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </path>
            <path d="M 55 50 L 57 55 L 62 57 L 57 59 L 55 64 L 53 59 L 48 57 L 53 55 Z" fill="#fbbf24">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </path>
            <path d="M 100 25 L 102 30 L 107 32 L 102 34 L 100 39 L 98 34 L 93 32 L 98 30 Z" fill="#fbbf24">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Hey! I&apos;m Blinky 👋</h2>
        <p className="text-gray-600 text-lg">
          Ask me anything and I&apos;ll explain it in a way that actually makes sense
        </p>
      </div>

      {/* Mode Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
        <div
          className={`rounded-xl p-4 text-left border-2 transition-all ${
            simplicityLevel === '5yo'
              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200'
              : 'bg-purple-50 border-purple-200 hover:border-purple-300'
          }`}
        >
          <div className="text-2xl mb-2">👶</div>
          <div className="font-semibold text-sm text-purple-900 mb-1 flex items-center gap-2">
            5 years old mode
            {simplicityLevel === '5yo' && (
              <span className="text-[10px] bg-purple-200 px-1.5 py-0.5 rounded">Active</span>
            )}
          </div>
          <div className="text-xs text-purple-700">Super simple words, fun analogies</div>
        </div>

        <div
          className={`rounded-xl p-4 text-left border-2 transition-all ${
            simplicityLevel === 'normal'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
              : 'bg-blue-50 border-blue-200 hover:border-blue-300'
          }`}
        >
          <div className="text-2xl mb-2">🤓</div>
          <div className="font-semibold text-sm text-blue-900 mb-1 flex items-center gap-2">
            Normal person mode
            {simplicityLevel === 'normal' && (
              <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">Active</span>
            )}
          </div>
          <div className="text-xs text-blue-700">Clear explanations, no jargon</div>
        </div>

        <div
          className={`rounded-xl p-4 text-left border-2 transition-all ${
            simplicityLevel === 'advanced'
              ? 'bg-green-50 border-green-400 ring-2 ring-green-200'
              : 'bg-green-50 border-green-200 hover:border-green-300'
          }`}
        >
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold text-sm text-green-900 mb-1 flex items-center gap-2">
            Advanced mode
            {simplicityLevel === 'advanced' && (
              <span className="text-[10px] bg-green-200 px-1.5 py-0.5 rounded">Active</span>
            )}
          </div>
          <div className="text-xs text-green-700">More depth, still crystal clear</div>
        </div>
      </div>
    </div>
  );
}