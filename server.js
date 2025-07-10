const express = require('express');
const { VM } = require('isolated-vm');
const cors = require('cors');
const { Ollama } = require('ollama');
const path = require('path');
const fetch = require('node-fetch');
const multer = require('multer');

const app = express();
const port = 3000;

const ollama = new Ollama({ host: 'http://localhost:11434' });

// Multer setup for file uploads
const upload = multer({ dest: path.join(__dirname, '..', 'public', 'icons') });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.post('/upload', upload.array('icons'), (req, res) => {
    try {
        const filePaths = req.files.map(file => `public/icons/${file.filename}`);
        res.json({ filePaths });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

app.post('/run', async (req, res) => {
    const { code, language } = req.body;
    try {
        if (!code || !language) {
            return res.status(400).json({ output: 'Code and language required' });
        }
        let output;
        if (language === 'javascript') {
            const isolate = new VM.Isolate({ memoryLimit: 128 });
            const context = await isolate.createContext();
            const jail = context.global;
            jail.setSync('console', {
                log: new VM.Reference((msg) => {
                    output = output ? output + '\n' + msg : msg;
                })
            });
            await context.eval(code, { timeout: 1000 });
            output = output || 'No console output';
            isolate.dispose();
        } else if (language === 'html') {
            output = 'HTML rendered in preview';
        } else {
            output = `Language ${language} not supported yet`;
        }
        res.json({ output });
    } catch (error) {
        res.status(500).json({ output: `Error: ${error.message}` });
    }
});

app.post('/ai/complete', async (req, res) => {
    const { prompt, code, filePaths = [] } = req.body;
    try {
        if (!prompt) {
            return res.status(400).json({ completion: 'Prompt required' });
        }
        const model = prompt.toLowerCase().includes('code') || code || filePaths.length > 0 ? 'codegemma:2b' : 'gemma:2b';
        const fullPrompt = `Prompt: ${prompt}\nCode:\n${code || 'No code provided'}\nUploaded Files: ${filePaths.length ? filePaths.join(', ') : 'None'}`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt: fullPrompt,
                stream: true
            })
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            if (value) {
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.response) {
                                res.write(`data: ${JSON.stringify({ completion: data.response })}\n\n`);
                            }
                        } catch (error) {
                            console.error('Parse error:', error);
                        }
                    }
                }
            }
        }
        res.end();
    } catch (error) {
        console.error('AI error:', error);
        res.write(`data: ${JSON.stringify({ completion: `AI error: ${error.message}` })}\n\n`);
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
