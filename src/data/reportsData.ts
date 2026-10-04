// Engineering Project Reports and Technical Architecture Dossiers Metadata
// Sourced from Nilay Chavhan's Knowledge Archive (09_PROJECT_CONTEXT & 03_CONFIGURATIONS)

export interface ReportDefinition {
  domainId: string;
  name: string;
  reportUrl: string;
  badge: string;
  color: string;
  subtitle: string;
  summary: string;
  highlights: string[];
  metrics: { label: string; val: string }[];
}

export const reportsList: ReportDefinition[] = [
  {
    domainId: 'network',
    name: 'Nationwide FortiGate ADVPN & BGP Dynamic Mesh Dossier',
    reportUrl: '/reports/ADVPN_BGP_Architecture_Report.html',
    badge: 'Enterprise Networking',
    color: '#38bdf8',
    subtitle: '21 FortiGate Firewalls, BGP AS 65000 & 78% Latency Reduction',
    summary: 'Full production architectural blueprint for an enterprise Auto-Discovery VPN (ADVPN) hub-and-spoke mesh with dynamic iBGP route reflection. Eliminates central datacenter WAN bottleneck by establishing on-demand spoke-to-spoke IPsec shortcuts.',
    highlights: [
      'Hub-and-spoke dynamic route reflection over iBGP AS 65000',
      'Phase 1/2 IKEv2 crypto profiles with wildcard 0.0.0.0/0 selectors',
      'Dual-WAN SD-WAN SLA automatic failover in <1 second',
      'Spoke BGP route aggregation reducing memory footprint by 84%'
    ],
    metrics: [
      { label: 'Inter-Spoke Latency', val: '78% Drop (65ms → 14ms)' },
      { label: 'Firewalls In Mesh', val: '21 FortiGates' },
      { label: 'Link Convergence', val: '< 1 Second' },
      { label: 'Spoke RAM Saved', val: '84% Less Routes' }
    ]
  },
  {
    domainId: 'security',
    name: 'Wazuh SIEM 4.14 Cluster & Automated Threat Defense Dossier',
    reportUrl: '/reports/Wazuh_SIEM_SOC_Report.html',
    badge: 'SOC & SIEM Architecture',
    color: '#ef4444',
    subtitle: 'Wazuh 4.14 Cluster, Edge IP Ban Daemon & Postfix Relay',
    summary: 'Centralized security monitoring and detection engineering architecture. Deploys Dockerized Wazuh 4.14 with OpenSearch JVM heap rebalancing, custom level="0" noise suppression rules, autonomous Python IP ban daemons, and DKIM-signed multi-tenant alert relays.',
    highlights: [
      'Sub-45s autonomous edge quarantine via Python ban manager daemon',
      '92% alert noise reduction via custom parent/child Level="0" rules',
      'OpenSearch shard density and 8 GB JVM heap optimization with 60-day ISM',
      'Centralized Postfix DKIM relay tunneling client alerts via socat:25 to VIP:1587'
    ],
    metrics: [
      { label: 'Perimeter Ban Time', val: '< 45 Seconds' },
      { label: 'Noise Reduction', val: '92% Alert Drop' },
      { label: 'OpenSearch Heap', val: 'Rebalanced to 8 GB' },
      { label: 'Alert Verification', val: '100% DKIM Signed' }
    ]
  },
  {
    domainId: 'linux',
    name: 'Ubuntu 24.04 KVM Hypervisor & Squid Proxy Architecture Dossier',
    reportUrl: '/reports/KVM_Linux_Virtualization_Report.html',
    badge: 'Linux Infrastructure',
    color: '#10b981',
    subtitle: 'Bare-Metal 802.3ad LACP Bond0, br0 Bridge & SSL-Bump Proxy',
    summary: 'Bare-metal enterprise Linux infrastructure and virtualization framework. Features dual 10GbE IEEE 802.3ad LACP bonded uplinks, zero-overhead kernel bridge networking for KVM virtual machines, Squid 6.14 dynamic SSL-bump forward caching, and hardened sysctl kernel tuning.',
    highlights: [
      'Netplan 802.3ad LACP bonding (bond0) + Linux bridge (br0) on dual 10GbE NICs',
      'Near bare-metal I/O for virtual machines using VirtIO drivers',
      'Squid 6.14 dynamic SSL-bump certificate generation and enterprise domain ACLs',
      'Kernel hardening: SYN cookies, reverse path anti-spoofing, BPF isolation'
    ],
    metrics: [
      { label: 'Aggregate Uplink', val: '20 Gbps (LACP)' },
      { label: 'Failover Timing', val: 'Sub-100ms' },
      { label: 'WAN Bandwidth Saved', val: '35% via Squid' },
      { label: 'VM I/O Architecture', val: '100% VirtIO' }
    ]
  },
  {
    domainId: 'cloud',
    name: 'AWS & GCP Hybrid Multi-Cloud Dynamic BGP Mesh Dossier',
    reportUrl: '/reports/Hybrid_Cloud_Mesh_Report.html',
    badge: 'Cloud & IaC',
    color: '#a855f7',
    subtitle: 'AWS Dynamic BGP VPN, Terraform HCL & ISP SLA Monitor',
    summary: 'Declarative Terraform HCL architecture establishing dual route-based IPsec tunnels between on-premise FortiGate Core Hub and AWS Virtual Private Gateway. Automated multi-WAN health monitoring daemon switches /etc/hosts records dynamically on link degradation.',
    highlights: [
      'Terraform HCL infrastructure for AWS CGW, VGW, and dynamic BGP peering',
      'Dynamic route propagation into private VPC route tables without static routes',
      'isp_failover.py ICMP SLA daemon tracking WAN1/WAN2 across 21 firewalls',
      'fortigate_autobackup.py automated daily REST API backup with 7-day retention'
    ],
    metrics: [
      { label: 'Uptime Reliability', val: '99.99% Dual-Tunnel' },
      { label: 'BGP Convergence', val: '< 3 Seconds' },
      { label: 'Backup Automation', val: '100% REST API' },
      { label: 'DNS Manual Effort', val: 'Zero Intervention' }
    ]
  },
  {
    domainId: 'automation',
    name: 'FortiGate 30E/50E to 30G/50G Hardware Refresh & Parity Engine Dossier',
    reportUrl: '/reports/Firewall_Migration_Automation_Report.html',
    badge: 'Systems Automation',
    color: '#f59e0b',
    subtitle: '11-Stage PowerShell AST Parser & Parity Verification Engine',
    summary: 'Automated migration and auditing engine converting legacy FortiOS 6.2 configurations into sanitized FortiOS 7.2/7.4 configurations. Solves factory virtual-switch hardware lock, interface remapping, and cryptographic upgrade with automated pre-cutover token verification.',
    highlights: [
      '11-stage PowerShell AST parsing engine generating production CLI scripts',
      'Unbinds factory virtual-switch "lan" and remaps interface syntax (wan1 → wan)',
      'Upgrades deprecated cryptographic proposals (3DES/MD5 → AES256/SHA256)',
      'Pre-cutover parity auditor verifying 100% address object and policy match'
    ],
    metrics: [
      { label: 'Object Parity', val: '100% Verified' },
      { label: 'Hardware Divergence', val: '0 Syntax Halts' },
      { label: 'Cutover Downtime', val: '< 15 Minutes' },
      { label: 'Parsing Stages', val: '11-Level Pipeline' }
    ]
  },
  {
    domainId: 'cinepolis',
    name: 'Cinépolis Multi-Site Enterprise IT Platform Operations Dossier',
    reportUrl: '/reports/Cinepolis_Enterprise_Platform_Report.html',
    badge: 'Enterprise Platform IT',
    color: '#10b981',
    subtitle: 'Active Directory DS, GPO, POS Network & Leased-Line SLA Recovery',
    summary: 'Comprehensive enterprise operations case study managing Windows Server 2022 Active Directory (AD DS, GPO, DNS, DHCP), Point-of-Sale (POS) ticketing terminal network segmentation, isolated CCTV VLANs, and edge firewall QoS prioritization supporting 100+ endpoints under 99.9% uptime SLA.',
    highlights: [
      'Administered Active Directory DS and GPO security baselines for 100+ endpoints',
      'Engineered Layer 2/3 VLAN isolation for POS payment terminals, CCTV, and guest Wi-Fi',
      'Enforced edge firewall QoS prioritizing transactional ticketing APIs over web browsing',
      'Restored primary leased-line telecom links (Airtel, Tata) under 4-hour SLA penalty windows'
    ],
    metrics: [
      { label: 'Platform Uptime', val: '99.9% Maintained' },
      { label: 'Managed Endpoints', val: '100+ Workstations' },
      { label: 'Telecom MTTR', val: '< 4 Hours' },
      { label: 'Showtime Outages', val: 'Zero Blackouts' }
    ]
  },
  {
    domainId: 'ikev2',
    name: 'Remote Access IKEv2 Dial-Up VPN & AD LDAP EAP-TTLS Dossier',
    reportUrl: '/reports/IKEv2_LDAP_Remote_Access_Report.html',
    badge: 'Remote Access Security',
    color: '#38bdf8',
    subtitle: 'Active Directory LDAP Bind, EAP-TTLS Method 2 & SNAT IP Pools',
    summary: 'High-security remote access architecture integrating FortiOS IKEv2 dial-up VPN with centralized Windows Server 2022 Active Directory LDAP authentication. Enforces EAP-TTLS (Method 2) via FortiClient XML profiles and local branch SNAT IP pools to eliminate cross-mesh route churn.',
    highlights: [
      'Eliminated local perimeter firewall credentials via centralized AD LDAP bind',
      'Configured FortiClient XML profiles enforcing EAP-TTLS (Method 2) encryption',
      'Local SNAT IP pools translate remote VPN traffic to avoid inter-site routing table churn',
      'Solved Case 04 EAP-MSCHAPv2 password authentication failure on LDAP accounts'
    ],
    metrics: [
      { label: 'AD Auth Success', val: '100% Verified' },
      { label: 'Tunnel Encryption', val: 'AES256-GCM' },
      { label: 'Local User DBs', val: 'Zero Firewalls' },
      { label: 'Mesh Route Churn', val: 'Zero Regressions' }
    ]
  }
];
