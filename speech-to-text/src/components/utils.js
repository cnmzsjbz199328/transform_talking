import { callAI, formatResponse } from '../services/aiManagement';
import { saveContentToLocalStorage } from '../utils/write';

export const optimizeText = async (text, setOptimizedText, apiType, backgroundInfo = '') => {
  // 构建提示模板
  let promptText = `Please optimize the following transcribed text to make it smoother, more natural, and correct any errors, and return the result as a valid JSON string in the format { "content": "Optimized text", "mainPoint": "Main point" } without any Markdown or extra characters:\n${text}`;
  
  // 添加背景信息
  if (backgroundInfo?.trim()) {
    promptText = `IMPORTANT CONTEXT: ${backgroundInfo.trim()}\n\n${promptText}\n\nNOTE: Use the above context information to better understand and optimize the text.`;
  }
  
  try {
    // 调用 AI API
    const response = await callAI(promptText, apiType);
    
    // 格式化响应
    const formattedResponse = formatResponse(response, apiType);
    const optimizedText = formattedResponse.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // 验证和处理 JSON
    const parsedJson = JSON.parse(optimizedText);
    
    // 保存结果
    const resultJson = JSON.stringify(parsedJson);
    saveContentToLocalStorage(resultJson);
    setOptimizedText(resultJson);
    
    return resultJson;
  } catch (error) {
    console.error('Optimization failed:', error);
    
    // 返回格式化的错误消息
    const errorJson = JSON.stringify({
      content: "Error processing text. Please try again.",
      mainPoint: "Error occurred during optimization"
    });
    
    setOptimizedText(errorJson);
    return errorJson;
  }
};