import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './css/MindMap.module.css';
import { generateMindMap } from './MindMapUtil';

/**
 * MindMap Component
 * Displays and renders top-down tree mind maps
 */
const MindMap = ({ content, mainPoint }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [currentMapSource, setCurrentMapSource] = useState('default'); // Track the source of current map

  // Default mind map data (only used when no content is available)
  const defaultMindMapContent = `flowchart TD
    root["Mind Map"] --> basicFunc["Basic Functions"]
    root --> structure["Structure & Layout"]
    root --> visual["Visual Effects"]
    basicFunc --> createNode["Node Creation"]
    basicFunc --> editNode["Node Editing"]
    structure --> hLayout["Horizontal Layout"]
    structure --> vLayout["Vertical Layout"]
    visual --> themes["Theme Colors"]
    visual --> shapes["Node Shapes"]`;

  // Convert mindmap format to vertical tree format (flowchart TD)
  const convertToVerticalTreeFormat = useCallback((content) => {
    // Only convert if it's in mindmap format
    if (content.includes('mindmap')) {
      console.log("Converting from mindmap to flowchart format...");
      
      let lines = content.split('\n');
      let result = ['flowchart TD'];
      let nodeMap = {};
      let nodeCounter = 0;
      let lastNodeAtLevel = {};
      
      // Skip mindmap line, keep non-empty lines
      lines = lines.filter(line => line.trim() !== 'mindmap' && line.trim() !== '');
      
      // First identify the root node
      let rootNodeId = null;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const text = line.trim();
        
        // Look for root node pattern: root((content)) or line with minimal indentation
        const rootMatch = text.match(/root\(\((.*?)\)\)/);
        if (rootMatch || (line.search(/\S/) === 2 && i === 0)) {
          const rootId = `node${nodeCounter++}`;
          const rootContent = rootMatch ? rootMatch[1] : text;
          
          result.push(`    ${rootId}["${rootContent}"]`);
          nodeMap[rootId] = { level: 0, text: rootContent };
          lastNodeAtLevel[0] = rootId;
          rootNodeId = rootId;
          
          // Remove processed root node
          lines.splice(i, 1);
          i--;
          break;
        }
      }
      
      // Ensure we have a root node
      if (!rootNodeId) {
        const defaultRootId = `node${nodeCounter++}`;
        // Use mainPoint as the root node text if available
        const defaultRootText = mainPoint || "Main Topic";
        result.push(`    ${defaultRootId}["${defaultRootText}"]`);
        nodeMap[defaultRootId] = { level: 0, text: defaultRootText };
        lastNodeAtLevel[0] = defaultRootId;
        rootNodeId = defaultRootId;
      }
      
      // Process remaining nodes
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indent = line.search(/\S|$/);
        // Calculate level: every 2 spaces is one level
        const level = indent === 0 ? 1 : Math.ceil(indent / 2); 
        const text = line.trim();
        
        if (!text) continue;
        
        // Create node ID
        const nodeId = `node${nodeCounter++}`;
        
        // Store current node
        nodeMap[nodeId] = { level, text };
        
        // Find parent node (last node at previous level)
        let parentId = null;
        
        // Look for nearest parent node
        for (let l = level - 1; l >= 0; l--) {
          if (lastNodeAtLevel[l]) {
            parentId = lastNodeAtLevel[l];
            break;
          }
        }
        
        // If no parent found, connect to root node
        if (!parentId) {
          parentId = rootNodeId;
        }
        
        // Add connection
        result.push(`    ${parentId} --> ${nodeId}["${text}"]`);
        
        // Update last node at current level
        lastNodeAtLevel[level] = nodeId;
      }
      
      const flowchartCode = result.join('\n');
      console.log("Conversion complete. Result format:", 
                  flowchartCode.substring(0, 50) + "...");
      return flowchartCode;
    }
    
    // If neither flowchart nor mindmap, return as is
    return content;
  }, [mainPoint]); // correctly includes mainPoint as dependency

  // Ensure flowchart TD format
  const ensureFlowchartFormat = useCallback((content) => {
    // If already in flowchart format, return as is
    if (content.includes('flowchart TD')) {
      return content;
    }
    
    return convertToVerticalTreeFormat(content);
  }, [convertToVerticalTreeFormat]); // Fix #1: Add convertToVerticalTreeFormat as dependency

  // Render mind map with improved cleanup and state management
  const handleRenderMindMap = useCallback((code) => {
    if (!code) return;
    
    // Ensure code format is consistent
    const formattedCode = ensureFlowchartFormat(code);
    
    // Clear previous content before rendering
    setSvgContent('');
    
    if (window.mermaid) {
      try {
        const uniqueId = `mindmap-${Date.now()}`;
        
        console.log("Rendering diagram with code:", formattedCode.substring(0, 50) + "...");
        
        // Small delay to ensure DOM is cleared
        setTimeout(() => {
          window.mermaid.render(uniqueId, formattedCode)
            .then(({ svg }) => {
              setSvgContent(svg);
            })
            .catch(err => {
              console.error('Mind map rendering error:', err);
              setError('Failed to render mind map');
            });
        }, 10);
      } catch (err) {
        console.error('Mind map rendering error:', err);
        setError('Failed to render mind map');
      }
    }
  }, [ensureFlowchartFormat]); // Fix #2: Add ensureFlowchartFormat as dependency

  // Main effect for generating mind map when content or mainPoint changes
  useEffect(() => {
    // Reset error state on new content
    setError(null);
    
    const generateMap = async () => {
      // Check if we have content to generate a map
      if (!content || !mainPoint) {
        console.log("No content or main point, using default mind map");
        if (currentMapSource !== 'default') {
          setCurrentMapSource('default');
          handleRenderMindMap(defaultMindMapContent);
        }
        return;
      }

      try {
        setIsProcessing(true);
        console.log("Generating mind map for:", mainPoint);
        
        // Use MindMapUtil to generate mind map
        let mapCode = await generateMindMap(content, mainPoint, setIsProcessing);
        console.log("Original generated code format:", 
                    mapCode.substring(0, 20) + "...");
        
        setCurrentMapSource('generated');
        handleRenderMindMap(mapCode);
      } catch (err) {
        console.error('Failed to generate mind map:', err);
        setError('Unable to generate mind map. Please try again later.');
        
        // Show simple error mind map
        const fallbackMap = `flowchart TD
          root["${mainPoint || 'Content Overview'}"] --> err["Unable to process"]
          err --> retry["Please try again"]`;
        handleRenderMindMap(fallbackMap);
      } finally {
        setIsProcessing(false);
      }
    };

    generateMap();
  }, [content, mainPoint, defaultMindMapContent, handleRenderMindMap, currentMapSource]);

  // Initialize mermaid library
  useEffect(() => {
    // Check if mermaid is already available globally
    if (!window.mermaid) {
      // If not, add script tag to load it
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.mermaid) {
          console.log("Mermaid library loaded successfully");
          window.mermaid.initialize({
            startOnLoad: false, // We'll handle rendering manually
            theme: 'default',
            flowchart: {
              curve: 'basis',
              nodeSpacing: 50,
              rankSpacing: 70,
              useMaxWidth: true,
              htmlLabels: true
            },
            securityLevel: 'loose'
          });
          
          // Let the main useEffect handle rendering
          // This prevents duplicate renders
        }
      };
      
      document.body.appendChild(script);
    } else {
      // If already exists, just initialize
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: {
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 70,
          useMaxWidth: true,
          htmlLabels: true
        },
        securityLevel: 'loose'
      });
    }
  }, []); // Only run once on mount

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        <i className="fas fa-project-diagram"></i> Mind Map
      </h2>
      
      {isProcessing && (
        <div className={styles.processingIndicator}>
          <i className="fas fa-spinner fa-spin"></i> Generating mind map...
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}
      
      {/* Use clean container approach - only render SVG when content is available */}
      <div 
        ref={containerRef} 
        className={styles.mindMapContent}
        style={{ minHeight: '300px', width: '100%' }}
      >
        {svgContent ? (
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />
        ) : (
          <div className={styles.placeholder}>
            {isProcessing ? '' : 'No mind map content available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMap;