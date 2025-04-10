import React, { useRef, useEffect } from 'react';
import styles from '../css/SpeechRecognition.module.css';

// 当前转录结果实时显示组件
export const CurrentTranscriptBox = ({ currentTranscript, transcriptKey }) => (
  <div className={styles.currentBox}>
    <label className={styles.boxHeading}>Current Recognition Result</label>
    <div className={styles.scrollContainer}>
      <div className={styles.realTimeTranscript}>
        {currentTranscript ? (
          <span key={transcriptKey} className={styles.liveText}>
            {currentTranscript}
          </span>
        ) : (
          <span className={styles.placeholderText}>
           
          </span>
        )}
        <span className={styles.cursor}></span>
      </div>
    </div>
  </div>
);

// 完整转录结果显示组件
export const FullTranscriptBox = ({ fullTranscript, wordCount }) => {
  // 添加引用以便自动滚动到底部
  const containerRef = useRef(null);
  
  // 当transcript更新时，滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [fullTranscript]);

  return (
    <div className={styles.fullBox}>
      <label className={styles.boxHeading}>Full Transcript</label>
      <div className={styles.fullTranscriptContainer} ref={containerRef}>
        <div className={styles.multiLine}>
          {fullTranscript || 'No full transcript available yet'}
        </div>
      </div>
      <div className={styles.wordCount}>
        Word Count: <span>{wordCount}</span>
      </div>
    </div>
  );
};