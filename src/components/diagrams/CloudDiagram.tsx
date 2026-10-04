import React, { useState } from 'react';
import { FileCode } from 'lucide-react';

interface CloudMeshSegment {
  id: string;
  name: string;
  provider: string;
  asn: string;
  ipRange: string;
  tunnelConfig: string;
  terraformSnippet: string;
}

const CLOUD_SEGMENTS: CloudMeshSegment[] = [
  {
    id: 'aws',
    name: 'AWS VPC & Virtual Private Gateway (VGW)',
    provider: 'Amazon Web Services (ap-south-1)',
    asn: 'BGP AS 64512',
    ipRange: 'VPC CIDR: 172.31.0.0/16',
    tunnelConfig: 'Dual Redundant IPsec Tunnels (Tunnel 1: 198.51.100.21, Tunnel 2: 198.51.100.22) with /30 BGP transit subnets (169.254.10.0/30, 169.254.10.4/30). Phase 1: AES256 / SHA256 / DH14.',
    terraformSnippet: `resource "aws_vpn_connection" "onprem_vpn" {
  vpn_gateway_id      = aws_vpn_gateway.vpn_gw.id
  customer_gateway_id = aws_customer_gateway.fortigate_cgw.id
  type                = "ipsec.1"
  static_routes_only  = false # Dynamic BGP Peering
  
  tunnel1_inside_cidr = "169.254.10.0/30"
  tunnel2_inside_cidr = "169.254.10.4/30"
  tunnel1_preshared_key = var.ipsec_psk
}`
  },
  {
    id: 'gcp',
    name: 'GCP Cloud Router & High-Availability VPN',
    provider: 'Google Cloud Platform (asia-south1)',
    asn: 'BGP AS 16550',
    ipRange: 'VPC Subnet: 10.128.0.0/20 (SOC Host moon)',
    tunnelConfig: 'HA-VPN 99.99% SLA Gateway with two external IP addresses peering with On-Prem FortiGate. Dynamic route learning injects 10.128.0.0/20 into on-premises routing tables.',
    terraformSnippet: `resource "google_compute_ha_vpn_gateway" "ha_gateway" {
  name    = "gcp-wazuh-vpn-gw"
  network = google_compute_network.soc_vpc.id
  region  = "asia-south1"
}

resource "google_compute_router" "router" {
  name    = "gcp-soc-router"
  network = google_compute_network.soc_vpc.id
  bgp {
    asn = 16550
  }
}`
  },
  {
    id: 'fortigate',
    name: 'On-Premises Core Gateway (FortiGate-1000F)',
    provider: 'Integrated Infosec Core Hub',
    asn: 'BGP AS 65000',
    ipRange: 'Datacenter Subnet: 10.0.0.0/16',
    tunnelConfig: 'Multi-homed BGP configuration establishing redundant eBGP peerings with AWS (AS 64512) and GCP (AS 16550), advertising internal ERP routes while receiving cloud VPC prefixes.',
    terraformSnippet: `config router bgp
    set as 65000
    config neighbor
        edit "169.254.10.1"
            set remote-as 64512 # AWS BGP Peer
            set description "AWS_VPC_Tunnel_1"
        next
        edit "169.254.20.1"
            set remote-as 16550 # GCP BGP Peer
            set description "GCP_SOC_Tunnel_1"
        next
    end
end`
  }
];

export const CloudDiagram: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('aws');

  const activeSegment = CLOUD_SEGMENTS.find(s => s.id === activeId) || CLOUD_SEGMENTS[0];

  return (
    <div className="cloud-pipeline-wrapper">
      {/* Cloud Segment Navigation */}
      <div className="pipeline-steps-bar">
        {CLOUD_SEGMENTS.map(s => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              className={`pipeline-step-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              <span className="step-num">{s.asn.replace('BGP ', '')}</span>
              <span className="step-label">{s.name.split('(')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Segment Detail */}
      <div className="pipeline-detail-grid">
        <div className="pipeline-info-col">
          <div className="pipeline-stage-badge">
            <span className="badge-pill-primary">{activeSegment.provider}</span>
            <span className="badge-pill-neutral font-mono">{activeSegment.asn}</span>
          </div>
          <h4 className="pipeline-stage-title">{activeSegment.name}</h4>
          <p className="pipeline-stage-desc">{activeSegment.tunnelConfig}</p>
          <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {activeSegment.ipRange}
          </div>
        </div>

        <div className="pipeline-code-col">
          <div className="pipeline-code-bar">
            <div className="code-bar-title">
              <FileCode size={13} className="text-blue" />
              <span>Infrastructure as Code / CLI Manifest</span>
            </div>
            <span className="code-lang-tag">TERRAFORM / CLI</span>
          </div>
          <pre className="pipeline-code-pre">
            <code>{activeSegment.terraformSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
