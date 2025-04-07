// filepath: c:\Users\tj169\OneDrive - Flinders\Semester4\COMP9033 Cloud and Distributed Computing\API Test\zhipu\speech-to-text\src\components\SpeechRecognition.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { optimizeText } from './utils';
import styles from './css/SpeechRecognition.module.css';

function SpeechRecognition({ setOptimizedText }) {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const optimizationInProgressRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const isListeningRef = useRef(false); // 添加ref以在回调中访问最新的listening状态

  // 当isListening状态变化时，同步更新ref值
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // 优化逻辑包装为useCallback，避免重复创建
  const handleOptimization = useCallback((text) => {
    try {
      optimizationInProgressRef.current = true;
      
      return optimizeText(text, setOptimizedText)
        .then(result => {
          console.log('Optimization successful:', result);
          return result;
        })
        .catch(error => {
          console.error('Optimization error:', error);
          // 即使出错，也不影响继续转录
        })
        .finally(() => {
          setTimeout(() => {
            optimizationInProgressRef.current = false;
            console.log('Optimization flag reset, ready for next batch');
          }, 1000);
        });
    } catch (e) {
      console.error('Fatal error in handleOptimization:', e);
      optimizationInProgressRef.current = false;
      return Promise.resolve(); // 返回一个已解决的promise，防止链式调用出错
    }
  }, [setOptimizedText]);

  // 初始化语音识别
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Web Speech API.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // 累加本次事件的所有最终结果
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          let text = result[0].transcript.trim();
          if (!/[.!?]$/.test(text)) {
            text += '.';
          }
          finalTranscript += (finalTranscript ? ' ' : '') + text;
        } else {
          interimTranscript = result[0].transcript;
        }
      }

      console.log('Current Final:', finalTranscript);
      console.log('Interim:', interimTranscript);

      // 更新当前转录（显示最新结果）
      setCurrentTranscript(finalTranscript || interimTranscript);

      // 只有在没有正在进行优化时才累积结果
      if (finalTranscript && !optimizationInProgressRef.current) {
        accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + finalTranscript;
        setFullTranscript(accumulatedTranscriptRef.current);

        const words = accumulatedTranscriptRef.current.split(/\s+/).filter((word) => word.length > 0);
        setWordCount(words.length);

        console.log('Full Transcript:', accumulatedTranscriptRef.current);
        
        // 检查是否达到优化标准
        if (!optimizationInProgressRef.current && 
            words.length >= 50 && 
            accumulatedTranscriptRef.current.includes('.')) {
          
          // 达到优化标准时处理当前文本
          const textToOptimize = accumulatedTranscriptRef.current;
          
          // 重置累积的转录和显示的全文
          accumulatedTranscriptRef.current = '';
          setFullTranscript('');
          setWordCount(0);
          
          // 标记优化过程开始，防止重复触发
          optimizationInProgressRef.current = true;
          
          // 使用callback进行优化，无需尝试调用结果的finally，因为已在callback中处理
          handleOptimization(textToOptimize);
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // 只在非暂时性错误时停止
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognitionInstance.onend = () => {
      console.log('Recognition ended, isListening:', isListeningRef.current);
      
      // 使用ref检查当前状态，避免闭包问题
      if (isListeningRef.current) {
        // 给一个短暂延迟再重启，避免连续快速重启
        setTimeout(() => {
          try {
            recognitionInstance.start();
            console.log('Recognition restarted');
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            setIsListening(false);
          }
        }, 300);
      } else {
        // 手动停止时处理最终结果
        if (accumulatedTranscriptRef.current && !optimizationInProgressRef.current) {
          handleOptimization(accumulatedTranscriptRef.current);
        }
      }
    };

    recognitionRef.current = recognitionInstance;

    // 组件卸载时清理
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition on cleanup:', err);
        }
      }
    };
  }, [handleOptimization]); // 现在只依赖于handleOptimization，解决了ESLint警告

  // 监听isListening状态变化，控制录音
  useEffect(() => {
    if (!recognitionRef.current) return; // 确保实例已初始化
    
    if (isListening) {
      // 尝试启动录音
      try {
        recognitionRef.current.start();
        console.log('Started recognition');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        // 如果是"already started"错误，不需要重置状态
        if (err.message !== 'Failed to execute \'start\' on \'SpeechRecognition\': recognition has already started.') {
          setIsListening(false);
        }
      }
    } else {
      // 尝试停止录音
      try {
        recognitionRef.current.stop();
        console.log('Stopped recognition');
      } catch (err) {
        console.error('Failed to stop recognition:', err);
      }
    }
  }, [isListening]);

  const startRecognition = () => {
    if (!isListening) {
      console.log('Requesting to start recognition');
      setFullTranscript(''); // 重置显示的转录
      accumulatedTranscriptRef.current = ''; // 重置累积的转录
      setWordCount(0);
      optimizationInProgressRef.current = false; // 重置优化标志
      setIsListening(true); // 这会触发上面的useEffect来实际启动录音
    }
  };

  const stopRecognition = () => {
    if (isListening) {
      console.log('Requesting to stop recognition');
      setIsListening(false); // 这会触发上面的useEffect来实际停止录音
    }
  };

  return (
    <div className={styles.leftPanel}>
      <h2 className={styles.heading}>Speech Transcription</h2>
      <button
        onClick={startRecognition}
        disabled={isListening}
        className={`${styles.button} ${isListening ? styles.buttonDisabled : ''}`}
      >
        Start Recording
      </button>
      <button
        onClick={stopRecognition}
        disabled={!isListening}
        className={`${styles.button} ${!isListening ? styles.buttonDisabled : ''}`}
      >
        Stop Recording
      </button>
      <div className={styles.currentBox}>
        <h3 className={styles.heading}>Current Result</h3>
        <input
          type="text"
          value={currentTranscript}
          readOnly
          className={styles.singleLine}
          placeholder="Current transcription..."
        />
      </div>
      <div className={styles.fullBox}>
        <h3 className={styles.heading}>Full Transcript</h3>
        <textarea
          value={fullTranscript}
          readOnly
          className={styles.multiLine}
          placeholder="Full transcription here..."
        />
      </div>
      <p>
        Word Count: <span>{wordCount}</span>
      </p>
    </div>
  );
}

export default SpeechRecognition;