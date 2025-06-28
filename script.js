require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
    try {
        const editor = monaco.editor.create(document.getElementById('editor'), {
            value: '// JavaScript code here\nconsole.log("Hello, World!");',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontFamily: 'Inter',
            fontSize: 14
        });

        const chatHistory = document.querySelector('.chat-history');
        const preview = document.getElementById('preview');
        const previewPlaceholder = document.getElementById('preview-placeholder');
        const terminal = document.getElementById('terminal');
        const editorElement = document.getElementById('editor');
        const toggleConsoleButton = document.querySelector('.btn-toggle-console');

        // Ensure button is clickable
        if (!toggleConsoleButton) {
            console.error('Console button not found');
            terminal.textContent = 'Error: Console button not found';
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        }

        window.changeLanguage = () => {
            const language = document.getElementById('language').value;
            monaco.editor.setModelLanguage(editor.getModel(), language);
        };

        window.runCode = async () => {
            const code = editor.getValue();
            const language = document.getElementById('language').value;
            try {
                if (language === 'html') {
                    preview.contentDocument.open();
                    preview.contentDocument.write(code);
                    preview.contentDocument.close();
                    previewPlaceholder.classList.add('hidden');
                    terminal.textContent = 'Preview updated';
                } else {
                    const response = await fetch('/run', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, language })
                    });
                    const result = await response.json();
                    terminal.textContent = result.output || 'Error running code';
                }
                terminal.classList.add('visible');
                terminal.classList.remove('hidden');
            } catch (error) {
                terminal.textContent = 'Backend not available on iPad...';
                terminal.classList.add('visible');
                terminal.classList.remove('hidden');
            }
        };

        window.requestAI = async () => {
            const prompt = document.getElementById('ai-prompt').value;
            const code = editor.getValue();
            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.textContent = prompt;
            chatHistory.appendChild(userMessage);
            try {
                const response = await fetch('/ai/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, code })
                });
                const result = await response.json();
                const aiMessage = document.createElement('div');
                aiMessage.className = 'message ai-message';
                aiMessage.textContent = result.completion || 'AI error';
                chatHistory.appendChild(aiMessage);
                terminal.textContent = 'AI response added to chat';
            } catch (error) {
                const aiMessage = document.createElement('div');
                aiMessage.className = 'message ai-message';
                aiMessage.textContent = 'AI not available on iPad...';
                chatHistory.appendChild(aiMessage);
                terminal.textContent = 'AI not available on iPad...';
            }
            chatHistory.scrollTop = chatHistory.scrollHeight;
            document.getElementById('ai-prompt').value = '';
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        };

        window.startCollaboration = () => {
            terminal.textContent = 'Collaboration not available on iPad...';
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        };

        window.toggleConsole = () => {
            // Ensure button remains clickable
            toggleConsoleButton.style.pointerEvents = 'auto';
            
            if (editorElement.classList.contains('visible')) {
                // Hide editor: slide down
                editorElement.classList.remove('visible');
                editorElement.classList.add('hidden');
                // Delay display:none to allow slide-down animation to complete
                setTimeout(() => {
                    if (editorElement.classList.contains('hidden')) {
                        editorElement.style.display = 'none';
                    }
                }, 700); // Match animation duration
                terminal.classList.remove('visible');
                terminal.classList.add('hidden');
            } else {
                // Show editor: slide up
                editorElement.style.display = 'block';
                // Force reflow to ensure animation restarts
                void editorElement.offsetWidth;
                editorElement.classList.remove('hidden');
                editorElement.classList.add('visible');
            }
        };

        // Add click event listener for Console button
        toggleConsoleButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.toggleConsole();
        });

        // Add Enter key listener for AI prompt
        const aiPrompt = document.getElementById('ai-prompt');
        aiPrompt.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                window.requestAI();
            }
        });
    } catch (error) {
        const terminal = document.getElementById('terminal');
        terminal.textContent = 'Editor error: ' + error.message;
        terminal.classList.add('visible');
        terminal.classList.remove('hidden');
    }
}, (err) => {
    const terminal = document.getElementById('terminal');
    terminal.textContent = 'Failed to load Monaco: ' + err.message;
    terminal.classList.add('visible');
    terminal.classList.remove('hidden');
});