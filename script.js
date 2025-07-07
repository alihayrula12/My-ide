document.addEventListener('DOMContentLoaded', () => {
    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.34.0/min/vs' } });
    require(['vs/editor/editor.main'], () => {
        try {
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
            const createProjectButton = document.getElementById('createProjectButton');

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

            const populateProjects = () => {
                if (!projectGrid) {
                    console.error('projectGrid element not found');
                    return;
                }
                const sampleProjects = [
                    { name: 'Project Alpha', description: 'AI-driven analytics tool' },
                    { name: 'Project Beta', description: 'Collaborative coding platform' },
                    { name: 'Project Gamma', description: 'Real-time data visualization' },
                    { name: 'Project Delta', description: 'Automated testing suite' }
                ];
                projectGrid.innerHTML = '';
                sampleProjects.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'project-card';
                    card.innerHTML = `
                        <div class="hexagon">⚙️</div>
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                    `;
                    card.addEventListener('click', () => {
                        card.classList.toggle('active');
                        logToTerminal(`Selected: ${project.name}`);
                    });
                    projectGrid.appendChild(card);
                });
            };

            if (projectGrid) {
                populateProjects();
            }

            if (importProjectsButton) {
                importProjectsButton.addEventListener('click', () => {
                    logToTerminal('Import Projects clicked (not implemented yet)');
                });
            }

            if (createProjectButton) {
                createProjectButton.addEventListener('click', () => {
                    logToTerminal('Create New Project clicked (not implemented yet)');
                });
            }

            if (signInForm && createAccountForm) {
                createAccountForm.classList.add('hidden');
                createAccountForm.style.display = 'none';
            }

            if (createAccountLink && backToSignInLink && signInForm && createAccountForm) {
                const toggleForm = (fromForm, toForm, direction) => {
                    fromForm.classList.remove('fade-in', 'fade-out');
                    fromForm.classList.add('fade-out');
                    setTimeout(() => {
                        fromForm.classList.add('hidden');
                        fromForm.style.display = 'none';
                        toForm.classList.remove('hidden', 'fade-in', 'fade-out');
                        toForm.style.display = 'block';
                        toForm.classList.add('fade-in');
                    }, 300); // Match fade-out duration
                };

                createAccountLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    console.log('Create Account link clicked');
                    toggleForm(signInForm, createAccountForm, 'toCreate');
                });

                backToSignInLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    console.log('Back to Sign In link clicked');
                    toggleForm(createAccountForm, signInForm, 'toSignIn');
                });
            }

            navItems.forEach(item => {
                const handleNavigation = (event) => {
                    event.preventDefault();
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    item.blur();
                    const targetPage = item.getAttribute('data-nav');
                    logToTerminal(`Navigating to ${targetPage}`);
                    setTimeout(() => {
                        const pages = {
                            'profile': 'profile.html',
                            'create': 'create.html',
                            'projects': 'projects.html',
                            'settings': 'settings.html'
                        };
                        if (pages[targetPage] && window.location.href.indexOf(pages[targetPage]) === -1) {
                            window.location.href = pages[targetPage];
                        } else {
                            logToTerminal(`Already on ${targetPage} page, no navigation needed`);
                        }
                    }, 300);
                };
                item.addEventListener('click', handleNavigation);
                item.addEventListener('touchstart', handleNavigation);
            });

            if (languageSelect) {
                languageSelect.addEventListener('change', () => {
                    languageSelect.classList.add('active');
                    languageSelect.blur();
                    setTimeout(() => languageSelect.classList.remove('active'), 300);
                    window.changeLanguage();
                });
                languageSelect.addEventListener('touchstart', () => {
                    languageSelect.classList.add('active');
                    languageSelect.blur();
                    setTimeout(() => languageSelect.classList.remove('active'), 300);
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
                            logToTerminal('Backend not available on iPad...');
                        }
                    } catch (error) {
                        logToTerminal('Error running code');
                    } finally {
                        runButton.classList.remove('active', 'loading');
                        runButton.disabled = false;
                    }
                }
            };

            window.requestAI = async () => {
                if (chatHistory && sendButton) {
                    const prompt = document.getElementById('ai-prompt').value;
                    const userMessage = document.createElement('div');
                    userMessage.className = 'message user-message';
                    userMessage.textContent = prompt;
                    chatHistory.appendChild(userMessage);

                    const typingIndicator = document.createElement('div');
                    typingIndicator.className = 'typing-indicator';
                    typingIndicator.innerHTML = '<span></span><span></span><span></span> <span>replicat’s thinking</span>';
                    chatHistory.appendChild(typingIndicator);
                    chatHistory.scrollTop = chatHistory.scrollHeight;

                    sendButton.classList.add('active');
                    sendButton.blur();
                    setTimeout(() => sendButton.classList.remove('active'), 300);

                    try {
                        typingIndicator.remove();
                        const aiMessage = document.createElement('div');
                        aiMessage.className = 'message ai-message';
                        aiMessage.textContent = 'Mock AI response';
                        chatHistory.appendChild(aiMessage);
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
                    document.getElementById('ai-prompt').value = '';
                }
            };

            window.startCollaboration = () => {
                if (collaborateButton) {
                    collaborateButton.classList.add('active');
                    collaborateButton.blur();
                    setTimeout(() => collaborateButton.classList.remove('active'), 300);
                    logToTerminal('Collaboration not available on iPad...');
                }
            };

            window.toggleConsole = () => {
                if (toggleConsoleButton && editorElement) {
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
                            editorElement.style.display = 'none';
                            if (buttonBar) buttonBar.style.display = 'none';
                        }, 800);
                    } else {
                        editorElement.style.display = 'block';
                        if (buttonBar) buttonBar.style.display = 'flex';
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
                        }, 300);
                    }
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
                        if (sendButton) {
                            sendButton.classList.add('active');
                            sendButton.blur();
                            setTimeout(() => sendButton.classList.remove('active'), 300);
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
                    if (file) logToTerminal(`File selected: ${file.name}`);
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