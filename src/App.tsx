import { useState, useEffect } from 'react';
import {
  FileText, Mail, ExternalLink,
  Copy, Check, ChevronDown, ChevronUp,
  Search, X, Network
} from 'lucide-react';

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
  </svg>
);
import { domains } from './data/domains';
import { firewallConfigs } from './data/firewallConfigs';
import { projectConfigBundles } from './data/projectConfigs';
import { allTroubleshootingCases } from './data/allTroubleshootingCases';
import { reportsList } from './data/reportsData';
import { InteractiveDiagram } from './components/diagrams/InteractiveDiagram';
import { ResumeModal } from './components/modals/ResumeModal';
import { ProjectReportModal } from './components/modals/ProjectReportModal';
import './App.css';

export default function App() {
  /* ── Mouse Spotlight Tracking ── */
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /* ── Active Section Scrollspy ── */
  const [activeSection, setActiveSection] = useState<string>('about');

  useEffect(() => {
    const sections = ['about', 'experience', 'projects', 'cases', 'studio', 'reports'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Modals State ── */
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportModalDomainId, setReportModalDomainId] = useState<string>('network');
  const [activeDiagramDomainId, setActiveDiagramDomainId] = useState<string | null>(null);

  /* ── Troubleshooting KB State ── */
  const [caseCategory, setCaseCategory] = useState<string>('all');
  const [caseSearch, setCaseSearch] = useState<string>('');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [copiedCaseCommandId, setCopiedCaseCommandId] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCaseCommandId(id);
    setTimeout(() => setCopiedCaseCommandId(null), 2000);
  };

  const filteredCases = allTroubleshootingCases.filter(c => {
    const matchesCat = caseCategory === 'all' || c.category === caseCategory;
    const q = caseSearch.trim().toLowerCase();
    if (!q) return matchesCat;
    return matchesCat && (
      c.title.toLowerCase().includes(q) ||
      c.problem.toLowerCase().includes(q) ||
      c.symptoms.toLowerCase().includes(q) ||
      c.rootCause.toLowerCase().includes(q) ||
      c.solution.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  /* ── Config Explorer / Terminal State ── */
  const [selectedFirewallId, setSelectedFirewallId] = useState<string>('ho_hub');
  const [activeTab, setActiveTab] = useState<'config' | 'routes'>('config');
  const [selectedBundleId, setSelectedBundleId] = useState<string>('network');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [configSearch, setConfigSearch] = useState<string>('');

  const currentFgt = firewallConfigs[selectedFirewallId] || firewallConfigs.ho_hub;
  const activeBundle = projectConfigBundles[selectedBundleId] || projectConfigBundles.network;
  const activeFile = activeBundle ? activeBundle.files[selectedFileIndex] || activeBundle.files[0] : null;

  let rawConfigCode = '';
  if (selectedBundleId === 'network') {
    rawConfigCode = activeTab === 'config' ? currentFgt.fullCliConfig : (currentFgt.routingTableOutput || currentFgt.fullCliConfig);
  } else if (activeFile) {
    rawConfigCode = activeFile.content;
  }

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(rawConfigCode);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const filteredConfigLines = configSearch
    ? rawConfigCode.split('\n').filter(line => line.toLowerCase().includes(configSearch.toLowerCase()))
    : rawConfigCode.split('\n');

  /* ── Navigation Links ── */
  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Architecture' },
    { id: 'cases', label: 'Troubleshooting KB' },
    { id: 'studio', label: 'Config Explorer' },
    { id: 'reports', label: 'Publications' }
  ];

  return (
    <div className="relative">
      {/* ── Signature Mouse Torch Spotlight ── */}
      <div
        className="spotlight-overlay"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`
        }}
      />

      <div className="bc-wrapper">
        <a href="#content" className="skip-link">Skip to Content</a>

        <div className="bc-layout">
          {/* ════════════════════════════════════════════════════════════
              LEFT COLUMN — Sticky Profile & Navigation
              ════════════════════════════════════════════════════════════ */}
          <header className="bc-header">
            <div>
              {/* Profile Avatar */}
              <div className="bc-profile-photo-wrap">
                <img
                  src={`${import.meta.env.BASE_URL}nilay-avatar.webp`}
                  alt="Nilay Chavhan"
                  className="bc-profile-photo"
                  width="96"
                  height="96"
                  loading="eager"
                />
                <span className="bc-photo-badge" title="Production Status: Active Operations">
                  <span className="bc-photo-badge-dot" />
                </span>
              </div>

              <h1 className="bc-name">
                <a href={import.meta.env.BASE_URL}>Nilay Chavhan</a>
              </h1>
              <h2 className="bc-headline">
                Cyber Security Analyst & Network Security Engineer
              </h2>
              <p className="bc-tagline">
                I build and defend enterprise network infrastructure, high-availability BGP routing meshes, and automated perimeter security.
              </p>

              <div className="bc-status-pill">
                <span className="bc-status-dot" />
                <span>Production Systems Active · 21 Firewalls Managed</span>
              </div>

              {/* In-page jump navigation with expanding indicator bar */}
              <nav className="bc-nav" aria-label="In-page jump links">
                <ul className="bc-nav-list">
                  {navItems.map(item => {
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <a
                          className={`bc-nav-item${isActive ? ' active' : ''}`}
                          href={`#${item.id}`}
                        >
                          <span className="bc-nav-indicator" />
                          <span className="bc-nav-text">{item.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Social & Direct Actions */}
            <ul className="bc-socials" aria-label="Social media and links">
              <li>
                <a
                  className="bc-social-btn"
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="GitHub profile"
                  title="GitHub"
                >
                  <GithubIcon />
                </a>
              </li>
              <li>
                <a
                  className="bc-social-btn"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="LinkedIn profile"
                  title="LinkedIn"
                >
                  <LinkedinIcon />
                </a>
              </li>
              <li>
                <a
                  className="bc-social-btn"
                  href="mailto:contact@nilaychavhan.internal"
                  aria-label="Send email"
                  title="Email"
                >
                  <Mail size={20} />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="bc-social-btn"
                  onClick={() => setIsResumeModalOpen(true)}
                  aria-label="Open Resume"
                  title="View Resume / CV"
                >
                  <FileText size={20} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="bc-social-btn"
                  onClick={() => setActiveDiagramDomainId('network')}
                  aria-label="Open Network Diagram"
                  title="Interactive Topology Map"
                >
                  <Network size={20} />
                </button>
              </li>
            </ul>
          </header>

          {/* ════════════════════════════════════════════════════════════
              RIGHT COLUMN — Scrolling Main Content
              ════════════════════════════════════════════════════════════ */}
          <main id="content" className="bc-main">

            {/* ── ABOUT ME ── */}
            <section id="about" className="bc-section" aria-label="About me">
              <div className="bc-mobile-section-header">
                <h2 className="bc-mobile-section-title">About</h2>
              </div>
              <div className="bc-about-text">
                <p>
                  I am a production Network Security and Systems Engineer with hands-on experience designing,
                  deploying, and actively defending critical perimeter infrastructure across multi-tenant enterprise environments.
                  Currently, I manage <strong>21 FortiGate enterprise firewalls</strong> (ranging from FortiGate-1000F Core Hubs down to 30G branch spokes)
                  supporting enterprise clients across <span className="bc-highlight">Multinational Pharmaceuticals</span>, <span className="bc-highlight">National Bullion & FinTech Exchanges</span>, <span className="bc-highlight">Global Infrastructure Groups</span>, <span className="bc-highlight">Freight & Logistics</span>, and <span className="bc-highlight">Biotechnology Labs</span>.
                </p>
                <p>
                  My core specialization is at the intersection of high-availability networking and modern detection engineering:
                  architecting <strong>ADVPN full-mesh overlays with dynamic BGP Route Reflection (AS 65000)</strong> to eliminate transit bottlenecks,
                  deploying <strong>Wazuh 4.14 SIEM multi-tier clusters</strong> on Ubuntu 24.04 with GCP log streaming and automated edge IP-ban daemons,
                  and standing up bare-metal <strong>KVM/QEMU hypervisors</strong> with bonded 802.3ad LACP interfaces.
                </p>
                <p>
                  I believe in deterministic, evidence-based engineering over guesswork. Whether automating multi-firewall migrations with
                  <strong> PowerShell AST parsers</strong> and <strong>FortiOS REST APIs</strong>, or conducting deep-packet forensics
                  with Wireshark flow traces, my focus is always on zero downtime, 100% policy parity, and measurable latency reduction.
                </p>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-400)', marginBottom: '0.65rem' }}>
                    Accreditations & Core Stack
                  </div>
                  <div className="bc-tags-wrap" style={{ marginBottom: '0.65rem' }}>
                    <span className="bc-tag" style={{ color: 'var(--teal-300)', borderColor: 'rgba(94, 234, 212, 0.3)' }}>🏆 Fortinet Certified Associate (FCA)</span>
                    <span className="bc-tag" style={{ color: 'var(--teal-300)', borderColor: 'rgba(94, 234, 212, 0.3)' }}>🛡️ Fortinet Certified Fundamentals (FCF)</span>
                    <span className="bc-tag" style={{ color: 'var(--teal-300)', borderColor: 'rgba(94, 234, 212, 0.3)' }}>⚡ FortiGate 7.6 Operator</span>
                    <span className="bc-tag" style={{ color: 'var(--teal-300)', borderColor: 'rgba(94, 234, 212, 0.3)' }}>🌐 Cisco CCNA (Curriculum Trained)</span>
                  </div>
                  <div className="bc-tags-wrap">
                    {['FortiManager (21+ Sites)', 'FortiAnalyzer', 'BGP Route Reflection', 'ADVPN / IPsec', 'Wazuh 4.14 SIEM', 'LibreNMS', 'SEPM', 'Sophos Central EDR', '802.1Q VLANs & LACP', 'Python & Bash Automation', 'Docker', 'Linux KVM'].map(s => (
                      <span key={s} className="bc-tag">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── WORK EXPERIENCE ── */}
            <section id="experience" className="bc-section" aria-label="Work experience">
              <div className="bc-mobile-section-header">
                <h2 className="bc-mobile-section-title">Experience</h2>
              </div>

              <ol className="group-list">
                {/* Role 1: Integrated Infosec */}
                <li className="bc-card">
                  <div className="bc-card-grid">
                    <header className="bc-card-date">
                      Aug 2026 — Present
                    </header>
                    <div className="bc-card-content">
                      <h3 className="bc-card-heading">
                        <a
                          className="bc-card-title-link"
                          href="#architecture"
                          onClick={(e) => { e.preventDefault(); setActiveDiagramDomainId('network'); }}
                        >
                          Cyber Security Analyst · Integrated Infosec India Pvt. Ltd.
                          <span className="bc-arrow">↗</span>
                        </a>
                      </h3>
                      <div className="bc-card-subtitle">
                        Promoted from Cyber Security Intern (May 2026 — Aug 2026)
                      </div>
                      <p className="bc-card-desc">
                        Configure, manage, and troubleshoot multi-vendor firewalls (FortiGate FortiOS 7.2/7.4/7.6, Sophos Firewall, SonicWall; limited Palo Alto exposure) across 10–15+ enterprise clients spanning pharmaceutical, logistics, and real estate sectors.
                        Manage centralized policy and VPN configuration across 21 client sites via FortiManager, using FortiAnalyzer for centralized log visibility, traffic forensics, and SIEM monitoring.
                        Architected end-to-end LAN/WAN infrastructure including 2 greenfield enterprise network builds from scratch (core switches, PoE switches, APs, and segmented 802.1Q VLANs).
                        Configure Static Routing, OSPF, and BGP/ADVPN with SD-WAN rules for multi-ISP WAN link resilience.
                        Resolve 7–11 network and security tickets per shift under SLA — policy creation, VPN-down troubleshooting, WAN failover, tunnel migration, and NAT/DHCP.
                        Monitor and tune Wazuh SIEM detection rules across FortiGate, Sophos, Windows, and Linux/SSH log sources, completing full MITRE ATT&CK mapping (brute-force T1110.001, malware execution T1204.002, remote services T1021.004).
                        Validated SSH brute-force detection using simulated attacks (Hydra) against production Wazuh alert rules, and validated Linux File Integrity Monitoring (FIM).
                        Support access provisioning by syncing Active Directory groups to FortiGate for scoped, least-privilege role-based access control.
                      </p>
                      <div className="bc-tags-wrap">
                        {['FortiGate (FortiOS 7.6)', 'FortiManager (21 Sites)', 'FortiAnalyzer', 'BGP / ADVPN', 'SD-WAN', 'Wazuh SIEM', 'MITRE ATT&CK', 'LibreNMS', 'Hydra Simulation', 'Linux FIM', 'AD Sync', 'GCP / Azure VPN'].map(t => (
                          <span key={t} className="bc-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                {/* Role 2: Kanishka Software */}
                <li className="bc-card">
                  <div className="bc-card-grid">
                    <header className="bc-card-date">
                      Feb 2026 — May 2026
                    </header>
                    <div className="bc-card-content">
                      <h3 className="bc-card-heading">
                        <span className="bc-card-title-link">
                          IT Support Executive · Kanishka Software Private Limited
                        </span>
                      </h3>
                      <div className="bc-card-subtitle">
                        Enterprise Desktop, Identity & System Support
                      </div>
                      <p className="bc-card-desc">
                        Delivered technical support and enterprise application deployment for premier banking, financial, and multinational corporate client environments under strict SLAs.
                        Administered Active Directory (AD DS) user accounts, role delegation, access permissions, security groups, and password resets; supported Microsoft 365 (O365) services.
                        Diagnosed and resolved hardware, software, network connectivity, and operating system issues across Windows, macOS, and Linux client environments.
                        Triaged, tracked, and resolved enterprise technical support tickets under defined SLA turnaround times, maintaining standardized incident resolution documentation.
                      </p>
                      <div className="bc-tags-wrap">
                        {['Active Directory (AD DS)', 'Microsoft 365 (O365)', 'IT Support & SLAs', 'Windows / macOS / Linux', 'Identity & Access', 'Hardware & OS Triage'].map(t => (
                          <span key={t} className="bc-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                {/* Role 3: Cinepolis India */}
                <li className="bc-card">
                  <div className="bc-card-grid">
                    <header className="bc-card-date">
                      Feb 2025 — Aug 2025
                    </header>
                    <div className="bc-card-content">
                      <h3 className="bc-card-heading">
                        <span className="bc-card-title-link">
                          IT & Platform Support Associate · Cinépolis India
                        </span>
                      </h3>
                      <div className="bc-card-subtitle">
                        Infrastructure, Identity & Edge Security
                      </div>
                      <p className="bc-card-desc">
                        Administered on-premise Windows Server Active Directory (AD DS, GPO, DNS, DHCP) and Linux server environments, managing user access privileges and ACLs for 100+ workstations and POS transaction systems.
                        Configured routers, switches, and edge firewalls; resolved IP/ACL overlap and access conflicts on network infrastructure under strict SLA.
                        Enforced edge firewall security policies and web/content filtering to block unauthorized and malicious site access per corporate security policy.
                        Coordinated with telecom ISPs and hardware vendors for leased-line restorations under strict 4-hour SLA penalty windows and conducted scheduled backup restoration drills to guarantee disaster recovery readiness.
                      </p>
                      <div className="bc-tags-wrap">
                        {['Windows Server AD', 'Fortinet / Firewalls', 'Web Filtering', 'Cisco / Switching', 'Linux Systems', 'SLA Incident Triage', 'Disaster Recovery'].map(t => (
                          <span key={t} className="bc-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                {/* Role 4: Sound Solutions */}
                <li className="bc-card">
                  <div className="bc-card-grid">
                    <header className="bc-card-date">
                      May 2019 — Jun 2019
                    </header>
                    <div className="bc-card-content">
                      <h3 className="bc-card-heading">
                        <span className="bc-card-title-link">
                          Technical Infrastructure Trainee · Sound Solutions
                        </span>
                      </h3>
                      <div className="bc-card-subtitle">
                        Physical Layer & Structured Network Deployment
                      </div>
                      <p className="bc-card-desc">
                        Executed structured Cat6 cabling, switch patch panel termination, and RJ45 crimping for enterprise LAN buildouts.
                        Conducted Fluke cable certification testing, patch cord verification, and hardware diagnostic verifications.
                      </p>
                      <div className="bc-tags-wrap">
                        {['Cat6 Structured Cabling', 'Patch Panels', 'Cable Certification', 'Network Hardware'].map(t => (
                          <span key={t} className="bc-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              </ol>

              {/* View Full Resume Link */}
              <div>
                <button
                  type="button"
                  className="bc-full-link"
                  onClick={() => setIsResumeModalOpen(true)}
                >
                  View Full Résumé
                  <span className="bc-arrow">→</span>
                </button>
              </div>
            </section>

            {/* ── CORE ARCHITECTURE PROJECTS (5 PILLARS) ── */}
            <section id="projects" className="bc-section" aria-label="Core architecture projects">
              <div className="bc-mobile-section-header">
                <h2 className="bc-mobile-section-title">Architecture</h2>
              </div>

              <ul className="group-list">
                {domains.map((d) => (
                  <li key={d.id} className="bc-card">
                    <div className="bc-card-grid">
                      <header className="bc-card-date">
                        {d.shortCode}
                      </header>
                      <div className="bc-card-content">
                        <h3 className="bc-card-heading">
                          <a
                            className="bc-card-title-link"
                            href={`#${d.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveDiagramDomainId(d.id);
                            }}
                          >
                            {d.title}
                            <span className="bc-arrow">↗</span>
                          </a>
                        </h3>
                        <div className="bc-card-subtitle">{d.subtitle}</div>
                        <p className="bc-card-desc">{d.summary}</p>

                        <div className="bc-card-actions">
                          <button
                            type="button"
                            className="bc-btn-ghost"
                            onClick={() => setActiveDiagramDomainId(d.id)}
                          >
                            <Network size={13} /> Interactive Schematic
                          </button>
                          <button
                            type="button"
                            className="bc-btn-ghost"
                            onClick={() => {
                              setReportModalDomainId(d.id);
                              setIsReportModalOpen(true);
                            }}
                          >
                            <FileText size={13} /> Whitepaper Report
                          </button>
                        </div>

                        <div className="bc-tags-wrap">
                          {d.metrics.map((m, mi) => (
                            <span key={mi} className="bc-tag">
                              {m.label}: {m.val}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── TROUBLESHOOTING KNOWLEDGE BASE (20 CASES) ── */}
            <section id="cases" className="bc-section" aria-label="Troubleshooting knowledge base">
              <div className="bc-mobile-section-header">
                <h2 className="bc-mobile-section-title">Troubleshooting KB</h2>
              </div>

              {/* Search & Filter Controls */}
              <div className="bc-search-wrap">
                <div className="bc-search-input-box">
                  <Search size={14} className="bc-search-icon" />
                  <input
                    type="text"
                    className="bc-search-input"
                    placeholder="Search 24 audited cases by symptom, Postfix, Wazuh, OpenSearch, BGP, MTU, IPsec..."
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                  />
                </div>

                <div className="bc-filter-pills">
                  {[
                    { id: 'all', label: 'All Cases (24)' },
                    { id: 'siem', label: 'SIEM & SOC' },
                    { id: 'mail', label: 'Mail Relay & Postfix' },
                    { id: 'vpn', label: 'IPsec & ADVPN' },
                    { id: 'security', label: 'Firewall & UTM' },
                    { id: 'routing', label: 'Routing & BGP' },
                    { id: 'linux', label: 'Linux & Systems' },
                    { id: 'switching', label: 'Switching & Wi-Fi' },
                    { id: 'automation', label: 'Migration Scripts' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`bc-filter-pill${caseCategory === tab.id ? ' active' : ''}`}
                      onClick={() => setCaseCategory(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cases List */}
              <ul className="group-list">
                {filteredCases.map(c => {
                  const isExpanded = expandedCaseId === c.id;
                  return (
                    <li key={c.id} className="bc-card">
                      <div className="bc-card-grid">
                        <header className="bc-card-date">
                          Case {String(c.caseNumber).padStart(2, '0')}
                        </header>
                        <div className="bc-card-content">
                          <h3 className="bc-card-heading">
                            <span
                              className="bc-card-title-link"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                            >
                              {c.title}
                              <span className="bc-arrow">
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            </span>
                          </h3>
                          <div className="bc-card-subtitle">{c.device} · {c.domain}</div>
                          <p className="bc-card-desc">{c.problem}</p>

                          {/* Expandable Accordion Body */}
                          {isExpanded && (
                            <div className="bc-case-body">
                              {/* 1. Symptoms & SLA Impact */}
                              <div className="bc-case-detail-row">
                                <div className="bc-case-label">Symptoms & Operational Impact:</div>
                                <p style={{ color: 'var(--slate-300)' }}>{c.symptoms}</p>
                                {c.impact && (
                                  <div style={{ marginTop: '0.4rem', color: '#38bdf8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--slate-400)' }}>SLA / Impact:</span> {c.impact}
                                  </div>
                                )}
                              </div>

                              {/* 2. Engineering Investigation */}
                              {c.investigation && (
                                <div className="bc-case-detail-row">
                                  <div className="bc-case-label">Engineering Investigation & Triage:</div>
                                  <p style={{ color: 'var(--slate-300)' }}>{c.investigation}</p>
                                </div>
                              )}

                              {/* 3. Diagnostic Commands */}
                              {c.commandsUsed && (
                                <div className="bc-case-detail-row">
                                  <div className="bc-case-label">Diagnostic CLI Verification:</div>
                                  <div className="bc-case-cli">
                                    <code>{c.commandsUsed}</code>
                                    <button
                                      type="button"
                                      className="bc-social-btn"
                                      onClick={() => handleCopyCommand(c.commandsUsed, c.id)}
                                      title="Copy Command"
                                    >
                                      {copiedCaseCommandId === c.id ? <Check size={13} style={{ color: 'var(--teal-300)' }} /> : <Copy size={13} />}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 4. Authentic Terminal Capture / Error Logs */}
                              {c.cliOutput && (
                                <div className="bc-case-detail-row">
                                  <div className="bc-case-label" style={{ color: '#f59e0b' }}>Terminal Capture / Authentic Logs:</div>
                                  <pre className="bc-case-cli-output">
                                    <code>{c.cliOutput}</code>
                                  </pre>
                                </div>
                              )}

                              {/* 5. Root Cause */}
                              <div className="bc-case-detail-row">
                                <div className="bc-case-label" style={{ color: '#f87171' }}>Root Cause Analysis:</div>
                                <p style={{ color: 'var(--slate-300)' }}>{c.rootCause}</p>
                              </div>

                              {/* 6. Remediation / Solution */}
                              <div className="bc-case-detail-row">
                                <div className="bc-case-label" style={{ color: '#34d399' }}>Resolution & Implementation:</div>
                                <p style={{ color: 'var(--slate-300)', whiteSpace: 'pre-line' }}>{c.solution}</p>
                              </div>

                              {/* 7. Verification */}
                              {c.verification && (
                                <div className="bc-case-detail-row">
                                  <div className="bc-case-label" style={{ color: '#a78bfa' }}>Post-Remediation Verification:</div>
                                  <p style={{ color: 'var(--slate-300)' }}>{c.verification}</p>
                                </div>
                              )}

                              {/* 8. Engineering Lessons Learned */}
                              {c.lessonsLearned && (
                                <div className="bc-case-detail-row" style={{ marginBottom: 0 }}>
                                  <div className="bc-case-label" style={{ color: 'var(--teal-300)' }}>Engineering Takeaways & SOC Best Practice:</div>
                                  <p style={{ color: 'var(--slate-300)' }}>{c.lessonsLearned}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="bc-tags-wrap">
                            <span className="bc-tag">{c.category}</span>
                            <span className="bc-tag">{c.device}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ── CONFIG EXPLORER / TERMINAL STUDIO ── */}
            <section id="studio" className="bc-section" aria-label="Configuration explorer">
              <div className="bc-mobile-section-header">
                <h2 className="bc-mobile-section-title">Config Explorer</h2>
              </div>

              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Production-sanitized configuration manifests from active FortiGate cluster firewalls,
                Linux network bonding netplans, transparent Squid configurations, and BGP routing tables.
                All public IPs conform strictly to RFC 5737 test networks.
              </p>

              {/* Selector Tabs */}
              <div className="bc-filter-pills" style={{ marginBottom: '0.85rem' }}>
                {[
                  { id: 'network', label: 'FortiGate ADVPN/BGP Core' },
                  { id: 'security', label: 'Wazuh Active Defense Hook' },
                  { id: 'linux', label: 'Linux Netplan LACP & Squid' },
                  { id: 'cloud', label: 'Terraform AWS/GCP Transit' },
                  { id: 'automation', label: 'PowerShell Parity Verifier' }
                ].map(bundle => (
                  <button
                    key={bundle.id}
                    type="button"
                    className={`bc-filter-pill${selectedBundleId === bundle.id ? ' active' : ''}`}
                    onClick={() => {
                      setSelectedBundleId(bundle.id);
                      setSelectedFileIndex(0);
                    }}
                  >
                    {bundle.label}
                  </button>
                ))}
              </div>

              {selectedBundleId === 'network' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`bc-filter-pill${activeTab === 'config' ? ' active' : ''}`}
                    onClick={() => setActiveTab('config')}
                  >
                    Full FortiOS CLI Config
                  </button>
                  <button
                    type="button"
                    className={`bc-filter-pill${activeTab === 'routes' ? ' active' : ''}`}
                    onClick={() => setActiveTab('routes')}
                  >
                    BGP Routing Table Output
                  </button>
                  <select
                    value={selectedFirewallId}
                    onChange={(e) => setSelectedFirewallId(e.target.value)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: 'var(--slate-200)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="ho_hub">Hub: FortiGate-1000F (Core Datacenter)</option>
                    <option value="plant_west_alpha">Spoke: FortiGate-80F (Plant West Alpha)</option>
                    <option value="plant_central_01">Spoke: FortiGate-60F (Plant Central 01)</option>
                    <option value="plant_north_alpha">Spoke: FortiGate-30G (Plant North Alpha)</option>
                  </select>
                </div>
              )}

              {/* Terminal Window View */}
              <div className="bc-terminal-window">
                <div className="bc-terminal-topbar">
                  <div className="bc-terminal-dots">
                    <span className="bc-terminal-dot red" />
                    <span className="bc-terminal-dot yellow" />
                    <span className="bc-terminal-dot green" />
                  </div>
                  <span className="bc-terminal-title">
                    {selectedBundleId === 'network'
                      ? (activeTab === 'config' ? `${currentFgt.name}.conf` : `get router info bgp summary`)
                      : (activeFile ? activeFile.filename : 'config.txt')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="bc-search-input-box" style={{ width: '160px' }}>
                      <input
                        type="text"
                        className="bc-search-input"
                        placeholder="Filter lines..."
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', height: '24px' }}
                        value={configSearch}
                        onChange={(e) => setConfigSearch(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="bc-btn-ghost"
                      style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                      onClick={handleCopyConfig}
                    >
                      {copiedConfig ? <Check size={12} style={{ color: 'var(--teal-300)' }} /> : <Copy size={12} />}
                      {copiedConfig ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bc-terminal-content">
                  {filteredConfigLines.slice(0, 100).join('\n')}
                  {filteredConfigLines.length > 100 && `\n\n# ... [${filteredConfigLines.length - 100} additional lines truncated for display]`}
                </div>
              </div>
            </section>

            {/* ── TECHNICAL PUBLICATIONS & REPORTS (7 WHITE PAPERS) ── */}
            <section id="reports" className="bc-section" aria-label="Technical publications and reports">
              <div className="bc-mobile-section-header">
                <h2 className="bc-mobile-section-title">Publications</h2>
              </div>

              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Audited technical whitepapers, root-cause forensic analysis reports, and architecture runbooks
                authored for executive engineering review.
              </p>

              <ul className="group-list">
                {reportsList.map(r => (
                  <li key={r.domainId} className="bc-card">
                    <div className="bc-card-grid">
                      <header className="bc-card-date">
                        {r.domainId.toUpperCase()}
                      </header>
                      <div className="bc-card-content">
                        <h3 className="bc-card-heading">
                          <a
                            className="bc-card-title-link"
                            href={r.reportUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              setReportModalDomainId(r.domainId);
                              setIsReportModalOpen(true);
                            }}
                          >
                            {r.name}
                            <span className="bc-arrow">↗</span>
                          </a>
                        </h3>
                        <div className="bc-card-subtitle">{r.subtitle}</div>
                        <p className="bc-card-desc">{r.summary}</p>

                        <div className="bc-card-actions">
                          <button
                            type="button"
                            className="bc-btn-ghost"
                            onClick={() => {
                              setReportModalDomainId(r.domainId);
                              setIsReportModalOpen(true);
                            }}
                          >
                            <FileText size={13} /> View Full Report
                          </button>
                          <a
                            href={r.reportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bc-btn-ghost"
                          >
                            <ExternalLink size={13} /> Open in Tab
                          </a>
                        </div>

                        <div className="bc-tags-wrap">
                          {r.metrics.map((m, mi) => (
                            <span key={mi} className="bc-tag">
                              {m.label}: {m.val}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── FOOTER (Brittany Chiang style) ── */}
            <footer className="bc-footer">
              <p>
                Loosely designed in <a href="https://www.figma.com/" target="_blank" rel="noreferrer">Figma</a> and coded in <a href="https://code.visualstudio.com/" target="_blank" rel="noreferrer">Visual Studio Code</a>.
                Built with <a href="https://react.dev/" target="_blank" rel="noreferrer">React</a> and <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript</a>, styled with custom CSS matching the <a href="https://brittanychiang.com/" target="_blank" rel="noreferrer">Brittany Chiang</a> design system.
                Inter font. All architecture diagrams and configurations production-sanitized per RFC 5737.
              </p>
            </footer>

          </main>
        </div>
      </div>

      {/* ── INTERACTIVE TOPOLOGY & DIAGRAM MODAL ── */}
      {activeDiagramDomainId && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveDiagramDomainId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="resume-modal-window"
            style={{ maxWidth: '1200px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resume-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <Network size={16} style={{ color: 'var(--teal-300)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--slate-200)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Interactive Architecture Schematic: {activeDiagramDomainId.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveDiagramDomainId(null)}
                aria-label="Close schematic viewer"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem' }}>
              <InteractiveDiagram
                domainId={activeDiagramDomainId}
                selectedFirewallId={selectedFirewallId}
                onSelectFirewall={(id) => setSelectedFirewallId(id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── RESUME MODAL ── */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      {/* ── PROJECT WHITE PAPER REPORT MODAL ── */}
      <ProjectReportModal
        isOpen={isReportModalOpen}
        initialDomainId={reportModalDomainId}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
