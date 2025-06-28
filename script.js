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
        const navItems = document.querySelectorAll('.nav-item');
        const languageSelect = document.getElementById('language');
        const runButton = document.querySelector('.btn-run');
        const collaborateButton = document.querySelector('.btn-collaborate');
        const sendButton = document.querySelector('.btn-send');

        if (!toggleConsoleButton || !runButton || !collaborateButton || !sendButton || !languageSelect) {
            console.error('Button or select element not found');
            terminal.textContent = 'Error: Button or select element not found';
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        }

        navItems.forEach(item => {
            const handleNavClick = (event) => {
                event.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                item.blur();
                terminal.textContent = `Navigated to ${item.dataset.nav}`;
                terminal.classList.add('visible');
                terminal.classList.remove('hidden');
                console.log(`Nav: ${item.dataset.nav}, active: ${item.classList.contains('active')}`);
            };
            item.addEventListener('click', handleNavClick);
            item.addEventListener('touchstart', handleNavClick);
        });

        languageSelect.addEventListener('change', () => {
            languageSelect.classList.add('active');
            languageSelect.blur();
            setTimeout(() => languageSelect.classList.remove('active'), 300);
            console.log('Select changed, active: true');
            window.changeLanguage();
        });
        languageSelect.addEventListener('touchstart', (event) => {
            event.preventDefault();
            languageSelect.classList.add('active');
            languageSelect.blur();
            setTimeout(() => languageSelect.classList.remove('active'), 300);
            console.log('Select touched, active: true');
        });

        window.changeLanguage = () => {
            const language = document.getElementById('language').value;
            monaco.editor.setModelLanguage(editor.getModel(), language);
            terminal.textContent = `Language changed to ${language}`;
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        };

        window.runCode = async () => {
            const code = editor.getValue();
            const language = document.getElementById('language').value;
            runButton.classList.add('active');
            runButton.blur();
            setTimeout(() => runButton.classList.remove('active'), 300);
            console.log('Run clicked, active: true');
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
            sendButton.classList.add('active');
            sendButton.blur();
            setTimeout(() => sendButton.classList.remove('active'), 300);
            console.log('Send clicked, active: true');
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
            collaborateButton.classList.add('active');
            collaborateButton.blur();
            setTimeout(() => collaborateButton.classList.remove('active'), 300);
            console.log('Collaborate clicked, active: true');
            terminal.textContent = 'Collaboration not available on iPad...';
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        };

        window.toggleConsole = () => {
            toggleConsoleButton.style.pointerEvents = 'auto';
            if (editorElement.classList.contains('visible')) {
                editorElement.classList.remove('visible');
                editorElement.classList.add('hidden');
                toggleConsoleButton.classList.remove('active');
                toggleConsoleButton.blur();
                setTimeout(() => {
                    if (editorElement.classList.contains('hidden')) {
                        editorElement.style.display = 'none';
                    }
                }, 700);
                terminal.classList.remove('visible');
                terminal.classList.add('hidden');
            } else {
                editorElement.style.display = 'block';
                void editorElement.offsetWidth;
                editorElement.classList.remove('hidden');
                editorElement.classList.add('visible');
                toggleConsoleButton.classList.add('active');
                toggleConsoleButton.blur();
            }
            console.log(`Console toggled, active: ${toggleConsoleButton.classList.contains('active')}`);
        };

        const addButtonListeners = (button, handler, isToggle = false) => {
            const handleEvent = (event) => {
                event.preventDefault();
                if (isToggle && button.classList.contains('active')) {
                    button.classList.remove('active');
                } else {
                    button.classList.add('active');
                }
                button.blur();
                handler();
                if (!isToggle) {
                    setTimeout(() => button.classList.remove('active'), 300);
                }
                console.log(`${button.textContent || 'Select'} ${isToggle ? 'toggled' : 'clicked'}, active: ${button.classList.contains('active')}`);
            };
            button.addEventListener('click', handleEvent);
            button.addEventListener('touchstart', handleEvent);
        };

        addButtonListeners(toggleConsoleButton, window.toggleConsole, true);
        addButtonListeners(runButton, window.runCode);
        addButtonListeners(collaborateButton, window.startCollaboration);
        addButtonListeners(sendButton, window.requestAI);

        const aiPrompt = document.getElementById('ai-prompt');
        aiPrompt.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendButton.classList.add('active');
                sendButton.blur();
                setTimeout(() => sendButton.classList.remove('active'), 300);
                console.log('Enter pressed, Send active: true');
                window.requestAI();
            }
        });
    } catch (error) {
        terminal.textContent = 'Editor error: ' + error.message;
        terminal.classList.add('visible');
        terminal.classList.remove('hidden');
    }
}, (err) => {
    terminal.textContent = 'Failed to load Monaco: ' + err.message;
    terminal.classList.add('visible');
    terminal.classList.remove('hidden');
});