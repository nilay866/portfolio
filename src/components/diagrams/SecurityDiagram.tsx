import React, { useState } from 'react';
import { Code2 } from 'lucide-react';

interface PipelineStage {
  id: string;
  number: string;
  name: string;
  component: string;
  summary: string;
  configTitle: string;
  snippet: string;
}

const STAGES: PipelineStage[] = [
  {
    id: 'ingestion',
    number: '01',
    name: 'Perimeter Telemetry Ingestion',
    component: 'rsyslog / UDP 514 & Wazuh Agent TCP 1514',
    summary: '21 FortiGate firewalls stream live event logs over UDP 514 directly to the Wazuh Manager container running on GCP host moon. Windows DCs and Linux endpoints communicate via encrypted TCP 1514 agent connections.',
    configTitle: '/var/ossec/etc/ossec.conf (Syslog Ingestion Block)',
    snippet: `<remote>
  <connection>syslog</connection>
  <port>514</port>
  <protocol>udp</protocol>
  <allowed-ips>192.168.0.0/16</allowed-ips>
  <allowed-ips>10.0.0.0/8</allowed-ips>
  <local_ip>0.0.0.0</local_ip>
</remote>`
  },
  {
    id: 'decoding',
    number: '02',
    name: 'Custom XML Field Decoding',
    component: 'Wazuh Analysisd & local_decoder.xml',
    summary: 'Authored custom regular-expression decoders mapping proprietary FortiOS 7.4 log fields (srcip, dstip, action, service, attack, devname) into normalized Wazuh schema attributes.',
    configTitle: '/var/ossec/etc/decoders/local_decoder.xml',
    snippet: `<decoder name="fortigate-firewall">
  <prematch>^date=.*devname="FG-.*logid="0000000013"</prematch>
</decoder>

<decoder name="fortigate-firewall-fields">
  <parent>fortigate-firewall</parent>
  <regex offset="after_parent">srcip=(\\S+) dstip=(\\S+) action="(\\S+)" service="(\\S+)"</regex>
  <order>srcip, dstip, action, protocol</order>
</decoder>`
  },
  {
    id: 'filtering',
    number: '03',
    name: 'Level "0" False-Positive Noise Suppression',
    component: 'local_rules.xml & MITRE ATT&CK Mapping',
    summary: 'Crafted child suppression rules with level="0" that match authorized internal vulnerability scanning tools (Nessus/Burp at 192.168.4.150), eliminating 92% of alert fatigue while preserving genuine perimeter intrusions.',
    configTitle: '/var/ossec/etc/rules/local_rules.xml',
    snippet: `<!-- Suppress internal scanner alerts -->
<rule id="100002" level="0">
  <if_sid>100001</if_sid>
  <srcip>192.168.4.150</srcip>
  <description>SUPPRESS: Authorized internal Nessus scanner probe</description>
</rule>

<!-- Escalate genuine brute-force login anomalies -->
<rule id="100051" level="12" frequency="5" timeframe="60">
  <if_matched_sid>100050</if_matched_sid>
  <same_source_ip />
  <description>FortiGate: Sustained admin brute force detected</description>
  <mitre><id>T1110</id></mitre>
</rule>`
  },
  {
    id: 'storage',
    number: '04',
    name: 'OpenSearch JVM Heap & Index Retention',
    component: 'OpenSearch 2.12 & 60-Day ISM Policy',
    summary: 'Resolved flood-stage disk watermark lockups and heap exhaustion by sizing JVM heap to 8GB (allocating 32GB host headroom) and implementing Index State Management (ISM) to prune indices older than 60 days.',
    configTitle: '/etc/opensearch/jvm.options & ISM Policy',
    snippet: `## OpenSearch JVM Memory Allocation
-Xms8g
-Xmx8g

## 60-Day ISM Retention Policy
{
  "policy": {
    "description": "Auto-delete indices older than 60 days",
    "default_state": "hot",
    "states": [
      { "name": "hot", "actions": [], "transitions": [{ "state_name": "delete", "conditions": { "min_index_age": "60d" } }] },
      { "name": "delete", "actions": [{ "delete": {} }] }
    ]
  }
}`
  },
  {
    id: 'response',
    number: '05',
    name: 'Autonomous IP Ban Daemon & Feed Export',
    component: 'Python 3.12 Daemon & FortiGate External Connector',
    summary: 'Custom Python daemon (ip_manager.py) continuously monitors /var/ossec/logs/alerts/alerts.json. Offending IPs triggering Rule 100051 (brute-force) are checked against internal whitelists and appended to an HTTP threat feed harvested by perimeter firewalls within 45 seconds.',
    configTitle: '/home/iiadmin/scripts/ip_manager.py (Core Daemon Snippet)',
    snippet: `def process_alert(alert):
    rule_id = alert.get("rule", {}).get("id")
    src_ip = alert.get("data", {}).get("srcip")
    
    # Check if rule warrants automated quarantine
    if rule_id in ["100051", "100010"] and src_ip:
        if not is_whitelisted(src_ip):
            add_to_quarantine_feed(src_ip, duration_days=90)
            log_quarantine_action(src_ip, rule_id)`
  }
];

export const SecurityDiagram: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('ingestion');

  const activeStage = STAGES.find(s => s.id === activeStageId) || STAGES[0];

  return (
    <div className="security-pipeline-wrapper">
      {/* Top Architectural Pipeline Sequence */}
      <div className="pipeline-steps-bar">
        {STAGES.map((s) => {
          const isActive = s.id === activeStageId;
          return (
            <button
              key={s.id}
              type="button"
              className={`pipeline-step-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveStageId(s.id)}
            >
              <span className="step-num">{s.number}</span>
              <span className="step-label">{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail & Code Configuration */}
      <div className="pipeline-detail-grid">
        <div className="pipeline-info-col">
          <div className="pipeline-stage-badge">
            <span className="badge-pill-primary">Stage {activeStage.number} of 05</span>
            <span className="badge-pill-neutral font-mono">{activeStage.component}</span>
          </div>
          <h4 className="pipeline-stage-title">{activeStage.name}</h4>
          <p className="pipeline-stage-desc">{activeStage.summary}</p>
        </div>

        <div className="pipeline-code-col">
          <div className="pipeline-code-bar">
            <div className="code-bar-title">
              <Code2 size={13} className="text-blue" />
              <span>{activeStage.configTitle}</span>
            </div>
            <span className="code-lang-tag">CONFIG</span>
          </div>
          <pre className="pipeline-code-pre">
            <code>{activeStage.snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
