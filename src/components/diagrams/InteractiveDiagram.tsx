import React from 'react';
import { NetworkDiagram } from './NetworkDiagram';
import { SecurityDiagram } from './SecurityDiagram';
import { LinuxDiagram } from './LinuxDiagram';
import { CloudDiagram } from './CloudDiagram';
import { AutomationDiagram } from './AutomationDiagram';

interface InteractiveDiagramProps {
  domainId: string;
  selectedFirewallId?: string;
  onSelectFirewall?: (id: string) => void;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({ 
  domainId,
  selectedFirewallId,
  onSelectFirewall
}) => {
  switch (domainId) {
    case 'network':
      return (
        <NetworkDiagram 
          selectedFirewallId={selectedFirewallId} 
          onSelectFirewall={onSelectFirewall} 
        />
      );
    case 'security':
      return <SecurityDiagram />;
    case 'linux':
      return <LinuxDiagram />;
    case 'cloud':
      return <CloudDiagram />;
    case 'automation':
      return <AutomationDiagram />;
    default:
      return (
        <NetworkDiagram 
          selectedFirewallId={selectedFirewallId} 
          onSelectFirewall={onSelectFirewall} 
        />
      );
  }
};
