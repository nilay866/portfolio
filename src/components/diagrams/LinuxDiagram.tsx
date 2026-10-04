import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface LinuxComponent {
  id: string;
  name: string;
  category: string;
  specs: string;
  description: string;
  configPath: string;
  configSnippet: string;
}

const LINUX_COMPONENTS: LinuxComponent[] = [
  {
    id: 'netplan',
    name: 'Netplan LACP Bonding & Bridge (br0)',
    category: 'Layer 2/3 Networking',
    specs: 'Dual 10GbE Interfaces (enp3s0, enp4s0) • 802.3ad Mode 4',
    description: 'Host network configuration aggregating physical network interfaces into bond0 using LACP, then binding into br0 Linux bridge so that KVM virtual machines and Docker containers share bare-metal wire speed without host CPU bottlenecks.',
    configPath: '/etc/netplan/01-netcfg.yaml',
    configSnippet: `network:
  version: 2
  renderer: networkd
  bonds:
    bond0:
      interfaces: [enp3s0, enp4s0]
      parameters:
        mode: 802.3ad
        lacp-rate: fast
        transmit-hash-policy: layer2+3
  bridges:
    br0:
      interfaces: [bond0]
      addresses: [192.168.1.10/24]
      routes:
        - to: default
          via: 192.168.1.1
      parameters:
        stp: false`
  },
  {
    id: 'faz',
    name: 'FortiAnalyzer Virtual Appliance (KVM/QEMU)',
    category: 'Security Analytics VM',
    specs: '16 GB RAM • 4 vCPUs • 100 GB faz-log.qcow2',
    description: 'Virtualized FortiAnalyzer instance provisioned via virt-install with dedicated storage volumes. Deployed to aggregate real-time security events and compliance logs across all 21 distributed branch firewalls.',
    configPath: 'virt-install CLI Deployment Command',
    configSnippet: `virt-install \\
  --name FortiAnalyzer \\
  --ram 16384 \\
  --vcpus 4 \\
  --os-variant generic \\
  --disk path=/var/lib/libvirt/images/faz-system.qcow2,size=20,format=qcow2 \\
  --disk path=/var/lib/libvirt/images/faz-log.qcow2,size=100,format=qcow2 \\
  --network bridge=br0,model=virtio \\
  --graphics none \\
  --console pty,target_type=serial`
  },
  {
    id: 'squid',
    name: 'Squid 6.14 SSL-Bump Proxy & Interception',
    category: 'Secure Web Gateway',
    specs: 'Port 8080 • Root CA Interception • dynamic-cert-mem-cache-size=16MB',
    description: 'High-performance forward proxy configured with ssl-bump to inspect encrypted outbound traffic from non-browser enterprise service processes, caching repeatable updates and enforcing domain categorization.',
    configPath: '/etc/squid/squid.conf (SSL-Bump Directive)',
    configSnippet: `http_port 8080 ssl-bump \\
  cert=/etc/squid/certs/squid-ca.pem \\
  generate-host-certificates=on \\
  dynamic_cert_mem_cache_size=16MB

acl step1 at_step SslBump1
ssl_bump peek step1
ssl_bump bump all

cache_mem 2048 MB
maximum_object_size_in_memory 512 KB
cache_dir ufs /var/spool/squid 10000 16 256`
  },
  {
    id: 'stack',
    name: 'Enterprise Co-Located Infrastructure',
    category: 'Infrastructure Services',
    specs: 'Vaultwarden • LibreNMS NMS • Postfix OpenDKIM Relay',
    description: 'Supplementary security and monitoring containers co-located on host moon. Sized carefully within host 32GB RAM constraints to guarantee uninterrupted operations for critical password management and SNMP trap collection.',
    configPath: 'docker-compose.yml (Services Summary)',
    configSnippet: `services:
  vaultwarden:
    image: vaultwarden/server:latest
    restart: always
    environment:
      - WEBSOCKET_ENABLED=true
  librenms:
    image: librenms/librenms:latest
    ports:
      - "5140:514/udp" # Syslog ingestion
      - "162:162/udp"  # SNMP traps`
  }
];

export const LinuxDiagram: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('netplan');

  const activeComponent = LINUX_COMPONENTS.find(c => c.id === activeId) || LINUX_COMPONENTS[0];

  return (
    <div className="linux-pipeline-wrapper">
      {/* Component Navigation */}
      <div className="pipeline-steps-bar">
        {LINUX_COMPONENTS.map(c => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              className={`pipeline-step-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="step-num">{c.category.split(' ')[0]}</span>
              <span className="step-label">{c.name.split('(')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Component Detail */}
      <div className="pipeline-detail-grid">
        <div className="pipeline-info-col">
          <div className="pipeline-stage-badge">
            <span className="badge-pill-success">Ubuntu 24.04 LTS</span>
            <span className="badge-pill-neutral font-mono">{activeComponent.specs}</span>
          </div>
          <h4 className="pipeline-stage-title">{activeComponent.name}</h4>
          <p className="pipeline-stage-desc">{activeComponent.description}</p>
        </div>

        <div className="pipeline-code-col">
          <div className="pipeline-code-bar">
            <div className="code-bar-title">
              <FileText size={13} className="text-emerald" />
              <span>{activeComponent.configPath}</span>
            </div>
            <span className="code-lang-tag">YAML / CONF</span>
          </div>
          <pre className="pipeline-code-pre">
            <code>{activeComponent.configSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
