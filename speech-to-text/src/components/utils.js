import { callGminiApi } from './aiApi/gminiApi';
import { callGlmApi } from './aiApi/glmApi';
import { saveContentToLocalStorage } from '../utils/write';

export const optimizeText = (text, setOptimizedText, apiType = 'gmini', backgroundInfo = '') => {
  // 基本提示模板
  let promptText = `Please optimize the following transcribed text to make it smoother, more natural, and correct any errors, and return the result as a valid JSON string in the format { "content": "Optimized text", "mainPoint": "Main point" } without any Markdown or extra characters:\n${text}`;
  
  // 尝试从localStorage获取最新的背景信息
  let currentBackground = backgroundInfo;
  try {
    const storedBackground = window.localStorage.getItem('lastSavedBackground');
    if (storedBackground && (!backgroundInfo || backgroundInfo !== storedBackground)) {
      console.log('Using background from localStorage instead of parameter');
      currentBackground = storedBackground;
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }
  
  // 如果有背景信息，将其添加到prompt中，使用更明确的格式
  if (currentBackground && currentBackground.trim()) {
    console.log('Adding background info to prompt (FULL):', currentBackground);
    promptText = `IMPORTANT CONTEXT: ${currentBackground.trim()}\n\n${promptText}\n\nNOTE: Use the above context information to better understand and optimize the text.`;
  } else {
    console.log('No background info added to prompt');
  }
  
  console.log('Final prompt structure:', promptText.length > 100 ? 
    promptText.substring(0, 100) + '... [truncated, full length: ' + promptText.length + ']' : 
    promptText);
  
  const apiCall = apiType === 'gmini' ? callGminiApi(promptText) : callGlmApi(promptText);

  // Return the promise so we can chain .then() and .finally()
  return new Promise((resolve, reject) => {
    apiCall
      .then((result) => {
        console.log(`${apiType} API response:`, result);
        let optimizedText = '';

        if (apiType === 'gmini') {
          if (
            result &&
            result.candidates &&
            result.candidates[0] &&
            result.candidates[0].content &&
            result.candidates[0].content.parts &&
            result.candidates[0].content.parts[0]
          ) {
            optimizedText = result.candidates[0].content.parts[0].text;
            // 移除可能的 Markdown 标记
            optimizedText = optimizedText
              .replace(/```json/g, '') // 移除 ```json
              .replace(/```/g, '')     // 移除 ```
              .trim();                 // 移除首尾空白
          } else {
            throw new Error('Unexpected Gmini API response structure');
          }
        } else if (apiType === 'glm') {
          if (
            result &&
            result.choices &&
            result.choices[0] &&
            result.choices[0].message &&
            result.choices[0].message.content
          ) {
            optimizedText = result.choices[0].message.content;
            // 同样移除可能的 Markdown 标记
            optimizedText = optimizedText
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
          } else {
            throw new Error('Unexpected GLM API response structure');
          }
        } else {
          throw new Error('Unsupported API type');
        }

        // 验证 optimizedText 是否为有效 JSON
        try {
          // 首先尝试直接解析
          let parsedJson;
          try {
            parsedJson = JSON.parse(optimizedText);
            console.log('Successfully parsed single JSON:', parsedJson);
          } catch (e) {
            // 如果直接解析失败，尝试处理多个JSON对象
            console.log('Initial JSON parse failed, attempting to extract multiple JSON objects');
            
            // 查找所有可能的JSON对象 (使用正则表达式匹配 {...} 格式)
            const jsonPattern = /\{[\s\S]*?\}/g;
            const jsonMatches = optimizedText.match(jsonPattern);
            
            if (jsonMatches && jsonMatches.length > 0) {
              console.log(`Found ${jsonMatches.length} potential JSON objects`);
              
              // 获取第一个有效的JSON对象
              let primaryContent = '';
              let primaryMainPoint = '';
              let secondaryTexts = [];
              
              // 尝试解析每个匹配的JSON
              for (let i = 0; i < jsonMatches.length; i++) {
                try {
                  const json = JSON.parse(jsonMatches[i]);
                  console.log(`Successfully parsed JSON object ${i + 1}:`, json);
                  
                  // 第一个JSON对象作为主要内容
                  if (i === 0) {
                    primaryContent = json.content || '';
                    primaryMainPoint = json.mainPoint || '';
                  } else {
                    // 其他JSON对象的内容添加到备注中
                    if (json.content) {
                      secondaryTexts.push(json.content);
                    }
                  }
                } catch (jsonErr) {
                  console.error(`Failed to parse JSON object ${i + 1}:`, jsonErr);
                }
              }
              
              // 创建一个新的JSON对象，只保留content和mainPoint字段
              let combinedContent = primaryContent;
              
              // 如果有其他翻译，将它们添加到主要内容中，但用分隔符隔开
              if (secondaryTexts.length > 0) {
                combinedContent += '\n\n--- 其他语言版本 ---\n\n' + secondaryTexts.join('\n\n');
              }
              
              parsedJson = {
                content: combinedContent,
                mainPoint: primaryMainPoint
              };
              
              // 将合并后的JSON转换回字符串形式
              optimizedText = JSON.stringify(parsedJson);
              console.log('Created simplified JSON from multiple objects:', parsedJson);
            } else {
              throw new Error('No valid JSON objects found in the response');
            }
          }
          
          saveContentToLocalStorage(optimizedText);
          setOptimizedText(optimizedText);
          resolve(optimizedText);
        } catch (e) {
          console.error('Failed to process JSON:', e);
          console.error('Raw text that failed processing:', optimizedText);
          
          // 创建一个带有错误信息的JSON
          const errorJson = JSON.stringify({
            content: "Error processing response. Please try again.",
            mainPoint: "Error in text optimization"
          });
          
          setOptimizedText(errorJson);
          saveContentToLocalStorage(errorJson);
          resolve(errorJson);
        }
      })
      .catch((error) => {
        console.error(`${apiType} API call failed:`, error);
        setOptimizedText('Optimization failed, please try again later');
        reject(error); // Reject the promise with the error
      });
  });
};