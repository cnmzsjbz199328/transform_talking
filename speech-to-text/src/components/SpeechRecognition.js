import React, { useEffect, useRef } from 'react';
import styles from './css/SpeechRecognition.module.css';
import BackgroundInfo from './BackgroundInfo';
import { useBackgroundContext } from '../context/BackgroundContext';
import AudioVisualizer from './speechRecognition/AudioVisualizer';
import RecordingControls from './speechRecognition/RecordingControls';
import { CurrentTranscriptBox, FullTranscriptBox } from './speechRecognition/TranscriptBox';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useOptimization from './hooks/useOptimization';

function SpeechRecognition({ setOptimizedText }) {
  const { savedBackground } = useBackgroundContext();
  const savedBackgroundRef = useRef(savedBackground);
  
  // 当savedBackground变化时，更新ref
  useEffect(() => {
    savedBackgroundRef.current = savedBackground;
    console.log('Background ref updated to:', savedBackground);
  }, [savedBackground]);
  
  // 初始化优化逻辑
  const { handleOptimization } = useOptimization(setOptimizedText, savedBackgroundRef);
  
  // 初始化语音识别逻辑
  const {
    currentTranscript,
    fullTranscript,
    wordCount,
    isListening,
    transcriptKey,
    startRecognition,
    stopRecognition
  } = useSpeechRecognition(handleOptimization);

  return (
    <div>
      <div className={styles.panelHeader}>
        <h2 className={styles.heading}>
          <i className="fas fa-microphone"></i> Voice Recognition
        </h2>
      </div>
      
      <BackgroundInfo />
      <AudioVisualizer isRecording={isListening} />
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
      />
    </div>
  );
}

export default SpeechRecognition;