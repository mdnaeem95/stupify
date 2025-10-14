import React from 'react';

type MascotExpression = 'happy' | 'thinking' | 'excited' | 'waving' | 'celebrating' | 'proud';

interface MascotProps {
  expression?: MascotExpression;
  size?: number;
  className?: string;
}

export function Mascot({ expression = 'happy', size = 200, className = '' }: MascotProps) {
  const getFaceForExpression = () => {
    switch (expression) {
      case 'thinking':
        return (
          <g id="thinking-face">
            {/* Eyes looking up-right */}
            <circle cx="90" cy="72" r="5" fill="#1e293b"/>
            <circle cx="92" cy="70" r="2" fill="white"/>
            <circle cx="120" cy="72" r="5" fill="#1e293b"/>
            <circle cx="122" cy="70" r="2" fill="white"/>
            
            {/* Thinking expression */}
            <path d="M 85 92 Q 100 88, 115 92" 
                  stroke="#1e293b" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            {/* Thought bubble */}
            <circle cx="135" cy="60" r="3" fill="#94a3b8" opacity="0.6">
              <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="145" cy="50" r="5" fill="#94a3b8" opacity="0.6">
              <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="150" cy="35" r="8" fill="#94a3b8" opacity="0.6">
              <animate attributeName="r" values="8;9;8" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
        );
      
      case 'excited':
        return (
          <g id="excited-face">
            {/* Wide eyes */}
            <circle cx="85" cy="75" r="6" fill="#1e293b"/>
            <circle cx="87" cy="73" r="3" fill="white"/>
            <circle cx="115" cy="75" r="6" fill="#1e293b"/>
            <circle cx="117" cy="73" r="3" fill="white"/>
            
            {/* Big open smile */}
            <ellipse cx="100" cy="95" rx="12" ry="8" fill="#1e293b"/>
            <ellipse cx="100" cy="92" rx="10" ry="6" fill="#f472b6"/>
            
            {/* Rosy cheeks */}
            <circle cx="68" cy="85" r="7" fill="#f472b6" opacity="0.5"/>
            <circle cx="132" cy="85" r="7" fill="#f472b6" opacity="0.5"/>
          </g>
        );
      
      case 'waving':
        return (
          <g id="waving-face">
            {/* Winking */}
            <circle cx="85" cy="75" r="5" fill="#1e293b"/>
            <circle cx="87" cy="73" r="2" fill="white"/>
            
            {/* Wink */}
            <path d="M 108 75 Q 115 73, 122 75" 
                  stroke="#1e293b" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            {/* Big smile */}
            <path d="M 80 90 Q 100 108, 120 90" 
                  stroke="#1e293b" 
                  strokeWidth="4" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            {/* Rosy cheeks */}
            <circle cx="70" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
            <circle cx="130" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
          </g>
        );

      case 'celebrating':
        return (
          <g id="celebrating-face">
            {/* Star eyes! */}
            <g transform="translate(85, 75)">
              <path d="M 0 -5 L 1.5 -1.5 L 5 0 L 1.5 1.5 L 0 5 L -1.5 1.5 L -5 0 L -1.5 -1.5 Z" 
                    fill="#fbbf24"/>
            </g>
            <g transform="translate(115, 75)">
              <path d="M 0 -5 L 1.5 -1.5 L 5 0 L 1.5 1.5 L 0 5 L -1.5 1.5 L -5 0 L -1.5 -1.5 Z" 
                    fill="#fbbf24"/>
            </g>
            
            {/* Huge smile */}
            <path d="M 70 90 Q 100 118, 130 90" 
                  stroke="#1e293b" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            {/* Extra rosy cheeks */}
            <circle cx="65" cy="85" r="10" fill="#f472b6" opacity="0.7"/>
            <circle cx="135" cy="85" r="10" fill="#f472b6" opacity="0.7"/>
          </g>
        );

      case 'proud':
        return (
          <g id="proud-face">
            {/* Confident eyes */}
            <circle cx="85" cy="75" r="5" fill="#1e293b"/>
            <circle cx="87" cy="73" r="2" fill="white"/>
            <circle cx="115" cy="75" r="5" fill="#1e293b"/>
            <circle cx="117" cy="73" r="2" fill="white"/>
            
            {/* Proud smile */}
            <path d="M 80 92 Q 100 102, 120 92" 
                  stroke="#1e293b" 
                  strokeWidth="4" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            {/* Slight blush */}
            <circle cx="70" cy="85" r="6" fill="#f472b6" opacity="0.3"/>
            <circle cx="130" cy="85" r="6" fill="#f472b6" opacity="0.3"/>
          </g>
        );

      default: // happy
        return (
          <g id="happy-face">
            <circle cx="85" cy="75" r="5" fill="#1e293b"/>
            <circle cx="87" cy="73" r="2" fill="white"/>
            <circle cx="115" cy="75" r="5" fill="#1e293b"/>
            <circle cx="117" cy="73" r="2" fill="white"/>
            
            <path d="M 80 90 Q 100 105, 120 90" 
                  stroke="#1e293b" 
                  strokeWidth="4" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            <circle cx="70" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
            <circle cx="130" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
          </g>
        );
    }
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      width={size} 
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:'#a855f7',stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:'#fbbf24',stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:'#f59e0b',stopOpacity:0.6}} />
        </linearGradient>
      </defs>
      
      {/* Glow effect */}
      <circle cx="100" cy="80" r="55" fill="url(#glowGradient)" opacity="0.3">
        {expression === 'celebrating' ? (
          <animate attributeName="r" values="55;65;55" dur="1s" repeatCount="indefinite"/>
        ) : (
          <animate attributeName="r" values="55;60;55" dur="2s" repeatCount="indefinite"/>
        )}
      </circle>
      
      {/* Main bulb body */}
      <path 
        d="M 100 30 C 75 30, 60 45, 60 70 C 60 85, 65 95, 70 105 L 70 115 L 130 115 L 130 105 C 135 95, 140 85, 140 70 C 140 45, 125 30, 100 30 Z" 
        fill="url(#bulbGradient)"
      />
      
      {/* Inner highlight */}
      <ellipse cx="90" cy="55" rx="15" ry="20" fill="white" opacity="0.3"/>
      
      {/* Base/socket */}
      <rect x="85" y="115" width="30" height="10" rx="2" fill="#6366f1"/>
      <rect x="80" y="125" width="40" height="8" rx="2" fill="#4f46e5"/>
      
      {/* Filament lines */}
      <line x1="95" y1="70" x2="95" y2="100" stroke="#fbbf24" strokeWidth="2" opacity="0.6"/>
      <line x1="105" y1="70" x2="105" y2="100" stroke="#fbbf24" strokeWidth="2" opacity="0.6"/>
      
      {/* Face based on expression */}
      {getFaceForExpression()}
      
      {/* Extra sparkles for celebrating */}
      {expression === 'celebrating' && (
        <g id="celebration-sparkles">
          <path d="M 145 50 L 147 55 L 152 57 L 147 59 L 145 64 L 143 59 L 138 57 L 143 55 Z" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M 55 50 L 57 55 L 62 57 L 57 59 L 55 64 L 53 59 L 48 57 L 53 55 Z" fill="#fbbf24">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M 100 20 L 102 25 L 107 27 L 102 29 L 100 34 L 98 29 L 93 27 L 98 25 Z" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
          </path>
        </g>
      )}
      
      {/* Waving arm */}
      {expression === 'waving' && (
        <g id="waving-arm">
          <path d="M 60 90 Q 45 85, 35 95" 
                stroke="#6366f1" 
                strokeWidth="6" 
                fill="none" 
                strokeLinecap="round">
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
        </g>
      )}
    </svg>
  );
}

// Demo component showing all expressions
export default function MascotDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Meet Blinky! 💡
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <Mascot expression="happy" size={180} />
            <h3 className="text-xl font-bold mt-4 mb-2">Happy Blinky</h3>
            <p className="text-gray-600 text-sm">Default friendly expression</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <Mascot expression="thinking" size={180} />
            <h3 className="text-xl font-bold mt-4 mb-2">Thinking Blinky</h3>
            <p className="text-gray-600 text-sm">When processing your question</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <Mascot expression="excited" size={180} />
            <h3 className="text-xl font-bold mt-4 mb-2">Excited Blinky</h3>
            <p className="text-gray-600 text-sm">When you understand something!</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <Mascot expression="waving" size={180} />
            <h3 className="text-xl font-bold mt-4 mb-2">Waving Blinky</h3>
            <p className="text-gray-600 text-sm">Welcoming you to Stupify</p>
          </div>
        </div>
        
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Mascot expression="waving" size={60} />
              <div>
                <p className="font-mono text-sm text-gray-600">&lt;Mascot expression=`&quot;`waving`&quot;` size={60} /&gt;</p>
                <p className="text-sm text-gray-500 mt-1">Use in welcome screens</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Mascot expression="thinking" size={60} />
              <div>
                <p className="font-mono text-sm text-gray-600">&lt;Mascot expression=`&quot;`thinking`&quot;` size={60} /&gt;</p>
                <p className="text-sm text-gray-500 mt-1">Show while AI is responding</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Mascot expression="excited" size={60} />
              <div>
                <p className="font-mono text-sm text-gray-600">&lt;Mascot expression=`&quot;`excited`&quot;` size={60} /&gt;</p>
                <p className="text-sm text-gray-500 mt-1">Use for success states</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}