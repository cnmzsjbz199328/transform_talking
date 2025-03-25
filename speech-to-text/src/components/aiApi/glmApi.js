export const callGlmApi = (text) => {
    const apiKey = '0cc1bd7dee85113504b05933dd543e4c.glXfJ24l00qHQS6u';
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const data = {
      model: 'glm-4-flash',
      messages: [
        {
          role: 'user',
          content: `Please optimize the following transcribed text to make it smoother, more natural, and correct any errors:\n${text}`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    };
  
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json());
  };