// Complete Audited Production Troubleshooting Cases from Knowledge Archive
// Preserves authentic systems, symptoms, commands, root causes, solutions, and engineering takeaways.
// All public IPs conform strictly to RFC 5737 (198.51.100.x, 203.0.113.x) and private subnets to RFC 1918.
// All client enterprise names and locations are fully sanitized using industry-standard pseudonyms.

export interface TroubleshootingCase {
  id: string;
  caseNumber: number;
  title: string;
  domain: string;
  device: string;
  category: 'siem' | 'mail' | 'vpn' | 'security' | 'routing' | 'linux' | 'switching' | 'automation';
  problem: string;
  symptoms: string;
  investigation: string;
  commandsUsed: string;
  cliOutput?: string;
  rootCause: string;
  solution: string;
  verification: string;
  lessonsLearned: string;
  impact: string;
  relatedArtifact?: string;
}

export const allTroubleshootingCases: TroubleshootingCase[] = [
  {
    id: 'case-01',
    caseNumber: 1,
    title: 'FortiGate Spoke Manufacturing Plant BGP Routing Table Timeout & CLI Hang',
    domain: 'Routing / BGP',
    device: 'FortiGate-80F (Spoke Manufacturing Plant)',
    category: 'routing',
    problem: "Executing 'get router info routing-table all' on Spoke FortiGate CLI times out or freezes the terminal session. Operators unable to view active routing state during peak production hours.",
    symptoms: "SSH session hangs upon running routing queries; high CPU on 'routed' daemon; inter-site ping latency transients.",
    investigation: "Verified CPU: 'routed' spiked to 95% during table dump. Spoke receives 1,420 granular prefixes from Head Office Route Reflector without route aggregation. CLI buffer overflowed serializing routes over SSH.",
    commandsUsed: "get router info routing-table all\nget router info bgp summary\nget router info bgp neighbors\ndiagnose sys top 2 20\ndiagnose ip router bgp all",
    cliOutput: `Spoke-Plant # get router info bgp summary
BGP router identifier 10.10.50.1, local AS number 65001
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.10.1.1       4 65000  421908  421890     3421    0    0 14d18h          1420
<CLI buffer freezes after 150 lines - terminal unresponsive>`,
    rootCause: "Excessive unaggregated BGP prefix propagation (1,400+ routes) delivered to branch unit combined with CLI output buffer lock in 'routed' daemon during full table serialization.",
    solution: "1. Configured BGP prefix filtering and route summarization at Head Office Hub (aggregating spoke subnets into regional /16 and /20 supernets).\n2. Applied prefix list on Spoke BGP neighbor: only accept default route and summarized corporate subnets.",
    verification: "Executed 'get router info routing-table details 10.10.0.0' - returned in <100ms. BGP summary prefix count reduced from 1,420 to 18 routes. Zero CLI hangs.",
    lessonsLearned: "Never propagate raw full routing tables across spoke firewalls with limited CPU/memory. Always summarize internal corporate routes at the ADVPN Hub.",
    impact: "100% instantaneous CLI response restored; 84% BGP memory reduction across all branch firewalls."
  },
  {
    id: 'case-02',
    caseNumber: 2,
    title: 'FortiGate ADVPN Shortcut Tunnel Failure (Edge Site 01 to Edge Site 02)',
    domain: 'ADVPN / IPsec',
    device: 'FortiGate-1000F (Hub) & FortiGate-80F/60F (Spokes)',
    category: 'vpn',
    problem: "Inter-spoke traffic between branch offices (Edge Site 01 to Edge Site 02) continuously hairpins through the Head Office Hub, incurring high WAN latency and Hub bandwidth consumption. Dynamic shortcut tunnels fail to negotiate.",
    symptoms: "Traceroute shows hop through Hub IP 10.10.0.1; diagnose vpn ike gateway list never creates dynamic *_0 shortcut interfaces; 65ms inter-branch latency.",
    investigation: "Parsed and cross-audited 15 firewall configs using automated PowerShell audit scripts. Network-ID and auto-discovery flags matched, but Hub BGP neighbor group had 'next-hop-self' enabled.",
    commandsUsed: "diagnose vpn ike status\ndiagnose vpn ike gateway list\nget vpn ipsec tunnel summary\ndiagnose ip router bgp all\nexecute traceroute 10.20.10.5",
    cliOutput: `HO-HUB # config vpn ipsec phase1-interface
    edit "ADVPN_SPOKES"
        set auto-discovery-sender enable
    next
end
EdgeSite01-Spoke # execute traceroute 10.30.1.15
 1  10.10.0.1 (HO-HUB)  28.4 ms
 2  10.30.1.15 (EdgeSite02) 65.2 ms`,
    rootCause: "Head Office Hub BGP neighbor configuration had 'next-hop-self' enabled on the ADVPN spoke neighbor group. This overwrote the spoke's original next-hop IP with the Hub IP, preventing shortcut triggers.",
    solution: "1. Removed 'set next-hop-self enable' from Hub BGP neighbor group.\n2. Configured Phase 2 selector with 0.0.0.0/0 to allow dynamic subnet negotiation between spokes.\n3. Added firewall policy on all spokes allowing shortcut traffic.",
    verification: "Initiated ping from Edge Site 01 host to Edge Site 02 host. First 2 packets traversed Hub; 3rd packet triggered direct 'ADVPN_HUB_0' shortcut tunnel. Latency dropped to 14ms (78% drop).",
    lessonsLearned: "In FortiOS ADVPN, the Hub MUST preserve the original spoke BGP next-hop. 'next-hop-self' must NEVER be enabled on an ADVPN Hub route reflector.",
    impact: "Inter-spoke ERP sync latency dropped from 65ms to 14ms (78% reduction); eliminated Hub WAN hair-pinning."
  },
  {
    id: 'case-03',
    caseNumber: 3,
    title: 'Site-to-Site IPsec VPN Phase 2 Selector Mismatch Traffic Blackhole',
    domain: 'IPsec Security',
    device: 'FortiGate-100F (Local) / Cisco Router (Remote)',
    category: 'vpn',
    problem: "IPsec tunnel shows UP/GREEN in FortiOS GUI, but traffic between local subnet 172.16.50.0/24 and remote partner subnet 192.168.100.0/24 fails completely. Ping and TCP connections timeout.",
    symptoms: "Tunnel status indicator is green; diagnose vpn tunnel list reports tunnel up; out-packets counter increments while in-packets counter remains zero.",
    investigation: "Analyzed proxy ID selectors: Local selector was 172.16.50.0/24, but Remote selector was 0.0.0.0/0. Cisco ASA dropped outbound packets because crypto ACL required exact 192.168.100.0/24 match. Outbound NAT was also enabled on policy.",
    commandsUsed: "diagnose vpn ike status\ndiagnose vpn tunnel list name S2S_PARTNER\ndiagnose sniffer packet any 'esp or port 500 or port 4500' 4 0 l\ndiagnose debug flow filter dport 443",
    cliOutput: `proxyid=S2S_PARTNER_P2 proto=0 sa_type=1 direction=out
  src: 172.16.50.0/255.255.255.0:0
  dst: 0.0.0.0/0.0.0.0:0
  packets(out/in): 248/0  bytes(out/in): 20832/0`,
    rootCause: "Phase 2 remote selector set to 0.0.0.0/0 instead of partner subnet 192.168.100.0/24, causing remote Cisco peer to drop non-matching proposals. Local firewall policy had NAT enabled.",
    solution: "1. Updated Phase 2 selector: set dst-subnet 192.168.100.0 255.255.255.0 and src-subnet 172.16.50.0 255.255.255.0.\n2. Modified firewall policy: set nat disable.\n3. Cleared SA via 'diagnose vpn ike restart'.",
    verification: "Phase 2 renegotiated with exact subnets. Both packets out and packets in incremented symmetrically. Ping to remote partner host 192.168.100.25 succeeded with 0% packet loss.",
    lessonsLearned: "A GREEN tunnel icon in FortiOS GUI only verifies Phase 1 IKE SA; it does NOT guarantee bidirectional Phase 2 traffic forwarding. Always verify Phase 2 traffic selectors and disable NAT.",
    impact: "Zero traffic drops; ERP batch processing restored within 12 minutes of incident dispatch."
  },
  {
    id: 'case-04',
    caseNumber: 4,
    title: 'Remote Dial-Up IPsec VPN with Active Directory LDAP Authentication Failure',
    domain: 'VPN / Identity',
    device: 'FortiGate-80F / Windows Server AD Domain Controller',
    category: 'vpn',
    problem: "Remote workers using FortiClient Dial-Up IPsec VPN are unable to connect. FortiClient stops at 98% and reports 'Authentication failed' or 'Credential error'.",
    symptoms: "FortiClient connection hangs at 98%; FortiOS event log shows negotiate_error / Peer SA failed; Active Directory shows no logon event.",
    investigation: "Tested TCP connectivity from FortiGate to Active Directory DC on port 389. Port was reachable, but bind failed. Discovered LDAPS was configured on plain port 389 without certificates, and service account password had expired in AD.",
    commandsUsed: "diagnose test authserver ldap AD_SERVER <user> <pass>\ndiagnose debug application fnbamd -1\ndiagnose debug application ike -1\nget user ldap",
    cliOutput: `# diagnose test authserver ldap AD_SERVER testuser *******
authenticate 'testuser' against 'AD_SERVER' failed! Error: Can't contact LDAP server
# diagnose debug application fnbamd -1
[184] handle_ldap_response-LDAP server 192.168.1.15 is down: connection refused`,
    rootCause: "FortiOS LDAP configuration attempted to use LDAPS over plain port 389 without DC certificate support, and the service bind account password had expired in Active Directory.",
    solution: "1. Reconfigured FortiOS LDAP server: set port to 389, disabled secure LDAPS, updated bind DN credentials.\n2. Tested authentication via CLI: 'diagnose test authserver ldap' returned SUCCESS.\n3. Updated user group mapping.",
    verification: "FortiClient dial-up connected successfully, passed 98% milestone, received IP address from pool 10.212.134.100-200, and verified reachability to internal intranet portal.",
    lessonsLearned: "When FortiClient hangs at 98%, the cause is almost universally authentication server timeout or group mismatch. Run 'diagnose test authserver ldap' from CLI first.",
    impact: "Restored secure remote access for 45+ distributed engineers and operations staff."
  },
  {
    id: 'case-05',
    caseNumber: 5,
    title: 'Sophos XGS Firewall NAT Rule and Inbound Port Forwarding Drop',
    domain: 'Firewall / NAT',
    device: 'Sophos XGS 2100 (SFOS 20.0)',
    category: 'security',
    problem: "External client requests to internal web server port 8443 through Sophos WAN IP are dropped. Connection times out.",
    symptoms: "Log viewer shows 'Firewall Drop - Rule 0 (Default drop)'; packet capture on Sophos GUI indicates packets arriving on Port2 (WAN) but never forwarded to Port1 (LAN).",
    investigation: "In SFOS v18+, NAT rules and Firewall rules are decoupled. Found DNAT rule created, but the associated Firewall Rule had Destination Zone set to 'WAN' instead of 'LAN' (post-translation zone).",
    commandsUsed: "tcpdump -eni Port2 port 8443\ndrop-packet-capture 'port 8443'\nshow firewall\nshow advanced-firewall",
    cliOutput: `SFOS# drop-packet-capture 'port 8443'
2026-09-28 11:24:02 [DROP] rule: 0 reason: Inbound traffic denied by firewall`,
    rootCause: "Firewall Rule destination zone was misconfigured as 'WAN' instead of 'LAN'. In Sophos SFOS architecture, the firewall rule destination zone must match the post-translation zone of the destination host.",
    solution: "1. Modified Firewall Rule: Set Source Zone to 'WAN', Destination Zone to 'LAN', Destination Network to internal host (192.168.10.50).\n2. Created Custom Service object 'TCP_8443'.\n3. Configured Reflexive MASQ for return routing.",
    verification: "Executed curl from external WAN host: 'curl -kv https://198.51.100.2:8443/health'. TCP handshake completed immediately, HTTP 200 OK received. Log viewer confirmed hit Rule 5 (Allowed).",
    lessonsLearned: "In Sophos SFOS (v18+), DNAT transforms the IP before firewall evaluation. The Firewall Rule matching the traffic must specify the post-NAT Destination Zone (LAN/DMZ), NOT WAN.",
    impact: "Fixed external vendor portal access with zero downtime for internal web applications."
  },
  {
    id: 'case-06',
    caseNumber: 6,
    title: 'Wazuh SIEM Manager Agent Disconnection & OpenSearch Pipeline Stalling',
    domain: 'SIEM / OpenSearch',
    device: 'Wazuh 4.14 Cluster (Ubuntu 24.04 LTS)',
    category: 'siem',
    problem: "Wazuh Dashboard shows 45 out of 60 agents as 'Disconnected'. Security events generated on endpoints are not indexed into OpenSearch dashboards. Alert pipeline is stalled.",
    symptoms: "Dashboard agent count drops; /var/ossec/logs/ossec.log reports wazuh-remoted: ERROR: Cannot send message to agent; 'filebeat test output' fails with connection refused.",
    investigation: "Checked service status: wazuh-manager was running, but wazuh-indexer (OpenSearch) crashed. Journalctl showed disk space available [1.2 GB] was below the 5 GB low disk watermark threshold.",
    commandsUsed: "systemctl status wazuh-manager\nsystemctl status wazuh-indexer\nfilebeat test output\ncurl -k -u admin https://localhost:9200/_cluster/health?pretty\njournalctl -u wazuh-indexer -n 50 --no-pager",
    cliOutput: `# filebeat test output
elasticsearch: https://localhost:9200...
  parse url... OK
  connection...
    dial tcp 127.0.0.1:9200: connect: connection refused
  ERROR: Connection marked as failed: cannot connect to elasticsearch

# journalctl -u wazuh-indexer | grep -i watermark
wazuh-indexer: [WARN ][o.o.c.r.a.DiskThresholdMonitor] high disk watermark [90%] exceeded on [node-1]
wazuh-indexer: [ERROR][o.o.c.r.a.DiskThresholdMonitor] flood stage disk watermark [95%] exceeded on [node-1][free: 1.2GB], all indices marked read-only`,
    rootCause: "Disk space exhaustion on SIEM server partition (/var/log and old core dumps) triggered OpenSearch flood-stage disk watermark (<5% free), causing wazuh-indexer to refuse writes and fail to start.",
    solution: "1. Purged old archived system logs in /var/log and vacuumed systemd journal ('journalctl --vacuum-size=500M').\n2. Deleted uncompressed raw backups freeing 42 GB of storage.\n3. Reset OpenSearch flood stage watermark settings via API: curl -k -u admin -X PUT 'https://localhost:9200/_cluster/settings' -H 'Content-Type: application/json' -d '{\"persistent\": {\"cluster.blocks.read_only_allow_delete\": null}}'.\n4. Restarted wazuh-indexer, filebeat, and wazuh-manager.",
    verification: "Cluster health returned to 'GREEN'. 'filebeat test output' returned 200 OK. Within 5 minutes, agent count restored to 60/60 'Active'. Real-time alerts resumed populating in Wazuh Dashboard.",
    lessonsLearned: "Wazuh SIEM pipeline depends strictly on indexer disk space. Always configure automated log rotation on /var/ossec/logs/alerts/ and configure disk alert thresholds at 80% to prevent indexer lockups.",
    impact: "Zero data loss; alert noise reduced by 92%; queue latency dropped to zero with sustained 24/7 logging across 21 firewalls."
  },
  {
    id: 'case-07',
    caseNumber: 7,
    title: 'Centralized Multi-Tenant Wazuh Alert Relay via Socat Port 25 Proxy & FortiGate VIP Source Preservation',
    domain: 'Mail Relay / Security Architecture',
    device: 'Postfix Docker (iirelay) / FortiGate-100F / Client Wazuh Managers',
    category: 'mail',
    problem: "External managed client Wazuh servers across public WAN need to dispatch critical security alerts to central SOC team inboxes without hardcoding credentials, storing SMTP passwords on client hosts, or paying for third-party relays. Wazuh native ossec-maild only transmits raw unauthenticated SMTP on port 25.",
    symptoms: "External client Wazuh managers fail to deliver email notifications; client hosts lack direct route to internal relay port 1587; Postfix rejects unauthorized external relay attempts with '554 5.7.1 Relay access denied'.",
    investigation: "Wazuh daemon 'ossec-maild' has hardcoded port 25 constraints. Forwarding directly over WAN port 25 is blocked by residential and cloud ISPs. Designed multi-tier architecture: 1) Client-side systemd proxy tunnels port 25 to perimeter port 1587 via socat; 2) FortiGate VIP forwards to internal Docker relay 192.168.4.19:1587; 3) FortiGate policy enforces 'set nat disable' so client public WAN IPs are preserved for Postfix mynetworks access control; 4) OpenDKIM signs messages; 5) Postfix delivers outbound to Microsoft 365 Exchange Online.",
    commandsUsed: "timeout 3 bash -c '</dev/tcp/198.51.100.58/1587'\nss -tulpn | grep ':25 '\nsystemctl status smtp-proxy\ncurl -v --url 'smtp://127.0.0.1:25'\ndocker exec -it iirelay postconf -n | grep mynetworks\ndocker logs --tail 30 iirelay",
    cliOutput: `# Test from Client Linux Host (Global Infrastructure Group - 198.51.100.11):
$ curl -v --url 'smtp://127.0.0.1:25'
* Connected to 127.0.0.1 (127.0.0.1) port 25 (#0)
< 220 relay.enterprise-sec.local ESMTP Postfix

# Docker Relay Log on central host (192.168.4.19):
postfix/smtpd[18402]: connect from client-gw.infrastructure-corp.com[198.51.100.11]
postfix/smtpd[18402]: 4WvB8b0821zZ1a: client=client-gw.infrastructure-corp.com[198.51.100.11]
opendkim[415]: 4WvB8b0821zZ1a: DKIM-Signature field added (s=mail, d=enterprise-sec.com)
postfix/qmgr[912]: 4WvB8b0821zZ1a: from=<sp-alerts@enterprise-sec.com>, size=2415, nrcpt=3
postfix/smtp[18405]: 4WvB8b0821zZ1a: to=<soc-tier1@enterprise-sec.com>, relay=enterprise-mail.protection.outlook.com[198.51.100.25]:25, dsn=2.6.0, status=sent (250 2.6.0 Queued mail for delivery)`,
    rootCause: "External client Wazuh instances could not speak to non-standard ports natively, and perimeter firewalls dropped unauthenticated port 25. Furthermore, FortiGate SNAT would normally mask client IPs with the gateway IP, preventing Postfix from distinguishing authorized clients.",
    solution: "1. Created systemd 'smtp-proxy.service' on client hosts using 'socat TCP4-LISTEN:25,bind=127.0.0.1,fork,reuseaddr TCP4:198.51.100.58:1587'.\n2. Configured FortiGate custom service TCP-1587, VIP mapping 198.51.100.58:1587 to 192.168.4.19:1587, and firewall policy with 'set nat disable' restricted strictly to authorized client public IPs.\n3. Whitelisted client WAN IPs in Docker Postfix 'mynetworks' (198.51.100.11, 198.51.100.12, 198.51.100.13, 198.51.100.14).\n4. Configured client ossec.conf with unique <email_idsname> for subject tagging.",
    verification: "Injected synthetic test message via netcat to 127.0.0.1:25 on client host. Docker mail log confirmed connection from preserved WAN IP 198.51.100.11, OpenDKIM header added, and delivery confirmed by Microsoft 365 Exchange Online (250 2.6.0). Alert arrived in SOC inbox within 2 seconds.",
    lessonsLearned: "By disabling NAT on perimeter VIP policies ('set nat disable'), Layer 7 services in DMZ/Internal zones can inspect and enforce access control on true public client IPs without needing complex authentication layers.",
    impact: "Enabled centralized, zero-credential, DKIM-signed SOC alert routing across 4 enterprise clients with zero software license fees."
  },
  {
    id: 'case-08',
    caseNumber: 8,
    title: 'Linux Postfix SMTP Relay IPv6 Egress Blackhole & SASL Authentication Failure',
    domain: 'Linux / Mail Services',
    device: 'Ubuntu 22.04 Mail Gateway / Postfix 3.6',
    category: 'mail',
    problem: "Outbound security emails and scan reports stuck in Postfix mail queue. Outbound delivery to Microsoft 365 Exchange Online fails with 'Network is unreachable' and SASL mechanism errors.",
    symptoms: "postqueue -p displays 120 deferred messages; /var/log/mail.log shows: 'connect to mail.protection.outlook.com[2a01:111:f403:2804::10]:25: Network is unreachable' and 'SASL authentication failed; no mechanism available'.",
    investigation: "Investigated two separate root causes: 1) Postfix dual-stack DNS resolver queried AAAA records first. Upstream ISP lacked an IPv6 gateway, causing outbound TCP SYN to IPv6 addresses to time out indefinitely; 2) Postfix configuration had 'smtp_sasl_security_options = noanonymous, noplaintext', rejecting STARTTLS PLAIN authentication.",
    commandsUsed: "postqueue -p\npostconf -n | grep -E 'inet_protocols|sasl'\ncat /var/log/mail.log | grep -E 'Network is unreachable|status=deferred'\npostconf -e 'inet_protocols = ipv4'\npostmap /etc/postfix/sasl_passwd\nsystemctl restart postfix\npostqueue -f",
    cliOutput: `# /var/log/mail.log
postfix/smtp[14201]: connect to enterprise-mail.protection.outlook.com[2a01:111:f403:2804::10]:25: Network is unreachable
postfix/smtp[14201]: 4Sj9k8281zZ1a: to=<soc-admin@enterprise-sec.com>, relay=none, delay=1824, delays=0.02/0.01/30/0, dsn=4.4.1, status=deferred (connect to enterprise-mail.protection.outlook.com[2a01:111:f403:2804::10]:25: Network is unreachable)

# Postfix Protocol Configuration
$ postconf inet_protocols
inet_protocols = all`,
    rootCause: "1. Postfix default 'inet_protocols = all' attempted delivery over non-functional IPv6 routes prior to falling back to IPv4.\n2. Missing 'libsasl2-modules' package and 'noplaintext' parameter blocked TLS-encrypted PLAIN credential exchange.",
    solution: "1. Enforced IPv4 egress: executed 'postconf -e \"inet_protocols = ipv4\"'.\n2. Installed SASL modules: 'apt-get install -y libsasl2-modules'.\n3. Updated /etc/postfix/main.cf: 'smtp_sasl_security_options = noanonymous' and 'smtp_tls_security_level = encrypt'.\n4. Rebuilt password hash map: 'postmap /etc/postfix/sasl_passwd'.\n5. Flushed deferred mail queue: 'postqueue -f'.",
    verification: "mail.log showed immediate IPv4 connection to 198.51.100.25:25. All 120 queued messages delivered in 4.2 seconds: 'status=sent (250 2.6.0 Queued mail for delivery)'. Mail queue cleared to 0.",
    lessonsLearned: "On Linux servers without dedicated native IPv6 routing, always explicitly lock Postfix to 'inet_protocols = ipv4' to avoid 30-second connection timeout penalties per message.",
    impact: "Cleared 120 backlog alert emails and eliminated mail pipeline delays for SOC tier-1 analysts."
  },
  {
    id: 'case-09',
    caseNumber: 9,
    title: 'Wazuh OpenSearch Cluster JVM Heap Starvation & Shard Proliferation (244 Shards on 1GB Heap)',
    domain: 'SIEM / Performance Engineering',
    device: 'Wazuh 4.14 / OpenSearch 2.12 (Host: moon)',
    category: 'siem',
    problem: "Wazuh Dashboard search queries time out with 504 Gateway Timeout or circuit_breaking_exception. Indexer container experiences periodic OOMKilled crashes during security audit investigations.",
    symptoms: "Docker logs show 'java.lang.OutOfMemoryError: Java heap space'; OpenSearch circuit breaker tripped ('[parent] Data too large, data for [<transport_request>] would be [1048576000/1000mb]'); 244 shards active.",
    investigation: "Audited host and Docker sizing: Host server had 32 GB RAM with 25 GB free, but Docker Compose file restricted OpenSearch to 'OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g' (1 GB). Discovered 77 daily unpruned indices with 3 primary shards each (244 total shards). Shard density was 244 shards/GB, violating OpenSearch safe ceiling of 20-30 shards/GB by 800%.",
    commandsUsed: "curl -k -u admin https://localhost:9200/_cat/nodes?v&h=name,heap.current,heap.percent,heap.max\ncurl -k -u admin https://localhost:9200/_cat/shards?v | wc -l\ncurl -k -u admin https://localhost:9200/_cat/indices?v\nfree -h\ndocker stats --no-stream",
    cliOutput: `# Node Heap Utilization
name             heap.current heap.percent heap.max
wazuh.indexer-1  984mb        96           1000mb

# Shard Count vs Safe Limit
Total Active Shards: 244
Allocated Heap: 1 GB
Current Shard Density: 244 shards / GB  [CRITICAL: Safe threshold is 20-30/GB]`,
    rootCause: "Severe JVM heap memory starvation (1 GB) combined with unmanaged daily index accumulation (77 days) and unnecessary 3-shard-per-index configuration on a single-node deployment.",
    solution: "1. Increased OpenSearch JVM heap in docker-compose.yml: set OPENSEARCH_JAVA_OPTS to '-Xms8g -Xmx8g'.\n2. Updated Wazuh index template: changed 'number_of_shards' from 3 to 1 for all future indices.\n3. Implemented OpenSearch Index State Management (ISM) retention policy: configured automated transition to delete indices older than 60 days.\n4. Manually shrunk and removed indices older than 60 days, dropping total active shards from 244 to 68.",
    verification: "OpenSearch JVM heap stabilized at 28% of 8 GB. Dashboard query latency dropped from 14.8 seconds to 420ms. Executed full 30-day cross-index search across 2.4M security events with zero circuit breaker errors.",
    lessonsLearned: "Single-node OpenSearch clusters should always use 1 primary shard per index. Shard density must never exceed 25 shards per GB of JVM heap. Never leave daily indices without an automated ISM lifecycle policy.",
    impact: "Zero indexer crashes; query latency dropped by 97%; reclaimed 85 GB disk storage."
  },
  {
    id: 'case-10',
    caseNumber: 10,
    title: 'Sophos Central Cloud EDR Telemetry Blackout & Ransomware Outbreak Triage in Wazuh',
    domain: 'SIEM / EDR Integration',
    device: 'Wazuh 4.14 / Sophos Central Cloud API',
    category: 'siem',
    problem: "SOC dashboard showing zero endpoint malware detections despite active alerts inside Sophos Central Cloud portal. SIEM was blind to endpoint threat telemetry for 60+ days.",
    symptoms: "Wazuh rules 100511-100522 (Sophos detections) registered 0 hits; python API polling script sophos_poll.py exited with 0; SIEM failed to alert on active endpoint threats.",
    investigation: "Investigated data pipeline: Cron job executed sophos_poll.py successfully, writing ingested events to /var/ossec/etc/sophos_result.txt. However, Wazuh Manager ossec.conf was configured with <localfile> pointing to /var/ossec/logs/sophos/result.txt (a non-existent file path). Wazuh log collector was polling an empty path while events accumulated unparsed.",
    commandsUsed: "grep -n 'sophos' /var/ossec/etc/ossec.conf\nls -la /var/ossec/etc/sophos_result.txt\nhead -n 2 /var/ossec/etc/sophos_result.txt\n/var/ossec/bin/wazuh-logtest\ncat /var/ossec/etc/rules/local_rules.xml | grep -A 10 '100012'",
    cliOutput: `# Wazuh Logtest Verification of Sophos Outbreak Event:
**Phase 1: Completed pre-decoding.
       full event: '{"name":"Outbreak detected","type":"Event::Endpoint::CoreOutbreak","severity":"high","threat":"Unknown Threat","source_info":{"ip":"192.168.0.189"},"dhost":"WORKSTATION-SEC","suser":"CORP\\\\user01"}'

**Phase 2: Completed decoding.
       decoder: 'json'
       name: 'Outbreak detected'
       type: 'Event::Endpoint::CoreOutbreak'
       severity: 'high'
       source_info.ip: '192.168.0.189'

**Phase 3: Completed filtering (rules).
       id: '100012'
       level: '12'
       description: 'Sophos Critical Threat: Outbreak detected'
       groups: '['sophos_high', 'malware']'`,
    rootCause: "File path mismatch between the Sophos Central API poller output path (/var/ossec/etc/sophos_result.txt) and the Wazuh logcollector configuration (/var/ossec/logs/sophos/result.txt).",
    solution: "1. Aligned ossec.conf <localfile> path to point to /var/ossec/etc/sophos_result.txt with <log_format>json</log_format>.\n2. Restarted wazuh-manager.\n3. Verified rule 100012 (Level 12) triggered on Event::Endpoint::CoreOutbreak.\n4. Configured automated email dispatch to SOC lead upon Level 12 triggers.",
    verification: "Tested via wazuh-logtest and restarted collector. Within 60 seconds, 41 queued historical threat events indexed into OpenSearch. Live test with EICAR test string triggered immediate Level 12 SOC notification.",
    lessonsLearned: "Third-party SIEM integrations must have automated heartbeats or ingest-lag monitoring. If an API collector script runs without verifying the ingestion engine consumes the file, silent telemetry loss can persist indefinitely.",
    impact: "Closed critical 60-day blind spot; restored endpoint malware visibility across 140+ corporate workstations."
  },
  {
    id: 'case-11',
    caseNumber: 11,
    title: 'Enterprise Financial Portal URL Filtering Exemption & SSL Inspection Bypass',
    domain: 'Firewall / Web Filter',
    device: 'FortiGate-100F (Corporate HQ)',
    category: 'security',
    problem: "Employees accessing partner financial and insurance claims portal receive a FortiGuard Web Filtering block page stating the website is classified under a restricted category.",
    symptoms: "Browser displays 'Web Page Blocked - Category: Financial / Insurance / High Risk'; business operations blocked for claims processing team.",
    investigation: "FortiGuard global database rated the subdomain under a category blocked by corporate standard user profile. Because the initial request was HTTP and redirected to HTTPS, SSL inspection certificate validation had to be exempted.",
    commandsUsed: "diagnose webfilter fortiguard-rating partner-portal.fintech-gateway.com\ndiagnose test application urlfilter 1 partner-portal.fintech-gateway.com\nconfig webfilter urlfilter\nconfig webfilter profile",
    cliOutput: `URL 'partner-portal.fintech-gateway.com' rating: Category 63 (Finance)
Profile 'Standard_Users': Category 63 action is set to 'Block'
SSL/TLS Handshake: Proprietary TLS 1.3 cipher suite rejected during proxy deep inspection`,
    rootCause: "FortiGuard category rating 'Finance/Insurance' was explicitly blocked in the standard employee web filter profile, and no static URL exemption rule existed for the partner portal.",
    solution: "1. Added static URL filter entry with action 'Exempt' for *partner-portal.fintech-gateway.com*.\n2. Added domain to SSL inspection exemption list to prevent TLS inspection resets.",
    verification: "Navigated to portal URL. HTTP 302 redirect followed to secure claims dashboard; page loaded fully with zero block notifications.",
    lessonsLearned: "When creating business-critical URL exemptions, always use wildcard format (*domain.com*) and exempt the domain from deep SSL inspection if the partner service employs proprietary TLS cipher suites.",
    impact: "Eliminated business claims roadblock within 15 minutes of escalation."
  },
  {
    id: 'case-12',
    caseNumber: 12,
    title: 'FortiGate Web Filter & Application Control AI Blocking (QUIC UDP 443 Bypass)',
    domain: 'Firewall / UTM',
    device: 'FortiGate-100F / 200F (FortiOS 7.4)',
    category: 'security',
    problem: "Corporate directive requires restricting access to public Generative AI platforms (Gemini, ChatGPT) to prevent corporate data leakage, while preserving access to general Google Workspace, Gmail, and Google Search.",
    symptoms: "Simple DNS domain blocking of google.com blocked all Google services; blocking ai subdomains via plain URL filter without deep inspection was bypassed due to browser QUIC/HTTP3.",
    investigation: "Analyzed Google web architecture: Gemini is hosted under shared CDN endpoints. Discovered browser QUIC protocol (UDP 443) bypassed standard TCP proxy inspection.",
    commandsUsed: "diagnose test application urlfilter 1 gemini.google.com\nconfig application list\nconfig webfilter profile\nconfig firewall policy",
    cliOutput: `URL 'gemini.google.com' rated as 'Generative.AI' (Category 103)
Action: Blocked by Application Control Profile 'RESTRICT_AI'
Traffic Analysis: Browser initiated UDP 443 (QUIC) prior to TCP fallback`,
    rootCause: "QUIC protocol (UDP 443) bypasses standard FortiOS SSL/TLS inspection, allowing modern Chrome browsers to reach AI portals without triggering standard TCP 443 proxy inspection rules.",
    solution: "1. Blocked QUIC protocol across all outbound policies (dropped UDP 443 in Policy 1).\n2. Configured Application Control profile 'RESTRICT_AI' blocking Category 103 (AI.Applications).\n3. Added custom URL filter with action block for *gemini.google.com* and *chatgpt.com*.",
    verification: "Tested on corporate client: navigating to gemini.google.com displays Fortinet Application Block page. Google Search, Gmail, and Drive remain 100% accessible.",
    lessonsLearned: "Always block UDP 443 (QUIC) whenever implementing FortiOS web filtering or application control. If QUIC is not blocked, modern browsers will bypass HTTP/HTTPS web filtering inspection.",
    impact: "100% corporate DLP compliance enforced with zero disruption to core enterprise collaboration tools."
  },
  {
    id: 'case-13',
    caseNumber: 13,
    title: 'FortiGate VNC Remote Desktop Traffic Blocking on TCP Port 5900',
    domain: 'Firewall / App Control',
    device: 'FortiGate-80F (Branch Plant)',
    category: 'security',
    problem: "Engineers unable to connect to SCADA HMI workstation via RealVNC / UltraVNC across internal subnets on port 5900. Connection refused or dropped immediately.",
    symptoms: "VNC viewer displays 'Connection dropped by peer' or 'Timed out waiting for response'; ping to HMI host succeeds.",
    investigation: "Ran packet flow trace: confirmed packets hit firewall policy 14 (LAN to OT_VLAN, action accept). Trace revealed packet was discarded at layer 7 by Application Control profile 'Strict_Security'.",
    commandsUsed: "diagnose debug flow filter dport 5900\ndiagnose debug flow filter saddr 10.10.20.15\ndiagnose debug flow trace start 50\ndiagnose debug enable",
    cliOutput: `id=20085 trace_id=12 func=resolve_ip_tuple_fast: Find matching policy 14: action=accept
id=20085 trace_id=12 func=app_ctrl_match: Application matched: VNC (ID: 16182), action=block by profile 'Strict_Security'
id=20085 trace_id=12 func=ip_session_drop: drop packet by application control`,
    rootCause: "Firewall policy 14 had an aggressive Application Control profile applied that classified VNC as blocked Remote.Access software, intercepting and resetting the TCP connection after the three-way handshake.",
    solution: "1. Created custom Application Control sensor 'OT_Engineering_AppProfile' with an application override permitting VNC for authenticated engineering subnets.\n2. Applied sensor to Policy 14.\n3. Restricted VNC access strictly to authorized source IP addresses.",
    verification: "Engineers launched RealVNC session to 10.10.80.22:5900. Flow trace confirmed 'action=accept'. Session established and remained stable for entire shift.",
    lessonsLearned: "Layer 4 firewall policy acceptance does not ensure traffic delivery if an inspection profile (Application Control, IPS, AV) is attached. Always check flow trace for 'app_ctrl_match'.",
    impact: "Secured critical SCADA HMI plant operational visibility without compromising enterprise segmentation."
  },
  {
    id: 'case-14',
    caseNumber: 14,
    title: 'FortiGate LAN Gateway Reachability & Interface allowaccess Ping Failure',
    domain: 'Network / ARP',
    device: 'FortiGate-100F (Corporate HQ)',
    category: 'switching',
    problem: "Users on newly provisioned Head Office LAN subnet 10.10.30.0/24 report complete loss of network connectivity. Workstations cannot ping their default gateway (10.10.30.1).",
    symptoms: "Host ping to 10.10.30.1 returns 'Request timed out'; host ARP table shows gateway MAC as incomplete; other VLANs on same core switch operate normally.",
    investigation: "Packet sniffer showed ARP resolution succeeded (host knew gateway MAC). Host sent ICMP echo requests arriving on port8 (VLAN_30 interface), but FortiGate did not generate echo replies. Inspected interface: allowaccess was completely empty.",
    commandsUsed: "get system interface\nget system arp | grep 10.10.30\ndiagnose sniffer packet any 'arp and host 10.10.30.1' 4 0 l\nexecute ping 10.10.30.50",
    cliOutput: `==[ VLAN_30 ]
name: VLAN_30   ip: 10.10.30.1 255.255.255.0   status: up
allowaccess: (empty)
11.234890 port8 in IP 10.10.30.50 > 10.10.30.1: ICMP echo request
<No echo reply generated by FortiOS kernel>`,
    rootCause: "Administrative access for ICMP ping (set allowaccess ping) was omitted during interface provisioning on the FortiGate VLAN interface, causing the kernel to drop echo requests directed at its own IP.",
    solution: "Enabled ping on VLAN_30 interface:\nconfig system interface\n  edit 'VLAN_30'\n    set allowaccess ping\n  next\nend",
    verification: "Workstations immediately received ICMP echo replies from 10.10.30.1 (<1ms). Ping tests to external destinations (1.1.1.1) succeeded via outbound SNAT policy.",
    lessonsLearned: "FortiOS enforces strict local-in interface management. An interface IP will never respond to ICMP ping unless 'ping' is enabled in set allowaccess, regardless of firewall policies.",
    impact: "Restored gateway routing and internet access for newly deployed corporate department."
  },
  {
    id: 'case-15',
    caseNumber: 15,
    title: 'Linux Bridge br0 Spanning Tree Protocol (STP) Listening-State Periodic 15s Packet Loss Burst',
    domain: 'Linux / Kernel Networking',
    device: 'Ubuntu 22.04 LTS Relay & Host Server (root@test)',
    category: 'linux',
    problem: "Linux host server running mail relay and container infrastructure experiences severe cyclical packet loss (~75.5%) when communicating with local gateway 192.168.4.2 and upstream internet.",
    symptoms: "Ping tests show 15–21 consecutive packet drops, followed by 5–7 low-latency packets (2.6ms–6.2ms), repeating continuously in an exact 20-second cycle.",
    investigation: "Checked network topology: Physical interface enp2s0 was enslaved to bridge br0. Output of 'ip -d link show br0' revealed 'stp_state 1', 'forward_delay 1500' (15 seconds), and 'max_age 2000' (20 seconds). Docker container restarts repeatedly flapped virtual ethernet interfaces (veth*), triggering STP topology change notifications (TCNs) and forcing br0 into 15-second listening/learning states.",
    commandsUsed: "ping -c 50 192.168.4.2\nip link show master br0\nbridge link\nip -d link show br0\ndmesg -T | grep -E 'enp2s0|br0|veth'",
    cliOutput: `# Ping Output:
53 packets transmitted, 13 received, 75.4717% packet loss, time 52992ms
rtt min/avg/max/mdev = 2.640/4.628/6.485/1.394 ms

# Bridge Status:
3: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 master br0
    bridge forward_delay 1500 hello_time 200 max_age 2000 ageing_time 30000 stp_state 1
    topology_change 1 topology_change_detected 1`,
    rootCause: "Software bridge br0 had STP enabled with a 15-second forward delay. Repeated virtual ethernet attachments from Docker caused continuous STP state renegotiations, blackholing traffic during listening and learning phases.",
    solution: "1. Disabled STP on standalone software bridge (no redundant physical switching loop existed on host): 'ip link set dev br0 type bridge stp_state 0'.\n2. Alternatively, configured forward delay to 2 seconds: 'ip link set dev br0 type bridge forward_delay 200'.\n3. Persisted configuration in Netplan / systemd-networkd.",
    verification: "Ran continuous ping of 200 packets to gateway: 0% packet loss, average latency 1.84ms with zero blackout windows.",
    lessonsLearned: "Never enable Spanning Tree Protocol (STP) with default 15-second timers on Linux host bridges connected to single-homed physical switches. Virtual container interfaces flapping will cause catastrophic host-wide link blackouts.",
    impact: "Restored 100% uninterrupted network reliability for Docker relay and SIEM collectors."
  },
  {
    id: 'case-16',
    caseNumber: 16,
    title: 'Aruba Switch Port VLAN Trunking & Wireless AP PVID Mismatch',
    domain: 'Switching / VLAN',
    device: 'Aruba 2930F / 6100 Switch & Aruba AP',
    category: 'switching',
    problem: "Wireless Access Points connected to switch ports fail to receive DHCP management IP, and Wi-Fi clients cannot browse the internet.",
    symptoms: "AP LEDs show discovery failure; switch CLI 'show mac-address' shows AP MAC in Default VLAN 1 instead of Management VLAN 50; wireless clients receive 169.254.x.x link-local addresses.",
    investigation: "Inspected port 1/1 config: VLAN 1 was set as untagged (native VLAN), but management network for APs is VLAN 50. AP sends untagged DHCP discovery frames which were placed into isolated VLAN 1.",
    commandsUsed: "show running-config interface 1/1\nshow vlans\nshow lldp info remote-device\nshow mac-address 1/1\nshow power-over-ethernet 1/1",
    cliOutput: `Aruba-2930F# show running-config interface 1/1
interface 1/1
   tagged vlan 10,20,30
   untagged vlan 1`,
    rootCause: "Switch port 1/1 had VLAN 1 untagged instead of AP Management VLAN 50, and VLAN 50 was missing from the port's membership list.",
    solution: "1. Reconfigured interface 1/1 on Aruba switch: untagged vlan 50, tagged vlan 10,20,30, no untagged vlan 1.\n2. Saved config via write memory.",
    verification: "AP rebooted, received IP 10.50.1.12 from VLAN 50 DHCP pool within 45 seconds. AP joined wireless controller. Wi-Fi client associated to Corporate SSID passed internet traffic.",
    lessonsLearned: "Access Points requiring untagged management traffic must have their switch port PVID / untagged VLAN explicitly configured to the AP Management VLAN, while user SSIDs must be tagged on the trunk.",
    impact: "Restored campus Wi-Fi connectivity for 200+ mobile workstations and warehouse barcode scanners."
  },
  {
    id: 'case-17',
    caseNumber: 17,
    title: 'FortiAP DHCP IP Acquisition & CAPWAP Discovery Failure (DHCP Option 138)',
    domain: 'Wireless / DHCP',
    device: 'FortiAP-231G / FortiGate-100F WLC',
    category: 'switching',
    problem: "FortiAP-231G boots up and receives a DHCP IP address from the local router, and wired devices on the same switch obtain IPs, but the FortiAP never appears in the FortiGate Wireless Controller (WLC) GUI for authorization.",
    symptoms: "FortiAP power and LAN LEDs solid green, but Wi-Fi link LED unlit; FortiAP CLI shows status 'State: Discovery'; FortiGate GUI shows 0 APs detected.",
    investigation: "FortiAP and FortiGate WLC reside in different subnets across an L3 routed boundary. Broadcast discovery packets (UDP 5246) do not cross routers. Local Cisco DHCP server lacked DHCP Option 138 (Capwap AC IP).",
    commandsUsed: "cw_diag -c\ncw_diag -d\ndiagnose wireless-controller wpad status\ndiagnose sniffer packet any 'port 5246 or port 5247' 4 0 l",
    cliOutput: `FortiAP-231G # cw_diag -c
AP IP: 192.168.10.155  GW: 192.168.10.1
State: Discovery
Discovery methods tried:
  DHCP Option 138: Not provided
  Broadcast: Sent 15, Received 0`,
    rootCause: "FortiAP and FortiGate were separated by Layer 3 routing, and the local DHCP server was not configured with DHCP Option 138, preventing the AP from discovering the Wireless Controller IP.",
    solution: "1. Configured static AC IP address on FortiAP via serial console: cfg -a AC_IPADDR_1=10.10.100.1; cfg -c.\n2. Configured DHCP Option 138 on local router DHCP pool: option 138 ip 10.10.100.1.\n3. Verified firewall policy permitted UDP 5246/5247.",
    verification: "FortiAP console logged: 'CAPWAP session connected to AC 10.10.100.1'. FortiGate GUI displayed FortiAP-231G in 'Pending Authorization'. Clicked 'Authorize'. SSIDs broadcasted within 60 seconds.",
    lessonsLearned: "In multi-subnet enterprise deployments, FortiAPs require either DHCP Option 138 or DNS host 'fortiap-capwap' to locate the FortiOS WLC across routed boundaries.",
    impact: "Successfully provisioned enterprise wireless access points across routed manufacturing plant."
  },
  {
    id: 'case-18',
    caseNumber: 18,
    title: 'Central Linux Rsyslog UDP 514 Firewall Syslog Ingestion Failure',
    domain: 'Linux / Logging',
    device: 'Ubuntu 22.04 LTS Logging Server / Rsyslog 8.21',
    category: 'linux',
    problem: "Central Linux syslog server is not receiving firewall log events from FortiGate and Cisco network devices over UDP port 514. /var/log/network.log remains empty.",
    symptoms: "tail -f /var/log/network.log displays no new lines; FortiGate CLI confirms logs sent to server IP; netstat on server does not show UDP 514 bound.",
    investigation: "Tcpdump confirmed firewall syslog packets were arriving at eth0 interface. ss -lunp revealed no service listening on UDP 514. Default Ubuntu /etc/rsyslog.conf ships with UDP syslog reception commented out, and UFW blocked UDP 514.",
    commandsUsed: "ss -lunp | grep 514\ncat /etc/rsyslog.conf | grep -E 'imudp|514'\nufw status verbose\ntcpdump -eni any udp port 514 -c 10",
    cliOutput: `# ss -lunp | grep 514
<Empty output - no process listening on UDP 514>
# tcpdump -eni eth0 udp port 514 -c 2
11:42:01 eth0 IN IP 10.10.0.1.514 > 10.10.5.20.514: UDP, length 248`,
    rootCause: "Default Ubuntu Rsyslog configuration had the imudp module and port 514 input directives commented out, and UFW blocked inbound UDP 514.",
    solution: "1. Edited /etc/rsyslog.conf and uncommented module(load='imudp') and input(type='imudp' port='514').\n2. Added network log filter in /etc/rsyslog.d/30-network.conf.\n3. Allowed UDP 514 in UFW: ufw allow from 10.10.0.0/16 to any port 514 proto udp.\n4. Restarted rsyslog.",
    verification: "ss -lunp showed rsyslogd listening on 0.0.0.0:514. Executed tail -f /var/log/network.log: real-time FortiOS traffic and UTM log streams populated continuously.",
    lessonsLearned: "Ubuntu default rsyslog is strictly a local client. Inbound network syslog ingestion always requires explicitly enabling the imudp module and configuring host firewall access rules.",
    impact: "Centralized syslog archive operational for SOC audit compliance across 21 network firewalls."
  },
  {
    id: 'case-19',
    caseNumber: 19,
    title: 'Vaultwarden Docker Reverse Proxy WebSocket Connection Drop',
    domain: 'Docker / Reverse Proxy',
    device: 'Ubuntu 22.04 LTS / Docker Compose / Nginx',
    category: 'linux',
    problem: "Vaultwarden password manager web vault works, but browser extensions and mobile clients fail to synchronize real-time updates. Logins throw intermittent WebSocket connection errors.",
    symptoms: "Browser developer console shows 'WebSocket connection to wss://vault.company.local/notifications/hub failed'; clients require manual sync to reflect new credentials.",
    investigation: "Vaultwarden uses two separate internal ports: port 80 for standard HTTP API, and port 3012 for WebSocket notifications. Nginx reverse proxy was forwarding all traffic indiscriminately to port 80 and lacked WebSocket upgrade headers.",
    commandsUsed: "docker ps\ndocker logs vaultwarden\nnginx -t\ncurl -I https://vault.company.local/notifications/hub",
    cliOutput: `docker logs vaultwarden:
[ERROR] WebSocket error: Broken pipe
curl -I -k https://vault.company.local/notifications/hub
HTTP/1.1 400 Bad Request`,
    rootCause: "Nginx reverse proxy lacked a dedicated location block for /notifications/hub directed to port 3012 with HTTP Upgrade and Connection headers.",
    solution: "1. Enabled WebSocket in Docker environment: WEBSOCKET_ENABLED=true.\n2. Added location /notifications/hub in Nginx pointing to http://127.0.0.1:3012 with proxy_set_header Upgrade $http_upgrade and proxy_set_header Connection 'upgrade'.\n3. Reloaded Nginx.",
    verification: "Tested via browser console: WebSocket connection established (101 Switching Protocols). Adding a credential on the web vault synced to the mobile app instantly (<1s).",
    lessonsLearned: "Vaultwarden requires explicit reverse proxy handling for WebSockets on /notifications/hub mapped to internal port 3012. Standard HTTP reverse proxy directives will reject WebSocket handshakes.",
    impact: "Zero-latency synchronization restored for corporate password manager across 100+ active users."
  },
  {
    id: 'case-20',
    caseNumber: 20,
    title: 'Ubuntu SSH Key Authentication Failure & KVM Hypervisor Access',
    domain: 'Linux / Virtualization',
    device: 'Ubuntu 24.04 LTS Bare-Metal KVM Host (moon)',
    category: 'linux',
    problem: "Administrator unable to connect to Ubuntu KVM hypervisor via SSH using ed25519 private key from Windows client terminal. Error: 'Load key: bad permissions' or 'Permission denied (publickey)'.",
    symptoms: "SSH client immediately terminates connection; SSH daemon debug log on server reports 'Authentication refused: bad ownership or modes for directory /home/iiadmin/.ssh'.",
    investigation: "Checked file permissions on server: /home/iiadmin/.ssh directory was set to 777 (world-writable) following a manual backup restore. In addition, on the Windows client, the private key file inherited permissions from Users group.",
    commandsUsed: "ls -ld /home/iiadmin/.ssh\nls -l /home/iiadmin/.ssh/authorized_keys\ntail -f /var/log/auth.log\nicacls id_ed25519",
    cliOutput: `/var/log/auth.log:
sshd[2412]: Authentication refused: bad ownership or modes for directory /home/iiadmin/.ssh
sshd[2412]: Failed publickey for iiadmin from 192.168.4.15 port 54122 ssh2`,
    rootCause: "OpenSSH strictly enforces strict modes: if ~/.ssh is writable by group or others (modes > 700) or authorized_keys is > 600, sshd refuses public key authentication as an anti-tamper security measure.",
    solution: "1. Fixed server permissions: chmod 700 /home/iiadmin/.ssh && chmod 600 /home/iiadmin/.ssh/authorized_keys.\n2. Stripped inherited Windows permissions on client: icacls id_ed25519 /inheritance:r && icacls id_ed25519 /grant:r %username%:F.",
    verification: "Executed ssh iiadmin@192.168.4.10 - connected instantly without password prompt. Verified KVM virsh list --all commands executed cleanly.",
    lessonsLearned: "OpenSSH StrictModes protects against unauthorized key manipulation. Both server-side ~/.ssh (700) and client-side private key permissions must be strictly isolated to the user account.",
    impact: "Secured administrative hypervisor access and restored operational KVM management."
  },
  {
    id: 'case-21',
    caseNumber: 21,
    title: 'FortiGate 50E to 50G Hardware Migration & Parity Audit',
    domain: 'Hardware Migration',
    device: 'FortiGate-50E (Source) -> FortiGate-50G (Target)',
    category: 'automation',
    problem: "Legacy FortiGate 50E firewalls reaching EOL required replacement with next-gen 50G (FortiOS 7.2) without downtime, interface conflicts, or firewall policy omission.",
    symptoms: "Factory 50G firmware ships with built-in virtual-switch 'lan' binding ports lan1-lan4; direct config restore fails with syntax errors; interface names differ (wan1 -> wan).",
    investigation: "Factory 50G firmware binds all internal ports to a virtual switch. Attempting to restore custom interface assignments fails unless virtual-switch is unpinned. In addition, address objects and policies must have 100% parity.",
    commandsUsed: "powershell .\\generate_migration.ps1 -SourceConf 50E.conf -TargetConf 50G.txt\npowershell .\\check_addr_parity.ps1\npowershell .\\check_policy_parity.ps1",
    cliOutput: `================ PARITY AUDIT REPORT ================
Source Legacy Objects Count: 142
Target Generated Objects:    142
[SUCCESS] 100% Address Object Parity Verified! Zero omissions.`,
    rootCause: "Architectural divergence between FortiOS 6.2 and 7.2 interface models: factory virtual-switch lock, interface renaming syntax (wan1 to wan), and deprecated 3DES IPsec encryption suites.",
    solution: "1. Authored 11-level PowerShell automation script generate_migration.ps1 to strip virtual-switch bindings, remap interfaces, and upgrade crypto suites.\n2. Executed check_addr_parity.ps1 to verify 100% object matching before flashing hardware.",
    verification: "Staged 50G flashed with generated script. Connected to live branch network during maintenance window: all 142 address objects, 48 policies, and SD-WAN rules passed traffic with zero packet loss.",
    lessonsLearned: "Never flash legacy backup files directly onto next-generation FortiGate hardware. Always use an automated translation pipeline and verify object parity before the maintenance window.",
    impact: "100% address and policy parity verified; zero-downtime cutover completed across regional branch network."
  },
  {
    id: 'case-22',
    caseNumber: 22,
    title: 'Dual WAN SD-WAN SLA Failover & Asymmetric Routing Drop',
    domain: 'SD-WAN / Routing',
    device: 'FortiGate-1000F HA Core Hub',
    category: 'routing',
    problem: "During primary leased line failover (1G), return traffic on secondary DIA link (500M) dropped sessions intermittently. Critical SAP ERP connections hung during ISP link switchover.",
    symptoms: "diagnose debug flow trace showed 'reverse path check fail, drop' due to strict asymmetric routing checks; TCP sessions terminated during WAN transition.",
    investigation: "SD-WAN performance SLA correctly detected packet loss on WAN1 and switched outbound traffic to WAN2. However, remote peer responses returned on WAN1 before external BGP fully converged, triggering FortiOS anti-spoofing reverse-path drops.",
    commandsUsed: "diagnose debug flow filter dport 3389\ndiagnose debug flow trace start 50\ndiagnose sys sdwan health-check status\nconfig system settings\nconfig system interface",
    cliOutput: `id=20085 trace_id=4 func=fw_forward_dirty: reverse path check fail, drop
id=20085 trace_id=4 func=ip_session_drop: drop packet`,
    rootCause: "FortiOS strict reverse path forwarding (RPF) check dropped valid return packets arriving on the secondary interface before session route tables updated.",
    solution: "1. Enabled asymmetric routing tolerance: config system settings -> set asymroute enable.\n2. Configured session route preservation on WAN interfaces: set preserve-session-route enable.\n3. Calibrated SD-WAN SLA failover threshold with 5-second hold-down timer.",
    verification: "Simulated primary leased line cut by pulling WAN1 cable. Outbound and inbound TCP sessions transparently migrated to WAN2 within 800ms. Zero dropped sessions observed on live ERP client.",
    lessonsLearned: "Multi-homed dual-WAN firewalls with dynamic BGP peering require 'preserve-session-route enable' and carefully calibrated RPF settings to prevent session drops during asymmetric transition windows.",
    impact: "Sub-second transparent ISP failover achieved with zero dropped TCP connections for live business traffic."
  },
  {
    id: 'case-23',
    caseNumber: 23,
    title: 'Aegis-Core SOC Alert Rule Tuning & 92% False Positive Noise Suppression',
    domain: 'SIEM / Detection',
    device: 'Wazuh 4.14 / Aegis Core Detection Engine',
    category: 'siem',
    problem: "SOC analyst team overwhelmed by thousands of false-positive Level 8 and Level 12 alerts daily generated by internal vulnerability scanners and health probes, causing critical alert fatigue.",
    symptoms: "Over 85,000 alerts generated in 24 hours; SOC inbox flooded; FortiGate admin login rule 100050 triggered 400+ times per day for routine administrator logins.",
    investigation: "Audited /var/ossec/etc/rules/local_rules.xml. Identified 3 primary noise sources: 1) Internal vulnerability scanner IP scanning subnets, 2) Routine admin logins from IT management subnet flagged at Level 12, 3) SSL VPN user logouts flagged at Level 7.",
    commandsUsed: "tail -f /var/ossec/logs/alerts/alerts.json\n/var/ossec/bin/wazuh-logtest\nwc -l /var/ossec/logs/alerts/alerts.log",
    cliOutput: `Alert Volume: 85,420 events/day
Top Trigger: Rule 100050 (FortiGate Admin Login) - 412 hits [Level 12]
Top Trigger: Rule 100001 (Firewall Deny) - 62,100 hits [Level 8]
Analysis: 92% of events originate from benign vulnerability scanning and authorized management IPs`,
    rootCause: "Overly aggressive default rule severity levels and lack of parent/child rule hierarchies with level='0' false-positive suppression logic for authorized internal systems.",
    solution: "1. Authored level='0' child rules suppressing internal vulnerability scanner IP (192.168.4.50) and multicast routing traffic (224.0.0.0/4).\n2. De-escalated routine admin logins to Level 3, adding child rule 100050A (Level 12) for non-IT source IPs.\n3. De-escalated VPN logouts to Level 3.",
    verification: "Tested rules via wazuh-logtest. Daily alert volume dropped from 85,420 down to 6,830 (92% noise reduction). Zero critical alerts missed; true positive triage time reduced from 45m to 3m.",
    lessonsLearned: "Effective SOC detection engineering requires continuous rule tuning. High-volume benign telemetry must be suppressed via level='0' child rules to preserve analyst attention for genuine threats.",
    impact: "92% SOC false-positive alert reduction; MTTR for genuine perimeter threats reduced from 45 minutes to 3 minutes."
  },
  {
    id: 'case-24',
    caseNumber: 24,
    title: 'Windows Security Event Log Ingestion via Wazuh Agent & Targeted XPath Queries',
    domain: 'SIEM / Windows Identity',
    device: 'Windows Server 2022 Domain Controller / Wazuh Agent 4.14',
    category: 'siem',
    problem: "Wazuh SIEM dashboard not receiving Active Directory security events (Event ID 4625 failed logins, 4720 account creations, 4688 process executions). SIEM blind to Windows identity layer.",
    symptoms: "Wazuh dashboard displays 0 Windows events; agent status shows 'Active' but event count is 0; agent ossec.log reports 'Channel Security: Access Denied'.",
    investigation: "Inspected agent ossec.conf on Domain Controller. Discovered <localfile> was configured to read raw .evtx binary file path directly from C:\\Windows\\System32\\winevt\\Logs\\ instead of using the Windows Event Log API channel (<location>Security</location> with <log_format>eventchannel</log_format>).",
    commandsUsed: "Get-WinEvent -ListLog Security\nGet-Service -Name Wazuh\nTest-NetConnection -ComputerName 192.168.5.12 -Port 1514\nGet-Content 'C:\\Program Files (x86)\\ossec-agent\\ossec.log' -Tail 20",
    cliOutput: `ossec-agent: ERROR: Could not open eventchannel 'C:\\Windows\\...\\Security.evtx': Access Denied
ossec-agent: INFO: Connected to manager at 192.168.5.12:1514 (TCP 1514)`,
    rootCause: "Incorrect log ingestion syntax: agent was configured with 'syslog' format pointing to a locked binary EVTX file instead of 'eventchannel' format targeting the Windows Eventing API.",
    solution: "1. Reconfigured agent ossec.conf on Domain Controller:\n<localfile>\n  <location>Security</location>\n  <log_format>eventchannel</log_format>\n  <query>Event/System[EventID=4624 or EventID=4625 or EventID=4720 or EventID=4728 or EventID=1102]</query>\n</localfile>\n2. Restarted Wazuh service.",
    verification: "Simulated failed RDP login on DC. Within 3 seconds, Event ID 4625 indexed in Wazuh Dashboard triggering Rule 100200 (RDP Brute Force Attempt, Level 10).",
    lessonsLearned: "On modern Windows Server platforms, always use 'eventchannel' format with targeted XPath queries instead of raw file reading. XPath queries filter events locally, reducing network bandwidth to the SIEM by 75%.",
    impact: "Closed critical Windows identity telemetry gap; enabled real-time AD domain brute-force and privilege escalation detection."
  }
];
