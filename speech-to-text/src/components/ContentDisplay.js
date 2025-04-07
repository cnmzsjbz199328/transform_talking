import React, { useEffect, useState } from 'react';
import styles from './css/ContentDisplay.module.css'; // Import CSS Modules

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
    console.log('localStorage has been cleared');
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Directory</h3>
      <button className={styles.clearButton} onClick={handleClearStorage}>
        Clear Storage
      </button>
      {data.length === 0 ? (
        <p className={styles.noContent}>No content available</p>
      ) : (
        <ul className={styles.list}>
          {data.map((item, index) => (
            <li key={index} className={styles.item}>
              <div
                className={styles.mainPoint}
                onClick={() => handleToggle(index)}
              >
                {item.mainPoint || 'Main point not provided'}
              </div>
              {expandedIndex === index && (
                <div className={styles.content}>
                  <p>{item.content || 'Content not provided'}</p>
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