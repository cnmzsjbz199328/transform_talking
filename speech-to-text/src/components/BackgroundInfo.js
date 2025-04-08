import React, { useState, useEffect } from 'react';
import styles from './css/BackgroundInfo.module.css';
import { useBackgroundContext } from '../context/BackgroundContext';

function BackgroundInfo() {
  const { backgroundInfo, setBackgroundInfo, savedBackground, setSavedBackground } = useBackgroundContext();
  const [editedBackground, setEditedBackground] = useState(backgroundInfo || '');
  const [saveStatus, setSaveStatus] = useState('');
  
  // 当外部backgroundInfo变化时，更新本地编辑状态
  useEffect(() => {
    setEditedBackground(backgroundInfo || '');
  }, [backgroundInfo]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setEditedBackground(newValue);
    // 清除保存状态提示
    if (saveStatus) {
      setSaveStatus('');
    }
  };
  
  const handleSave = () => {
    // 将编辑中的背景信息保存到应用状态
    const trimmedValue = editedBackground.trim();
    
    // 强制保存，即使和之前的值相同
    window.localStorage.setItem('lastSavedBackground', trimmedValue);
    
    // 使用回调更新状态，确保使用最新值
    setBackgroundInfo(trimmedValue);
    setSavedBackground(prev => {
      console.log('Updating savedBackground from:', prev, 'to:', trimmedValue);
      return trimmedValue;
    });
    
    // 设置保存成功的提示，并在3秒后消失
    setSaveStatus('已保存');
    console.log('Background info saved:', trimmedValue);
    console.log('Previous saved background:', savedBackground);
    console.log('New saved background:', trimmedValue);
    
    // 更彻底的验证
    setTimeout(() => {
      const storedValue = window.localStorage.getItem('lastSavedBackground');
      console.log('Verification - localStorage value:', storedValue);
      console.log('Verification - context value:', savedBackground);
    }, 100);
    
    setTimeout(() => {
      setSaveStatus('');
    }, 3000);
  };

  // 清除按钮功能
  const handleClear = () => {
    setEditedBackground('');
    setBackgroundInfo('');
    setSavedBackground('');
    setSaveStatus('已清除');
    console.log('Background info cleared');
    
    setTimeout(() => {
      setSaveStatus('');
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h3 className={styles.heading}>Background Information</h3>
        {saveStatus && <span className={styles.saveStatus}>{saveStatus}</span>}
      </div>
      <p className={styles.description}>
        Add contextual information to improve transcription optimization.
        <strong> Click Save to apply changes.</strong>
      </p>
      <div className={styles.inputContainer}>
        <textarea
          value={editedBackground}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Enter background information like topic, domain, technical terms, etc."
          rows={4}
        />
        <div className={styles.buttonContainer}>
          <button 
            onClick={handleClear}
            className={styles.clearButton}
            disabled={!editedBackground && !savedBackground}
          >
            Clear
          </button>
          <button 
            onClick={handleSave}
            className={styles.saveButton}
            disabled={editedBackground.trim() === savedBackground}
          >
            Save Background Info
          </button>
        </div>
      </div>
      {savedBackground && (
        <div className={styles.savedInfo}>
          <h4 className={styles.savedHeading}>Active Background Info:</h4>
          <p className={styles.savedText}>{savedBackground}</p>
        </div>
      )}
    </div>
  );
}

export default BackgroundInfo;