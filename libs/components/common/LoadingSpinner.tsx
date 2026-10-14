import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'compass' | 'ring';

export interface LoadingSpinnerProps {
  size?: SpinnerSize | number;
  variant?: SpinnerVariant;
  color?: string;
  label?: string;
  sublabel?: string;
  labelPlacement?: 'bottom' | 'right';
  fullscreen?: boolean;
  overlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_NUM_MAP: Record<SpinnerSize, number> = {
  xs: 24,
  sm: 36,
  md: 64,
  lg: 96,
  xl: 120,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'compass',
  color = '#0284c7',
  label,
  sublabel,
  labelPlacement = 'bottom',
  fullscreen = false,
  overlay = false,
  className = '',
  style,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_NUM_MAP[size] || 64;

  const containerClasses = [
    'aurora-spinner-wrapper',
    `variant-${variant}`,
    `placement-${labelPlacement}`,
    fullscreen ? 'is-fullscreen' : '',
    overlay ? 'is-overlay' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'ring' || pixelSize < 28) {
    // Compact ring fallback for micro buttons
    return (
      <div
        className={containerClasses}
        style={style}
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading'}
      >
        <svg
          className="aurora-spinner-svg"
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="aurora-spinner-track"
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="rgba(2, 132, 199, 0.15)"
            strokeWidth="3"
          />
          <circle
            className="aurora-spinner-path"
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="81.68"
            strokeDashoffset="60"
          />
        </svg>
        {label && <span className="aurora-spinner-label">{label}</span>}
      </div>
    );
  }

  // Expedition Radar Compass in Light Theme
  return (
    <div
      className={containerClasses}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading travel data'}
    >
      <div
        className="aurora-compass-assembly"
        style={{
          width: pixelSize,
          height: pixelSize,
        }}
      >
        {/* Sonar Radar Waves (Pulse Rings) */}
        <div className="sonar-wave-1" />
        <div className="sonar-wave-2" />

        {/* Compass Glass Base Plate */}
        <div className="compass-glass-base" />

        {/* Rotating Compass Outer Ring with Cardinal Directions */}
        <svg
          className="compass-rotating-dial"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(2, 132, 199, 0.28)"
            strokeWidth="1.5"
          />
          {/* Inner dashed track */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="rgba(2, 132, 199, 0.18)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          {/* Tick marks */}
          <line x1="50" y1="6" x2="50" y2="10" stroke="#0284c7" strokeWidth="1.5" />
          <line x1="50" y1="90" x2="50" y2="94" stroke="#94a3b8" strokeWidth="1" />
          <line x1="6" y1="50" x2="10" y2="50" stroke="#94a3b8" strokeWidth="1" />
          <line x1="90" y1="50" x2="94" y2="50" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Cardinal Labels */}
          <text x="50" y="18" textAnchor="middle" className="cardinal-text cardinal-n">N</text>
          <text x="50" y="86" textAnchor="middle" className="cardinal-text">S</text>
          <text x="83" y="53" textAnchor="middle" className="cardinal-text">E</text>
          <text x="17" y="53" textAnchor="middle" className="cardinal-text">W</text>
        </svg>

        {/* Dynamic Hunting Compass Needle */}
        <div className="compass-hunting-needle">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="needle-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.32" />
              </filter>
            </defs>
            <g filter="url(#needle-glow)">
              {/* North Needle Tip (Primary Blue Gradient / Facet) */}
              <polygon points="50,14 58,50 50,44 42,50" fill="#0284c7" />
              <polygon points="50,14 50,44 42,50" fill="#0ea5e9" />

              {/* South Needle Tip (Silver Slate) */}
              <polygon points="50,86 58,50 50,44 42,50" fill="#94a3b8" />
              <polygon points="50,86 50,44 42,50" fill="#cbd5e1" />

              {/* Center Pivot Bezel & Sapphire Cap */}
              <circle cx="50" cy="47" r="7" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
              <circle cx="50" cy="47" r="3" fill="#0284c7" />
            </g>
          </svg>
        </div>
      </div>

      {/* Optional Travel-themed status label */}
      {(label || sublabel) && (
        <div className="aurora-compass-text-block">
          {label && (
            <div className="aurora-compass-label">
              <span className="compass-status-dot" />
              <span>{label}</span>
            </div>
          )}
          {sublabel && <p className="aurora-compass-sublabel">{sublabel}</p>}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
