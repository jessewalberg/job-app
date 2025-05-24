import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Download, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import type { HistoryTabProps, CoverLetter } from '@/types';

const HistoryTab: React.FC<HistoryTabProps> = ({ user }) => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);

  useEffect(() => {
    loadCoverLetters();
  }, []);

  const loadCoverLetters = async (): Promise<void> => {
    try {
      setLoading(true);
      const letters = await apiService.getCoverLetters();
      setCoverLetters(letters);
    } catch (error) {
      console.error('Failed to load cover letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLetter = (letter: CoverLetter): void => {
    setSelectedLetter(letter);
  };

  const handleBackToList = (): void => {
    setSelectedLetter(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  if (selectedLetter) {
    return (
      <LetterViewer 
        letter={selectedLetter} 
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="history-tab">
      <div className="history-header">
        <h3>Cover Letter History</h3>
        <p>{coverLetters.length} letters generated</p>
      </div>

      {coverLetters.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h4>No cover letters yet</h4>
          <p>Generate your first cover letter to see it here.</p>
        </div>
      ) : (
        <div className="history-list">
          {coverLetters.map(letter => (
            <HistoryItem 
              key={letter.id}
              letter={letter}
              onView={() => handleViewLetter(letter)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface HistoryItemProps {
  letter: CoverLetter;
  onView: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ letter, onView }) => (
  <div className="history-item">
    <div className="history-content">
      <div className="history-main">
        <h4>{letter.jobTitle}</h4>
        <p className="company">{letter.company}</p>
        <div className="history-meta">
          <span className="date">
            <Calendar size={12} />
            {new Date(letter.createdAt).toLocaleDateString()}
          </span>
          <span className="credits">
            {letter.creditsUsed} credits used
          </span>
        </div>
      </div>
      <div className="history-actions">
        <button className="icon-button" onClick={onView}>
          <Eye size={16} />
        </button>
        <button className="icon-button">
          <Download size={16} />
        </button>
      </div>
    </div>
  </div>
);

interface LetterViewerProps {
  letter: CoverLetter;
  onBack: () => void;
}

const LetterViewer: React.FC<LetterViewerProps> = ({ letter, onBack }) => (
  <div className="letter-viewer">
    <div className="viewer-header">
      <button className="back-button" onClick={onBack}>
        ← Back to History
      </button>
      <div className="viewer-actions">
        <button className="secondary-button">
          <Download size={16} /> Download
        </button>
      </div>
    </div>
    
    <div className="letter-details">
      <h3>{letter.jobTitle}</h3>
      <p>{letter.company}</p>
      <small>Generated on {new Date(letter.createdAt).toLocaleDateString()}</small>
    </div>

    <div className="letter-content">
      <textarea 
        value={letter.content} 
        readOnly
        rows={15}
        className="letter-text"
      />
    </div>
  </div>
);

export default HistoryTab;