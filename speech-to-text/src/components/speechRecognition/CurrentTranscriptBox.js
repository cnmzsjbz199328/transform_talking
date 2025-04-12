import React from 'react';
import styles from '../css/TranscriptDisplay.module.css';
import baseStyles from '../css/BaseStyles.module.css';

const CurrentTranscriptBox = ({ currentTranscript, transcriptKey }) => {
  return (
    <div className={styles.currentTranscriptContainer}>
      <h3 className={baseStyles.subHeading}>Current Speech</h3>
      <div 
        key={transcriptKey}
        className={`${styles.currentTranscript} ${currentTranscript ? styles.active : ''}`}
      >
        {currentTranscript || "Waiting for speech..."}
      </div>
    </div>
  );
};

export default CurrentTranscriptBox;