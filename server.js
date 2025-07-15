import express from 'express';
import pkg from 'isolated-vm';
const { VM } = pkg;
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fetch from 'node-fetch';
import multer from 'multer';
import { Ollama } from 'ollama';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Store pre-loaded context, user inputs, and input count for follow-up
const preloadedContexts = new Map();
const userInputs = new Map();
const inputCounts = new Map();

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

const upload = multer({ dest: path.join(__dirname, 'public', 'icons') });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create.html'));
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
      return res.status(500).json({ output: 'Code and language required' });
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
  const { prompt, code, filePaths = [], sessionId = Date.now().toString() } = req.body;
  try {
    if (!prompt) {
      return res.status(400).json({ completion: 'Prompt required' });
    }
    const model = 'mistral:7b';

    // Phase 1: Instant acknowledgment with positive feedback
    const initialPrompt = `Hey! Respond like an enthusiastic, supportive AI buddy! Provide 1 part on a single line: Acknowledge '${prompt}' with a warm recap, an emoji, a positive affirmation (e.g., 'You’re doing great!'), and a friendly follow-up question (e.g., 'What features excite you for this workout app?'). No numbering or extra text. Prompt: ${prompt}\nCode:\n${code || 'No code provided'}\nUploaded Files: ${filePaths.length ? filePaths.join(', ') : 'None'}`;
    
    console.log('Fetching initial response from Ollama:', { model, initialPrompt });
    const initialResponse = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: initialPrompt,
        stream: false
      })
    });

    if (!initialResponse.ok) {
      throw new Error(`Initial HTTP error! status: ${initialResponse.status}`);
    }

    const initialData = await initialResponse.json();
    let initialMessage = initialData.response || 'Fantastic idea! 💪 You’re doing great! What features excite you for this workout app?';
    console.log('Initial response data:', initialData);

    // Track input count and store user input
    inputCounts.set(sessionId, (inputCounts.get(sessionId) || 0) + 1);
    userInputs.set(sessionId, (userInputs.get(sessionId) || '') + prompt + '\n');
    preloadedContexts.set(sessionId, null); // Placeholder
    setTimeout(async () => {
      const contextPrompt = `Based on initial input '${userInputs.get(sessionId)}', create a basic guide for a workout app. Assume it could be a planner or tracker. Provide a title, then 3-4 numbered steps (1 sentence each) with general tools (e.g., '1. Design with a tool like Figma'), and bullets for features (e.g., • Workout log 📋). End with a placeholder wrap-up (e.g., 'Stay tuned for a detailed plan! 🚀') if input count is less than 2, otherwise use 'Whipping up a plan!' and a detailed guide matching the terminal example. Keep it simple or expand based on input. Prompt: ${prompt}\nCode:\n${code || 'No code provided'}\nUploaded Files: ${filePaths.length ? filePaths.join(', ') : 'None'}`;
      const contextResponse = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: contextPrompt,
          stream: false
        })
      });

      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        const inputCount = inputCounts.get(sessionId) || 0;
        if (inputCount < 2) {
          preloadedContexts.set(sessionId, contextData.response || 'Title: Initial Guide for Your Workout App 🏋️‍♂️\n1. Design with a tool like Figma 📋\n2. Choose a framework like React Native 📱\n3. Add • Workout log 📊 • Basic plans 🏋️‍♂️\nStay tuned for a detailed plan! 🚀');
        } else {
          preloadedContexts.set(sessionId, contextData.response || `Whipping up a plan!\nTitle: A Step-by-Step Guide for Building Your Workout App: Planner & Tracker 🏋️‍♂️📱\n1. Define Goals with Figma: Begin by sketching out the user experience (UX) and user interface (UI) of your workout app using Figma 📋\n2. Design Key Features: Incorporate essential features such as • Workout Log 📊 • Exercise Library 🌱 • Personalized Workout Routine Generator 🔁 • Timer & Music Integration ⏰ 📻\n3. Select App Platform: Choose the platform(s) like Android or iOS, considering cross-platform tools like React Native 📱\n4. Develop and Test: Develop the frontend and backend using Figma mockups, testing thoroughly for usability 🔧\n5. Launch and Iterate: Launch on your chosen platform(s), gather feedback, and update with new features 🎯\nLet's create this—tell me more! 🚀\n- What exercises for the library?\n- How to personalize routines?\n- Any unique features?\n- Design preference?\n- Marketing ideas?`);
        }
      }
    }, 0); // Non-blocking pre-load

    // Send initial response immediately
    res.json({ completion: [initialMessage], sessionId });

  } catch (error) {
    console.error('AI error:', error);
    res.json({ completion: [`AI error: ${error.message}`] });
  }
});

// New endpoint for follow-up with pre-loaded context
app.post('/ai/followup', async (req, res) => {
  const { prompt, code, filePaths = [], sessionId } = req.body;
  try {
    if (!sessionId || !preloadedContexts.has(sessionId) || !userInputs.has(sessionId)) {
      return res.status(400).json({ completion: 'No session or context found' });
    }

    // Aggregate all user inputs and update count
    inputCounts.set(sessionId, (inputCounts.get(sessionId) || 0) + 1);
    userInputs.set(sessionId, userInputs.get(sessionId) + prompt + '\n');
    const allInputs = userInputs.get(sessionId).trim();
    const preloadedContext = preloadedContexts.get(sessionId) || 'Title: Initial Guide for Your Workout App 🏋️‍♂️\n1. Design with a tool like Figma 📋\n2. Choose a framework like React Native 📱\n3. Add • Workout log 📊 • Basic plans 🏋️‍♂️\nStay tuned for a detailed plan! 🚀';
    const model = 'mistral:7b';
    const inputCount = inputCounts.get(sessionId) || 0;

    let followupPrompt;
    if (inputCount < 2) {
      followupPrompt = `Using the pre-analyzed context: '${preloadedContext}', acknowledge '${prompt}' with a warm recap, an emoji, a positive affirmation (e.g., 'Great idea!'), and a follow-up question (e.g., 'What else excites you?'). No numbering or extra text. Prompt: ${prompt}\nCode:\n${code || 'No code provided'}\nUploaded Files: ${filePaths.length ? filePaths.join(', ') : 'None'}`;
    } else {
      followupPrompt = `Using the pre-analyzed context: '${preloadedContext}' and all user inputs: '${allInputs}', tailor a detailed response matching the terminal example. Start with 'Whipping up a plan!' on a new line, then provide a title, 3-5 numbered steps (1-2 sentences each) with specific tools (e.g., '1. Define Goals with Figma'), bullets for features based on input, and 1-2 sentences of practical advice per step. End with a collaborative wrap-up (e.g., 'Let's create this—tell me more! 🚀') and 5 specific follow-up questions. No numbering in wrap-up. Make it engaging and responsive. Prompt: ${prompt}\nCode:\n${code || 'No code provided'}\nUploaded Files: ${filePaths.length ? filePaths.join(', ') : 'None'}`;
    }

    console.log('Fetching follow-up from Ollama:', { model, followupPrompt });
    const followupResponse = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: followupPrompt,
        stream: false
      })
    });

    if (!followupResponse.ok) {
      throw new Error(`Follow-up HTTP error! status: ${followupResponse.status}`);
    }

    const followupData = await followupResponse.json();
    let followupMessage;
    if (inputCount < 2) {
      followupMessage = followupData.response || 'Great idea! 💡 Love your input! What else excites you?';
    } else {
      followupMessage = followupData.response || `Whipping up a plan!\nTitle: A Step-by-Step Guide for Building Your Workout App: Planner & Tracker 🏋️‍♂️📱\n1. Define Goals with Figma: Begin by sketching out the user experience (UX) and user interface (UI) of your workout app using Figma to focus on fun and intuitive design 📋\n2. Design Key Features: Incorporate essential features such as • Calendar tracker for daily activity 📅 • Gameification with rewards 🎮 • Video system for tutorials 🎥 • Daily check-in system 📬, ensuring they’re beginner-friendly 🔧\n3. Select App Platform: Choose Android or iOS platforms, using React Native for cross-platform efficiency 📱\n4. Develop and Test: Build the frontend and backend with Figma mockups, testing with new users for usability 🎯\n5. Launch and Iterate: Launch on your platforms, collect feedback, and add community features to keep it engaging 🚀\nLet's create this—tell me more! 🚀\n- What rewards for gameification?\n- Which workouts for videos?\n- Target beginner needs?\n- Design style preference?\n- Promotion plans?`;
    }
    console.log('Follow-up response data:', followupData);

    // Clear pre-loaded context and inputs after sufficient input or guide delivery
    if (inputCount >= 2) {
      preloadedContexts.delete(sessionId);
      userInputs.delete(sessionId);
      inputCounts.delete(sessionId);
    }
    res.json({ completion: followupMessage.split('\n').filter(line => line.trim()) });
  } catch (error) {
    console.error('Follow-up error:', error);
    res.json({ completion: [`Follow-up error: ${error.message}`] });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
