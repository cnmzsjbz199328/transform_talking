import React, { useState } from 'react';
import './App.css';
import SpeechRecognition from './components/SpeechRecognition';
import OptimizedText from './components/OptimizedText';

function App() {
  const [optimizedText, setOptimizedText] = useState('');

  return (
    <div className="container">
      <div className="left-panel">
        <SpeechRecognition setOptimizedText={setOptimizedText} />
      </div>
      <div className="right-panel">
        <OptimizedText optimizedText={optimizedText} />
      </div>
    </div>
  );
}

export default App;