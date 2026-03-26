"use client";

/**
 * Custom SVG illustrations for M3TRIC scale concepts.
 * Detailed, animated, neon-glow style matching the dark theme.
 */

export function SensorIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Signal waves */}
      <circle cx="100" cy="80" r="25" stroke="#2ecc71" strokeWidth="1" opacity="0.15">
        <animate attributeName="r" values="25;50;25" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.02;0.15" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="80" r="35" stroke="#2ecc71" strokeWidth="0.8" opacity="0.1">
        <animate attributeName="r" values="35;65;35" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.01;0.1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="80" r="45" stroke="#2ecc71" strokeWidth="0.5" opacity="0.06">
        <animate attributeName="r" values="45;80;45" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.06;0.005;0.06" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Sensor body */}
      <rect x="88" y="70" width="24" height="50" rx="4" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="1.5" />
      <rect x="92" y="75" width="16" height="8" rx="2" fill="#2ecc7120" stroke="#2ecc71" strokeWidth="0.5" />

      {/* LED indicator */}
      <circle cx="100" cy="79" r="2" fill="#2ecc71">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Antenna */}
      <line x1="100" y1="70" x2="100" y2="52" stroke="#2ecc71" strokeWidth="1.5" />
      <circle cx="100" cy="50" r="3" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="1.5" />

      {/* Data display */}
      <text x="100" y="98" textAnchor="middle" fill="#2ecc71" fontSize="6" fontFamily="monospace" opacity="0.8">24.5°C</text>

      {/* Base/mount */}
      <rect x="85" y="120" width="30" height="6" rx="2" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="1" />
      <line x1="100" y1="126" x2="100" y2="145" stroke="#d0ddd5" strokeWidth="2" />
      <ellipse cx="100" cy="148" rx="20" ry="5" fill="#d0ddd540" stroke="#d0ddd5" strokeWidth="0.5" />

      {/* Data particles floating up */}
      <circle cx="108" cy="65" r="1" fill="#2ecc71" opacity="0.5">
        <animate attributeName="cy" values="65;40;65" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="95" cy="60" r="0.8" fill="#3a8a5c" opacity="0.4">
        <animate attributeName="cy" values="60;35;60" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function DroneIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Scan beam from drone */}
      <path d="M100 130 L60 180 L140 180 Z" fill="url(#scanGrad)" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.08;0.15" dur="2s" repeatCount="indefinite" />
      </path>
      <defs>
        <linearGradient id="scanGrad" x1="100" y1="130" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2ecc71" stopOpacity="0.6" />
          <stop offset="1" stopColor="#2ecc71" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Drone body */}
      <g>
        <animate attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2.5s" repeatCount="indefinite" />

        {/* Center body */}
        <ellipse cx="100" cy="105" rx="18" ry="8" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="1.2" />
        <ellipse cx="100" cy="103" rx="14" ry="5" fill="#f0f5f280" stroke="#2ecc7180" strokeWidth="0.5" />

        {/* Camera/sensor underneath */}
        <circle cx="100" cy="112" r="4" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="1" />
        <circle cx="100" cy="112" r="2" fill="#2ecc7130" />
        <circle cx="100" cy="112" r="1" fill="#2ecc71">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* Arms */}
        <line x1="82" y1="105" x2="55" y2="90" stroke="#7a9e8a" strokeWidth="2" />
        <line x1="118" y1="105" x2="145" y2="90" stroke="#7a9e8a" strokeWidth="2" />
        <line x1="82" y1="105" x2="55" y2="115" stroke="#7a9e8a" strokeWidth="2" />
        <line x1="118" y1="105" x2="145" y2="115" stroke="#7a9e8a" strokeWidth="2" />

        {/* Rotors */}
        <ellipse cx="55" cy="88" rx="15" ry="3" fill="#2ecc7110" stroke="#2ecc7140" strokeWidth="0.5">
          <animate attributeName="rx" values="15;12;15" dur="0.15s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="55" cy="88" r="3" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="0.8" />

        <ellipse cx="145" cy="88" rx="15" ry="3" fill="#2ecc7110" stroke="#2ecc7140" strokeWidth="0.5">
          <animate attributeName="rx" values="12;15;12" dur="0.15s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="145" cy="88" r="3" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="0.8" />

        <ellipse cx="55" cy="117" rx="15" ry="3" fill="#2ecc7110" stroke="#2ecc7140" strokeWidth="0.5">
          <animate attributeName="rx" values="14;11;14" dur="0.15s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="55" cy="117" r="3" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="0.8" />

        <ellipse cx="145" cy="117" rx="15" ry="3" fill="#2ecc7110" stroke="#2ecc7140" strokeWidth="0.5">
          <animate attributeName="rx" values="11;14;11" dur="0.15s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="145" cy="117" r="3" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="0.8" />

        {/* Status LED */}
        <circle cx="100" cy="100" r="1.5" fill="#2ecc71">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Ground scan dots */}
      <circle cx="80" cy="175" r="1.5" fill="#2ecc71" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="178" r="1.5" fill="#2ecc71" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="173" r="1.5" fill="#2ecc71" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function SatelliteIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Earth curvature at bottom */}
      <path d="M0 200 Q100 155 200 200 Z" fill="#f0f5f240" stroke="#d0ddd5" strokeWidth="0.5" />
      <path d="M20 200 Q100 165 180 200 Z" fill="none" stroke="#2ecc7110" strokeWidth="0.3" strokeDasharray="3 3" />

      {/* Scan beam to earth */}
      <path d="M95 80 L50 190 L150 190 Z" fill="url(#satScan)" opacity="0.08">
        <animate attributeName="opacity" values="0.08;0.04;0.08" dur="3s" repeatCount="indefinite" />
      </path>
      <defs>
        <linearGradient id="satScan" x1="95" y1="80" x2="95" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a8a5c" stopOpacity="0.5" />
          <stop offset="1" stopColor="#3a8a5c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6dbe6d" stopOpacity="0.3" />
          <stop offset="1" stopColor="#3a8a5c" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <g>
        <animate attributeName="transform" type="translate" values="0,0;2,-2;0,0" dur="6s" repeatCount="indefinite" />

        {/* Solar panel left */}
        <rect x="20" y="55" width="45" height="22" rx="2" fill="url(#panelGrad)" stroke="#6dbe6d" strokeWidth="1" />
        <line x1="32" y1="55" x2="32" y2="77" stroke="#6dbe6d80" strokeWidth="0.5" />
        <line x1="43" y1="55" x2="43" y2="77" stroke="#6dbe6d80" strokeWidth="0.5" />
        <line x1="54" y1="55" x2="54" y2="77" stroke="#6dbe6d80" strokeWidth="0.5" />
        <line x1="20" y1="66" x2="65" y2="66" stroke="#6dbe6d80" strokeWidth="0.5" />

        {/* Solar panel right */}
        <rect x="135" y="55" width="45" height="22" rx="2" fill="url(#panelGrad)" stroke="#6dbe6d" strokeWidth="1" />
        <line x1="147" y1="55" x2="147" y2="77" stroke="#6dbe6d80" strokeWidth="0.5" />
        <line x1="158" y1="55" x2="158" y2="77" stroke="#6dbe6d80" strokeWidth="0.5" />
        <line x1="169" y1="55" x2="169" y2="77" stroke="#6dbe6d80" strokeWidth="0.5" />
        <line x1="135" y1="66" x2="180" y2="66" stroke="#6dbe6d80" strokeWidth="0.5" />

        {/* Panel arms */}
        <line x1="65" y1="66" x2="78" y2="66" stroke="#7a9e8a" strokeWidth="1.5" />
        <line x1="122" y1="66" x2="135" y2="66" stroke="#7a9e8a" strokeWidth="1.5" />

        {/* Main body */}
        <rect x="78" y="50" width="44" height="32" rx="4" fill="#f0f5f2" stroke="#3a8a5c" strokeWidth="1.2" />
        <rect x="83" y="55" width="34" height="10" rx="2" fill="#3a8a5c10" stroke="#3a8a5c40" strokeWidth="0.5" />

        {/* Antenna dish */}
        <path d="M96 82 Q100 92 104 82" stroke="#2ecc71" strokeWidth="1" fill="none" />
        <line x1="100" y1="82" x2="100" y2="88" stroke="#2ecc71" strokeWidth="0.8" />
        <circle cx="100" cy="89" r="2" fill="#2ecc7130" stroke="#2ecc71" strokeWidth="0.5" />

        {/* Status lights */}
        <circle cx="88" cy="72" r="1.5" fill="#2ecc71">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="95" cy="72" r="1.5" fill="#3a8a5c">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="102" cy="72" r="1.5" fill="#6dbe6d">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Stars */}
      <circle cx="30" cy="25" r="0.8" fill="#fff" opacity="0.4" />
      <circle cx="170" cy="15" r="0.6" fill="#fff" opacity="0.3" />
      <circle cx="155" cy="40" r="0.5" fill="#fff" opacity="0.25" />
      <circle cx="45" cy="45" r="0.7" fill="#fff" opacity="0.35" />
      <circle cx="15" cy="90" r="0.5" fill="#fff" opacity="0.2" />
      <circle cx="185" cy="100" r="0.6" fill="#fff" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function MapGridIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Isometric grid — regional map view */}
      <g transform="translate(100,30) rotate(0) skewX(0)">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={`grid-${i}`}>
            <line
              x1={-70 + i * 22}
              y1={20}
              x2={-70 + i * 22}
              y2={150}
              stroke="#d0ddd5"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <line
              x1={-70}
              y1={20 + i * 22}
              x2={65}
              y2={20 + i * 22}
              stroke="#d0ddd5"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Region polygons */}
        <path d="M-50 42 L-30 35 L-10 50 L-20 70 L-48 65 Z" fill="#2ecc7108" stroke="#2ecc71" strokeWidth="0.8" opacity="0.4" />
        <path d="M-10 50 L15 38 L35 52 L25 75 L-5 72 L-20 70 Z" fill="#3a8a5c08" stroke="#3a8a5c" strokeWidth="0.8" opacity="0.4" />
        <path d="M-48 65 L-20 70 L-5 72 L-15 95 L-45 90 Z" fill="#6dbe6d08" stroke="#6dbe6d" strokeWidth="0.8" opacity="0.4" />
        <path d="M25 75 L45 68 L55 90 L40 105 L15 98 Z" fill="#2ecc7108" stroke="#2ecc71" strokeWidth="0.8" opacity="0.3" />

        {/* Data points — sensors on map */}
        <circle cx="-35" cy="52" r="3" fill="#2ecc71" opacity="0.8">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="10" cy="55" r="3" fill="#3a8a5c" opacity="0.8">
          <animate attributeName="r" values="3;4.5;3" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="-30" cy="82" r="2.5" fill="#6dbe6d" opacity="0.7">
          <animate attributeName="r" values="2.5;4;2.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="35" cy="85" r="2.5" fill="#2ecc71" opacity="0.6">
          <animate attributeName="r" values="2.5;3.5;2.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="5" cy="90" r="2" fill="#f59e0b" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Connection lines between sensors */}
        <line x1="-35" y1="52" x2="10" y2="55" stroke="#2ecc71" strokeWidth="0.3" opacity="0.3" strokeDasharray="3 3" />
        <line x1="10" y1="55" x2="35" y2="85" stroke="#2ecc71" strokeWidth="0.3" opacity="0.2" strokeDasharray="3 3" />
        <line x1="-35" y1="52" x2="-30" y2="82" stroke="#6dbe6d" strokeWidth="0.3" opacity="0.3" strokeDasharray="3 3" />

        {/* Heatmap overlay on one cell */}
        <rect x="-48" y="42" rx="3" width="38" height="28" fill="#2ecc71" opacity="0.04">
          <animate attributeName="opacity" values="0.04;0.08;0.04" dur="3s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Legend */}
      <g transform="translate(130, 160)">
        <circle cx="0" cy="0" r="2.5" fill="#2ecc71" opacity="0.8" />
        <text x="8" y="3" fill="#7a9e8a" fontSize="6" fontFamily="monospace">Active</text>
        <circle cx="0" cy="14" r="2.5" fill="#f59e0b" opacity="0.7" />
        <text x="8" y="17" fill="#7a9e8a" fontSize="6" fontFamily="monospace">Alert</text>
      </g>
    </svg>
  );
}

export function DashboardIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Browser frame */}
      <rect x="10" y="5" width="180" height="150" rx="6" fill="#f7faf8" stroke="#d0ddd5" strokeWidth="1" />
      {/* Title bar */}
      <rect x="10" y="5" width="180" height="16" rx="6" fill="#f0f5f2" />
      <rect x="10" y="15" width="180" height="6" fill="#f0f5f2" />
      <circle cx="22" cy="13" r="2.5" fill="#ff5f5730" stroke="#ff5f57" strokeWidth="0.5" />
      <circle cx="32" cy="13" r="2.5" fill="#ffbd2e30" stroke="#ffbd2e" strokeWidth="0.5" />
      <circle cx="42" cy="13" r="2.5" fill="#28c94030" stroke="#28c940" strokeWidth="0.5" />

      {/* Sidebar */}
      <rect x="10" y="21" width="35" height="134" fill="#f0f5f280" />
      <line x1="45" y1="21" x2="45" y2="155" stroke="#d0ddd5" strokeWidth="0.5" />
      {/* Sidebar items */}
      <rect x="16" y="30" width="22" height="3" rx="1" fill="#2ecc7140" />
      <rect x="16" y="40" width="18" height="2" rx="1" fill="#d0ddd5" />
      <rect x="16" y="48" width="20" height="2" rx="1" fill="#d0ddd5" />
      <rect x="16" y="56" width="15" height="2" rx="1" fill="#d0ddd5" />
      <rect x="16" y="64" width="22" height="2" rx="1" fill="#d0ddd5" />

      {/* KPI Cards row */}
      <rect x="50" y="26" width="33" height="20" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      <text x="56" y="35" fill="#2ecc71" fontSize="7" fontFamily="monospace" fontWeight="bold">247</text>
      <rect x="52" y="40" width="18" height="2" rx="1" fill="#d0ddd580" />

      <rect x="88" y="26" width="33" height="20" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      <text x="94" y="35" fill="#3a8a5c" fontSize="7" fontFamily="monospace" fontWeight="bold">98.2%</text>
      <rect x="90" y="40" width="20" height="2" rx="1" fill="#d0ddd580" />

      <rect x="126" y="26" width="33" height="20" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      <text x="132" y="35" fill="#6dbe6d" fontSize="7" fontFamily="monospace" fontWeight="bold">12</text>
      <rect x="128" y="40" width="16" height="2" rx="1" fill="#d0ddd580" />

      <rect x="164" y="26" width="22" height="20" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      <text x="168" y="35" fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold">3</text>
      <rect x="166" y="40" width="14" height="2" rx="1" fill="#d0ddd580" />

      {/* Chart area */}
      <rect x="50" y="52" width="68" height="45" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      {/* Line chart */}
      <polyline
        points="56,88 62,82 68,85 74,75 80,78 86,70 92,72 98,65 104,68 110,60"
        stroke="#2ecc71"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M56,88 L62,82 L68,85 L74,75 L80,78 L86,70 L92,72 L98,65 L104,68 L110,60 L110,92 L56,92 Z"
        fill="#2ecc7108"
      />

      {/* Map widget */}
      <rect x="123" y="52" width="63" height="45" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      {/* Fake map content */}
      <path d="M130 75 Q145 65 155 72 Q165 80 175 70" stroke="#d0ddd5" strokeWidth="0.5" fill="none" />
      <circle cx="145" cy="70" r="2" fill="#2ecc71" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="78" r="1.5" fill="#3a8a5c" opacity="0.6" />
      <circle cx="138" cy="82" r="1.5" fill="#f59e0b" opacity="0.6" />

      {/* Bottom table */}
      <rect x="50" y="102" width="136" height="48" rx="3" fill="#f0f5f2" stroke="#d0ddd5" strokeWidth="0.5" />
      {/* Table header */}
      <line x1="50" y1="112" x2="186" y2="112" stroke="#d0ddd5" strokeWidth="0.5" />
      <rect x="55" y="106" width="25" height="2" rx="1" fill="#7a9e8a80" />
      <rect x="90" y="106" width="20" height="2" rx="1" fill="#7a9e8a80" />
      <rect x="120" y="106" width="25" height="2" rx="1" fill="#7a9e8a80" />
      <rect x="155" y="106" width="20" height="2" rx="1" fill="#7a9e8a80" />
      {/* Table rows */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`row-${i}`}>
          <rect x="55" y={117 + i * 8} width="22" height="2" rx="1" fill="#d0ddd580" />
          <rect x="90" y={117 + i * 8} width="16" height="2" rx="1" fill="#d0ddd580" />
          <rect x="120" y={117 + i * 8} width="20" height="2" rx="1" fill="#d0ddd580" />
          <circle cx="160" cy={118 + i * 8} r="2" fill={i === 2 ? "#f59e0b50" : "#2ecc7130"} />
        </g>
      ))}
    </svg>
  );
}

export function DataFlowIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Source nodes */}
      <g>
        {/* IoT */}
        <rect x="5" y="10" width="35" height="25" rx="4" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="0.8" />
        <text x="22" y="25" textAnchor="middle" fill="#2ecc71" fontSize="5" fontFamily="monospace">IoT</text>
        {/* Geo */}
        <rect x="5" y="45" width="35" height="25" rx="4" fill="#f0f5f2" stroke="#3a8a5c" strokeWidth="0.8" />
        <text x="22" y="60" textAnchor="middle" fill="#3a8a5c" fontSize="5" fontFamily="monospace">GeoJSON</text>
        {/* Raster */}
        <rect x="5" y="80" width="35" height="25" rx="4" fill="#f0f5f2" stroke="#6dbe6d" strokeWidth="0.8" />
        <text x="22" y="95" textAnchor="middle" fill="#6dbe6d" fontSize="5" fontFamily="monospace">Raster</text>
      </g>

      {/* Animated flow lines */}
      <line x1="40" y1="22" x2="70" y2="55" stroke="#2ecc7140" strokeWidth="0.8" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
      </line>
      <line x1="40" y1="57" x2="70" y2="55" stroke="#3a8a5c40" strokeWidth="0.8" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="1.2s" repeatCount="indefinite" />
      </line>
      <line x1="40" y1="92" x2="70" y2="55" stroke="#6dbe6d40" strokeWidth="0.8" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="1.4s" repeatCount="indefinite" />
      </line>

      {/* Pipeline */}
      <rect x="70" y="40" width="35" height="30" rx="5" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="1" />
      <text x="87" y="53" textAnchor="middle" fill="#2ecc71" fontSize="4.5" fontFamily="monospace">Pipeline</text>
      <text x="87" y="62" textAnchor="middle" fill="#7a9e8a" fontSize="3.5" fontFamily="monospace">ETL</text>

      {/* Flow to analytics */}
      <line x1="105" y1="55" x2="125" y2="55" stroke="#2ecc7140" strokeWidth="1" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.8s" repeatCount="indefinite" />
      </line>

      {/* Analytics engine */}
      <rect x="125" y="35" width="35" height="40" rx="5" fill="#f0f5f2" stroke="#3a8a5c" strokeWidth="1" />
      <text x="142" y="50" textAnchor="middle" fill="#3a8a5c" fontSize="4.5" fontFamily="monospace">Analytics</text>
      <text x="142" y="59" textAnchor="middle" fill="#7a9e8a" fontSize="3.5" fontFamily="monospace">Engine</text>
      <text x="142" y="68" textAnchor="middle" fill="#7a9e8a" fontSize="3" fontFamily="monospace">M1→M2→M3</text>

      {/* Flow to output */}
      <line x1="160" y1="55" x2="175" y2="35" stroke="#3a8a5c40" strokeWidth="0.8" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="0.9s" repeatCount="indefinite" />
      </line>
      <line x1="160" y1="55" x2="175" y2="75" stroke="#3a8a5c40" strokeWidth="0.8" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="1.1s" repeatCount="indefinite" />
      </line>

      {/* Output: Dashboard */}
      <rect x="175" y="20" width="22" height="22" rx="3" fill="#f0f5f2" stroke="#2ecc71" strokeWidth="0.8" />
      <text x="186" y="33" textAnchor="middle" fill="#2ecc71" fontSize="3.5" fontFamily="monospace">Maps</text>

      {/* Output: Alerts */}
      <rect x="175" y="62" width="22" height="22" rx="3" fill="#f0f5f2" stroke="#f59e0b" strokeWidth="0.8" />
      <text x="186" y="75" textAnchor="middle" fill="#f59e0b" fontSize="3.5" fontFamily="monospace">Alerts</text>

      {/* Processing dot animation */}
      <circle r="2" fill="#2ecc71" opacity="0.8">
        <animateMotion dur="2s" repeatCount="indefinite" path="M40,22 L70,55 L105,55 L125,55" />
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
