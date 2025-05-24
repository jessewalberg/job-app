import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check,
  AlertCircle,
  Upload,
  ChevronRight,
  Briefcase,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { GenerateTabProps, Resume } from '@/types';

const GenerateTab: React.FC<GenerateTabProps> = ({ user, onUserUpdate }) => {
  const [step, setStep] = useState(1);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
    checkForExtractedContent();
  }, []);

  const loadResumes = async (): Promise<void> => {
    try {
      const resumeList = await apiService.getResumes();
      setResumes(resumeList);
      if (resumeList.length > 0) {
        setSelectedResume(resumeList[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  /**
   * Check if user has recently extracted content
   */
  const checkForExtractedContent = async (): Promise<void> => {
    try {
      const result = await chrome.storage.local.get(['lastExtractedJob', 'extractionTimestamp']);
      
      if (result.lastExtractedJob && result.extractionTimestamp) {
        // Check if extraction is recent (within 10 minutes)
        const tenMinutes = 10 * 60 * 1000;
        const isRecent = (Date.now() - result.extractionTimestamp) < tenMinutes;
        
        if (isRecent) {
          setExtractedData(result.lastExtractedJob);
          setStep(2); // Skip to step 2 if we have recent data
        }
      }
    } catch (error) {
      console.error('Failed to check for extracted content:', error);
    }
  };

  /**
   * Trigger content extraction from current page
   */
  const handleExtractContent = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to extract
      const response = await chrome.tabs.sendMessage(tab.id!, {
        type: 'EXTRACT_PAGE_CONTENT'
      });

      if (response?.success) {
        // Wait a moment then check for extracted data
        setTimeout(async () => {
          await checkForExtractedContent();
        }, 2000);
      } else {
        throw new Error('Failed to extract content from page');
      }
    } catch (err: any) {
      setError('Failed to extract content. Make sure you\'re on the page you want to extract from.');
      console.error('Content extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const uploadedResume = await apiService.uploadResume(file);
      await loadResumes();
      setSelectedResume(uploadedResume);
    } catch (err: any) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (): Promise<void> => {
    if (user.credits < 3) {
      setError('Insufficient credits. Please upgrade your plan.');
      return;
    }

    if (!extractedData || !selectedResume) {
      setError('Please extract content and select a resume first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.generateCoverLetterFromContent({
        jobContent: extractedData,
        resumeId: selectedResume.id
      });

      setCoverLetter(result.content);
      onUserUpdate({ ...user, credits: result.remainingCredits });
      setStep(3);
    } catch (err: any) {
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      // Show success feedback (you could add a toast notification here)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="generate-tab">
      <div className="steps-indicator">
        {[1, 2, 3].map(stepNum => (
          <div 
            key={stepNum}
            className={`step-indicator ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}
          >
            {step > stepNum ? <Check size={12} /> : stepNum}
          </div>
        ))}
      </div>

      {step === 1 && (
        <StepCard
          title="Extract Page Content"
          description="Extract information from any webpage"
          icon={Globe}
        >
          <div className="extraction-info">
            <p>Click the ✨ button on any webpage or use the button below to extract content for your cover letter.</p>
          </div>
          <button 
            className="primary-button"
            onClick={handleExtractContent}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Extracting...
              </>
            ) : (
              'Extract Current Page'
            )}
          </button>
        </StepCard>
      )}

      {step === 2 && extractedData && (
        <StepCard
          title="Content Extracted"
          description="Review the extracted information"
          icon={Briefcase}
        >
          <ContentPreview data={extractedData} />
          <ResumeSelector
            resumes={resumes}
            selectedResume={selectedResume}
            onResumeSelect={setSelectedResume}
            onResumeUpload={handleResumeUpload}
            loading={loading}
          />
          <button 
            className="primary-button"
            onClick={handleGenerateCoverLetter}
            disabled={!selectedResume || loading}
          >
            {loading ? 'Generating...' : 'Generate Cover Letter (3 credits)'}
          </button>
        </StepCard>
      )}

      {step === 3 && coverLetter && (
        <StepCard
          title="Cover Letter Ready"
          description="Your personalized cover letter"
          icon={FileText}
        >
          <div className="cover-letter-preview">
            <textarea 
              value={coverLetter} 
              readOnly
              rows={10}
              className="cover-letter-text"
            />
          </div>
          <div className="action-buttons">
            <button 
              className="secondary-button" 
              onClick={handleCopyToClipboard}
            >
              <Copy size={16} /> Copy
            </button>
            <button className="primary-button">
              <Download size={16} /> Download PDF
            </button>
          </div>
          <button 
            className="link-button"
            onClick={() => {
              setStep(1);
              setExtractedData(null);
              setCoverLetter('');
            }}
          >
            Extract Another Page
          </button>
        </StepCard>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

interface StepCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ title, description, icon: Icon, children }) => (
  <div className="step-card">
    <div className="step-header">
      <Icon className="step-icon" />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
    <div className="step-content">
      {children}
    </div>
  </div>
);

/**
 * Component to preview extracted content
 */
interface ContentPreviewProps {
  data: any;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ data }) => (
  <div className="content-preview">
    <div className="preview-header">
      <h4>Extracted from: {data.domain}</h4>
      {data.confidence !== undefined && (
        <div className="confidence-badge">
          Confidence: {Math.round(data.confidence * 100)}%
        </div>
      )}
    </div>
    
    <div className="preview-content">
      {data.title && <div><strong>Title:</strong> {data.title}</div>}
      {data.company && <div><strong>Company:</strong> {data.company}</div>}
      {data.location && <div><strong>Location:</strong> {data.location}</div>}
      {data.pageType && <div><strong>Page Type:</strong> {data.pageType}</div>}
      {data.description && (
        <div>
          <strong>Description:</strong> 
          <p className="description-text">{data.description.substring(0, 200)}...</p>
        </div>
      )}
    </div>
  </div>
);

interface ResumeSelectorProps {
  resumes: Resume[];
  selectedResume: Resume | null;
  onResumeSelect: (resume: Resume) => void;
  onResumeUpload: (file: File) => Promise<void>;
  loading: boolean;
}

const ResumeSelector: React.FC<ResumeSelectorProps> = ({ 
  resumes, 
  selectedResume, 
  onResumeSelect, 
  onResumeUpload, 
  loading 
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      onResumeUpload(file);
    }
  };

  return (
    <div className="resume-selector">
      <div className="upload-area">
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={loading}
        />
        <label htmlFor="resume-upload" className="upload-button">
          <Upload size={16} />
          Upload New Resume
        </label>
      </div>
      
      {resumes.length > 0 && (
        <div className="resume-list">
          <h4>Select Resume:</h4>
          {resumes.map(resume => (
            <div
              key={resume.id}
              className={`resume-item ${selectedResume?.id === resume.id ? 'selected' : ''}`}
              onClick={() => onResumeSelect(resume)}
            >
              <FileText size={16} />
              <div className="resume-info">
                <span className="resume-name">{resume.filename}</span>
                <span className="resume-date">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTab;