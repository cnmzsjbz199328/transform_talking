import React, { useState } from 'react';
import RealAudioVisualizer from './components/RealAudioVisualizer';
import styles from './css/SpeechRecognition.module.css';

const SpeechRecognitionApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  const startRecording = () => {
    setIsRecording(true);
    // 这里添加你的语音识别逻辑
  };

  const stopRecording = () => {
    setIsRecording(false);
    // 这里添加你的停止识别逻辑
  };

  return (
    <div className={styles.container}>
      <h2>语音转录助手</h2>
      
      {/* 使用实时音频可视化器 */}
      <RealAudioVisualizer isRecording={isRecording} />
      
      <div className={styles.controls}>
        {!isRecording ? (
          <button 
            className={styles.startButton} 
            onClick={startRecording}
          >
            开始录音
          </button>
        ) : (
          <button 
            className={styles.stopButton} 
            onClick={stopRecording}
          >
            停止录音
          </button>
        )}
      </div>
      
      <div className={styles.transcriptionContainer}>
        <h3>识别结果</h3>
        <div className={styles.transcription}>
          {transcription || '等待录音...'}
        </div>
      </div>
    </div>
  );
};

export default SpeechRecognitionApp;

import React, { useEffect, useRef, useState } from 'react';
import styles from '../css/SpeechRecognition.module.css';

const RealAudioVisualizer = ({ isRecording }) => {
  const [audioData, setAudioData] = useState(new Uint8Array(40).fill(0));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const requestAnimationFrameId = useRef(null);

  // 初始化音频分析器
  const initAudioAnalyser = async () => {
    try {
      // 创建音频上下文
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // 配置分析器
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.7;
      
      // 请求麦克风访问权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 连接音频源到分析器
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // 开始可视化
      visualize();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // 停止音频分析
  const stopAudioAnalyser = () => {
    if (requestAnimationFrameId.current) {
      cancelAnimationFrame(requestAnimationFrameId.current);
      requestAnimationFrameId.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // 重置音频数据
    setAudioData(new Uint8Array(40).fill(0));
  };

  // 可视化函数 - 实时更新频率数据
  const visualize = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateData = () => {
      // 获取频率数据
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // 从频率数据中选择40个点用于可视化
      const step = Math.floor(bufferLength / 40);
      const visualData = new Uint8Array(40);
      
      for (let i = 0; i < 40; i++) {
        visualData[i] = dataArray[i * step];
      }
      
      setAudioData(visualData);
      requestAnimationFrameId.current = requestAnimationFrame(updateData);
    };
    
    updateData();
  };

  // 处理录制状态变化
  useEffect(() => {
    if (isRecording) {
      initAudioAnalyser();
    } else {
      stopAudioAnalyser();
    }
    
    // 组件卸载时清理
    return () => {
      stopAudioAnalyser();
    };
  }, [isRecording]);

  // 根据实际音频数据创建波形条
  const audioVisualizerBars = audioData.map((value, i) => (
    <div
      key={i}
      className={styles.audioBar}
      style={{
        height: `${value / 255 * 100}%`,
        minHeight: '4%', // 确保即使音量很低也有最小可见高度
        transition: 'height 0.05s ease' // 平滑过渡
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

export default RealAudioVisualizer;

/* SpeechRecognition.module.css */
.audioVisualizer {
  height: 60px;
  background: linear-gradient(to right, #4361ee, #3a0ca3);
  border-radius: 8px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
}

.audioVisualizer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.1) 2px,
    transparent 2px,
    transparent 5px
  );
}

.audioBars {
  display: flex;
  align-items: flex-end;
  height: 100%;
  padding: 10px;
  gap: 3px;
}

.audioBar {
  background-color: rgba(255, 255, 255, 0.7);
  width: 3px;
  height: 10%;
  border-radius: 1px;
}