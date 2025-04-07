import React from 'react';

function OptimizedText({ optimizedText }) {
  return (
    <div>
      <h2>Optimized Results</h2>
      <div id="optimized" className="optimized-box">{optimizedText}</div>
    </div>
  );
}

export default OptimizedText;