// Backend server (to run on PC)
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve frontend files
app.post('/run', (req, res) => {
  const { code, language } = req.body;
  // TODO: Run code in Docker container
  res.json({ output: `Running ${language} code: ${code}` });
});
app.post('/ai/complete', (req, res) => {
  const { prompt, code } = req.body;
  // TODO: Call Ollama/Gemma 7B
  res.json({ completion: `AI response for prompt: ${prompt}` });
});
app.listen(3000, () => console.log('IDE running on localhost:3000'));