import React, { useState } from 'react';
import { optimizeText } from './utils';
import styles from './css/SpeechRecognition.module.css';

function SpeechRecognition({ setOptimizedText }) {
  const [currentTranscript, setCurrentTranscript] = useState(''); // 当前转录（单行）
  const [fullTranscript, setFullTranscript] = useState(''); // 完整转录（多行）
  const [wordCount, setWordCount] = useState(0);
  const [recognition, setRecognition] = useState(null);

  const startRecognition = () => {
    if (!recognition) {
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
        let interimTranscript = ''; // 临时结果
        let finalTranscript = ''; // 本次事件的最终结果

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            let text = result[0].transcript.trim();
            if (!/[.!?]$/.test(text)) {
              text += '.';
            }
            finalTranscript = text; // 当前最终结果
            console.log('Current Final:', finalTranscript);
          } else {
            interimTranscript = result[0].transcript;
            console.log('Interim:', interimTranscript);
          }
        }

        // 更新单行窗口：显示当前最终结果或临时结果
        setCurrentTranscript(finalTranscript ? finalTranscript : interimTranscript);

        // 累加到多行窗口
        if (finalTranscript) {
          setFullTranscript((prev) => {
            const updated = prev + (prev ? ' ' : '') + finalTranscript;
            console.log('Full Transcript:', updated);

            // 计算单词数
            const words = updated.split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);

            // 检查条件
            if (words.length >= 100 && updated.includes('.')) {
              recognitionInstance.stop();
              optimizeText(updated, setOptimizedText);
            }

            return updated;
          });
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setRecognition(null);
      };

      recognitionInstance.onend = () => {
        setRecognition(null);
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();
    }
  };

  const stopRecognition = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
  };

  return (
    <div className={styles.leftPanel}>
      <h2 className={styles.heading}>Speech Transcription</h2>
      <button
        onClick={startRecognition}
        disabled={!!recognition}
        className={`${styles.button} ${recognition ? styles.buttonDisabled : ''}`}
      >
        Start Recording
      </button>
      <button
        onClick={stopRecognition}
        disabled={!recognition}
        className={`${styles.button} ${!recognition ? styles.buttonDisabled : ''}`}
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