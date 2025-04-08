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
    if (window.confirm('Are you should？')) {
      localStorage.clear();
      setData([]);
      setExpandedIndex(null);
      console.log('localStorage has been cleared');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        <i className="fas fa-history"></i> History Records
      </h2>
      
      <div className={styles.toolbar}>
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
                <i className={`fas ${expandedIndex === index ? 'fa-chevron-right' : 'fa-chevron-right'}`}></i>
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