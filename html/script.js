const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcriptDiv = document.getElementById('transcript');
const optimizedDiv = document.getElementById('optimized');
const wordCountSpan = document.getElementById('wordCount');

let recognition;
let transcript = '';

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    startBtn.addEventListener('click', () => {
        transcript = '';
        transcriptDiv.textContent = '';
        optimizedDiv.textContent = '';
        wordCountSpan.textContent = '0';
        recognition.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    stopBtn.addEventListener('click', () => {
        recognition.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = transcript;

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                let text = result[0].transcript;
                if (!/[.!?]$/.test(text)) {
                    text += '.';
                }
                finalTranscript += text;
            } else {
                interimTranscript = result[0].transcript;
            }
        }

        transcript = finalTranscript;
        transcriptDiv.textContent = transcript + interimTranscript;

        const words = transcript.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        wordCountSpan.textContent = wordCount;

        if (wordCount >= 100 && transcript.includes('.')) {
            recognition.stop();
            startBtn.disabled = false;
            stopBtn.disabled = true;
            optimizeText(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };
} else {
    alert('Your browser does not support the Web Speech API. Please use a supported browser like Chrome.');
}

function optimizeText(text) {
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

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        const optimizedText = result.choices[0].message.content;
        optimizedDiv.textContent = optimizedText;
    })
    .catch(error => {
        console.error('API call failed:', error);
        optimizedDiv.textContent = 'Optimization failed, please try again later';
    });
}