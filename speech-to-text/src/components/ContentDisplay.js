import React, { useEffect, useState } from 'react';
import styles from './css/ContentDisplay.module.css'; // 导入 CSS Modules

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
    localStorage.clear();
    setData([]);
    setExpandedIndex(null);
    console.log('localStorage 已清空');
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>目录</h3>
      <button className={styles.clearButton} onClick={handleClearStorage}>
        清空存储
      </button>
      {data.length === 0 ? (
        <p className={styles.noContent}>暂无内容</p>
      ) : (
        <ul className={styles.list}>
          {data.map((item, index) => (
            <li key={index} className={styles.item}>
              <div
                className={styles.mainPoint}
                onClick={() => handleToggle(index)}
              >
                {item.mainPoint || '未提供主旨'}
              </div>
              {expandedIndex === index && (
                <div className={styles.content}>
                  <p>{item.content || '未提供内容'}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentDisplay;