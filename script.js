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

            const logToTerminal = (message) => {
                const terminal = document.getElementById('terminal');
                const toggleConsoleButton = document.querySelector('.btn-toggle-console');
                if (toggleConsoleButton && toggleConsoleButton.classList.contains('active') && terminal) {
                    terminal.textContent = message;
                    terminal.classList.add('visible');
                    terminal.classList.remove('hidden');
                }
                console.log(message);
            };

            console.log('script.js loaded');

            // Global button delegation
            const container = document.querySelector('.container');
            if (container) {
                container.addEventListener('click', (event) => {
                    const target = event.target.closest('.btn');
                    if (!target) return;

                    const handlers = {
                        '.btn-toggle-console': () => window.toggleConsole(),
                        '.btn-run': () => window.runCode(),
                        '.btn-collaborate': () => window.startCollaboration(),
                        '.btn-send': () => window.requestAI(),
                        '#importProjectsButton': () => logToTerminal('Import Projects clicked (not implemented yet)'),
                        '.btn-upload': () => {
                            const fileInput = target.querySelector('input[type="file"]');
                            if (fileInput) fileInput.click();
                        }
                    };

                    const handler = handlers[target.className || target.id];
                    if (handler) {
                        event.preventDefault();
                        target.classList.add('active');
                        target.blur();
                        handler();
                        if (!target.classList.contains('btn-toggle-console')) {
                            setTimeout(() => target.classList.remove('active'), 300);
                        }
                    }
                });

                container.addEventListener('touchstart', (event) => {
                    const target = event.target.closest('.btn');
                    if (!target) return;

                    const handlers = {
                        '.btn-toggle-console': () => window.toggleConsole(),
                        '.btn-run': () => window.runCode(),
                        '.btn-collaborate': () => window.startCollaboration(),
                        '.btn-send': () => window.requestAI(),
                        '#importProjectsButton': () => logToTerminal('Import Projects clicked (not implemented yet)'),
                        '.btn-upload': () => {
                            const fileInput = target.querySelector('input[type="file"]');
                            if (fileInput) fileInput.click();
                        }
                    };

                    const handler = handlers[target.className || target.id];
                    if (handler) {
                        event.preventDefault();
                        target.classList.add('active');
                        target.blur();
                        handler();
                        if (!target.classList.contains('btn-toggle-console')) {
                            setTimeout(() => target.classList.remove('active'), 300);
                        }
                    }
                });
            }

            // Page-specific logic
            const path = window.location.pathname;

            // Create page logic
            if (path.includes('create.html')) {
                try {
                    const chatHistory = document.querySelector('.chat-history');
                    const preview = document.getElementById('preview');
                    const previewPlaceholder = document.getElementById('preview-placeholder');
                    const terminal = document.getElementById('terminal');
                    const languageSelect = document.getElementById('language');
                    const themeCheckbox = document.querySelector('.theme-checkbox');

                    if (!terminal || !languageSelect || !themeCheckbox) {
                        logToTerminal('Error: Required elements not found on create.html');
                        return;
                    }

                    window.changeLanguage = () => {
                        if (editor && languageSelect) {
                            const language = languageSelect.value;
                            monaco.editor.setModelLanguage(editor.getModel(), language);
                            logToTerminal(`Language changed to ${language}`);
                        }
                    };

                    window.runCode = async () => {
                        if (editor && preview && previewPlaceholder) {
                            const code = editor.getValue();
                            const language = languageSelect.value;
                            const runButton = document.querySelector('.btn-run');
                            if (runButton) {
                                runButton.classList.add('active', 'loading');
                                runButton.disabled = true;
                                runButton.blur();
                            }
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
                                if (runButton) {
                                    runButton.classList.remove('active', 'loading');
                                    runButton.disabled = false;
                                }
                            }
                        }
                    };

                    window.requestAI = async () => {
                        if (chatHistory) {
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

                            const sendButton = document.querySelector('.btn-send');
                            if (sendButton) {
                                sendButton.classList.add('active');
                                sendButton.blur();
                                setTimeout(() => sendButton.classList.remove('active'), 300);
                            }

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
                        const collaborateButton = document.querySelector('.btn-collaborate');
                        if (collaborateButton) {
                            collaborateButton.classList.add('active');
                            collaborateButton.blur();
                            setTimeout(() => collaborateButton.classList.remove('active'), 300);
                            logToTerminal('Collaboration not available on iPad...');
                        }
                    };

                    window.toggleConsole = () => {
                        const toggleConsoleButton = document.querySelector('.btn-toggle-console');
                        const editorElement = document.getElementById('editor');
                        const buttonBar = document.querySelector('.button-bar');
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
                                if (toggleConsoleButton) toggleConsoleButton.classList.remove('active');
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
                                if (toggleConsoleButton) toggleConsoleButton.classList.add('active');
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

                    const aiPrompt = document.getElementById('ai-prompt');
                    if (aiPrompt) {
                        aiPrompt.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                const sendButton = document.querySelector('.btn-send');
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
                        uploadButton.querySelector('input[type="file"]').addEventListener('change', (event) => {
                            const file = event.target.files[0];
                            if (file) logToTerminal(`File selected: ${file.name}`);
                        });
                    }

                    if (themeCheckbox) {
                        themeCheckbox.addEventListener('change', () => {
                            const isLight = themeCheckbox.checked;
                            document.body.classList.toggle('light', isLight);
                            themeCheckbox.setAttribute('data-theme', isLight ? 'light' : 'dark');
                            if (editor) editor.setTheme(isLight ? 'vs' : 'vs-dark');
                            logToTerminal(`Switched to ${isLight ? 'light' : 'dark'} theme`);
                        });
                    }
                } catch (error) {
                    logToTerminal(`Error in create.html logic: ${error.message}`);
                }
            }

            // Profile page logic
            if (path.includes('profile.html')) {
                try {
                    const signInForm = document.getElementById('signInForm');
                    const createAccountForm = document.getElementById('createAccountForm');
                    const createAccountLink = document.getElementById('createAccountLink');
                    const backToSignInLink = document.getElementById('backToSignInLink');

                    if (signInForm && createAccountForm && createAccountLink && backToSignInLink) {
                        createAccountForm.classList.add('hidden');
                        createAccountForm.style.display = 'none';

                        const toggleForm = (fromForm, toForm) => {
                            fromForm.classList.remove('fade-in', 'fade-out');
                            fromForm.classList.add('fade-out');
                            setTimeout(() => {
                                fromForm.classList.add('hidden');
                                fromForm.style.display = 'none';
                                toForm.classList.remove('hidden', 'fade-in', 'fade-out');
                                toForm.style.display = 'block';
                                toForm.classList.add('fade-in');
                            }, 300);
                        };

                        createAccountLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            toggleForm(signInForm, createAccountForm);
                        });

                        backToSignInLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            toggleForm(createAccountForm, signInForm);
                        });
                    }
                } catch (error) {
                    logToTerminal(`Error in profile.html logic: ${error.message}`);
                }
            }

            // Projects page logic
            if (path.includes('projects.html')) {
                try {
                    const projectGrid = document.getElementById('projectGrid');
                    const importProjectsButton = document.getElementById('importProjectsButton');
                    const projectContainer = document.querySelector('.project-container');

                    if (!projectGrid) {
                        logToTerminal('projectGrid element not found on projects.html');
                        return;
                    }

                    let projects = [
                        { name: 'Project Alpha', description: 'AI-driven analytics tool' },
                        { name: 'Project Beta', description: 'Collaborative coding platform' },
                        { name: 'Project Gamma', description: 'Real-time data visualization' },
                        { name: 'Project Delta', description: 'Automated testing suite' }
                    ];

                    const populateProjects = () => {
                        projectGrid.innerHTML = '';
                        if (projects.length === 0) {
                            projectContainer.classList.add('no-projects');
                            const addProject = document.createElement('div');
                            addProject.className = 'add-project';
                            addProject.innerHTML = '+<svg viewBox="0 0 180 156"><path d="M90 0 L180 39 L180 117 L90 156 L0 117 L0 39 Z" /></svg>';
                            addProject.addEventListener('click', () => {
                                const name = prompt('Enter project name:');
                                if (name) {
                                    projects.push({ name });
                                    projectContainer.classList.remove('no-projects');
                                    populateProjects();
                                }
                            });
                            const addText = document.createElement('div');
                            addText.className = 'add-project-text';
                            addText.textContent = 'Create your first project!';
                            projectGrid.appendChild(addProject);
                            projectGrid.appendChild(addText);
                        } else {
                            projectContainer.classList.remove('no-projects');
                            projects.forEach((project, index) => {
                                const card = document.createElement('div');
                                card.className = 'project-card';
                                card.innerHTML = `<h3>${project.name}</h3><svg viewBox="0 0 180 156"><path d="M90 0 L180 39 L180 117 L90 156 L0 117 L0 39 Z" /></svg>`;
                                card.addEventListener('click', () => {
                                    card.classList.toggle('active');
                                    logToTerminal(`Selected: ${project.name}`);
                                    window.location.href = `project.html?name=${encodeURIComponent(project.name)}`;
                                });
                                card.addEventListener('mouseover', () => console.log('Hover detected on', card));
                                projectGrid.appendChild(card);
                            });

                            const cards = projectGrid.querySelectorAll('.project-card');
                            cards.forEach((card, index) => {
                                if (index % 2 === 1) card.style.marginTop = '78px';
                                projectGrid.style.height = Math.ceil(cards.length / 6) * 156 + 'px';
                            });
                        }
                    };

                    populateProjects();
                } catch (error) {
                    logToTerminal(`Error in projects.html logic: ${error.message}`);
                }
            }

            // Navigation
            const navItems = document.querySelectorAll('.nav-item');
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

            // Theme toggle
            const themeCheckbox = document.querySelector('.theme-checkbox');
            if (themeCheckbox) {
                themeCheckbox.addEventListener('change', () => {
                    const isLight = themeCheckbox.checked;
                    document.body.classList.toggle('light', isLight);
                    themeCheckbox.setAttribute('data-theme', isLight ? 'light' : 'dark');
                    if (editor) editor.setTheme(isLight ? 'vs' : 'vs-dark');
                    logToTerminal(`Switched to ${isLight ? 'light' : 'dark'} theme`);
                });
            }

        } catch (error) {
            console.error('Script error:', error);
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.textContent = 'Script error: ' + error.message;
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