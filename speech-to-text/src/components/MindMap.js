import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './css/MindMap.module.css';
import { generateMindMap } from '../utils/MindMapUtil';
import Modal from './Modal';

/**
 * MindMap Component
 * Displays and renders top-down tree mind maps
 */
const MindMap = ({ content, mainPoint }) => {
  const containerRef = useRef(null);
  const modalContentRef = useRef(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [currentMapSource, setCurrentMapSource] = useState('default');
  const [showModal, setShowModal] = useState(false); // 控制模态框显示状态

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

  // 转换mindmap格式为垂直树形格式(flowchart TD)
  const convertToVerticalTreeFormat = useCallback((content) => {
    // 只转换mindmap格式
    if (content.includes('mindmap')) {
      console.log("Converting from mindmap to flowchart format...");
      
      let lines = content.split('\n');
      let result = ['flowchart TD'];
      let nodeMap = {};
      let nodeCounter = 0;
      let lastNodeAtLevel = {};
      
      // 跳过mindmap行，保留非空行
      lines = lines.filter(line => line.trim() !== 'mindmap' && line.trim() !== '');
      
      // 首先识别根节点
      let rootNodeId = null;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const text = line.trim();
        
        // 优化根节点识别，确保使用mainPoint
        const rootMatch = text.match(/root\(\((.*?)\)\)/);
        if (rootMatch || (line.search(/\S/) === 2 && i === 0)) {
          const rootId = `node${nodeCounter++}`;
          // 如果找到根节点匹配，使用匹配内容；否则强制使用mainPoint
          const rootContent = rootMatch ? rootMatch[1] : mainPoint;
          
          result.push(`    ${rootId}["${rootContent}"]`);
          nodeMap[rootId] = { level: 0, text: rootContent };
          lastNodeAtLevel[0] = rootId;
          rootNodeId = rootId;
          
          // 移除已处理的根节点
          lines.splice(i, 1);
          i--;
          break;
        }
      }
      
      // 如果未找到根节点，确保使用mainPoint创建一个
      if (!rootNodeId) {
        const defaultRootId = `node${nodeCounter++}`;
        result.push(`    ${defaultRootId}["${mainPoint}"]`);
        nodeMap[defaultRootId] = { level: 0, text: mainPoint };
        lastNodeAtLevel[0] = defaultRootId;
        rootNodeId = defaultRootId;
      }
      
      // 处理剩余节点
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indent = line.search(/\S|$/);
        // 计算层级：每2个空格算一级
        const level = indent === 0 ? 1 : Math.ceil(indent / 2); 
        const text = line.trim();
        
        if (!text) continue;
        
        // 创建节点ID
        const nodeId = `node${nodeCounter++}`;
        
        // 存储当前节点
        nodeMap[nodeId] = { level, text };
        
        // 查找父节点(上一级的最后一个节点)
        let parentId = null;
        
        // 查找最近的父节点
        for (let l = level - 1; l >= 0; l--) {
          if (lastNodeAtLevel[l]) {
            parentId = lastNodeAtLevel[l];
            break;
          }
        }
        
        // 如果没有找到父节点，连接到根节点
        if (!parentId) {
          parentId = rootNodeId;
        }
        
        // 添加连接
        result.push(`    ${parentId} --> ${nodeId}["${text}"]`);
        
        // 更新当前级别的最后一个节点
        lastNodeAtLevel[level] = nodeId;
      }
      
      const flowchartCode = result.join('\n');
      console.log("Conversion complete. Result format:", 
                  flowchartCode.substring(0, 50) + "...");
      return flowchartCode;
    }
    
    // 如果既不是flowchart也不是mindmap，按原样返回
    return content;
  }, [mainPoint]);

  // 确保flowchart TD格式
  const ensureFlowchartFormat = useCallback((content) => {
    // 如果已经是flowchart格式，则按原样返回
    if (content.includes('flowchart TD')) {
      return content;
    }
    
    return convertToVerticalTreeFormat(content);
  }, [convertToVerticalTreeFormat]);

  // 使用改进的清理和状态管理渲染思维导图
  const handleRenderMindMap = useCallback((code, targetRef) => {
    if (!code) return;
    
    // 确保代码格式一致
    const formattedCode = ensureFlowchartFormat(code);
    
    // 渲染前清除先前的内容
    if (!targetRef) return;
    
    if (window.mermaid) {
      try {
        const uniqueId = `mindmap-${Date.now()}`;
        
        console.log("Rendering diagram with code:", formattedCode.substring(0, 50) + "...");
        
        // 小延迟确保DOM已清除
        setTimeout(() => {
          window.mermaid.render(uniqueId, formattedCode)
            .then(({ svg }) => {
              if (targetRef === containerRef) {
                setSvgContent(svg);
              } else if (targetRef.current) {
                targetRef.current.innerHTML = svg;
                
                // 放大模态框中的SVG
                const svgElement = targetRef.current.querySelector('svg');
                if (svgElement) {
                  svgElement.style.width = '100%';
                  svgElement.style.height = '100%';
                }
              }
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
  }, [ensureFlowchartFormat]);

  // 当内容或主要点变更时生成思维导图的主要效果
  useEffect(() => {
    // 重置错误状态
    setError(null);
    
    const generateMap = async () => {
      // 检查是否有内容可生成导图
      if (!content || !mainPoint) {
        console.log("No content or main point, using default mind map");
        if (currentMapSource !== 'default') {
          setCurrentMapSource('default');
          handleRenderMindMap(defaultMindMapContent, containerRef);
        }
        return;
      }

      try {
        setIsProcessing(true);
        console.log("Generating mind map for:", mainPoint);
        
        // 使用 MindMapUtil 生成思维导图
        let mapCode = await generateMindMap(content, mainPoint, setIsProcessing);
        console.log("Original generated code format:", 
                    mapCode.substring(0, 20) + "...");
        
        setCurrentMapSource('generated');
        handleRenderMindMap(mapCode, containerRef);
      } catch (err) {
        console.error('Failed to generate mind map:', err);
        setError('Unable to generate mind map. Please try again later.');
        
        // 显示简单的错误思维导图
        const fallbackMap = `flowchart TD
          root["${mainPoint || 'Content Overview'}"] --> err["Unable to process"]
          err --> retry["Please try again"]`;
        handleRenderMindMap(fallbackMap, containerRef);
      } finally {
        setIsProcessing(false);
      }
    };

    generateMap();
  }, [content, mainPoint, defaultMindMapContent, handleRenderMindMap, currentMapSource]);

  // 初始化 mermaid 库
  useEffect(() => {
    // 检查 mermaid 是否已全局可用
    if (!window.mermaid) {
      // 如果没有，添加脚本标签来加载它
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.mermaid) {
          console.log("Mermaid library loaded successfully");
          window.mermaid.initialize({
            startOnLoad: false, // 我们将手动处理渲染
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
      };
      
      document.body.appendChild(script);
    } else {
      // 如果已存在，只初始化
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
  }, []);

  // 控制模态框打开时阻止页面滚动
  useEffect(() => {
    if (showModal) {
      // 当模态框打开时，阻止背景页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 当模态框关闭时，恢复页面滚动
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      // 组件卸载时恢复滚动
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  // 打开模态框时，渲染放大版的思维导图
  const openModal = () => {
    setShowModal(true);
  };

  // 当模态框显示时，重新渲染思维导图到模态框中
  useEffect(() => {
    if (showModal && modalContentRef.current) {
      // 获取当前的思维导图代码
      const currentCode = svgContent 
        ? (window.mermaid && window.mermaid.mermaidAPI.getConfig().currentCode) || defaultMindMapContent
        : defaultMindMapContent;
        
      // 延迟渲染，确保模态框完全显示
      setTimeout(() => {
        handleRenderMindMap(currentCode, modalContentRef);
      }, 300);
    }
  }, [showModal, handleRenderMindMap, svgContent, defaultMindMapContent]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        <i className="fas fa-project-diagram"></i> Mind Map
      </h2>
      
      {/* 放大按钮 */}
      <button 
        className={styles.expandButton} 
        onClick={openModal}
        title="Expand Mind Map"
        aria-label="Expand Mind Map"
      >
        <i className="fas fa-expand-alt"></i>
      </button>
      
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
      
      <div 
        ref={containerRef} 
        className={styles.mindMapContent}
      >
        {svgContent ? (
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />
        ) : (
          <div className={styles.placeholder}>
            {isProcessing ? '' : 'No mind map content available'}
          </div>
        )}
      </div>

      {/* 使用独立的模态框组件 */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Mind Map"
      >
        <div 
          ref={modalContentRef}
          className={styles.modalMindMapContent}
        >
          {isProcessing ? (
            <div className={styles.processingIndicator}>
              <i className="fas fa-spinner fa-spin"></i> Generating mind map...
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default MindMap;