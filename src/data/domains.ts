export type DomainId = 'network' | 'security' | 'linux' | 'cloud' | 'automation' | null;

export interface DomainItem {
  id: 'network' | 'security' | 'linux' | 'cloud' | 'automation';
  name: string;
  shortCode: string;
  color: string;
  glowColor: string;
  position: [number, number, number];
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  metrics: { label: string; val: string; sub?: string }[];
  bulletPoints: string[];
  codeSnippetTitle: string;
  codeSnippet: string;
  image: string | null;
  imageCaption: string;
}

export const domains: DomainItem[] = [
  {
    id: 'network',
    name: 'Network Architecture',
    shortCode: 'NET-01',
    color: '#00f3ff',
    glowColor: 'rgba(0, 243, 255, 0.4)',
    position: [-4.2, 0.5, 0],
    title: 'Enterprise ADVPN & BGP Route Reflector Mesh',
    subtitle: 'Fortinet Infrastructure • 21 Firewalls • Multi-Homed SD-WAN',
    badge: 'Production Validated (1000F Hub)',
    summary: 'Architected and actively maintain multi-site enterprise infrastructure running 21 FortiGate firewalls (FortiGate 1000F Core Hub down to 30G branches). Built high-availability ADVPN mesh with wildcard Phase 2 selectors and centralized BGP Route Reflection.',
    metrics: [
      { label: 'Firewalls Managed', val: '21 Units', sub: 'FortiGate 1000F to 30G' },
      { label: 'Routing Topology', val: 'BGP RR (AS 65000)', sub: 'Zero-Full-Mesh Overhead' },
      { label: 'Tunnel Overlay', val: 'ADVPN Phase 1/2', sub: '10.254.0.0/24 Unified Mesh' },
      { label: 'ISP Redundancy', val: '1Gbps + 500M', sub: 'Automated SD-WAN SLA' }
    ],
    bulletPoints: [
      'Configured Auto Discovery VPN (ADVPN) with wildcard Phase 2 selectors across 20+ spokes.',
      'Architected multi-homed BGP with dual-ISP upstream failover and dynamic route filtering.',
      'Enforced SD-WAN performance-SLA steering for real-time traffic failover between Leased Line and DIA.',
      'Eliminated manual spoke-to-spoke configuration by leveraging dynamic on-demand IKE shortcut tunnels.'
    ],
    codeSnippetTitle: 'FortiOS BGP Route Reflector & ADVPN Hub Config (CLI)',
    codeSnippet: `config router bgp
    set as 65000
    set router-id 10.254.0.1
    config neighbor-group
        edit "advpn-spokes"
            set remote-as 65000
            set route-reflector-client enable
            set next-hop-self enable
        next
    end
end
config vpn ipsec phase1-interface
    edit "advpn-hub"
        set auto-discovery-sender enable
        set proposal aes256-sha256
    next
end`,
    image: null,
    imageCaption: 'Production-validated FortiGate ADVPN Hub & Spoke Topology with BGP Route Reflection'
  },
  {
    id: 'security',
    name: 'Cyber Defense & SIEM',
    shortCode: 'SEC-02',
    color: '#ff2a2a',
    glowColor: 'rgba(255, 42, 42, 0.4)',
    position: [-2.1, 0.5, -2.5],
    title: 'Autonomous SIEM & Threat Response Matrix',
    subtitle: 'Wazuh Cluster • GCP Security Command • FortiOS Active Defense',
    badge: 'Sub-Minute Threat Neutralization',
    summary: 'Centralized telemetry across all perimeter firewalls, server infrastructure, and public cloud environments. Engineered an automated active defense daemon that blocks malicious IP addresses at the firewall edge in sub-minute response times.',
    metrics: [
      { label: 'SIEM Core', val: 'Wazuh Cluster', sub: 'Ubuntu 24.04 Hardened' },
      { label: 'Ingestion Sources', val: '21 Firewalls + GCP', sub: 'Syslog TLS & Pub/Sub' },
      { label: 'Active Defense', val: 'Auto IP-Ban', sub: 'Dynamic Address Feeds' },
      { label: 'Compliance Tier', val: 'Zero Trust & CIS', sub: 'Audited Telemetry' }
    ],
    bulletPoints: [
      'Engineered real-time Syslog pipelines streaming security events from 21 FortiGates over secure TLS/UDP 514.',
      'Connected Google Cloud Platform Cloud Audit & VPC Flow Logs to Wazuh via GCP Pub/Sub streaming.',
      'Developed custom Python daemon (ip-ban-manager.py) to intercept brute-force alerts and push dynamic IP blocks.',
      'Configured deep packet SSL inspection, IPS signature databases, and zero-day containment profiles.'
    ],
    codeSnippetTitle: 'Active Defense Daemon (ip-ban-manager.py) Hook',
    codeSnippet: `def handle_security_alert(alert_payload):
    src_ip = alert_payload.get('data', {}).get('srcip')
    rule_id = alert_payload.get('rule', {}).get('id')
    
    if rule_id in CRITICAL_THREAT_RULES and is_valid_public_ip(src_ip):
        # Push IP to FortiGate Dynamic Address Group via REST API
        resp = requests.post(
            f"https://{FGT_HOST}/api/v2/cmdb/firewall/address",
            headers={"Authorization": f"Bearer {API_TOKEN}"},
            json={"name": f"BAN_{src_ip}", "type": "ipmask", "subnet": f"{src_ip}/32"},
            verify=False, timeout=5
        )
        return resp.status_code == 200`,
    image: null,
    imageCaption: 'Centralized Wazuh SIEM Pipeline with Cloud Audit Stream & FortiOS Edge Mitigation'
  },
  {
    id: 'linux',
    name: 'Linux Virtualization',
    shortCode: 'LNX-03',
    color: '#b026ff',
    glowColor: 'rgba(176, 38, 255, 0.4)',
    position: [0, 0.5, -4],
    title: 'Bare-Metal KVM/QEMU & Squid Enterprise Proxy',
    subtitle: 'Ubuntu 24.04 LTS • Bridge Networking • Kernel Sysctl Tuning',
    badge: 'Enterprise Virtualization',
    summary: 'Engineered bare-metal virtualization nodes powering internal security services, staging clusters, and caching layers. Tuned high-throughput Linux network stacks to achieve zero-packet-drop under heavy enterprise load.',
    metrics: [
      { label: 'Base Host OS', val: 'Ubuntu 24.04 LTS', sub: 'Hardened Kernel' },
      { label: 'Hypervisor', val: 'KVM / QEMU', sub: 'Libvirt & Virsh Mgmt' },
      { label: 'Network Bridge', val: '802.3ad LACP', sub: 'Dual 10GbE bond0/br0' },
      { label: 'Caching Proxy', val: 'Squid Enterprise', sub: '35% WAN Reduction' }
    ],
    bulletPoints: [
      'Configured bonded 802.3ad network interfaces (bond0) connected to Linux bridge (br0) across segregated 802.1Q VLANs.',
      'Deployed lightweight KVM/QEMU guest virtual machines managed via custom shell scripts and virsh CLI.',
      'Architected Squid caching proxy in transparent mode with SSL certificate bumping whitelist to optimize WAN bandwidth.',
      'Hardened Linux kernel via /etc/sysctl.d/ (net.ipv4.ip_forward=1, somaxconn=4096, tcp_tw_reuse=1).'
    ],
    codeSnippetTitle: 'Linux Network Bridge & Kernel Tuning (/etc/sysctl.conf)',
    codeSnippet: `# Production High-Throughput Network Stack
net.ipv4.ip_forward = 1
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216`,
    image: null,
    imageCaption: 'Bare-Metal KVM/QEMU Virtualization Stack with 802.1Q Bridge Segregation'
  },
  {
    id: 'cloud',
    name: 'Hybrid Cloud Mesh',
    shortCode: 'CLD-04',
    color: '#00ffaa',
    glowColor: 'rgba(0, 255, 170, 0.4)',
    position: [2.1, 0.5, -2.5],
    title: 'AWS & GCP Enterprise Hybrid Mesh Connectivity',
    subtitle: 'Transit Gateway • HA Cloud VPN • Multi-Cloud Peering',
    badge: 'Dual-Cloud Infrastructure',
    summary: 'Connected on-premises FortiGate 1000F datacenter core to AWS Virtual Private Clouds and Google Cloud Platform VPCs using dual-homed, route-based IPsec tunnels with dynamic BGP route propagation.',
    metrics: [
      { label: 'Public Clouds', val: 'AWS + GCP', sub: 'Hybrid Multi-Cloud' },
      { label: 'Interconnect', val: 'BGP Route-Based', sub: 'IPsec Site-to-Cloud' },
      { label: 'Failover SLA', val: 'Sub-3s BFD', sub: 'Autonomous Re-Routing' },
      { label: 'Telemetry', val: 'Pub/Sub & S3', sub: 'Offsite Log Archiving' }
    ],
    bulletPoints: [
      'Terminated redundant BGP IPsec tunnels from on-premise FortiGate 1000F into AWS Virtual Private Gateway.',
      'Established high-availability Google Cloud VPN connections with Cloud Router (BGP ASN 65534).',
      'Configured AS-Path prepending and route metric policies to prevent asymmetric inter-cloud routing loops.',
      'Constructed automated S3/GCS bucket lifecycle management for encrypted immutable backup archives.'
    ],
    codeSnippetTitle: 'Terraform AWS VPN Connection & Route Propagation',
    codeSnippet: `resource "aws_vpn_connection" "onprem_fortigate" {
  vpn_gateway_id      = aws_vpn_gateway.datacenter_vgw.id
  customer_gateway_id = aws_customer_gateway.fortigate_1000f.id
  type                = "ipsec.1"
  static_routes_only  = false # BGP Dynamic
  tags = {
    Name = "FortiGate-Hub-To-AWS-Production"
  }
}`,
    image: null,
    imageCaption: 'Dual-Cloud Hybrid Interconnect Architecture: On-Prem FortiGate to AWS/GCP'
  },
  {
    id: 'automation',
    name: 'Automation Engines',
    shortCode: 'AUT-05',
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    position: [4.2, 0.5, 0],
    title: 'Production Migration & Parity Automation Engine',
    subtitle: 'Python 3 • FortiOS REST API • PowerShell Parity Engine',
    badge: '100% Policy Parity Verified',
    summary: 'Eliminated manual firewall provisioning through bespoke Python and PowerShell automation daemons. Automated end-to-end migration, health check telemetry, and configuration validation across all 21 firewalls.',
    metrics: [
      { label: 'Core Daemons', val: 'vpn_script.py', sub: 'Production API Engine' },
      { label: 'Parity Verifier', val: 'PowerShell / Py', sub: 'Zero Missing Rules' },
      { label: 'Deployment Time', val: 'Reduced 85%', sub: 'From Days to Minutes' },
      { label: 'Telemetry', val: 'Webhook / Email', sub: 'Instant Incident Digest' }
    ],
    bulletPoints: [
      'Built vpn_script.py to parse target configuration matrices and inject Phase 1/2 tunnels via FortiOS REST API.',
      'Constructed migration parity verification script comparing legacy firewall rules to new FortiGate JSON trees.',
      'Implemented automated pre-flight API authorization, payload validation, and post-flight tunnel state monitoring.',
      'Engineered automated rollback logic reverting changes within 180 seconds if BGP neighbor state fails.'
    ],
    codeSnippetTitle: 'Production Migration Daemon (vpn_script.py Core)',
    codeSnippet: `def deploy_advpn_spoke(spoke_cfg):
    url = f"https://{spoke_cfg['ip']}/api/v2/cmdb/vpn.ipsec/phase1-interface"
    payload = {
        "name": "advpn-hub",
        "interface": "port1",
        "peertype": "any",
        "auto-discovery-receiver": "enable",
        "proposal": "aes256-sha256",
        "remote-gw": HUB_PUBLIC_IP,
        "psksecret": spoke_cfg['psk']
    }
    resp = session.post(url, json=payload, headers=HEADERS, timeout=10)
    return resp.json().get('status') == 'success'`,
    image: null,
    imageCaption: 'Automated Migration & Parity Verification Scripting Workflow'
  }
];
