import React from 'react';
import styles from '../css/TranscriptDisplay.module.css';
import baseStyles from '../css/BaseStyles.module.css';
import progressStyles from '../css/ProgressSettings.module.css';

const FullTranscriptBox = ({ fullTranscript, wordCount, threshold = 200, onThresholdChange, isListening }) => {
  const transcriptRef = React.useRef(null);
  
  // 计算进度百分比
  const progressPercentage = Math.min(100, (wordCount / threshold) * 100);
  
  // 当文本更新时，自动滚动到底部
  React.useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [fullTranscript]);
  
  return (
    <div className={styles.fullTranscriptContainer}>
      <div className={styles.transcriptHeader}>
        <div className={progressStyles.headerLeft}>
          <h3 className={baseStyles.subHeading}>Full Transcript</h3>
          <select 
            className={progressStyles.inlineSelect}
            value={threshold}
            onChange={onThresholdChange}
            disabled={isListening}
            title="Auto-optimize after this many words"
          >
            <option value="50">50w</option>
            <option value="100">100w</option>
            <option value="150">150w</option>
            <option value="200">200w</option>
            <option value="250">250w</option>
          </select>
        </div>
        
        <span className={progressStyles.wordCount}>
          Words: {wordCount}/{threshold} 
          <div className={progressStyles.progressBarContainer}>
            <div 
              className={progressStyles.progressBar} 
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: progressPercentage > 90 ? '#4cc9f0' : '#4361ee'
              }}
            ></div>
          </div>
        </span>
      </div>
      <div
        ref={transcriptRef}
        className={styles.fullTranscript}
      >
        {fullTranscript || "No transcript available yet. Start speaking to see your words here."}
      </div>
    </div>
  );
};

export default FullTranscriptBox;