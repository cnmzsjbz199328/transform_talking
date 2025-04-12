import React, { useState, useEffect, useRef } from 'react';
import styles from './css/SpeechRecognition.module.css';
import { useBackgroundContext } from '../context/BackgroundContext';
import BackgroundInfo from './BackgroundInfo';
import CurrentTranscriptBox from './speechRecognition/CurrentTranscriptBox';
import FullTranscriptBox from './speechRecognition/FullTranscriptBox';
import RecordingControls from './speechRecognition/RecordingControls';// 确保导入可视化器
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useOptimization from './hooks/useOptimization';

function SpeechRecognition({ setOptimizedText }) {
  const { savedBackground } = useBackgroundContext();
  const savedBackgroundRef = useRef(savedBackground);
  const [wordThreshold, setWordThreshold] = useState(200); // 默认阈值为200
  
  // 当savedBackground变化时，更新ref
  useEffect(() => {
    savedBackgroundRef.current = savedBackground;
    console.log('Background ref updated to:', savedBackground);
  }, [savedBackground]);
  
  // 初始化优化逻辑
  const { handleOptimization } = useOptimization(setOptimizedText, savedBackgroundRef);
  
  // 初始化语音识别逻辑 - 传入wordThreshold
  const {
    currentTranscript,
    fullTranscript,
    wordCount,
    isListening,
    transcriptKey,
    startRecognition,
    stopRecognition
  } = useSpeechRecognition(handleOptimization, wordThreshold);

  // 处理阈值变更
  const handleThresholdChange = (e) => {
    setWordThreshold(parseInt(e.target.value));
  };

  return (
    <div>
      <div className={styles.panelHeader}>
        <h2 className={styles.heading}>
          <i className="fas fa-microphone"></i> Voice Recognition
        </h2>
      </div>
      
      <BackgroundInfo />
      
      <RecordingControls 
        isListening={isListening} 
        startRecognition={startRecognition} 
        stopRecognition={stopRecognition} 
      />
      
      <CurrentTranscriptBox 
        currentTranscript={currentTranscript} 
        transcriptKey={transcriptKey} 
      />
      
      <FullTranscriptBox 
        fullTranscript={fullTranscript} 
        wordCount={wordCount}
        threshold={wordThreshold}
        onThresholdChange={handleThresholdChange}
        isListening={isListening}
      />
    </div>
  );
}

export default SpeechRecognition;