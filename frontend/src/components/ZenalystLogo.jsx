export default function ZenalystLogo({ height = 40, className = "" }) {
  return (
    <div className={`d-flex align-items-center ${className}`} style={{ height: `${height}px` }}>
      <svg 
        width={height * 4} 
        height={height} 
        viewBox="0 0 160 40" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '100%', width: 'auto' }}
      >
        {/* Yellow rounded square background for Z */}
        <rect x="2" y="2" width="36" height="36" rx="6" ry="6" fill="#F1C40F"/>
        
        {/* Black Z letter */}
        <text x="20" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#000000" textAnchor="middle">Z</text>
        
        {/* Main text "enalyst" */}
        <text x="48" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="400" fill="#000000">en</text>
        
        {/* Yellow triangle for A */}
        <polygon points="78,15 84,28 72,28" fill="#F1C40F"/>
        
        {/* Rest of text "lyst" */}
        <text x="88" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="400" fill="#000000">lyst</text>
        
        {/* Tagline "Born Thinking" - smaller and positioned below */}
        <text x="20" y="36" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="400" fill="#666666">Born Thinking</text>
      </svg>
    </div>
  );
}