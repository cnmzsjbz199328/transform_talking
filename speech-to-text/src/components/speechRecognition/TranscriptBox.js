import React from 'react';
import styles from '../css/SpeechRecognition.module.css';

// 当前转录结果实时显示组件
export const CurrentTranscriptBox = ({ currentTranscript, transcriptKey }) => (
  <div className={styles.currentBox}>
    <label className={styles.boxHeading}>Current Recognition Result</label>
    <div className={styles.realTimeTranscript}>
      {currentTranscript ? (
        <span key={transcriptKey} className={styles.liveText}>
          {currentTranscript}
        </span>
      ) : (
        <span className={styles.placeholderText}>
          Waiting for speech...
        </span>
      )}
      <span className={styles.cursor}></span>
    </div>
  </div>
);

// 完整转录结果显示组件
export const FullTranscriptBox = ({ fullTranscript, wordCount }) => (
  <div className={styles.fullBox}>
    <label className={styles.boxHeading}>Full Transcript</label>
    <div className={styles.multiLine}>
      {fullTranscript || 'No full transcript available yet'}
    </div>
    <div className={styles.wordCount}>
      Word Count: <span>{wordCount}</span>
    </div>
  </div>
);