import React, { useState } from 'react';
import { Terminal, ShieldCheck } from 'lucide-react';

interface MigrationStage {
  level: string;
  name: string;
  purpose: string;
  targetSyntax: string;
  auditGate: string;
}

const MIGRATION_STAGES: MigrationStage[] = [
  {
    level: 'Level 0',
    name: 'Factory Defaults & Switch Teardown',
    purpose: 'Deletes default factory policy 1, unbinds fortilink from physical ports, and deletes factory virtual-switch "lan" to allow individual interface assignment on G-Series models.',
    targetSyntax: `config firewall policy
    delete 1
end
config system virtual-switch
    delete "lan"
end`,
    auditGate: 'Verifies unbundled ports (lan1, lan2, lan3, lan4, a) are free of software switch bindings.'
  },
  {
    level: 'Level 1',
    name: 'Physical & Logical Interfaces',
    purpose: 'Remaps physical interface names (30E lan3 -> 30G wan; 30E lan4 -> 30G a; 30E internal -> 30G lan1-lan4). Configures 802.1Q VLAN sub-interfaces and static IPs.',
    targetSyntax: `config system interface
    edit "wan"
        set mode static
        set ip 198.51.100.40 255.255.255.0
        set allowaccess ping
    next
    edit "a"
        set mode pppoe
        set alias "CableNet_ISP"
    next
end`,
    auditGate: 'Validates MTU, administrative access, and interface IP subnet correctness.'
  },
  {
    level: 'Level 2-3',
    name: 'DHCP, DNS & Address Objects',
    purpose: 'Parses raw configuration lines, strips invalid legacy UUID strings (which cause syntax reject on FortiOS 7.2/7.4), and provisions clean firewall address objects and FQDNs.',
    targetSyntax: `config firewall address
    edit "Regional_Branch_West_LAN"
        set subnet 192.168.11.0 255.255.255.0
    next
    edit "Cloud4C_Azure_DC"
        set subnet 172.21.100.32 255.255.255.240
    next
end`,
    auditGate: 'check_addr_parity.ps1 confirms 100% address object match (0 missing).'
  },
  {
    level: 'Level 4',
    name: 'Address Groups & Virtual IPs (VIP)',
    purpose: 'Provisions nested address groups and destination NAT Virtual IPs for external CCTV and ERP application access (e.g. TCP port 37777 and TCP port 8000 forwarding).',
    targetSyntax: `config firewall vip
    edit "CCTV-ACCESS_Airtel"
        set extip 198.51.100.40
        set mappedip "192.168.11.121"
        set extintf "wan"
        set portforward enable
        set extport 37777
        set mappedport 37777
    next
end`,
    auditGate: 'check_grp_parity.ps1 verifies all member bindings exist in address database.'
  },
  {
    level: 'Level 5-7',
    name: 'VPN Overlays, SD-WAN & UTM Profiles',
    purpose: 'Transforms legacy interface-based IPsec tunnels into FortiOS 7.x modern cryptographic profiles. Binds interfaces into SD-WAN zones with performance SLA health-checks.',
    targetSyntax: `config vpn ipsec phase1-interface
    edit "IPSecToCloud4C"
        set interface "wan"
        set remote-gw 203.0.113.50
        set proposal aes128-sha256 aes256-sha256
        set dhgrp 2
    next
end`,
    auditGate: 'check_routing_vpn_parity.ps1 checks Phase 1 proposals and Phase 2 selectors.'
  },
  {
    level: 'Level 8-10',
    name: 'Policies, Routing & Parity Audit',
    purpose: 'Rebuilds firewall policy set with updated interface names and translated log directives (logtraffic all + logtraffic-start enable). Enforces final automated diff audit.',
    targetSyntax: `config firewall policy
    edit 1
        set name "LAN_to_Cloud4C"
        set srcintf "lan"
        set dstintf "IPSecToCloud4C"
        set srcaddr "Regional_Branch_West_LAN"
        set dstaddr "Cloud4C_Azure_DC"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end`,
    auditGate: 'check_policy_parity.ps1 executes automated deep-field AST comparison (100% policy parity).'
  }
];

export const AutomationDiagram: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const activeStage = MIGRATION_STAGES[activeIdx];

  return (
    <div className="automation-pipeline-wrapper">
      {/* Top Stage Navigation Tabs */}
      <div className="pipeline-steps-bar">
        {MIGRATION_STAGES.map((s, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={s.level}
              type="button"
              className={`pipeline-step-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveIdx(idx)}
            >
              <span className="step-num">{s.level}</span>
              <span className="step-label">{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail */}
      <div className="pipeline-detail-grid">
        <div className="pipeline-info-col">
          <div className="pipeline-stage-badge">
            <span className="badge-pill-warning">{activeStage.level}</span>
            <span className="badge-pill-neutral">1,091-Line PowerShell AST Parser</span>
          </div>
          <h4 className="pipeline-stage-title">{activeStage.name}</h4>
          <p className="pipeline-stage-desc">{activeStage.purpose}</p>

          <div className="pipeline-audit-gate">
            <div className="audit-gate-header">
              <ShieldCheck size={14} className="text-emerald" />
              <span>Automated Verification Gate</span>
            </div>
            <p className="audit-gate-text">{activeStage.auditGate}</p>
          </div>
        </div>

        <div className="pipeline-code-col">
          <div className="pipeline-code-bar">
            <div className="code-bar-title">
              <Terminal size={13} className="text-amber" />
              <span>Target Staged Output (FortiOS 7.2/7.4 CLI)</span>
            </div>
            <span className="code-lang-tag">CLI SCRIPT</span>
          </div>
          <pre className="pipeline-code-pre">
            <code>{activeStage.targetSyntax}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
