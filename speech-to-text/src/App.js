import React, { useState } from 'react';
import './App.css';
import SpeechRecognition from './components/SpeechRecognition';
import OptimizedText from './components/OptimizedText';
import ContentDisplay from './components/ContentDisplay';
import { BackgroundProvider } from './context/BackgroundContext';

function App() {
  const [optimizedText, setOptimizedText] = useState('');

  return (
    <BackgroundProvider>
      <div className="header">
        <h1>Be a lazy dog</h1>
        <p>I want to earn money without hard work</p>
      </div>
      
      <div className="container">
        <ContentDisplay />
        <div className="leftPanel">
          <SpeechRecognition setOptimizedText={setOptimizedText} />
        </div>
        <div className="rightPanel">
          <OptimizedText optimizedText={optimizedText} />
        </div>
      </div>
    </BackgroundProvider>
  );
}

export default App;