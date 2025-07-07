document.addEventListener('DOMContentLoaded', () => {
    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' } });
    require(['vs/editor/editor.main'], () => {
        try {
            // Editor setup (only if editor element exists)
            let editor = null;
            const editorElement = document.getElementById('editor');
            if (editorElement) {
                editor = monaco.editor.create(editorElement, {
                    value: '// JavaScript code here\nconsole.log("Hello, World!");',
                    language: 'javascript',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    fontFamily: 'Inter',
                    fontSize: 14
                });
            }

            const chatHistory = document.querySelector('.chat-history');
            const preview = document.getElementById('preview');
            const previewPlaceholder = document.getElementById('preview-placeholder');
            const terminal = document.getElementById('terminal');
            const toggleConsoleButton = document.querySelector('.btn-toggle-console');
            const buttonBar = document.querySelector('.button-bar');
            const navItems = document.querySelectorAll('.nav-item');
            const languageSelect = document.getElementById('language');
            const runButton = document.querySelector('.btn-run');
            const collaborateButton = document.querySelector('.btn-collaborate');
            const sendButton = document.querySelector('.btn-send');
            const themeCheckbox = document.querySelector('.theme-checkbox');
            const projectGrid = document.getElementById('projectGrid');
            const signInForm = document.getElementById('signInForm');
            const createAccountForm = document.getElementById('createAccountForm');
            const createAccountLink = document.getElementById('createAccountLink');
            const backToSignInLink = document.getElementById('backToSignInLink');
            const importProjectsButton = document.getElementById('importProjectsButton');

            const logToTerminal = (message) => {
                if (toggleConsoleButton && toggleConsoleButton.classList.contains('active')) {
                    if (terminal) {
                        terminal.textContent = message;
                        terminal.classList.add('visible');
                        terminal.classList.remove('hidden');
                    }
                }
                console.log(message);
            };

            console.log('script.js loaded');
            console.log('Terminal element:', terminal);
            console.log('Buttons:', document.querySelectorAll('.btn').length);

            if (terminal && !toggleConsoleButton && !buttonBar && !runButton && !collaborateButton && !sendButton && !languageSelect && !themeCheckbox) {
                console.error('Button, button-bar, or select element not found');
                if (terminal) {
                    terminal.textContent = 'Error: Button, button-bar, or select element not found';
                    terminal.classList.add('visible');
                    terminal.classList.remove('hidden');
                }
                return;
            }

            // Populate project grid with temporary placeholder data
            const populateProjects = () => {
                if (!projectGrid) {
                    console.error('projectGrid element not found');
                    return;
                }
                const sampleProjects = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta']; // 4 placeholder projects
                projectGrid.innerHTML = '';
                sampleProjects.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'project-card';
                    card.textContent = project;
                    card.addEventListener('click', () => {
                        card.classList.toggle('active');
                        logToTerminal(`Selected: ${project}`);
                    });
                    projectGrid.appendChild(card);
                });
                // TODO: Fetch actual projects from backend API based on logged-in user
            };

            if (projectGrid) {
                populateProjects();
            }

            // Handle Import Projects button
            if (importProjectsButton) {
                importProjectsButton.addEventListener('click', () => {
                    logToTerminal('Import Projects clicked (not implemented yet)');
                });
            }

            // Debug initial state for Profile forms
            console.log('Initial state - signInForm visible:', signInForm ? !signInForm.classList.contains('hidden') : 'Not found');
            console.log('Initial state - createAccountForm hidden:', createAccountForm ? createAccountForm.classList.contains('hidden') : 'Not found');

            // Ensure only Sign In form is visible on load
            if (signInForm && createAccountForm) {
                createAccountForm.classList.add('hidden');
                createAccountForm.style.display = 'none'; // Fallback
                console.log('Forced createAccountForm to hidden on load');
            }

            // Toggle between Sign In and Create Account forms with fade animation
            if (createAccountLink && backToSignInLink && signInForm && createAccountForm) {
                createAccountLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    console.log('Create Account link clicked');
                    // Reset classes to ensure animation plays
                    signInForm.classList.remove('fade-in');
                    createAccountForm.classList.remove('fade-in', 'fade-out');
                    signInForm.classList.add('fade-out');
                    setTimeout(() => {
                        signInForm.classList.add('hidden');
                        signInForm.style.display = 'none';
                        createAccountForm.classList.remove('hidden');
                        createAccountForm.style.display = 'block';
                        setTimeout(() => {
                            createAccountForm.classList.add('fade-in');
                            console.log('Switched to Create Account form with fade-in');
                        }, 10); // Slight delay to trigger transition
                    }, 300); // Match fade-out duration
                });

                backToSignInLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    console.log('Back to Sign In link clicked');
                    // Reset classes to ensure animation plays
                    createAccountForm.classList.remove('fade-in');
                    signInForm.classList.remove('fade-in', 'fade-out');
                    createAccountForm.classList.add('fade-out');
                    setTimeout(() => {
                        createAccountForm.classList.add('hidden');
                        createAccountForm.style.display = 'none';
                        signInForm.classList.remove('hidden');
                        signInForm.style.display = 'block';
                        setTimeout(() => {
                            signInForm.classList.add('fade-in');
                            console.log('Switched back to Sign In form with fade-in');
                        }, 10); // Slight delay to trigger transition
                    }, 300); // Match fade-out duration
                });
            } else {
                console.error('One or more form elements not found:', {
                    createAccountLink, backToSignInLink, signInForm, createAccountForm
                });
            }

            // Initialize navigation
            navItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    event.preventDefault();
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    item.blur();
                    logToTerminal(`Navigating to ${item.dataset.nav}`);
                    setTimeout(() => {
                        const pages = {
                            'profile': 'profile.html',
                            'create': 'create.html',
                            'projects': 'projects.html',
                            'settings': 'settings.html' // Assuming a settings page exists or will be added
                        };
                        if (pages[item.dataset.nav]) {
                            window.location.href = pages[item.dataset.nav];
                        }
                    }, 300);
                });
                item.addEventListener('touchstart', (event) => {
                    event.preventDefault();
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    item.blur();
                    logToTerminal(`Navigating to ${item.dataset.nav}`);
                    setTimeout(() => {
                        const pages = {
                            'profile': 'profile.html',
                            'create': 'create.html',
                            'projects': 'projects.html',
                            'settings': 'settings.html'
                        };
                        if (pages[item.dataset.nav]) {
                            window.location.href = pages[item.dataset.nav];
                        }
                    }, 300);
                });
            });

            if (languageSelect) {
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
            }

            window.changeLanguage = () => {
                if (editor && languageSelect) {
                    const language = languageSelect.value;
                    monaco.editor.setModelLanguage(editor.getModel(), language);
                    logToTerminal(`Language changed to ${language}`);
                }
            };

            window.runCode = async () => {
                if (editor && runButton && preview && previewPlaceholder) {
                    const code = editor.getValue();
                    const language = languageSelect.value;
                    runButton.classList.add('active', 'loading');
                    runButton.disabled = true;
                    runButton.blur();
                    try {
                        if (language === 'html') {
                            preview.contentDocument.open();
                            preview.contentDocument.write(code);
                            preview.contentDocument.close();
                            previewPlaceholder.classList.add('hidden');
                            logToTerminal('Preview updated');
                        } else {
                            const response = await fetch('/run', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code, language })
                            });
                            const result = await response.json();
                            logToTerminal(result.output || 'Error running code');
                        }
                    } catch (error) {
                        logToTerminal('Backend not available on iPad...');
                    } finally {
                        runButton.classList.remove('active', 'loading');
                        runButton.disabled = false;
                    }
                }
            };

            window.requestAI = async () => {
                if (chatHistory && sendButton) {
                    const prompt = document.getElementById('ai-prompt').value;
                    const code = editor ? editor.getValue() : '';
                    const userMessage = document.createElement('div');
                    userMessage.className = 'message user-message';
                    userMessage.textContent = prompt;
                    chatHistory.appendChild(userMessage);

                    const existingIndicator = chatHistory.querySelector('.typing-indicator');
                    if (existingIndicator) existingIndicator.remove();

                    const typingIndicator = document.createElement('div');
                    typingIndicator.className = 'typing-indicator';
                    typingIndicator.innerHTML = '<span></span><span></span><span></span> <span>replicat’s thinking</span>';
                    chatHistory.appendChild(typingIndicator);
                    chatHistory.scrollTop = chatHistory.scrollHeight;

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

                        typingIndicator.remove();
                        const aiMessage = document.createElement('div');
                        aiMessage.className = 'message ai-message';
                        chatHistory.appendChild(aiMessage);

                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        let done = false;
                        let fullResponse = '';

                        while (!done) {
                            const { value, done: streamDone } = await reader.read();
                            done = streamDone;
                            if (value) {
                                const chunk = decoder.decode(value);
                                const lines = chunk.split('\n\n');
                                for (const line of lines) {
                                    if (line.startsWith('data: ')) {
                                        const data = JSON.parse(line.slice(6));
                                        if (data.completion) {
                                            aiMessage.textContent += data.completion;
                                            fullResponse += data.completion;
                                            chatHistory.scrollTop = chatHistory.scrollHeight;
                                        }
                                    }
                                }
                            }
                        }

                        if (fullResponse.includes('```')) {
                            const copyButton = document.createElement('button');
                            copyButton.className = 'btn btn-copy-code';
                            copyButton.textContent = 'Copy to Editor';
                            copyButton.onclick = () => {
                                if (editor) {
                                    const codeMatch = fullResponse.match(/```[\s\S]*?```/g)?.[0]?.replace(/```/g, '') || '';
                                    editor.setValue(codeMatch);
                                    logToTerminal('Code copied to editor');
                                }
                            };
                            aiMessage.appendChild(copyButton);
                        }
                        logToTerminal('AI response added to chat');
                    } catch (error) {
                        typingIndicator.remove();
                        const aiMessage = document.createElement('div');
                        aiMessage.className = 'message ai-message';
                        aiMessage.textContent = 'AI not available on iPad...';
                        chatHistory.appendChild(aiMessage);
                        logToTerminal('AI not available on iPad...');
                    }
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                    if (document.getElementById('ai-prompt')) document.getElementById('ai-prompt').value = '';
                }
            };

            window.startCollaboration = () => {
                if (collaborateButton) {
                    collaborateButton.classList.add('active');
                    collaborateButton.blur();
                    setTimeout(() => collaborateButton.classList.remove('active'), 300);
                    console.log('Collaborate clicked, active: true');
                    logToTerminal('Collaboration not available on iPad...');
                }
            };

            window.toggleConsole = () => {
                if (toggleConsoleButton && editorElement) {
                    toggleConsoleButton.style.pointerEvents = 'auto';
                    if (editorElement.classList.contains('visible')) {
                        editorElement.classList.remove('visible');
                        editorElement.classList.add('hidden');
                        if (preview) preview.classList.remove('hidden');
                        if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
                        if (terminal) {
                            terminal.classList.remove('visible');
                            terminal.classList.add('hidden');
                            terminal.style.display = 'none';
                        }
                        toggleConsoleButton.classList.remove('active');
                        toggleConsoleButton.blur();
                        if (buttonBar) buttonBar.classList.add('hidden');
                        setTimeout(() => {
                            if (editorElement.classList.contains('hidden')) {
                                editorElement.style.display = 'none';
                                if (buttonBar) buttonBar.style.display = 'none';
                                if (editor) editor.layout();
                            }
                        }, 800);
                    } else {
                        editorElement.style.display = 'block';
                        if (buttonBar) buttonBar.style.display = 'flex';
                        void editorElement.offsetWidth;
                        if (buttonBar) void buttonBar.offsetWidth;
                        editorElement.classList.remove('hidden');
                        editorElement.classList.add('visible');
                        if (preview) preview.classList.add('hidden');
                        if (previewPlaceholder) previewPlaceholder.classList.add('hidden');
                        if (buttonBar) buttonBar.classList.remove('hidden');
                        toggleConsoleButton.classList.add('active');
                        toggleConsoleButton.blur();
                        setTimeout(() => {
                            if (terminal) {
                                terminal.style.display = 'block';
                                terminal.classList.remove('hidden');
                                terminal.classList.add('visible');
                            }
                            if (editor) editor.layout();
                        }, 300);
                    }
                    console.log(`Console toggled, active: ${toggleConsoleButton.classList.contains('active')}`);
                }
            };

            if (themeCheckbox) {
                themeCheckbox.addEventListener('change', () => {
                    const isLight = themeCheckbox.checked;
                    document.body.classList.toggle('light', isLight);
                    themeCheckbox.setAttribute('data-theme', isLight ? 'light' : 'dark');
                    if (editor) editor.setTheme(isLight ? 'vs' : 'vs-dark');
                    logToTerminal(`Switched to ${isLight ? 'light' : 'dark'} theme`);
                });
            }

            const addButtonListeners = (button, handler, isToggle = false) => {
                if (button) {
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
                }
            };

            addButtonListeners(toggleConsoleButton, window.toggleConsole, true);
            addButtonListeners(runButton, window.runCode);
            addButtonListeners(collaborateButton, window.startCollaboration);
            addButtonListeners(sendButton, window.requestAI);

            const aiPrompt = document.getElementById('ai-prompt');
            if (aiPrompt) {
                aiPrompt.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        if (sendButton) {
                            sendButton.classList.add('active');
                            sendButton.blur();
                            setTimeout(() => sendButton.classList.remove('active'), 300);
                            console.log('Enter pressed, Send active: true');
                            window.requestAI();
                        }
                    }
                });
            }

            const uploadButton = document.querySelector('.btn-upload');
            if (uploadButton) {
                uploadButton.addEventListener('click', () => {
                    const fileInput = uploadButton.querySelector('input[type="file"]');
                    fileInput.click();
                });

                uploadButton.querySelector('input[type="file"]').addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        logToTerminal(`File selected: ${file.name}`);
                        console.log('File upload not implemented on iPad');
                    }
                });

                addButtonListeners(uploadButton, () => {
                    const fileInput = uploadButton.querySelector('input[type="file"]');
                    fileInput.click();
                });
            }
        } catch (error) {
            console.error('Editor error:', error);
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.textContent = 'Editor error: ' + error.message;
                terminal.classList.add('visible');
                terminal.classList.remove('hidden');
            }
        }
    }, (err) => {
        console.error('Monaco load error:', err);
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.textContent = 'Failed to load Monaco: ' + err.message;
            terminal.classList.add('visible');
            terminal.classList.remove('hidden');
        }
    });
});