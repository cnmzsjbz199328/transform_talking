import React, { useState, useEffect, useRef } from 'react';
import { optimizeText } from './utils';
import styles from './css/SpeechRecognition.module.css';

function SpeechRecognition({ setOptimizedText }) {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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

    let accumulatedFinalTranscript = ''; // 累积所有最终结果

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

      // 累积最终结果
      if (finalTranscript) {
        accumulatedFinalTranscript += (accumulatedFinalTranscript ? ' ' : '') + finalTranscript;
        setFullTranscript(accumulatedFinalTranscript);

        const words = accumulatedFinalTranscript.split(/\s+/).filter((word) => word.length > 0);
        setWordCount(words.length);

        console.log('Full Transcript:', accumulatedFinalTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      // 录音结束时检查条件并调用 optimizeText
      const words = accumulatedFinalTranscript.split(/\s+/).filter((word) => word.length > 0);
      if (words.length >= 50 && accumulatedFinalTranscript.includes('.')) {
        optimizeText(accumulatedFinalTranscript, setOptimizedText);
      }
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setOptimizedText]);

  const startRecognition = () => {
    if (!isListening && recognitionRef.current) {
      setIsListening(true);
      setFullTranscript(''); // 重置转录
      setWordCount(0);
      recognitionRef.current.start();
    }
  };

  const stopRecognition = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
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