import React from 'react';

/**
 * Roziyev Systems Official Logo Component
 * Matches the official brand style: deep navy badge (#0c1322),
 * geometric white 'R' monogram, bold lowercase "roziyev", and spaced slate "systems".
 */
export default function RoziyevLogo({ 
  height = 42, 
  variant = 'badge', // 'badge' | 'transparent' | 'light-badge' | 'icon-only'
  showTagline = true,
  style = {}
}) {
  const scale = height / 56;
  const width = variant === 'icon-only' ? height : Math.round(176 * scale);

  if (variant === 'icon-only') {
    return (
      <svg 
        viewBox="0 0 32 32" 
        width={height} 
        height={height} 
        fill="none" 
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
        title="Roziyev Systems"
      >
        <rect width="32" height="32" rx="8" fill="#0c1322" stroke="#1e293b" strokeWidth="1" />
        <g transform="translate(4.5, 3.5)">
          <path d="M 0,10.5 L 5.5,5 L 5.5,25 L 0,25 Z" fill="#ffffff" />
          <path d="M 0,2.5 L 2.5,0 L 14.5,0 C 19.5,0 23,3.2 23,8 C 23,12.5 19.5,15.2 15,15.2 L 23.5,25 L 16.5,25 L 9.5,16.5 L 5.5,16.5 L 5.5,11.5 L 13.5,11.5 C 16,11.5 17,10 17,8 C 17,6 16,5 13.5,5 L 3,5 Z" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  const isDarkBadge = variant === 'badge';
  const isLightBadge = variant === 'light-badge';
  const isTransparent = variant === 'transparent';

  const bgColor = isDarkBadge ? '#0c1322' : (isLightBadge ? '#f8fafc' : 'transparent');
  const borderColor = isDarkBadge ? '#1e293b' : (isLightBadge ? '#e2e8f0' : 'transparent');
  const textColor = isLightBadge ? '#0f172a' : '#ffffff';
  const subTextColor = isLightBadge ? '#64748b' : '#94a3b8';
  const iconColor = isLightBadge ? '#0f172a' : '#ffffff';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 176 56" 
      width={width} 
      height={height} 
      fill="none"
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: isTransparent ? 0 : '12px', ...style }}
      title="Roziyev Systems"
    >
      {/* Background container */}
      {!isTransparent && (
        <rect 
          x="0.75" 
          y="0.75" 
          width="174.5" 
          height="54.5" 
          rx="14" 
          fill={bgColor} 
          stroke={borderColor} 
          strokeWidth="1.5"
        />
      )}

      {/* Stylized Monogram 'R' */}
      <g transform="translate(18, 14)">
        {/* Lower Left Stem with 45-degree angled bevel */}
        <path d="M 0,11.5 L 6.5,5 L 6.5,27.5 L 0,27.5 Z" fill={iconColor} />
        
        {/* Upper Loop and Right Diagonal Leg */}
        <path 
          d="M 0,2.5 L 2.5,0 L 16.5,0 C 22,0 26,3.5 26,9 C 26,14.5 22,17.5 17,17.5 L 26.5,27.5 L 18.5,27.5 L 10.5,18.5 L 6.5,18.5 L 6.5,12.5 L 15.5,12.5 C 18,12.5 19.5,11.2 19.5,9 C 19.5,6.8 18,5.5 15.5,5.5 L 3.5,5.5 Z" 
          fill={iconColor} 
        />
      </g>

      {/* Typography */}
      <g transform="translate(56, 13)">
        <text 
          x="0" 
          y="17" 
          fill={textColor} 
          fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, sans-serif" 
          fontSize="19" 
          fontWeight="800" 
          letterSpacing="-0.4px"
        >
          roziyev
        </text>
        {showTagline && (
          <text 
            x="1" 
            y="30" 
            fill={subTextColor} 
            fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, sans-serif" 
            fontSize="9.5" 
            fontWeight="600" 
            letterSpacing="3.2px"
          >
            systems
          </text>
        )}
      </g>
    </svg>
  );
}
