import React, { useState } from 'react';
import './App.css';
import SpeechRecognition from './components/SpeechRecognition';
import OptimizedText from './components/OptimizedText';
import ContentDisplay from './components/ContentDisplay';

function App() {
  const [optimizedText, setOptimizedText] = useState('');

  return (
    <div className="container">
      <ContentDisplay /> {/* 独立组件，使用自己的样式 */}
      <div className="leftPanel">
        <SpeechRecognition setOptimizedText={setOptimizedText} />
      </div>
      <div className="rightPanel">
        <OptimizedText optimizedText={optimizedText} />
      </div>
    </div>
  );
}

export default App;