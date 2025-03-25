import React from 'react';

function OptimizedText({ optimizedText }) {
  return (
    <div>
      <h2>优化结果</h2>
      <div id="optimized" className="optimized-box">{optimizedText}</div>
    </div>
  );
}

export default OptimizedText;