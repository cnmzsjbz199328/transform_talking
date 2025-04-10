import React, { useEffect, useState } from 'react';
import styles from './css/ContentDisplay.module.css';

const ContentDisplay = () => {
  const [data, setData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('apiResponse');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          setData(parsedData);
        } else {
          setData([parsedData]);
          console.warn('Stored data was not an array, converted to array:', parsedData);
        }
      } catch (error) {
        console.error('Error parsing JSON from localStorage:', error);
      }
    }
  }, []);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleClearStorage = () => {
    if (window.confirm('Are you sure?')) {
      localStorage.clear();
      setData([]);
      setExpandedIndex(null);
      console.log('localStorage has been cleared');
    }
  };

  // 添加导出功能
  const handleExport = () => {
    if (data.length === 0) {
      alert('No history records to export.');
      return;
    }

    // 格式化数据为可读的文本
    const formattedData = data.map((item, index) => {
      return `--- Record ${index + 1} ---\n\nMain Point: ${item.mainPoint || 'No main point'}\n\nContent: ${item.content || 'No Content'}\n\n`;
    }).join('\n');

    // 创建文件内容
    const fileContent = `History Records Export - ${new Date().toLocaleString()}\n\n${formattedData}`;
    
    // 创建blob对象
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-records-${new Date().toISOString().slice(0,10)}.txt`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Export completed');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        <i className="fas fa-history"></i> History Records
      </h2>
      
      <div className={styles.toolbar}>
        {/* 添加导出按钮 */}
        <button className={styles.exportButton} onClick={handleExport} disabled={data.length === 0}>
          <i className="fas fa-download"></i> Export Records
        </button>
        <button className={styles.clearButton} onClick={handleClearStorage}>
          <i className="fas fa-trash"></i> Clean History
        </button>
      </div>
      
      {data.length === 0 ? (
        <p className={styles.noContent}>No history records</p>
      ) : (
        <ul className={styles.list}>
          {data.map((item, index) => (
            <li key={index} className={styles.item}>
              <div
                className={`${styles.mainPoint} ${expandedIndex === index ? styles.expanded : ''}`}
                onClick={() => handleToggle(index)}
              >
                <i className={`fas ${expandedIndex === index ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                {item.mainPoint || 'No main point'}
              </div>
              {expandedIndex === index && (
                <div className={styles.content}>
                  <p>{item.content || 'No Content'}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContentDisplay;