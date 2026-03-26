"use client";

/**
 * M3TRIC official brand logo.
 * Stylized "M" with 3 green bands:
 * - Top band (lightest #6dbe6d) with satellite
 * - Middle band (#3a8a5c) with drone
 * - Bottom band (darkest #1b4332) with sensor
 * Then "3TRIC" text in dark green.
 */

export function M3tricLogoMark({ size = 40 }: { size?: number }) {
  const h = size;
  const w = size * 1.1;
  return (
    <svg
      viewBox="0 0 110 100"
      width={w}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* === M letter shape with 3 green bands === */}
      {/* Light green band (top) */}
      <path
        d="M0 35 L0 0 L25 35 L50 0 L50 35 Z"
        fill="#6dbe6d"
      />
      {/* Medium green band (middle) */}
      <path
        d="M0 35 L0 60 L50 60 L50 35 L25 35 Z"
        fill="#3a8a5c"
      />
      {/* Dark green band (bottom-left leg) */}
      <path
        d="M0 60 L0 90 L18 90 L18 60 Z"
        fill="#1b4332"
      />
      {/* Dark green band (bottom-right leg) */}
      <path
        d="M32 60 L32 90 L50 90 L50 60 Z"
        fill="#1b4332"
      />

      {/* === Satellite (top right of M) === */}
      <g transform="translate(38, -4) scale(0.65)">
        {/* Left solar panel */}
        <rect x="-10" y="8" width="16" height="10" rx="1.5" fill="#6dbe6d" stroke="#1b4332" strokeWidth="0.8" />
        <line x1="-5" y1="8" x2="-5" y2="18" stroke="#1b4332" strokeWidth="0.5" />
        <line x1="0" y1="8" x2="0" y2="18" stroke="#1b4332" strokeWidth="0.5" />
        {/* Body */}
        <rect x="6" y="5" width="12" height="16" rx="2.5" fill="#3a8a5c" stroke="#1b4332" strokeWidth="0.8" />
        <circle cx="12" cy="13" r="2.5" fill="#1b4332" opacity="0.4" />
        {/* Right solar panel */}
        <rect x="18" y="8" width="16" height="10" rx="1.5" fill="#6dbe6d" stroke="#1b4332" strokeWidth="0.8" />
        <line x1="23" y1="8" x2="23" y2="18" stroke="#1b4332" strokeWidth="0.5" />
        <line x1="28" y1="8" x2="28" y2="18" stroke="#1b4332" strokeWidth="0.5" />
        {/* Antenna */}
        <line x1="12" y1="21" x2="12" y2="26" stroke="#1b4332" strokeWidth="0.8" />
        <circle cx="12" cy="27" r="1.5" fill="#1b4332" opacity="0.5" />
      </g>

      {/* === Drone (center of M, in the middle band) === */}
      <g transform="translate(10, 38) scale(0.8)">
        {/* Body */}
        <ellipse cx="15" cy="8" rx="7" ry="4" fill="white" />
        {/* Arms */}
        <line x1="8" y1="8" x2="0" y2="3" stroke="white" strokeWidth="1.3" />
        <line x1="22" y1="8" x2="30" y2="3" stroke="white" strokeWidth="1.3" />
        <line x1="8" y1="8" x2="0" y2="13" stroke="white" strokeWidth="1.3" />
        <line x1="22" y1="8" x2="30" y2="13" stroke="white" strokeWidth="1.3" />
        {/* Rotors */}
        <ellipse cx="0" cy="3" rx="5" ry="1.3" fill="white" opacity="0.4" />
        <ellipse cx="30" cy="3" rx="5" ry="1.3" fill="white" opacity="0.4" />
        <ellipse cx="0" cy="13" rx="5" ry="1.3" fill="white" opacity="0.4" />
        <ellipse cx="30" cy="13" rx="5" ry="1.3" fill="white" opacity="0.4" />
        {/* Camera */}
        <circle cx="15" cy="12" r="2.5" fill="#1b4332" opacity="0.5" />
      </g>

      {/* === Sensor/IoT (bottom-left of M) === */}
      <g transform="translate(2, 62) scale(0.7)">
        {/* Sensor body (rectangle with rounded ends) */}
        <rect x="5" y="10" width="9" height="18" rx="3" fill="white" />
        {/* Antenna line */}
        <line x1="9.5" y1="10" x2="9.5" y2="3" stroke="white" strokeWidth="1.2" />
        {/* Antenna tip */}
        <circle cx="9.5" cy="2" r="1.5" fill="white" />
        {/* Signal waves */}
        <path d="M-1 7 Q-4 2 1 -2" stroke="#6dbe6d" strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M-4 9 Q-8 2 -1 -4" stroke="#6dbe6d" strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M-7 11 Q-12 2 -3 -6" stroke="#6dbe6d" strokeWidth="0.6" fill="none" opacity="0.3" />
      </g>
    </svg>
  );
}

export function M3tricLogoFull({ className = "h-10" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <M3tricLogoMark size={44} />
      <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "system-ui, sans-serif" }}>
        <span style={{ color: "#1b4332" }}>3TRIC</span>
      </span>
    </div>
  );
}
