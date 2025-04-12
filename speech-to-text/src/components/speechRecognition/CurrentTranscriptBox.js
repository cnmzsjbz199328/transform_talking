import React from 'react';
import styles from '../css/SpeechRecognition.module.css';

const CurrentTranscriptBox = ({ currentTranscript, transcriptKey }) => {
  return (
    <div className={styles.currentTranscriptContainer}>
      <h3 className={styles.subHeading}>Current Speech</h3>
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