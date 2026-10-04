import React, { useEffect } from 'react';
import { X, Printer, Download, ExternalLink } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('resume-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.open('/Nilay_Chavhan_Executive_CV.html', '_blank');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="resume-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="resume-modal-header">
          <div className="resume-modal-title-wrap">
            <div className="badge-pill-primary">Curriculum Vitae</div>
            <h2 className="resume-modal-heading">Nilay Chavhan — Professional Resume</h2>
          </div>

          <div className="resume-modal-actions">
            <button type="button" className="btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={14} className="text-blue" /> Print / Save PDF
            </button>
            <a
              href={`${import.meta.env.BASE_URL}NILAY_CHAVHAN_MASTER_CV.txt`}
              download="Nilay_Chavhan_CV.txt"
              className="btn-secondary btn-sm"
            >
              <Download size={14} /> Raw Plaintext
            </a>
            <a
              href={`${import.meta.env.BASE_URL}Nilay_Chavhan_Executive_CV.html`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary btn-sm"
            >
              <ExternalLink size={14} /> Full Page
            </a>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Iframe View */}
        <div className="resume-modal-body">
          <iframe
            id="resume-iframe"
            src={`${import.meta.env.BASE_URL}Nilay_Chavhan_Executive_CV.html`}
            title="Nilay Chavhan Resume"
            className="resume-iframe"
          />
        </div>
      </div>
    </div>
  );
};
