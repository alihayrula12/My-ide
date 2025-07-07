document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const signInForm = document.getElementById('signInForm');
    const profileDashboard = document.getElementById('profileDashboard');
    const signInLink = document.getElementById('signInLink');
    const createAccountLink = document.getElementById('createAccountLink');
    const projectList = document.getElementById('projectList');
    const addProjectButton = document.querySelector('.btn-add-project');

    if (userForm) {
        userForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const user = { username, email, password, projects: [] };
            localStorage.setItem('users', JSON.stringify([user]));
            localStorage.setItem('currentUser', JSON.stringify(user));
            userForm.classList.add('hidden');
            profileDashboard.classList.remove('hidden');
        });
    }

    if (signInLink) {
        signInLink.addEventListener('click', (event) => {
            event.preventDefault();
            userForm.classList.add('hidden');
            signInForm.classList.remove('hidden');
        });
    }

    if (createAccountLink) {
        createAccountLink.addEventListener('click', (event) => {
            event.preventDefault();
            signInForm.classList.add('hidden');
            userForm.classList.remove('hidden');
        });
    }

    if (signInForm) {
        signInForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                signInForm.classList.add('hidden');
                profileDashboard.classList.remove('hidden');
            } else {
                alert('Invalid credentials');
            }
        });
    }

    // Only attach addProjectButton listener if it exists and dashboard is visible
    if (addProjectButton && profileDashboard && !profileDashboard.classList.contains('hidden')) {
        addProjectButton.addEventListener('click', () => {
            const projectName = prompt('Enter project name:');
            if (projectName) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    currentUser.projects.push(projectName);
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    const li = document.createElement('li');
                    li.textContent = projectName;
                    projectList.appendChild(li);
                }
            }
        });
    }
});