import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertCircle, CheckCircle2, 
  Maximize2, Terminal, Copy, Check, 
  ArrowLeft, X, Search
} from 'lucide-react';
import { firewallConfigs } from '../../data/firewallConfigs';

interface NetworkDiagramProps {
  selectedFirewallId?: string;
  onSelectFirewall?: (id: string) => void;
}

export const NetworkDiagram: React.FC<NetworkDiagramProps> = ({ 
  selectedFirewallId = 'ho_hub',
  onSelectFirewall
}) => {
  const [activeId, setActiveId] = useState<string>(selectedFirewallId || 'ho_hub');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Editable simulation states
  const [spokeAlphaIp, setSpokeAlphaIp] = useState<string>('10.254.0.10');
  const [hubRemoteGw, setHubRemoteGw] = useState<string>('198.51.100.10');
  const [copied, setCopied] = useState<boolean>(false);
  const [configSearch, setConfigSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'config' | 'routes'>('config');

  // Keep internal activeId in sync with prop if changed from outside
  const [prevSelectedId, setPrevSelectedId] = useState<string>(selectedFirewallId);
  if (selectedFirewallId && selectedFirewallId !== prevSelectedId) {
    setPrevSelectedId(selectedFirewallId);
    setActiveId(selectedFirewallId);
  }

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (onSelectFirewall) onSelectFirewall(id);
  };

  // Evaluation of link health based on IPs
  const isSpokeAlphaIpValid = spokeAlphaIp.trim().startsWith('10.254.0.');
  const isHubGwReachable = hubRemoteGw.trim() === '198.51.100.10';

  const isSpokeAlphaHealthy = isSpokeAlphaIpValid && isHubGwReachable;
  const isSpokeBetaHealthy = isHubGwReachable;
  const isSpokeCentralHealthy = isHubGwReachable;
  const isSpokeWestHealthy = isHubGwReachable;

  const currentFgt = firewallConfigs[activeId] || firewallConfigs.ho_hub;

  const handleCopy = () => {
    const textToCopy = activeTab === 'config' 
      ? currentFgt.fullCliConfig 
      : (currentFgt.routingTableOutput || currentFgt.fullCliConfig);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Code filtering
  const rawCode = activeTab === 'config' ? currentFgt.fullCliConfig : (currentFgt.routingTableOutput || '');
  const codeLines = rawCode.split('\n');
  const filteredLines = configSearch 
    ? codeLines.filter(line => line.toLowerCase().includes(configSearch.toLowerCase()))
    : codeLines;

  // ── ARCHITECTURE SVG CANVAS COMPONENT ──
  const renderSvgArchitecture = () => (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#070312',
      borderRadius: '10px',
      border: '1px solid rgba(168, 85, 247, 0.25)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg viewBox="0 0 960 440" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e0854" />
            <stop offset="100%" stopColor="#130426" />
          </linearGradient>
          <linearGradient id="spkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#070a12" />
          </linearGradient>
          <linearGradient id="errorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#450a0a" />
            <stop offset="100%" stopColor="#1a0408" />
          </linearGradient>
          <pattern id="diag-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(168, 85, 247, 0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="960" height="440" fill="url(#diag-grid)" />

        {/* ── CONNECTION TUNNELS & DYNAMIC PACKET SIMULATION ── */}
        
        {/* Hub to Public WAN */}
        <line 
          x1="480" y1="120" x2="480" y2="165" 
          stroke={isHubGwReachable ? '#a855f7' : '#ef4444'} 
          strokeWidth="3" 
          strokeDasharray={isHubGwReachable ? 'none' : '4 3'} 
        />
        {isHubGwReachable && (
          <circle cx="480" cy="142" r="3.5" fill="#c084fc" filter="url(#glow-purple)">
            <animate attributeName="cy" values="120;165" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* WAN to Plant Alpha */}
        <path 
          d="M 480 205 L 140 280" 
          stroke={isSpokeAlphaHealthy ? '#38bdf8' : '#ef4444'} 
          strokeWidth={isSpokeAlphaHealthy ? 2.5 : 3} 
          strokeDasharray={isSpokeAlphaHealthy ? 'none' : '4 3'}
          filter={!isSpokeAlphaHealthy ? 'url(#glow-red)' : 'none'}
        />
        {isSpokeAlphaHealthy ? (
          <circle r="4" fill="#38bdf8" filter="url(#glow-cyan)">
            <animateMotion path="M 480 205 L 140 280" dur="1.8s" repeatCount="indefinite" />
          </circle>
        ) : (
          /* Red failure beacon halting packet flow (CASE 03 Simulation) */
          <g>
            <circle cx="310" cy="242" r="14" fill="#ef4444" opacity="0.3">
              <animate attributeName="r" values="10;22;10" dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="310" cy="242" r="10" fill="#ef4444" filter="url(#glow-red)" />
            <text x="310" y="246" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">✕</text>
            <rect x="180" y="206" width="260" height="26" rx="4" fill="#200609" stroke="#ef4444" strokeWidth="1.5" />
            <text x="310" y="223" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">
              ✕ [FLOW HALTED: PHASE 2 SELECTOR MISMATCH - CASE 03]
            </text>
          </g>
        )}

        {/* WAN to Plant Beta */}
        <path 
          d="M 480 205 L 360 280" 
          stroke={isSpokeBetaHealthy ? '#38bdf8' : '#ef4444'} 
          strokeWidth={isSpokeBetaHealthy ? 2.5 : 3} 
          strokeDasharray={isSpokeBetaHealthy ? 'none' : '4 3'}
        />
        {isSpokeBetaHealthy && (
          <circle r="3.5" fill="#38bdf8" filter="url(#glow-cyan)">
            <animateMotion path="M 480 205 L 360 280" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* WAN to Plant Central 01 */}
        <path 
          d="M 480 205 L 600 280" 
          stroke={isSpokeCentralHealthy ? '#38bdf8' : '#ef4444'} 
          strokeWidth={isSpokeCentralHealthy ? 2.5 : 3} 
          strokeDasharray={isSpokeCentralHealthy ? 'none' : '4 3'}
        />
        {isSpokeCentralHealthy && (
          <circle r="3.5" fill="#38bdf8" filter="url(#glow-cyan)">
            <animateMotion path="M 480 205 L 600 280" dur="2.1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* WAN to Plant West Alpha */}
        <path 
          d="M 480 205 L 820 280" 
          stroke={isSpokeWestHealthy ? '#38bdf8' : '#ef4444'} 
          strokeWidth={isSpokeWestHealthy ? 2.5 : 3} 
          strokeDasharray={isSpokeWestHealthy ? 'none' : '4 3'}
        />
        {isSpokeWestHealthy && (
          <circle r="3.5" fill="#38bdf8" filter="url(#glow-cyan)">
            <animateMotion path="M 480 205 L 820 280" dur="2.3s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Dynamic ADVPN Shortcut (Plant North <-> Plant West Direct ERP Replication) */}
        <g>
          <path 
            d="M 140 330 C 250 375, 250 375, 360 330" 
            fill="none" 
            stroke={isSpokeAlphaHealthy ? '#c084fc' : '#475569'} 
            strokeWidth="2.5" 
            strokeDasharray={isSpokeAlphaHealthy ? '6 4' : '3 3'}
          />
          {isSpokeAlphaHealthy && (
            <circle r="3.5" fill="#f472b6">
              <animateMotion path="M 140 330 C 250 375, 250 375, 360 330" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
          <rect x="180" y="348" width="150" height="20" rx="4" fill="#18072d" stroke={isSpokeAlphaHealthy ? '#c084fc' : '#475569'} strokeWidth="1" />
          <text x="255" y="362" fill={isSpokeAlphaHealthy ? '#f472b6' : '#94a3b8'} fontSize="8.5" fontWeight="bold" textAnchor="middle">
            {isSpokeAlphaHealthy ? '⚡ DYNAMIC SHORTCUT (ERP)' : 'SHORTCUT OFFLINE'}
          </text>
        </g>

        {/* ── CORE DATA CENTER HUB (HEAD OFFICE) ── */}
        <g onClick={() => handleSelect('ho_hub')} style={{ cursor: 'pointer' }}>
          <rect 
            x="320" y="25" width="320" height="95" rx="10" 
            fill="url(#hubGrad)" 
            stroke={activeId === 'ho_hub' ? '#c084fc' : 'rgba(168, 85, 247, 0.4)'} 
            strokeWidth={activeId === 'ho_hub' ? 2.5 : 1.5}
            filter={activeId === 'ho_hub' ? 'url(#glow-purple)' : 'none'}
          />
          <rect x="335" y="38" width="8" height="8" rx="2" fill={isHubGwReachable ? '#10b981' : '#ef4444'} />
          <text x="350" y="46" fill="#c084fc" fontSize="12" fontWeight="bold" letterSpacing="0.5">
            HEAD OFFICE CORE HUB • FG-1000F / FG-200E
          </text>
          <text x="350" y="66" fill="#ffffff" fontSize="10" fontWeight="600">
            Overlay: 10.254.0.1/24 • BGP Route Reflector (AS 65000)
          </text>
          <text x="350" y="84" fill={isHubGwReachable ? '#cbd5e1' : '#ef4444'} fontSize="9" fontWeight={!isHubGwReachable ? 'bold' : 'normal'}>
            WAN1: {hubRemoteGw} {isHubGwReachable ? '[Active Leased Line 1G]' : '[UNREACHABLE]'}
          </text>
          <text x="350" y="102" fill="#10b981" fontSize="9" fontWeight="bold">
            LAN: 10.0.0.0/16 Core Datacenter • 20 Spokes Aggregated
          </text>
        </g>

        {/* ── REDUNDANT PUBLIC WAN OVERLAY ── */}
        <g>
          <rect x="350" y="165" width="260" height="40" rx="8" fill="#0f0720" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="480" y="183" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
            🌐 REDUNDANT MULTI-HOMED WAN OVERLAY
          </text>
          <text x="480" y="196" fill="#94a3b8" fontSize="8.5" textAnchor="middle">
            ISP 1: 1 Gbps Primary • ISP 2: 500 Mbps Backup DIA (SD-WAN SLA)
          </text>
        </g>

        {/* ── SPOKE 01: PLANT ALPHA ── */}
        <g onClick={() => handleSelect('plant_alpha')} style={{ cursor: 'pointer' }}>
          <rect 
            x="50" y="275" width="180" height="85" rx="8" 
            fill={!isSpokeAlphaHealthy ? 'url(#errorGrad)' : 'url(#spkGrad)'} 
            stroke={!isSpokeAlphaHealthy ? '#ef4444' : (activeId === 'plant_alpha' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)')} 
            strokeWidth={activeId === 'plant_alpha' || !isSpokeAlphaHealthy ? 2.5 : 1}
          />
          <rect x="62" y="287" width="6" height="6" rx="2" fill={isSpokeAlphaHealthy ? '#10b981' : '#ef4444'} />
          <text x="75" y="293" fill={!isSpokeAlphaHealthy ? '#f87171' : '#38bdf8'} fontSize="11" fontWeight="bold">PLANT ALPHA (PHARMA)</text>
          <text x="65" y="312" fill="#ffffff" fontSize="9">North Manufacturing Core</text>
          <text x="65" y="328" fill={!isSpokeAlphaIpValid ? '#f87171' : '#c084fc'} fontSize="8.5" fontWeight="bold">
            Tunnel: {spokeAlphaIp}/24
          </text>
          <text x="65" y="344" fill="#94a3b8" fontSize="8.5">LAN: 10.10.0.0/20</text>
        </g>

        {/* ── SPOKE 02: PLANT BETA ── */}
        <g onClick={() => handleSelect('plant_beta')} style={{ cursor: 'pointer' }}>
          <rect 
            x="270" y="275" width="180" height="85" rx="8" 
            fill="url(#spkGrad)" 
            stroke={activeId === 'plant_beta' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'} 
            strokeWidth={activeId === 'plant_beta' ? 2.5 : 1}
          />
          <rect x="282" y="287" width="6" height="6" rx="2" fill={isSpokeBetaHealthy ? '#10b981' : '#ef4444'} />
          <text x="295" y="293" fill="#38bdf8" fontSize="11" fontWeight="bold">PLANT BETA (SYNTHESIS)</text>
          <text x="285" y="312" fill="#ffffff" fontSize="9">West Chemical & API SEZ</text>
          <text x="285" y="328" fill="#c084fc" fontSize="8.5" fontWeight="bold">Tunnel: 10.254.0.20/24</text>
          <text x="285" y="344" fill="#94a3b8" fontSize="8.5">LAN: 10.20.0.0/20</text>
        </g>

        {/* ── SPOKE 03: PLANT CENTRAL 01 ── */}
        <g onClick={() => handleSelect('plant_central_01')} style={{ cursor: 'pointer' }}>
          <rect 
            x="510" y="275" width="180" height="85" rx="8" 
            fill="url(#spkGrad)" 
            stroke={activeId === 'plant_central_01' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'} 
            strokeWidth={activeId === 'plant_central_01' ? 2.5 : 1}
          />
          <rect x="522" y="287" width="6" height="6" rx="2" fill={isSpokeCentralHealthy ? '#10b981' : '#ef4444'} />
          <text x="535" y="293" fill="#38bdf8" fontSize="11" fontWeight="bold">PLANT CENTRAL 01</text>
          <text x="525" y="312" fill="#ffffff" fontSize="9">Industrial Production</text>
          <text x="525" y="328" fill="#c084fc" fontSize="8.5" fontWeight="bold">Tunnel: 10.254.0.30/24</text>
          <text x="525" y="344" fill="#94a3b8" fontSize="8.5">LAN: 10.30.0.0/20</text>
        </g>

        {/* ── SPOKE 04: PLANT WEST ALPHA ── */}
        <g onClick={() => handleSelect('plant_west_alpha')} style={{ cursor: 'pointer' }}>
          <rect 
            x="730" y="275" width="180" height="85" rx="8" 
            fill="url(#spkGrad)" 
            stroke={activeId === 'plant_west_alpha' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'} 
            strokeWidth={activeId === 'plant_west_alpha' ? 2.5 : 1}
          />
          <rect x="742" y="287" width="6" height="6" rx="2" fill={isSpokeWestHealthy ? '#10b981' : '#ef4444'} />
          <text x="755" y="293" fill="#38bdf8" fontSize="11" fontWeight="bold">PLANT WEST ALPHA</text>
          <text x="745" y="312" fill="#ffffff" fontSize="9">Formulation Site (Case 01)</text>
          <text x="745" y="328" fill="#c084fc" fontSize="8.5" fontWeight="bold">Tunnel: 10.254.0.40/24</text>
          <text x="745" y="344" fill="#94a3b8" fontSize="8.5">LAN: 10.40.0.0/22</text>
        </g>
      </svg>
    </div>
  );

  // ── LIVE CONFIGURATION CODE INSPECTOR (INTEGRATED PART 2 VIEW) ──
  const renderConfigInspector = (heightStyle?: React.CSSProperties) => (
    <div style={{
      background: '#040711',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...heightStyle
    }}>
      {/* Top Device Switcher Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#080d1a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '4px 6px',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {Object.values(firewallConfigs).map((fgt) => {
          const isSelected = activeId === fgt.id;
          return (
            <button
              key={fgt.id}
              onClick={() => handleSelect(fgt.id)}
              style={{
                background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                border: `1px solid ${isSelected ? '#a855f7' : 'transparent'}`,
                color: isSelected ? '#ffffff' : '#94a3b8',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: fgt.id === 'plant_alpha' && !isSpokeAlphaHealthy ? '#ef4444' : '#10b981'
              }} />
              {fgt.name.split(' ')[0]} {fgt.name.split(' ')[1] || ''}
            </button>
          );
        })}
      </div>

      {/* Header Info & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0.8rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="#38bdf8" />
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.78rem' }}>
            {currentFgt.model} • {currentFgt.name}
          </span>
          <span style={{
            fontSize: '0.68rem',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            padding: '1px 6px',
            borderRadius: '3px',
            fontWeight: 600
          }}>
            {currentFgt.client}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Config vs Routes Tab Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2px'
          }}>
            <button
              onClick={() => setActiveTab('config')}
              style={{
                background: activeTab === 'config' ? '#7c3aed' : 'transparent',
                color: activeTab === 'config' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '2px 8px',
                fontSize: '0.68rem',
                borderRadius: '3px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              FortiOS CLI Config
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              style={{
                background: activeTab === 'routes' ? '#7c3aed' : 'transparent',
                color: activeTab === 'routes' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '2px 8px',
                fontSize: '0.68rem',
                borderRadius: '3px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Live Routing Table
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              color: copied ? '#10b981' : '#cbd5e1',
              padding: '3px 9px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Diagnostics Telemetry Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '6px',
        padding: '6px 10px',
        background: 'rgba(10, 16, 30, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.7rem'
      }}>
        <div>
          <span style={{ color: '#64748b' }}>CPU / RAM: </span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{currentFgt.diagnostics.cpu} / {currentFgt.diagnostics.ram.split('(')[0]}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Sessions: </span>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>{currentFgt.diagnostics.sessions.split(' ')[0]}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Throughput: </span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>{currentFgt.diagnostics.packetRate.split('/')[0]}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>IPsec Tunnel: </span>
          <span style={{ color: activeId === 'plant_alpha' && !isSpokeAlphaHealthy ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {activeId === 'plant_alpha' && !isSpokeAlphaHealthy ? 'Phase 2 DOWN' : currentFgt.diagnostics.tunnelState.split('•')[0]}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>BGP Peering: </span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>
            {activeId === 'plant_alpha' && !isSpokeAlphaHealthy ? 'Peering Down' : currentFgt.diagnostics.bgpState.split('(')[0]}
          </span>
        </div>
      </div>

      {/* Troubleshooting Case Note */}
      {currentFgt.troubleshootingNote && (
        <div style={{
          padding: '4px 10px',
          background: 'rgba(168, 85, 247, 0.1)',
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
          fontSize: '0.68rem',
          color: '#e9d5ff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ background: '#7c3aed', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
            AUDITED CASE
          </span>
          <span>{currentFgt.troubleshootingNote}</span>
        </div>
      )}

      {/* Search Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        gap: '6px'
      }}>
        <Search size={11} color="#64748b" />
        <input 
          type="text"
          placeholder="Filter code... (e.g. 'bgp', 'advpn', 'policy', 'phase1')"
          value={configSearch}
          onChange={(e) => setConfigSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#cbd5e1',
            fontSize: '0.72rem',
            width: '100%',
            fontFamily: 'monospace'
          }}
        />
        {configSearch && (
          <button 
            onClick={() => setConfigSearch('')} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.7rem' }}
          >
            clear
          </button>
        )}
      </div>

      {/* Code Viewer with Line Numbers */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '400px',
        padding: '0.6rem 0',
        fontFamily: 'monospace',
        fontSize: '0.73rem',
        lineHeight: 1.45,
        background: '#040711'
      }}>
        {filteredLines.map((line, idx) => {
          const isComment = line.trim().startsWith('#');
          const isKeyword = line.trim().startsWith('config ') || line.trim().startsWith('edit ') || line.trim() === 'end' || line.trim() === 'next';
          const isSet = line.trim().startsWith('set ');
          
          let lineContentColor = '#cbd5e1';
          if (isComment) lineContentColor = '#64748b';
          else if (isKeyword) lineContentColor = '#f59e0b';
          else if (isSet) lineContentColor = '#38bdf8';

          return (
            <div key={idx} style={{ display: 'flex', padding: '0 0.8rem', minHeight: '18px' }}>
              <span style={{
                width: '36px',
                userSelect: 'none',
                color: '#475569',
                textAlign: 'right',
                paddingRight: '12px',
                fontSize: '0.68rem'
              }}>
                {idx + 1}
              </span>
              <span style={{ color: lineContentColor, whiteSpace: 'pre', flex: 1 }}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      gap: '0.75rem',
      boxSizing: 'border-box'
    }}>
      {/* ── TOP CONTROLLER: EDITABLE IP INPUTS & SIMULATION PRESETS ── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '0.6rem',
        background: 'rgba(22, 11, 40, 0.85)',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(168, 85, 247, 0.25)'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={15} color="#c084fc" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', letterSpacing: '0.5px' }}>
            ENTERPRISE ADVPN TOPOLOGY ENGINE
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            [Touch node to load full FortiOS config]
          </span>
        </div>

        {/* Editable IP Inputs & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Spoke IP Editable Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Spoke IP:</span>
            <input 
              type="text" 
              value={spokeAlphaIp} 
              onChange={(e) => setSpokeAlphaIp(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isSpokeAlphaIpValid ? '#10b981' : '#f87171',
                fontWeight: 700,
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                width: '85px'
              }}
              title="Change Spoke IP (Subnet 10.254.0.0/24 required for healthy connection)"
            />
          </div>

          {/* Quick Preset Buttons */}
          <button
            onClick={() => {
              setSpokeAlphaIp('10.254.0.10');
              setHubRemoteGw('198.51.100.10');
            }}
            style={{
              background: isSpokeAlphaHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isSpokeAlphaHealthy ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
              color: isSpokeAlphaHealthy ? '#10b981' : '#94a3b8',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ✔ Normal
          </button>

          <button
            onClick={() => setSpokeAlphaIp('10.254.99.10')}
            style={{
              background: !isSpokeAlphaIpValid ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${!isSpokeAlphaIpValid ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
              color: !isSpokeAlphaIpValid ? '#f87171' : '#94a3b8',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Simulate Case 03: Phase 2 selector mismatch traffic blackhole"
          >
            ⚠ Simulate IP Mismatch
          </button>

          <button
            onClick={() => setHubRemoteGw(hubRemoteGw === '198.51.100.10' ? '203.0.113.99' : '198.51.100.10')}
            style={{
              background: !isHubGwReachable ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${!isHubGwReachable ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
              color: !isHubGwReachable ? '#f87171' : '#94a3b8',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚠ Break Hub Gateway
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullScreen(true)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: '1px solid #c084fc',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)'
            }}
            title="Open Fullscreen Architecture & Live Code Workbench"
          >
            <Maximize2 size={13} />
            FULLSCREEN WORKBENCH
          </button>
        </div>
      </div>

      {/* ── VECTOR ARCHITECTURE CANVAS ── */}
      <div style={{ width: '100%', minHeight: '220px', maxHeight: '420px', aspectRatio: '960 / 440' }}>
        {renderSvgArchitecture()}
      </div>

      {/* ── CONNECTION LOSS / CONNECTED STATUS STRIP ── */}
      <div style={{
        background: isSpokeAlphaHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${isSpokeAlphaHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.5)'}`,
        borderRadius: '8px',
        padding: '0.55rem 0.85rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', flex: 1, minWidth: '220px' }}>
          {isSpokeAlphaHealthy ? <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} /> : <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {isSpokeAlphaHealthy
              ? 'ALL 21 ADVPN TUNNELS & BGP PEERS ESTABLISHED: Direct spoke shortcuts active across Northern, Western & Central enterprise plants.'
              : `CONNECTION LOSS ON PLANT NORTH ALPHA: Subnet ${spokeAlphaIp} is rejected by Hub Phase 2 selector 10.254.0.0/24! Traffic blackhole detected (Case 03).`}
          </span>
        </div>

        <span style={{ 
          fontSize: '0.7rem', 
          fontWeight: 800, 
          padding: '2px 8px', 
          borderRadius: '4px',
          background: isSpokeAlphaHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)',
          color: isSpokeAlphaHealthy ? '#10b981' : '#f87171',
          flexShrink: 0
        }}>
          {isSpokeAlphaHealthy ? 'CONNECTED (21/21 UP)' : 'FLOW HALTED'}
        </span>
      </div>

      {/* ── FULLSCREEN MODAL VIEW WITH PROMINENT BACK BUTTON & LIVE CODE ── */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              background: '#070312',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            {/* ── PROMINENT TOP HEADER WITH HIGH-CONTRAST BACK BUTTON ── */}
            <div style={{
              height: '64px',
              background: 'rgba(17, 7, 32, 0.98)',
              borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '0 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 25px rgba(0,0,0,0.7)'
            }}>
              {/* BIG, PROMINENT BACK BUTTON */}
              <button
                onClick={() => setIsFullScreen(false)}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  border: '1px solid #c084fc',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                title="Return to Portfolio Slide (or press ESC)"
              >
                <ArrowLeft size={18} />
                <span>← BACK TO PROJECT</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.8, marginLeft: '4px', fontWeight: 500 }}>(ESC)</span>
              </button>

              {/* Title & Live Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  ENTERPRISE ADVPN TOPOLOGY & CONFIGURATION WORKBENCH
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  background: isSpokeAlphaHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${isSpokeAlphaHealthy ? '#10b981' : '#ef4444'}`,
                  color: isSpokeAlphaHealthy ? '#10b981' : '#f87171'
                }}>
                  {isSpokeAlphaHealthy ? 'STATUS: ALL 21 SPOKES HEALTHY' : 'STATUS: FLOW HALTED ON PLANT NORTH ALPHA'}
                </span>
              </div>

              {/* Secondary Close Button */}
              <button
                onClick={() => setIsFullScreen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                <X size={15} /> CLOSE
              </button>
            </div>

            {/* ── FULLSCREEN TWO-COLUMN SPLIT: INTERACTIVE ARCHITECTURE + LIVE CONFIG CODE ── */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1.25fr 1fr',
              gap: '1.5rem',
              padding: '1.5rem 2rem',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}>
              {/* LEFT: ARCHITECTURE & SIMULATION ENGINE */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                height: '100%',
                overflow: 'hidden'
              }}>
                {/* Simulation Control Strip */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(22, 11, 40, 0.85)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>
                      INTERACTIVE IP SIMULATOR:
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      [Touch any firewall node to load its configuration on the right]
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Spoke IP:</span>
                      <input 
                        type="text" 
                        value={spokeAlphaIp} 
                        onChange={(e) => setSpokeAlphaIp(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: isSpokeAlphaIpValid ? '#10b981' : '#f87171',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          width: '90px'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => setSpokeAlphaIp('10.254.0.10')}
                      style={{
                        background: isSpokeAlphaHealthy ? '#10b981' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reset (Healthy)
                    </button>

                    <button
                      onClick={() => setSpokeAlphaIp('10.254.99.10')}
                      style={{
                        background: !isSpokeAlphaIpValid ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Trigger IP Mismatch
                    </button>
                  </div>
                </div>

                {/* SVG Architecture */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  {renderSvgArchitecture()}
                </div>

                {/* Health strip */}
                <div style={{
                  background: isSpokeAlphaHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${isSpokeAlphaHealthy ? '#10b981' : '#ef4444'}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#ffffff'
                }}>
                  {isSpokeAlphaHealthy ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
                  <span>
                    {isSpokeAlphaHealthy
                      ? 'ALL ADVPN MESH SESSIONS OPERATIONAL: BGP Route Reflector has distributed 21 prefix routes.'
                      : `PACKET FLOW HALTED: Spoke IP ${spokeAlphaIp} rejected by Core Hub ADVPN Phase 2 child selector (Case 03).`}
                  </span>
                </div>
              </div>

              {/* RIGHT: LIVE FULL CONFIGURATION CODE INSPECTOR */}
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {renderConfigInspector({ flex: 1, maxHeight: 'none' })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
