import React, { useState } from 'react';
import { X, ExternalLink, Printer, Shield, Network, Server, Cloud, Cpu, Building2, Lock } from 'lucide-react';

import { reportsList } from '../../data/reportsData';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomainId?: string;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({
  isOpen,
  onClose,
  initialDomainId = 'network'
}) => {
  const [userSelectedDomainId, setUserSelectedDomainId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedDomainId = userSelectedDomainId ?? initialDomainId;
  const currentReport = reportsList.find(r => r.domainId === selectedDomainId) || reportsList[0];

  const reportHref = currentReport.reportUrl.startsWith('/')
    ? `${import.meta.env.BASE_URL}${currentReport.reportUrl.slice(1)}`
    : `${import.meta.env.BASE_URL}${currentReport.reportUrl}`;

  const handleClose = () => {
    setUserSelectedDomainId(null);
    onClose();
  };

  const handlePrint = () => {
    const iframe = document.getElementById('report-iframe-viewer') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.open(reportHref, '_blank');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 7, 15, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#0d1322',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1200px',
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                Engineering Whitepaper
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                {currentReport.subtitle}
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', color: '#ffffff', margin: '4px 0 0 0', fontWeight: 800 }}>
              {currentReport.name}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} color="#38bdf8" /> Print / Save PDF
            </button>

            <a
              href={reportHref}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink size={14} /> Open in New Tab
            </a>

            <button
              onClick={handleClose}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '7px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Close Report Viewer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Pillar Switcher Sub-Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 16px',
          background: '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto'
        }}>
          {reportsList.map((rep) => {
            const isSelected = selectedDomainId === rep.domainId;
            return (
              <button
                key={rep.domainId}
                onClick={() => setUserSelectedDomainId(rep.domainId)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? rep.color : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {rep.domainId === 'network' && <Network size={14} color="#38bdf8" />}
                {rep.domainId === 'security' && <Shield size={14} color="#ef4444" />}
                {rep.domainId === 'linux' && <Server size={14} color="#10b981" />}
                {rep.domainId === 'cloud' && <Cloud size={14} color="#a855f7" />}
                {rep.domainId === 'automation' && <Cpu size={14} color="#f59e0b" />}
                {rep.domainId === 'cinepolis' && <Building2 size={14} color="#ec4899" />}
                {rep.domainId === 'ikev2' && <Lock size={14} color="#06b6d4" />}
                {rep.name}
              </button>
            );
          })}
        </div>

        {/* Embedded Iframe Body */}
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#090d16' }}>
          <iframe
            id="report-iframe-viewer"
            src={reportHref}
            title={currentReport.name}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#090d16'
            }}
          />
        </div>
      </div>
    </div>
  );
};
