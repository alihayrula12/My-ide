require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: '// JavaScript code here\nconsole.log("Hello, World!");',
    language: 'javascript',
    theme: 'vs-dark'
  });
  window.runCode = async () => {
    const code = editor.getValue();
    // Placeholder: On PC, this will send code to the-backend
    document.getElementById('output').textContent = 'Code will run on your PC...';
  };
});