/**
 * LiftShaft Component
 * 
 * Purely visual component representing an elevator shaft or building cross-section.
 * Fixed to the left edge of the viewport with a hand-drawn aesthetic.
 * 
 * FUTURE: Could be enhanced with:
 * - Interactive floor selection
 * - Animated elevator car
 * - Floor navigation functionality
 */

export default function LiftShaft() {
  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-slate-100 border-r-4 border-slate-800 flex flex-col items-center py-8 z-10 lift-shaft">
      {/* Shaft header */}
      <div className="mb-6 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-700 border-3 border-slate-900 flex items-center justify-center mb-2 chalk-element">
          <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      </div>

      {/* Floor markers - decorative */}
      <div className="flex-1 flex flex-col justify-around items-center w-full px-2">
        {[6, 5, 4, 3, 2, 1].map((floor) => (
          <div key={floor} className="w-full flex flex-col items-center gap-1">
            <div className="w-10 h-1 bg-slate-400 rounded-full chalk-line"></div>
            <span className="text-xs font-bold text-slate-600 chalk-text">{floor}</span>
          </div>
        ))}
      </div>

      {/* Shaft footer - ground level */}
      <div className="mt-6 text-center">
        <div className="w-14 h-3 bg-slate-800 rounded-sm chalk-element"></div>
        <span className="text-xs font-bold text-slate-700 mt-1 block chalk-text">G</span>
      </div>
    </div>
  );
}
