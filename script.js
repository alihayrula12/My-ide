require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  try {
    const editor = monaco.editor.create(document.getElementById('editor'), {
      value: '// JavaScript code here\nconsole.log("Hello, World!");',
      language: 'javascript',
      theme: 'vs-dark'
    });
    window.changeLanguage = () => {
      const language = document.getElementById('language').value;
      monaco.editor.setModelLanguage(editor.getModel(), language);
    };
    window.runCode = async () => {
      const code = editor.getValue();
      const language = document.getElementById('language').value;
      try {
        const response = await fetch('/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language })
        });
        const result = await response.json();
        document.getElementById('output').textContent = result.output || 'Error running code';
      } catch (error) {
        document.getElementById('output').textContent = 'Backend not available on iPad...';
      }
    };
    window.requestAI = async () => {
      const prompt = document.getElementById('ai-prompt').value;
      const code = editor.getValue();
      try {
        const response = await fetch('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, code })
        });
        const result = await response.json();
        document.getElementById('output').textContent = result.completion || 'AI error';
      } catch (error) {
        document.getElementById('output').textContent = 'AI not available on iPad...';
      }
    };
    window.startCollaboration = () => {
      document.getElementById('output').textContent = 'Collaboration not available on iPad...';
    };
  } catch (error) {
    document.getElementById('output').textContent = 'Editor error: ' + error.message;
  }
}, (err) => {
  document.getElementById('output').textContent = 'Failed to load Monaco: ' + err.message;
});