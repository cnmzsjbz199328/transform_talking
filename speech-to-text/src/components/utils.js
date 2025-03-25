import { callGminiApi } from './aiApi/gminiApi';
import { callGlmApi } from './aiApi/glmApi';

// 优化文本函数，支持Gmini和GLM API
export const optimizeText = (text, setOptimizedText, apiType = 'gmini') => {
  const prompt = `Please optimize the following transcribed text to make it smoother, more natural, and correct any errors:\n${text}`;
  const apiCall = apiType === 'gmini' ? callGminiApi(prompt) : callGlmApi(prompt);

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
        } else {
          throw new Error('Unexpected GLM API response structure');
        }
      } else {
        throw new Error('Unsupported API type');
      }

      setOptimizedText(optimizedText);
    })
    .catch((error) => {
      console.error(`${apiType} API call failed:`, error);
      setOptimizedText('Optimization failed, please try again later');
    });
};