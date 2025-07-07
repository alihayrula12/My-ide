document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const signInForm = document.getElementById('signInForm');
    const profileDashboard = document.getElementById('profileDashboard');
    const signInLink = document.getElementById('signInLink');
    const createAccountLink = document.getElementById('createAccountLink');
    const projectList = document.getElementById('projectList');
    const addProjectButton = document.getElementById('btn-add-project');

    let users = JSON.parse(localStorage.getItem('users') || '{}');
    let currentUser = localStorage.getItem('currentUser');

    const showForm = (form) => {
        userForm.classList.add('hidden');
        signInForm.classList.add('hidden');
        profileDashboard.classList.add('hidden');
        form.classList.remove('hidden');
    };

    const updateProfileDashboard = () => {
        projectList.innerHTML = '';
        if (currentUser && users[currentUser]) {
            users[currentUser].projects.forEach(project => {
                const li = document.createElement('li');
                li.textContent = project.name;
                projectList.appendChild(li);
            });
        }
    };

    if (currentUser) showForm(profileDashboard);
    else showForm(userForm);

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!users[username]) {
            users[username] = { email, password, projects: [] };
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', username);
            currentUser = username;
            showForm(profileDashboard);
            updateProfileDashboard();
        } else {
            alert('Username already exists!');
        }
    });

    signInLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm(signInForm);
    });

    createAccountLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm(userForm);
    });

    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        for (let username in users) {
            if (users[username].email === email && users[username].password === password) {
                localStorage.setItem('currentUser', username);
                currentUser = username;
                showForm(profileDashboard);
                updateProfileDashboard();
                return;
            }
        }
        alert('Invalid email or password!');
    });

    addProjectButton.addEventListener('click', () => {
        const projectName = prompt('Enter project name:');
        if (projectName && currentUser) {
            users[currentUser].projects.push({ name: projectName });
            localStorage.setItem('users', JSON.stringify(users));
            updateProfileDashboard();
        }
    });
});