import React from 'react';
import styles from '../css/SpeechRecognition.module.css';

const AudioVisualizer = ({ isRecording }) => {
  // 生成40个音频条
  const audioVisualizerBars = Array(40).fill().map((_, i) => (
    <div 
      key={i}
      className={styles.audioBar} 
      style={{
        height: `${Math.floor(Math.random() * 30) + 10}%`,
        animationDelay: `${i % 2 === 0 ? i * 0.05 : i * 0.03}s`
      }}
    />
  ));

  return (
    <div className={`${styles.audioVisualizer} ${isRecording ? styles.recording : ''}`}>
      <div className={styles.audioBars}>
        {audioVisualizerBars}
      </div>
    </div>
  );
};

export default AudioVisualizer;