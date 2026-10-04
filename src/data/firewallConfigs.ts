// Complete FortiOS CLI Configurations and Real-Time Routing Tables for 8 Enterprise Production Sites
// Sourced from Nilay Chavhan's Knowledge Archive (03_CONFIGURATIONS)
// All scripts annotated with [CHANGEABLE PARAMETER] comments explaining exact production IPs, CIDRs, and values.

export interface FirewallConfigDetail {
  id: string;
  name: string;
  model: string;
  location: string;
  client: string;
  role: string;
  wanIp: string;
  overlayIp: string;
  remoteGw?: string;
  lanSubnet: string;
  bgpAs: number;
  bgpPeer: string;
  advpnSetting: string;
  troubleshootingNote?: string;
  routingTableOutput?: string;
  ipsecSaOutput?: string;
  diagnostics: {
    cpu: string;
    ram: string;
    sessions: string;
    tunnelState: string;
    bgpState: string;
    packetRate: string;
  };
  fullCliConfig: string;
}

export const firewallConfigs: Record<string, FirewallConfigDetail> = {
  ho_hub: {
    id: 'ho_hub',
    name: 'Head Office Core Hub',
    model: 'FortiGate 1000F HA Cluster',
    location: 'Primary Datacenter Core Hub (Region-West)',
    client: 'Enterprise Core Backbone (NDA Sanitized)',
    role: 'Central ADVPN Hub, BGP Route Reflector, Core Datacenter Gateway',
    wanIp: '198.51.100.10 (Leased Line 1G) + 203.0.113.10 (Backup 500M)',
    overlayIp: '10.254.0.1/24 (ADVPN Loopback Hub)',
    lanSubnet: '10.0.0.0/16 (Core Server Farm)',
    bgpAs: 65000,
    bgpPeer: 'BGP Route Reflector for 20 Spokes (neighbor-group)',
    advpnSetting: 'auto-discovery-sender: ENABLE',
    troubleshootingNote: 'Core Datacenter Hub running FortiOS 7.4.12. BGP route reflection active with next-hop-self disabled on spoke neighbor-group to force dynamic spoke-to-spoke shortcuts.',
    routingTableOutput: `HO_Hub # get router info routing-table all
Routing table for VRF=0
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area, * - candidate default

S*      0.0.0.0/0 [10/0] via 198.51.100.1, wan1 (Primary Fiber 1Gbps)
        0.0.0.0/0 [20/0] via 203.0.113.1, wan2 (Secondary DIA 500M)
C       10.0.0.0/16 is directly connected, internal (Core Server Farm)
C       10.254.0.1/24 is directly connected, advpn-hub
B       10.10.0.0/20 [200/0] via 10.254.0.10, advpn-hub, 42d18h (Plant North Alpha)
B       10.20.0.0/20 [200/0] via 10.254.0.20, advpn-hub, 42d18h (Plant West Beta)
B       10.30.0.0/20 [200/0] via 10.254.0.30, advpn-hub, 42d18h (Plant Central 01)
B       10.40.0.0/22 [200/0] via 10.254.0.40, advpn-hub, 42d18h (Plant West Alpha)
B       10.50.0.0/22 [200/0] via 10.254.0.50, advpn-hub, 42d18h (Plant East Alpha)
B       10.60.0.0/24 [200/0] via 10.254.0.60, advpn-hub, 42d18h (Logistics Hub West)
B       10.80.0.0/24 [200/0] via 10.254.0.80, advpn-hub, 42d18h (R&D Lab 200G)`,
    ipsecSaOutput: `HO_Hub # get vpn ipsec tunnel summary
'advpn-hub': mode=dialup, vdom=root, tun_id=1
  peer: 192.0.2.10:4500 (Plant_North_Alpha) - Phase1: UP, Phase2: UP (SA: 10.254.0.10/32 <=> 0.0.0.0/0)
  peer: 198.51.100.45:4500 (Plant_West_Beta) - Phase1: UP, Phase2: UP (SA: 10.254.0.20/32 <=> 0.0.0.0/0)
  peer: 203.0.113.88:4500 (Plant_Central_01) - Phase1: UP, Phase2: UP (SA: 10.254.0.30/32 <=> 0.0.0.0/0)
  peer: 192.0.2.40:4500 (Plant_West_Alpha) - Phase1: UP, Phase2: UP (SA: 10.254.0.40/32 <=> 0.0.0.0/0)
  peer: 192.0.2.50:4500 (Plant_East_Alpha) - Phase1: UP, Phase2: UP (SA: 10.254.0.50/32 <=> 0.0.0.0/0)
  peer: 192.0.2.60:4500 (Logistics_Hub_West) - Phase1: UP, Phase2: UP (SA: 10.254.0.60/32 <=> 0.0.0.0/0)
  peer: 192.0.2.80:4500 (RND-200G) - Phase1: UP, Phase2: UP (SA: 10.254.0.80/32 <=> 0.0.0.0/0)`,
    diagnostics: {
      cpu: '14%',
      ram: '34% (10.8 GB / 32 GB)',
      sessions: '48,290 Concurrent Sessions',
      tunnelState: 'Phase 1/2 UP • 20 Spokes Connected',
      bgpState: 'BGP AS 65000 • 20 Neighbors Established',
      packetRate: '1.42 Gbps / 480k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate Head Office Core Datacenter Hub Configuration
# Hostname: HQ_Core_Gateway | Firmware: FortiOS 7.4.12-build2902
# Verified Production Archive: 03_CONFIGURATIONS/HQ_Core_Gateway.conf
# All Public WAN IPs & Credentials Masked with RFC Documentation Blocks
# ========================================================

config system global
    # [CHANGEABLE: Hostname] Datacenter Core Firewall identifier
    set hostname "HQ_Core_Gateway"
    set alias "FG1000F-CORE-HA"
    # [CHANGEABLE: Admin Certificate] Set to your internal enterprise PKI SSL certificate
    set admin-server-cert "CorpCert2026"
    # [CHANGEABLE: HTTPS Management Port] Hardened non-standard port (e.g. 6443, 8443, 10443)
    set admin-sport 6443
    set admintimeout 50
    set auth-keepalive enable
    set av-failopen off
    set post-login-banner enable
    set pre-login-banner enable
    set sslvpn-web-mode enable
    set switch-controller enable
    set timezone "Asia/Kolkata"
end

config system interface
    edit "wan1"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Primary WAN Static IP & Netmask]
        # In production: replace 198.51.100.10/28 with your ISP-assigned primary static IP
        set ip 198.51.100.10 255.255.255.240
        set allowaccess ping https ssh
        set type physical
        set alias "WAN1_Primary_Leased_Line_1Gbps"
        set monitor-bandwidth enable
    next
    edit "wan2"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Secondary WAN Static IP]
        # In production: replace 203.0.113.10/28 with backup ISP DIA static IP
        set ip 203.0.113.10 255.255.255.240
        set allowaccess ping
        set type physical
        set alias "WAN2_Secondary_DIA_500Mbps"
        set monitor-bandwidth enable
    next
    edit "internal"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Datacenter Core Server Subnet Default Gateway]
        set ip 10.0.0.1 255.255.0.0
        set allowaccess ping https ssh fabric
        set type physical
        set description "Core_Datacenter_Server_Farm"
    next
    edit "advpn-hub"
        set vdom "root"
        # [CHANGEABLE: Central ADVPN Loopback Overlay Gateway IP]
        set ip 10.254.0.1 255.255.255.0
        set allowaccess ping
        set type tunnel
        set remote-ip 10.254.0.254 255.255.255.0
        set interface "wan1"
        set description "ADVPN_Hub_Tunnel_Overlay"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-hub"
        set type dynamic
        set interface "wan1"
        set ike-version 2
        set proposal aes256-sha256 aes128-sha256
        # [CHANGEABLE: Pre-Shared Key] 32+ character strong cryptographic enterprise secret
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        # [KEY ADVPN SETTING: Hub sends redirect triggers to spokes for dynamic shortcuts]
        set auto-discovery-sender enable
        set add-gw-route enable
        set dpd-retryinterval 10
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-hub_p2"
        set phase1name "advpn-hub"
        set proposal aes256-sha256 aes128-sha256
        set auto-negotiate enable
        # Enforce 0.0.0.0/0 wildcard selectors to allow any spoke-to-spoke subnet communication
        set src-subnet 0.0.0.0 0.0.0.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    # [CHANGEABLE: Enterprise Autonomous System Number] Private ASN 64512-65534
    set as 65000
    # [CHANGEABLE: BGP Router ID] Set to Core Hub Loopback or ADVPN overlay IP
    set router-id 10.254.0.1
    config neighbor-group
        edit "advpn-spokes"
            set remote-as 65000
            # Route Reflector allows spokes to learn each other's routes without full BGP mesh
            set route-reflector-client enable
            # MUST be disabled so next-hop remains the advertising spoke, triggering shortcut tunnel!
            set next-hop-self disable
            set soft-reconfiguration enable
            set capability-graceful-restart enable
        next
    end
    config neighbor-range
        edit 1
            # [CHANGEABLE: Spoke IPAM Overlay Subnet Range]
            set prefix 10.254.0.0 255.255.255.0
            set neighbor-group "advpn-spokes"
        next
    end
    config network
        edit 1
            # [CHANGEABLE: Core DC Subnet Advertised across WAN]
            set prefix 10.0.0.0 255.255.0.0
        next
    end
end

config firewall policy
    edit 101
        set name "ADVPN_Spoke_to_DC_Core"
        set srcintf "advpn-hub"
        set dstintf "internal"
        set srcaddr "all"
        set dstaddr "10.0.0.0/16"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
    edit 102
        set name "ADVPN_Spoke_to_Spoke_Transit"
        set srcintf "advpn-hub"
        set dstintf "advpn-hub"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end`
  },

  plant_alpha: {
    id: 'plant_alpha',
    name: 'Enterprise Manufacturing - Plant North Alpha',
    model: 'FortiGate 100F Cluster',
    location: 'North Manufacturing Core Facility',
    client: 'Global Pharma Enterprise (NDA Sanitized)',
    role: 'Large Manufacturing Spoke with ERP & Production OT Subnets',
    wanIp: '192.0.2.10',
    overlayIp: '10.254.0.10',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.10.0.0/20',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    troubleshootingNote: 'Direct dynamic shortcut established to Plant West Beta (10.20.0.0/20) and Plant Central 01 (10.30.0.0/20), offloading ERP batch replication from Core Hub.',
    routingTableOutput: `Plant_North_Alpha # get router info routing-table all
Routing table for VRF=0
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP

S*      0.0.0.0/0 [10/0] via 192.0.2.1, wan1 (Local Fiber ISP)
C       10.10.0.0/20 is directly connected, lan (Plant North Production LAN)
C       10.254.0.10/24 is directly connected, advpn-spk
B       10.0.0.0/16 [200/0] via 10.254.0.1, advpn-spk, 42d18h (DC Server Farm)
B       10.20.0.0/20 [200/0] via 10.254.0.20, advpn-spk_0, 08h24m (DYNAMIC SHORTCUT TO PLANT WEST BETA)
B       10.30.0.0/20 [200/0] via 10.254.0.30, advpn-spk_1, 04h11m (DYNAMIC SHORTCUT TO PLANT CENTRAL 01)
B       10.40.0.0/22 [200/0] via 10.254.0.1, advpn-spk, 42d18h (Plant West Alpha via Hub)`,
    ipsecSaOutput: `Plant_North_Alpha # get vpn ipsec tunnel summary
'advpn-spk': mode=dialup, vdom=root, tun_id=1
  peer: 198.51.100.10:4500 (HO) - Phase1: UP, Phase2: UP (SA established)
'advpn-spk_0': mode=dynamic_shortcut, vdom=root, tun_id=2
  peer: 198.51.100.45:4500 (Plant_West_Beta) - Phase1: UP, Phase2: UP (Direct Pharma Link)
'advpn-spk_1': mode=dynamic_shortcut, vdom=root, tun_id=3
  peer: 203.0.113.88:4500 (Plant_Central_01) - Phase1: UP, Phase2: UP (Direct Pharma Link)`,
    diagnostics: {
      cpu: '9%',
      ram: '28% (2.2 GB / 8 GB)',
      sessions: '6,420 Active Sessions',
      tunnelState: 'Phase 1/2 UP • 2 Dynamic Shortcuts Active',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED (21 Prefixes)',
      packetRate: '320 Mbps / 85k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 100F Plant North Alpha Spoke Configuration
# Hostname: Plant_North_Alpha | Firmware: FortiOS 7.4.12
# Verified Archive: 03_CONFIGURATIONS/Plant_North_Alpha.conf
# ========================================================

config system global
    # [CHANGEABLE: Spoke Hostname]
    set hostname "Plant_North_Alpha"
    set timezone "Asia/Kolkata"
    # [CHANGEABLE: HTTPS Management Port]
    set admin-sport 6443
end

config system interface
    edit "wan1"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Spoke Static Public WAN IP & Subnet Mask]
        # In production: replace 192.0.2.10/29 with local plant Leased Line IP
        set ip 192.0.2.10 255.255.255.248
        set allowaccess ping
        set type physical
        set description "Primary_Leased_Line"
    next
    edit "lan"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Local Plant LAN Default Gateway]
        # Subnet 10.10.0.0/20 provides 4,094 IP addresses for manufacturing OT & ERP
        set ip 10.10.0.1 255.255.240.0
        set allowaccess ping https ssh
        set type physical
        set description "Plant_North_LAN_and_ERP"
    next
    edit "advpn-spk"
        set vdom "root"
        # [CHANGEABLE: Spoke Overlay Tunnel IP] Unique IP in 10.254.0.0/24 subnet
        set ip 10.254.0.10 255.255.255.0
        set allowaccess ping
        set type tunnel
        # [CHANGEABLE: Hub Overlay IP] Remote endpoint points to Hub 10.254.0.1
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "wan1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "wan1"
        set ike-version 2
        # [CHANGEABLE: Remote Hub Public Gateway IP] Points to HO Wan1 IP
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        # [CHANGEABLE: Pre-Shared Key] Matches Core Hub PSK
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        # [KEY ADVPN SPOKE SETTING: Enables automatic creation of direct shortcuts to peers]
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        # [CHANGEABLE: Local Source Subnet] Plant LAN subnet
        set src-subnet 10.10.0.0 255.255.240.0
        # Wildcard destination allows dynamic traffic to any other spoke!
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    # [CHANGEABLE: Enterprise ASN]
    set as 65000
    # [CHANGEABLE: Spoke Router ID] Set to spoke overlay IP
    set router-id 10.254.0.10
    config neighbor
        # [CHANGEABLE: BGP Neighbor IP] Points to Central Hub Route Reflector
        edit "10.254.0.1"
            set remote-as 65000
            set soft-reconfiguration enable
        next
    end
    config network
        edit 1
            # [CHANGEABLE: Subnet advertised by this spoke into BGP mesh]
            set prefix 10.10.0.0 255.255.240.0
        next
    end
end`
  },

  plant_beta: {
    id: 'plant_beta',
    name: 'Chemical Synthesis Core - Plant West Beta',
    model: 'FortiGate 90G',
    location: 'West Regional Production & API Facility',
    client: 'Specialty Chemical Core (NDA Sanitized)',
    role: 'API Synthesis & Chemical Production Spoke with SCADA Controls',
    wanIp: '198.51.100.45',
    overlayIp: '10.254.0.20',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.20.0.0/20',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    troubleshootingNote: 'FortiOS 7.4.12 on FGT-90G with hardware crypto acceleration and direct dynamic shortcut to Plant North Alpha.',
    routingTableOutput: `Plant_West_Beta # get router info routing-table all
Routing table for VRF=0
Codes: K - kernel, C - connected, S - static, B - BGP

S*      0.0.0.0/0 [10/0] via 198.51.100.41, wan1
C       10.20.0.0/20 is directly connected, internal (Plant West SCADA Zone)
C       10.254.0.20/24 is directly connected, advpn-spk
B       10.0.0.0/16 [200/0] via 10.254.0.1, advpn-spk, 42d18h (DC Server Farm)
B       10.10.0.0/20 [200/0] via 10.254.0.10, advpn-spk_0, 08h24m (DYNAMIC SHORTCUT TO PLANT NORTH ALPHA)`,
    diagnostics: {
      cpu: '11%',
      ram: '31% (1.2 GB / 4 GB)',
      sessions: '4,100 Sessions',
      tunnelState: 'Phase 1/2 UP • Shortcut to Plant North Active',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED (21 Prefixes)',
      packetRate: '180 Mbps / 42k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 90G Plant West Beta Spoke Configuration
# Hostname: Plant_West_Beta | Firmware: FortiOS 7.4.12
# Verified Archive: 03_CONFIGURATIONS/Plant_West_Beta.conf
# ========================================================

config system global
    # [CHANGEABLE: Spoke Hostname]
    set hostname "Plant_West_Beta"
    set alias "Synthesis_SEZ_Core"
    # [CHANGEABLE: Admin Certificate]
    set admin-server-cert "CorpCert2026"
    # [CHANGEABLE: Admin Port]
    set admin-sport 6443
    set timezone "Asia/Kolkata"
    set virtual-switch-vlan enable
end

config system interface
    edit "wan1"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Static Public WAN IP]
        set ip 198.51.100.45 255.255.255.248
        set allowaccess ping
        set type physical
    next
    edit "internal"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Local SCADA & Chemical Synthesis LAN Subnet Gateway]
        set ip 10.20.0.1 255.255.240.0
        set allowaccess ping https ssh
        set type physical
        set description "Plant_West_SCADA_Network"
    next
    edit "advpn-spk"
        set vdom "root"
        # [CHANGEABLE: Spoke Overlay Tunnel IP]
        set ip 10.254.0.20 255.255.255.0
        set type tunnel
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "wan1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "wan1"
        set ike-version 2
        # [CHANGEABLE: Hub Gateway IP]
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        # [CHANGEABLE: Local Source Subnet]
        set src-subnet 10.20.0.0 255.255.240.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    # [CHANGEABLE: BGP ASN]
    set as 65000
    set router-id 10.254.0.20
    config neighbor
        edit "10.254.0.1"
            set remote-as 65000
        next
    end
    config network
        edit 1
            # [CHANGEABLE: Subnet advertised by this unit]
            set prefix 10.20.0.0 255.255.240.0
        next
    end
end`
  },

  plant_central_01: {
    id: 'plant_central_01',
    name: 'Precision Manufacturing - Plant Central 01',
    model: 'FortiGate 80F Cluster',
    location: 'Coastal Manufacturing Facility 01',
    client: 'Industrial Operations Group (NDA Sanitized)',
    role: 'High-Volume Production Facility with Dual WAN SD-WAN',
    wanIp: '203.0.113.88',
    overlayIp: '10.254.0.30',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.30.0.0/20',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    troubleshootingNote: 'Case 02: ADVPN shortcut validation across Plant Central to Plant East with BGP route-reflector-client inspection.',
    diagnostics: {
      cpu: '10%',
      ram: '29% (2.3 GB / 8 GB)',
      sessions: '5,180 Sessions',
      tunnelState: 'Phase 1/2 UP • Shortcut Active',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED',
      packetRate: '210 Mbps / 54k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 80F Plant Central 01 Spoke Configuration
# Hostname: Plant_Central_01 | Firmware: FortiOS 7.4.4
# Verified Archive: 03_CONFIGURATIONS/Plant_Central_01.conf
# ========================================================

config system global
    # [CHANGEABLE: Hostname]
    set hostname "Plant_Central_01"
    set timezone "Asia/Kolkata"
    set admin-sport 6443
end

config system interface
    edit "wan1"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Static Public WAN IP]
        set ip 203.0.113.88 255.255.255.248
        set allowaccess ping
    next
    edit "internal"
        set vdom "root"
        set mode static
        # [CHANGEABLE: Local Plant LAN Subnet Gateway]
        set ip 10.30.0.1 255.255.240.0
        set allowaccess ping https ssh
        set description "Plant_Central_Manufacturing_Floor"
    next
    edit "advpn-spk"
        set vdom "root"
        # [CHANGEABLE: Overlay Tunnel IP]
        set ip 10.254.0.30 255.255.255.0
        set type tunnel
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "wan1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "wan1"
        set ike-version 2
        # [CHANGEABLE: Remote Core Hub IP]
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        # [CHANGEABLE: Local Subnet]
        set src-subnet 10.30.0.0 255.255.240.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    set as 65000
    set router-id 10.254.0.30
    config neighbor
        edit "10.254.0.1"
            set remote-as 65000
        next
    end
    config network
        edit 1
            set prefix 10.30.0.0 255.255.240.0
        next
    end
end`
  },

  plant_west_alpha: {
    id: 'plant_west_alpha',
    name: 'Specialty Processing - Plant West Alpha',
    model: 'FortiGate 80F',
    location: 'Spoke Formulation Plant 02',
    client: 'Chemical & Active Formulation (NDA Sanitized)',
    role: 'Production Spoke with BGP Route Filtering',
    wanIp: '192.0.2.40',
    overlayIp: '10.254.0.40',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.40.0.0/22',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    troubleshootingNote: 'Case 01: Resolved BGP routing table CLI buffer timeout by configuring BGP prefix summarization on Plant West Alpha peer.',
    diagnostics: {
      cpu: '8%',
      ram: '24% (960 MB / 4 GB)',
      sessions: '2,890 Sessions',
      tunnelState: 'Phase 1/2 UP',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED (Prefixes: 21)',
      packetRate: '120 Mbps / 28k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 80F Plant West Alpha Spoke Configuration
# Hostname: Plant_West_Alpha | Firmware: FortiOS 7.4.4
# Verified Archive: 03_CONFIGURATIONS/Plant_West_Alpha.conf
# ========================================================

config system global
    set hostname "Plant_West_Alpha"
    set timezone "Asia/Kolkata"
end

config system interface
    edit "wan1"
        set mode static
        # [CHANGEABLE: Primary WAN Static IP]
        set ip 192.0.2.40 255.255.255.248
    next
    edit "internal"
        # [CHANGEABLE: Formulation Plant LAN Gateway]
        set ip 10.40.0.1 255.255.252.0
    next
    edit "advpn-spk"
        # [CHANGEABLE: Spoke Overlay Tunnel IP]
        set ip 10.254.0.40 255.255.255.0
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "wan1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "wan1"
        set ike-version 2
        # [CHANGEABLE: Hub Gateway IP]
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        # [CHANGEABLE: Local LAN Subnet]
        set src-subnet 10.40.0.0 255.255.252.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    set as 65000
    set router-id 10.254.0.40
    config neighbor
        edit "10.254.0.1"
            set remote-as 65000
        next
    end
    config network
        edit 1
            set prefix 10.40.0.0 255.255.252.0
        next
    end
end`
  },

  plant_east_alpha: {
    id: 'plant_east_alpha',
    name: 'Formulation Campus - Plant East Alpha',
    model: 'FortiGate 60F',
    location: 'East Regional Packaging Facility',
    client: 'Pharmaceutical Production Group (NDA Sanitized)',
    role: 'Remote Mountain Spoke with High-Latency Jitter Buffer Tuning',
    wanIp: '192.0.2.50',
    overlayIp: '10.254.0.50',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.50.0.0/22',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    diagnostics: {
      cpu: '7%',
      ram: '21% (420 MB / 2 GB)',
      sessions: '1,740 Sessions',
      tunnelState: 'Phase 1/2 UP',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED',
      packetRate: '75 Mbps / 16k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 60F Plant East Alpha Spoke Configuration
# Hostname: Plant_East_Alpha | Firmware: FortiOS 7.4.4
# Verified Archive: 03_CONFIGURATIONS/Plant_East_Alpha.conf
# ========================================================

config system global
    set hostname "Plant_East_Alpha"
    set timezone "Asia/Kolkata"
end

config system interface
    edit "wan1"
        # [CHANGEABLE: Public WAN IP]
        set ip 192.0.2.50 255.255.255.248
    next
    edit "internal"
        # [CHANGEABLE: Mountain Plant LAN Subnet]
        set ip 10.50.0.1 255.255.252.0
    next
    edit "advpn-spk"
        # [CHANGEABLE: Overlay Tunnel IP]
        set ip 10.254.0.50 255.255.255.0
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "wan1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "wan1"
        set ike-version 2
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        set src-subnet 10.50.0.0 255.255.252.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    set as 65000
    set router-id 10.254.0.50
    config neighbor
        edit "10.254.0.1"
            set remote-as 65000
        next
    end
    config network
        edit 1
            set prefix 10.50.0.0 255.255.252.0
        next
    end
end`
  },

  logistics_west: {
    id: 'logistics_west',
    name: 'Central Supply Chain Hub - Logistics West',
    model: 'FortiGate 80F',
    location: 'Central Logistics & Warehousing Hub',
    client: 'Logistics & Warehousing Core (NDA Sanitized)',
    role: 'High-Throughput Logistics Spoke with WMS Barcode Scanners',
    wanIp: '192.0.2.60',
    overlayIp: '10.254.0.60',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.60.0.0/24',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    diagnostics: {
      cpu: '9%',
      ram: '26% (1.0 GB / 4 GB)',
      sessions: '3,210 Sessions',
      tunnelState: 'Phase 1/2 UP',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED',
      packetRate: '145 Mbps / 34k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 80F Logistics West Spoke Configuration
# Hostname: Logistics_Hub_West | Firmware: FortiOS 7.4.4
# Verified Archive: 03_CONFIGURATIONS/Logistics_Hub_West.conf
# ========================================================

config system global
    set hostname "Logistics_Hub_West"
    set timezone "Asia/Kolkata"
end

config system interface
    edit "wan1"
        # [CHANGEABLE: Public WAN IP]
        set ip 192.0.2.60 255.255.255.248
    next
    edit "internal"
        # [CHANGEABLE: Warehouse Management LAN Subnet]
        set ip 10.60.0.1 255.255.255.0
        set description "Warehouse_Management_System_LAN"
    next
    edit "advpn-spk"
        # [CHANGEABLE: Overlay Tunnel IP]
        set ip 10.254.0.60 255.255.255.0
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "wan1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "wan1"
        set ike-version 2
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        set src-subnet 10.60.0.0 255.255.255.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    set as 65000
    set router-id 10.254.0.60
    config neighbor
        edit "10.254.0.1"
            set remote-as 65000
        next
    end
    config network
        edit 1
            set prefix 10.60.0.0 255.255.255.0
        next
    end
end`
  },

  rnd_lab: {
    id: 'rnd_lab',
    name: 'Advanced R&D Testing Core',
    model: 'FortiGate 200G',
    location: 'Advanced R&D Technology Center (Region-West)',
    client: 'Advanced Research & Validation Testing (NDA Sanitized)',
    role: 'Ultra-High Throughput Hardware Testing & Zero-Trust Validation',
    wanIp: '192.0.2.80',
    overlayIp: '10.254.0.80',
    remoteGw: '198.51.100.10',
    lanSubnet: '10.80.0.0/24',
    bgpAs: 65000,
    bgpPeer: '10.254.0.1 (HO Hub)',
    advpnSetting: 'auto-discovery-receiver: ENABLE',
    diagnostics: {
      cpu: '4%',
      ram: '18% (1.4 GB / 8 GB)',
      sessions: '8,400 Concurrent Sessions',
      tunnelState: 'Phase 1/2 UP • 10G SFP+ Uplink',
      bgpState: 'Neighbor 10.254.0.1 ESTABLISHED',
      packetRate: '850 Mbps / 240k pps'
    },
    fullCliConfig: `# ========================================================
# FortiGate 200G R&D High-Capacity Laboratory Configuration
# Hostname: RND-200G | Firmware: FortiOS 7.4.4
# Verified Archive: 03_CONFIGURATIONS/RND-200G_2026-09-26.conf
# ========================================================

config system global
    set hostname "RND-200G"
    set timezone "Asia/Kolkata"
end

config system interface
    edit "port1"
        set mode static
        # [CHANGEABLE: 10G SFP+ Fiber Testing Uplink IP]
        set ip 192.0.2.80 255.255.255.240
        set type physical
        set description "10G_Fiber_Testing_Uplink"
    next
    edit "port2"
        # [CHANGEABLE: Zero-Trust Microsegmentation Subnet]
        set ip 10.80.0.1 255.255.255.0
        set description "Zero_Trust_Microsegmentation_Lab"
    next
    edit "advpn-spk"
        # [CHANGEABLE: Spoke Overlay Tunnel IP]
        set ip 10.254.0.80 255.255.255.0
        set remote-ip 10.254.0.1 255.255.255.0
        set interface "port1"
    next
end

config vpn ipsec phase1-interface
    edit "advpn-spk"
        set interface "port1"
        set ike-version 2
        set remote-gw 198.51.100.10
        set proposal aes256-sha256
        set psksecret "ENC_MASKED_SHARED_SECRET_CHANGE_ME"
        set auto-discovery-receiver enable
        set network-overlay enable
        set network-id 1
    next
end

config vpn ipsec phase2-interface
    edit "advpn-spk_p2"
        set phase1name "advpn-spk"
        set proposal aes256-sha256
        set auto-negotiate enable
        set src-subnet 10.80.0.0 255.255.255.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end

config router bgp
    set as 65000
    set router-id 10.254.0.80
    config neighbor
        edit "10.254.0.1"
            set remote-as 65000
        next
    end
    config network
        edit 1
            set prefix 10.80.0.0 255.255.255.0
        next
    end
end`
  }
};
