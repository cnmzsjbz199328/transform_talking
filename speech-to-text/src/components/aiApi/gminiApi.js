export const callGminiApi = (text) => {
    const apiKey = 'AIzaSyCvZbX62rkQNjef4xCHh0dHu-5B-CrHRQg';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const data = {
      contents: [{
        parts: [{ text: text }]
      }]
    };
  
    return fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json());
  };