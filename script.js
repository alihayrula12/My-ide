document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded successfully');

    const logToTerminal = (message) => {
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.textContent = message;
            const toggleConsoleButton = document.querySelector('.btn-toggle-console');
            if (toggleConsoleButton && toggleConsoleButton.classList.contains('active')) {
                terminal.classList.add('visible');
                terminal.classList.remove('hidden');
            }
        }
        console.log(message);
    };

    let sessionId = Date.now().toString();
    let inputHistory = [];

    const setupButtons = () => {
        const buttons = [
            { selector: '.btn-upload', action: () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.style.display = 'none';
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) logToTerminal(`File selected: ${file.name}`);
                });
                fileInput.click();
            }},
            { selector: '.btn-send', action: async () => {
                const chatHistory = document.querySelector('.chat-history');
                const aiPrompt = document.getElementById('ai-prompt');
                if (chatHistory && aiPrompt) {
                    const prompt = aiPrompt.value.trim();
                    if (prompt) {
                        inputHistory.push(prompt);
                        const userMessage = document.createElement('div');
                        userMessage.className = 'message user-message';
                        userMessage.textContent = prompt;
                        chatHistory.appendChild(userMessage);
                        const typingIndicator = document.createElement('div');
                        typingIndicator.className = 'typing-indicator';
                        typingIndicator.innerHTML = '<span></span><span></span><span></span> <span>replicat’s thinking</span>';
                        chatHistory.appendChild(typingIndicator);
                        chatHistory.scrollTop = chatHistory.scrollHeight;

                        const displayThought = (message) => {
                            const thoughtMessage = document.createElement('div');
                            thoughtMessage.className = 'message ai-thought';
                            thoughtMessage.textContent = message;
                            chatHistory.appendChild(thoughtMessage);
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                            setTimeout(() => thoughtMessage.remove(), 3000);
                        };

                        const processAIResponse = async () => {
                            try {
                                const endpoint = inputHistory.length > 1 ? '/ai/followup' : '/ai/complete';
                                const response = await fetch(`http://localhost:3000${endpoint}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ prompt, code: '', filePaths: [], sessionId })
                                });
                                const data = await response.json();
                                const thoughts = inputHistory.length > 1 
                                    ? ['Analyzing your input...', 'Crafting a detailed plan...']
                                    : ['Interpreting your idea...', 'Building a response...'];
                                thoughts.forEach((thought, index) => {
                                    setTimeout(() => displayThought(thought), index * 1000);
                                });

                                setTimeout(() => {
                                    typingIndicator.remove();
                                    let currentMessage = null;
                                    data.completion.forEach(line => {
                                        const trimmedLine = line.trim();
                                        if (trimmedLine.match(/^(Features|Practical Advice|Follow-up Questions):$/i)) {
                                            if (currentMessage) chatHistory.appendChild(currentMessage);
                                            currentMessage = document.createElement('div');
                                            currentMessage.className = 'message ai-message';
                                            currentMessage.textContent = trimmedLine;
                                        } else if (currentMessage && trimmedLine.match(/^\d+\.\s/)) {
                                            if (currentMessage.textContent) currentMessage.textContent += '\n';
                                            currentMessage.textContent += trimmedLine;
                                        } else if (currentMessage && trimmedLine.match(/^-\sFeature:/)) {
                                            if (currentMessage.textContent) currentMessage.textContent += '\n';
                                            currentMessage.textContent += trimmedLine;
                                        } else if (currentMessage) {
                                            currentMessage.textContent += '\n' + trimmedLine;
                                        } else {
                                            currentMessage = document.createElement('div');
                                            currentMessage.className = 'message ai-message';
                                            currentMessage.textContent = trimmedLine;
                                            chatHistory.appendChild(currentMessage);
                                        }
                                    });
                                    if (currentMessage) chatHistory.appendChild(currentMessage);
                                    chatHistory.scrollTop = chatHistory.scrollHeight;
                                    aiPrompt.value = '';
                                    logToTerminal('AI response received');
                                }, thoughts.length * 1000 + 1000);
                            } catch (error) {
                                logToTerminal(`AI error: ${error.message}`);
                                typingIndicator.remove();
                                const aiMessage = document.createElement('div');
                                aiMessage.className = 'message ai-message';
                                aiMessage.textContent = 'Error fetching AI response.';
                                chatHistory.appendChild(aiMessage);
                                chatHistory.scrollTop = chatHistory.scrollHeight;
                            }
                        };

                        processAIResponse();
                    } else {
                        logToTerminal('No prompt entered');
                    }
                } else {
                    logToTerminal('Chat history or prompt missing');
                }
            }},
            { selector: '.btn-toggle-console', action: () => {
                const editorElement = document.getElementById('editor');
                const buttonBar = document.querySelector('.button-bar');
                const terminal = document.getElementById('terminal');
                const preview = document.querySelector('.preview');
                const previewPlaceholder = document.querySelector('#preview-placeholder');
                if (editorElement && buttonBar && terminal && preview && previewPlaceholder) {
                    const isVisible = editorElement.classList.contains('visible');
                    if (isVisible) {
                        editorElement.classList.remove('visible');
                        editorElement.classList.add('hidden');
                        editorElement.style.display = 'none';
                        preview.classList.remove('hidden');
                        previewPlaceholder.classList.remove('hidden');
                        terminal.classList.remove('visible');
                        terminal.classList.add('hidden');
                        terminal.style.display = 'none';
                        buttonBar.classList.add('hidden');
                        document.querySelector('.btn-toggle-console').classList.remove('active');
                        logToTerminal('Console closed');
                    } else {
                        editorElement.style.display = 'block';
                        editorElement.classList.remove('hidden');
                        editorElement.classList.add('visible');
                        preview.classList.add('hidden');
                        previewPlaceholder.classList.add('hidden');
                        buttonBar.classList.remove('hidden');
                        terminal.style.display = 'block';
                        terminal.classList.remove('hidden');
                        terminal.classList.add('visible');
                        document.querySelector('.btn-toggle-console').classList.add('active');
                        logToTerminal('Console opened');
                    }
                } else {
                    logToTerminal('Toggle elements missing');
                }
            }},
            { selector: '.btn-run', action: () => {
                const preview = document.getElementById('preview');
                const previewPlaceholder = document.getElementById('preview-placeholder');
                if (preview && previewPlaceholder) {
                    const code = document.getElementById('editor')?.value || '';
                    if (code) {
                        preview.contentDocument.open();
                        preview.contentDocument.write(code);
                        preview.contentDocument.close();
                        previewPlaceholder.classList.add('hidden');
                        logToTerminal('Preview updated');
                    } else {
                        logToTerminal('No code to run');
                    }
                } else {
                    logToTerminal('Preview missing');
                }
            }},
            { selector: '.btn-collaborate', action: () => logToTerminal('Collaboration not available on iPad...') }
        ];

        buttons.forEach(btn => {
            const button = document.querySelector(btn.selector);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    button.classList.add('active');
                    button.blur();
                    btn.action();
                    if (btn.selector !== '.btn-toggle-console') {
                        setTimeout(() => button.classList.remove('active'), 300);
                    }
                });
            } else {
                logToTerminal(`Button not found: ${btn.selector}`);
            }
        });

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                item.blur();
                const targetPage = item.getAttribute('data-nav');
                const pages = {
                    'profile': 'profile.html',
                    'create': 'create.html',
                    'projects': 'projects.html',
                    'settings': 'settings.html'
                };
                if (targetPage && window.location.pathname.split('/').pop() !== pages[targetPage]) {
                    window.location.href = pages[targetPage];
                    logToTerminal(`Navigating to ${pages[targetPage]}`);
                } else {
                    logToTerminal(`Already on ${targetPage} page`);
                }
            });
        });

        navItems.forEach(item => {
            const itemPage = item.getAttribute('data-nav');
            if (itemPage && window.location.pathname.includes(itemPage + '.html')) {
                item.classList.add('active');
            }
        });
    };

    setupButtons();

    // Theme toggle initialization with error handling
    const themeCheckboxes = document.querySelectorAll('.theme-checkbox');
    if (themeCheckboxes.length > 0) {
        console.log('Theme checkboxes found, initializing...');
        const isLight = document.body.classList.contains('light');
        themeCheckboxes.forEach(checkbox => {
            checkbox.checked = isLight;
            checkbox.setAttribute('data-theme', isLight ? 'light' : 'dark');
            checkbox.addEventListener('change', () => {
                const isLight = checkbox.checked;
                document.body.classList.toggle('light', isLight);
                themeCheckboxes.forEach(cb => cb.setAttribute('data-theme', isLight ? 'light' : 'dark'));
                logToTerminal(`Switched to ${isLight ? 'light' : 'dark'} theme`);
            });
        });
    } else {
        console.error('Theme checkboxes not found');
    }

    if (window.location.pathname.includes('projects.html')) {
        const projectContainer = document.querySelector('.project-container');
        const projectGrid = document.getElementById('projectGrid');
        if (projectContainer && projectGrid) {
            projectContainer.innerHTML = '';
            projectContainer.appendChild(projectGrid);
            let projects = [
                { name: 'Project Alpha', description: 'AI-driven analytics tool' },
                { name: 'Project Beta', description: 'Collaborative coding platform' },
                { name: 'Project Gamma', description: 'Real-time data visualization' },
                { name: 'Project Delta', description: 'Automated testing suite' },
                { name: 'Project Epsilon', description: 'Machine learning prototype' },
                { name: 'Project Zeta', description: 'Data processing engine' },
                { name: 'Project Eta', description: 'User interface toolkit' },
                { name: 'Project Theta', description: 'Cloud deployment tool' },
                { name: 'Project Iota', description: 'Security framework' },
                { name: 'Project Kappa', description: 'Performance optimizer' },
                { name: 'Project Lambda', description: 'API gateway' },
                { name: 'Project Mu', description: 'Database manager' },
                { name: 'Project Nu', description: 'Network analyzer' },
                { name: 'Project Xi', description: 'Image processing tool' },
                { name: 'Project Omicron', description: 'Text analytics engine' },
                { name: 'Project Pi', description: 'Virtual assistant' }
            ];
            const populateProjects = () => {
                projectGrid.innerHTML = '';
                const totalSlots = Math.ceil((projects.length + 1) / 5) * 5;
                projects.forEach((project) => {
                    const card = document.createElement('div');
                    card.className = 'project-card';
                    card.innerHTML = `<h3>${project.name}</h3><svg viewBox="0 0 180 156" xmlns="http://www.w3.org/2000/svg"><path d="M90 0 L180 39 L180 117 L90 156 L0 117 L0 39 Z" /></svg>`;
                    card.addEventListener('click', () => {
                        card.classList.toggle('active');
                        logToTerminal(`Selected: ${project.name}`);
                        window.location.href = `project.html?name=${encodeURIComponent(project.name)}`;
                    });
                    projectGrid.appendChild(card);
                });
                const addProject = document.createElement('div');
                addProject.className = 'add-project';
                addProject.innerHTML = '+<svg viewBox="0 0 180 156" xmlns="http://www.w3.org/2000/svg"><path d="M90 0 L180 39 L180 117 L90 156 L0 117 L0 39 Z" /></svg>';
                addProject.addEventListener('click', () => {
                    const name = prompt('Enter project name:');
                    if (name) {
                        projects.push({ name });
                        populateProjects();
                    } else {
                        window.location.href = 'create.html';
                    }
                });
                projectGrid.appendChild(addProject);
                for (let i = projects.length + 1; i < totalSlots; i++) {
                    const emptyProject = document.createElement('div');
                    emptyProject.className = 'empty-project';
                    emptyProject.innerHTML = '<svg viewBox="0 0 180 156" xmlns="http://www.w3.org/2000/svg"><path d="M90 0 L180 39 L180 117 L90 156 L0 117 L0 39 Z" /></svg>';
                    projectGrid.appendChild(emptyProject);
                }
                projectGrid.style.height = `${Math.ceil(totalSlots / 5) * 166}px`;
            };
            populateProjects();

            const existingButton = document.querySelector('.import-projects-button');
            if (existingButton) {
                existingButton.addEventListener('click', () => logToTerminal('Import Projects clicked (not implemented yet)'));
            } else {
                const newButton = document.createElement('button');
                newButton.className = 'import-projects-button';
                newButton.textContent = 'Import Projects';
                newButton.addEventListener('click', () => logToTerminal('Import Projects clicked (not implemented yet)'));
                projectContainer.parentElement.insertAdjacentElement('afterend', newButton);
            }
        }
    }

    if (window.location.pathname.includes('profile.html')) {
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
            createAccountLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleForm(signInForm, createAccountForm);
            });
            backToSignInLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleForm(createAccountForm, signInForm);
            });
        }
    }

    if (window.location.pathname.includes('create.html')) {
        const aiPrompt = document.getElementById('ai-prompt');
        const sendButton = document.querySelector('.btn-send');
        if (aiPrompt && sendButton) {
            aiPrompt.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendButton.classList.add('active');
                    sendButton.blur();
                    sendButton.click();
                    setTimeout(() => sendButton.classList.remove('active'), 300);
                }
            });
        }
    }

    if (window.location.pathname.includes('settings.html')) {
        const notificationsToggle = document.getElementById('notifications-toggle');
        const clearMemoryButton = document.querySelector('.btn-clear-memory');

        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', () => {
                logToTerminal(`Notifications ${notificationsToggle.checked ? 'enabled' : 'disabled'}`);
            });
        } else {
            console.error('Notifications toggle not found');
        }

        if (clearMemoryButton) {
            clearMemoryButton.addEventListener('click', () => {
                logToTerminal('Chat memory cleared (simulated)');
            });
        } else {
            console.error('Clear memory button not found');
        }
    }
});
