import React, { useState } from 'react';
import styles from './css/OptimizedText.module.css';

function OptimizedText({ optimizedText }) {
  const [activeTab, setActiveTab] = useState('content');
  const [copySuccess, setCopySuccess] = useState(false);
  
  let parsedContent = null;
  try {
    if (optimizedText) {
      parsedContent = JSON.parse(optimizedText);
    }
  } catch (e) {
    console.error('Error parsing optimized text:', e);
  }
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        <i className="fas fa-file-alt"></i> Optimized Results
        <span className={`${styles.badge} ${styles.badgePrimary}`}>Auto Optimization</span>
      </h2>
      
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'content' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'main' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('main')}
          >
            Key Points
          </div>
        </div>
        
        {activeTab === 'content' && (
          <div className={styles.tabContent}>
            <div className={styles.contentBox}>
              {parsedContent ? parsedContent.content : ''}
              <button 
                className={styles.copyButton}
                onClick={() => parsedContent && handleCopy(parsedContent.content)}
              >
                <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'main' && (
          <div className={styles.tabContent}>
            <div className={styles.contentBox}>
              {parsedContent ? parsedContent.mainPoint : ''}
              <button 
                className={styles.copyButton}
                onClick={() => parsedContent && handleCopy(parsedContent.mainPoint)}
              >
                <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OptimizedText;