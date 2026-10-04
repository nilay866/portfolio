import React, { useState } from 'react';
import { Network, ShieldCheck, Zap } from 'lucide-react';

interface SpokeNode {
  id: string;
  name: string;
  device: string;
  tunnelIp: string;
  lanSubnet: string;
  wanIp: string;
  role: string;
}

const SPOKES: SpokeNode[] = [
  {
    id: 'spoke_west',
    name: 'Plant West Spoke',
    device: 'FortiGate-80F',
    tunnelIp: '10.254.0.10/24',
    lanSubnet: '172.16.0.0/24',
    wanIp: '198.51.100.10',
    role: 'Manufacturing Site'
  },
  {
    id: 'spoke_east',
    name: 'Plant East Spoke',
    device: 'FortiGate-60F',
    tunnelIp: '10.254.0.20/24',
    lanSubnet: '10.10.20.0/24',
    wanIp: '198.51.100.20',
    role: 'Pharma Production'
  },
  {
    id: 'spoke_central',
    name: 'Plant Central Spoke',
    device: 'FortiGate-60F',
    tunnelIp: '10.254.0.30/24',
    lanSubnet: '192.168.10.0/24',
    wanIp: '198.51.100.30',
    role: 'Packaging Unit 2'
  },
  {
    id: 'spoke_metro',
    name: 'Regional West Spoke',
    device: 'FortiGate-30G',
    tunnelIp: '10.254.0.40/24',
    lanSubnet: '192.168.11.0/24',
    wanIp: '198.51.100.40 (Masked)',
    role: 'Regional Commercial Hub'
  }
];

export const EnterpriseTopologyHero: React.FC = () => {
  const [mode, setMode] = useState<'advpn' | 'hairpinned'>('advpn');
  const [selectedNode, setSelectedNode] = useState<string>('spoke_west');

  const activeSpoke = SPOKES.find(s => s.id === selectedNode) || SPOKES[0];

  return (
    <div className="topology-hero-card">
      {/* Card Header & Controls */}
      <div className="topology-hero-header">
        <div className="topology-hero-title">
          <Network size={16} className="text-blue" />
          <span>Production ADVPN & BGP Overlay Mesh</span>
          <span className="badge-pill">AS 65000</span>
        </div>

        <div className="topology-mode-selector" role="tablist">
          <button
            type="button"
            className={`mode-btn ${mode === 'advpn' ? 'active' : ''}`}
            onClick={() => setMode('advpn')}
            title="Direct Spoke-to-Spoke On-Demand Shortcut Tunnel"
          >
            <Zap size={13} />
            Direct ADVPN Shortcut (17.9ms)
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'hairpinned' ? 'active' : ''}`}
            onClick={() => setMode('hairpinned')}
            title="Legacy Central Hub Hairpin Route"
          >
            Legacy Hairpin (82.4ms)
          </button>
        </div>
      </div>

      {/* SVG Network Schematic */}
      <div className="topology-canvas-wrap">
        <svg viewBox="0 0 760 380" className="topology-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Accent */}
          <pattern id="grid-subtle" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          </pattern>
          <rect width="760" height="380" fill="url(#grid-subtle)" />

          {/* Tunnel Lines from Hub to Spokes */}
          {/* Hub to Plant West */}
          <line
            x1="380" y1="90" x2="110" y2="250"
            stroke={mode === 'hairpinned' ? '#f59e0b' : 'rgba(59, 130, 246, 0.35)'}
            strokeWidth={mode === 'hairpinned' ? '2.5' : '1.5'}
            strokeDasharray={mode === 'hairpinned' ? 'none' : '4 3'}
          />
          {/* Hub to Plant East */}
          <line
            x1="380" y1="90" x2="290" y2="250"
            stroke={mode === 'hairpinned' ? '#f59e0b' : 'rgba(59, 130, 246, 0.35)'}
            strokeWidth={mode === 'hairpinned' ? '2.5' : '1.5'}
            strokeDasharray={mode === 'hairpinned' ? 'none' : '4 3'}
          />
          {/* Hub to Plant Central */}
          <line
            x1="380" y1="90" x2="470" y2="250"
            stroke="rgba(59, 130, 246, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Hub to Regional West */}
          <line
            x1="380" y1="90" x2="650" y2="250"
            stroke="rgba(59, 130, 246, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* DIRECT ADVPN SHORTCUT TUNNEL: Plant West (110) <-> Plant East (290) */}
          {mode === 'advpn' && (
            <g>
              <line
                x1="110" y1="270" x2="290" y2="270"
                stroke="#10b981"
                strokeWidth="3"
                filter="url(#glow-cyan)"
              />
              {/* Shortcut Tunnel Badge */}
              <rect x="155" y="280" width="90" height="20" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <text x="200" y="294" fill="#34d399" fontSize="9" fontWeight="700" textAnchor="middle">
                SHORTCUT: 17.9ms
              </text>
            </g>
          )}

          {/* HAIRPIN TRAFFIC CALLOUT */}
          {mode === 'hairpinned' && (
            <g>
              <rect x="180" y="140" width="130" height="22" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="245" y="155" fill="#fbbf24" fontSize="9" fontWeight="700" textAnchor="middle">
                HAIRPINNED: 82.4ms (Via Hub)
              </text>
            </g>
          )}

          {/* ── CORE HUB NODE (FortiGate-1000F) ── */}
          <g transform="translate(270, 25)" style={{ cursor: 'pointer' }} onClick={() => setSelectedNode('hub')}>
            <rect
              width="220" height="74" rx="8"
              fill="url(#hubGrad)"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="22" r="5" fill="#10b981" />
            <text x="32" y="26" fill="#f8fafc" fontSize="12" fontWeight="700">HO CORE HUB (FG-1000F)</text>
            <text x="20" y="44" fill="#94a3b8" fontSize="9.5" fontFamily="var(--font-mono)">Overlay: 10.254.0.1/24 • AS 65000</text>
            <text x="20" y="60" fill="#64748b" fontSize="8.5">BGP Route Reflector • auto-discovery-sender</text>
          </g>

          {/* ── SPOKE 1: PLANT WEST ── */}
          <g transform="translate(40, 240)" style={{ cursor: 'pointer' }} onClick={() => setSelectedNode('spoke_west')}>
            <rect
              width="140" height="66" rx="6"
              fill={selectedNode === 'spoke_west' ? 'url(#activeNodeGrad)' : 'url(#nodeGrad)'}
              stroke={selectedNode === 'spoke_west' ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)'}
              strokeWidth={selectedNode === 'spoke_west' ? '2' : '1'}
            />
            <text x="12" y="20" fill="#f8fafc" fontSize="11" fontWeight="700">Spoke: Plant West</text>
            <text x="12" y="36" fill="#38bdf8" fontSize="9" fontWeight="600">FG-80F</text>
            <text x="12" y="52" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-mono)">10.254.0.10 • .16.0/24</text>
          </g>

          {/* ── SPOKE 2: PLANT EAST ── */}
          <g transform="translate(220, 240)" style={{ cursor: 'pointer' }} onClick={() => setSelectedNode('spoke_east')}>
            <rect
              width="140" height="66" rx="6"
              fill={selectedNode === 'spoke_east' ? 'url(#activeNodeGrad)' : 'url(#nodeGrad)'}
              stroke={selectedNode === 'spoke_east' ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)'}
              strokeWidth={selectedNode === 'spoke_east' ? '2' : '1'}
            />
            <text x="12" y="20" fill="#f8fafc" fontSize="11" fontWeight="700">Spoke: Plant East</text>
            <text x="12" y="36" fill="#38bdf8" fontSize="9" fontWeight="600">FG-60F</text>
            <text x="12" y="52" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-mono)">10.254.0.20 • .20.0/24</text>
          </g>

          {/* ── SPOKE 3: PLANT CENTRAL ── */}
          <g transform="translate(400, 240)" style={{ cursor: 'pointer' }} onClick={() => setSelectedNode('spoke_central')}>
            <rect
              width="140" height="66" rx="6"
              fill={selectedNode === 'spoke_central' ? 'url(#activeNodeGrad)' : 'url(#nodeGrad)'}
              stroke={selectedNode === 'spoke_central' ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)'}
              strokeWidth={selectedNode === 'spoke_central' ? '2' : '1'}
            />
            <text x="12" y="20" fill="#f8fafc" fontSize="11" fontWeight="700">Spoke: Plant Central</text>
            <text x="12" y="36" fill="#38bdf8" fontSize="9" fontWeight="600">FG-60F</text>
            <text x="12" y="52" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-mono)">10.254.0.30 • .10.0/24</text>
          </g>

          {/* ── SPOKE 4: ANDHERI ── */}
          <g transform="translate(580, 240)" style={{ cursor: 'pointer' }} onClick={() => setSelectedNode('spoke_metro')}>
            <rect
              width="140" height="66" rx="6"
              fill={selectedNode === 'spoke_metro' ? 'url(#activeNodeGrad)' : 'url(#nodeGrad)'}
              stroke={selectedNode === 'spoke_metro' ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)'}
              strokeWidth={selectedNode === 'spoke_metro' ? '2' : '1'}
            />
            <text x="12" y="20" fill="#f8fafc" fontSize="11" fontWeight="700">Spoke: Regional West</text>
            <text x="12" y="36" fill="#38bdf8" fontSize="9" fontWeight="600">FG-30G (G-Series)</text>
            <text x="12" y="52" fill="#94a3b8" fontSize="8.5" fontFamily="var(--font-mono)">10.254.0.40 • .11.0/24</text>
          </g>
        </svg>
      </div>

      {/* Selected Node Telemetry Bar */}
      <div className="topology-telemetry-bar">
        <div className="telemetry-item">
          <span className="telemetry-label">Inspected Appliance:</span>
          <span className="telemetry-value">
            {selectedNode === 'hub' ? 'FortiGate-1000F (Datacenter Core Hub)' : `${activeSpoke.name} (${activeSpoke.device})`}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Overlay IP:</span>
          <span className="telemetry-value font-mono">
            {selectedNode === 'hub' ? '10.254.0.1/24 (Hub Interface)' : activeSpoke.tunnelIp}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Local Subnet:</span>
          <span className="telemetry-value font-mono">
            {selectedNode === 'hub' ? '10.0.0.0/16 (DC Core Servers)' : activeSpoke.lanSubnet}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">ADVPN State:</span>
          <span className="telemetry-status-ok">
            <ShieldCheck size={13} /> Active (BGP Peered)
          </span>
        </div>
      </div>
    </div>
  );
};
