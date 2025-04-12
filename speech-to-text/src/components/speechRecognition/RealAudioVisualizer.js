import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../css/SpeechRecognition.module.css';

const RealAudioVisualizer = ({ isRecording }) => {
  const [audioData, setAudioData] = useState(new Uint8Array(40).fill(10));
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const requestAnimationFrameId = useRef(null);
  const initializedRef = useRef(false);

  // 使用useCallback包装可视化函数
  const visualize = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateData = () => {
      if (!analyserRef.current) return;
      
      try {
        // 获取频率数据
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // 从频率数据中选择40个点用于可视化
        const step = Math.floor(bufferLength / 40);
        const visualData = new Uint8Array(40);
        
        let hasNonZeroValue = false;
        for (let i = 0; i < 40; i++) {
          visualData[i] = dataArray[i * step];
          if (visualData[i] > 0) hasNonZeroValue = true;
        }
        
        // 如果所有值都是0，添加一些随机值模拟有声音
        if (!hasNonZeroValue && isRecording) {
          for (let i = 0; i < 40; i++) {
            visualData[i] = Math.floor(Math.random() * 30) + 10;
          }
        }
        
        setAudioData(visualData);
      } catch (err) {
        console.error("Error updating audio data:", err);
      }
      
      requestAnimationFrameId.current = requestAnimationFrame(updateData);
    };
    
    updateData();
  }, [isRecording]);

  // 使用useCallback包装stopAudioAnalyser函数
  const stopAudioAnalyser = useCallback(() => {
    if (requestAnimationFrameId.current) {
      cancelAnimationFrame(requestAnimationFrameId.current);
      requestAnimationFrameId.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.error("Error closing audio context:", err);
      }
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    
    // 使用渐变的方式重置音频数据
    setAudioData(prev => {
      const newData = new Uint8Array(40);
      for (let i = 0; i < 40; i++) {
        // 降低到10%高度，而不是完全为0
        newData[i] = Math.max(10, Math.floor(prev[i] * 0.3));
      }
      return newData;
    });
    
    initializedRef.current = false;
  }, []);

  // 1. 先定义 simulateAudioData
  const simulateAudioData = useCallback(() => {
    if (!isRecording) return;
    
    const simulateFrame = () => {
      const simulatedData = new Uint8Array(40);
      for (let i = 0; i < 40; i++) {
        simulatedData[i] = Math.floor(Math.random() * 50) + 10;
      }
      setAudioData(simulatedData);
      
      if (isRecording) {
        requestAnimationFrameId.current = requestAnimationFrame(simulateFrame);
      }
    };
    
    simulateFrame();
  }, [isRecording]);

  // 2. 然后再定义 initAudioAnalyser
  const initAudioAnalyser = useCallback(async () => {
    if (initializedRef.current) return;
    
    try {
      // 关闭现有的音频上下文（如果有）
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      
      // 创建新的音频上下文
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // 创建分析器
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.7;
      
      // 请求麦克风访问权限
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      console.log("Microphone access granted:", stream.getTracks().length, "tracks");
      streamRef.current = stream;
      
      // 连接音频源到分析器
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // 开始可视化
      console.log("Starting visualization...");
      visualize();
      
      initializedRef.current = true;
      
      // 如果之前有权限错误，现在清除
      if (permissionError) setPermissionError(false);
      
    } catch (error) {
      console.error('Error initializing audio analyzer:', error);
      
      // 设置权限错误状态，用于显示错误消息
      if (error.name === 'NotAllowedError') {
        setPermissionError(true);
      }
      
      // 如果失败，使用模拟数据
      simulateAudioData();
    }
  }, [visualize, permissionError, simulateAudioData]);

  // 检查浏览器支持
  useEffect(() => {
    const checkSupport = async () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const getUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      
      if (!AudioContext || !getUserMedia) {
        console.warn('Browser does not support Web Audio API or getUserMedia');
        setIsSupported(false);
        return false;
      }
      
      // 检查麦克风权限
      try {
        // 只检查权限，不持久化流
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err) {
        console.error('Microphone permission denied:', err);
        setPermissionError(true);
        return false;
      }
    };
    
    checkSupport();
  }, []);

  // 主要的效果处理录制状态变化
  useEffect(() => {
    console.log("Recording state changed:", isRecording);
    
    if (isRecording && isSupported && !permissionError) {
      console.log("Initializing audio analyzer...");
      initAudioAnalyser();
    } else if (!isRecording) {
      console.log("Stopping audio analyzer...");
      stopAudioAnalyser();
    } else if (isRecording && (!isSupported || permissionError)) {
      console.log("Using simulated audio data");
      simulateAudioData();
    }
    
    // 组件卸载时清理
    return () => {
      if (requestAnimationFrameId.current) {
        cancelAnimationFrame(requestAnimationFrameId.current);
      }
      stopAudioAnalyser();
    };
  }, [isRecording, initAudioAnalyser, stopAudioAnalyser, isSupported, permissionError, simulateAudioData]);

  // 根据实际或模拟的音频数据创建波形条
  const audioVisualizerBars = audioData.map((value, i) => (
    <div
      key={i}
      className={styles.audioBar}
      style={{
        height: `${Math.max(5, value / 255 * 100)}%`, // 确保至少5%高度
        transition: 'height 0.05s ease' // 平滑过渡
      }}
    />
  ));

  return (
    <div className={`${styles.audioVisualizer} ${isRecording ? styles.recording : ''}`}>
      {permissionError && (
        <div className={styles.permissionError}>
          Microphone access denied. Please enable microphone permissions.
        </div>
      )}
      <div className={styles.audioBars}>
        {audioVisualizerBars}
      </div>
    </div>
  );
};

export default RealAudioVisualizer;