import { callGminiApi } from './aiApi/gminiApi';
import { callGlmApi } from './aiApi/glmApi';
import { saveContentToLocalStorage } from '../utils/write';

export const optimizeText = (text, setOptimizedText, apiType = 'gmini') => {
  const prompt = `Please optimize the following transcribed text to make it smoother, more natural, and correct any errors, and return the result as a valid JSON string in the format { "content": "Optimized text", "mainPoint": "Main point" } without any Markdown or extra characters:\n${text}`;
  const apiCall = apiType === 'gmini' ? callGminiApi(prompt) : callGlmApi(prompt);

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
          JSON.parse(optimizedText);
        } catch (e) {
          console.error('optimizedText is not valid JSON:', optimizedText);
          reject(new Error('API returned invalid JSON format'));
          return;
        }

        saveContentToLocalStorage(optimizedText);
        setOptimizedText(optimizedText);
        resolve(optimizedText); // Resolve the promise with the optimized text
      })
      .catch((error) => {
        console.error(`${apiType} API call failed:`, error);
        setOptimizedText('Optimization failed, please try again later');
        reject(error); // Reject the promise with the error
      });
  });
};