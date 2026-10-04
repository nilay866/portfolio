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
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="resume-modal-window" style={{ maxWidth: '1200px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="resume-modal-header">
          <div className="resume-modal-title-wrap" style={{ maxWidth: 'calc(100% - 130px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge-pill-primary">
                Engineering Whitepaper
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {currentReport.subtitle}
              </span>
            </div>
            <h2 className="resume-modal-heading" style={{ marginTop: '2px', wordBreak: 'break-word' }}>
              {currentReport.name}
            </h2>
          </div>

          <div className="resume-modal-actions">
            <button
              onClick={handlePrint}
              type="button"
              className="btn-secondary btn-sm"
              title="Print or save report as PDF"
            >
              <Printer size={14} className="text-blue" />
              <span className="btn-text-responsive">Print / PDF</span>
            </button>

            <a
              href={reportHref}
              target="_blank"
              rel="noreferrer"
              className="btn-primary btn-sm"
              title="Open full report in a new tab"
            >
              <ExternalLink size={14} />
              <span className="btn-text-responsive">Open Tab</span>
            </a>

            <button
              onClick={handleClose}
              type="button"
              className="modal-close-btn"
              title="Close Report Viewer"
            >
              <X size={18} />
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
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
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
                  whiteSpace: 'nowrap',
                  flexShrink: 0
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
        <div className="resume-modal-body">
          <iframe
            id="report-iframe-viewer"
            src={reportHref}
            title={currentReport.name}
            className="resume-iframe"
          />
        </div>
      </div>
    </div>
  );
};
