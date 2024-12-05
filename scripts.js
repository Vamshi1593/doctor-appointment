document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const loginRoleMessage = document.getElementById('login-role-message');
    const registerRoleMessage = document.getElementById('register-role-message');
    const switchRoleLoginButton = document.getElementById('switch-role-button');
    const switchRoleRegisterButton = document.getElementById('switch-role-register-button');
    const patientFields = document.getElementById('patient-fields');
    const doctorFields = document.getElementById('doctor-fields');

    function showMessage(role, messageDiv, roleMessage, switchButton) {
        roleMessage.innerText = `Logging in as ${role}`;
        switchButton.innerText = role === 'patient' ? 'Switch to Doctor' : 'Switch to Patient';
    }

    function showRegisterMessage(role) {
        registerRoleMessage.innerText = `Registering as ${role}`;
        switchRoleRegisterButton.innerText = role === 'patient' ? 'Switch to Doctor' : 'Switch to Patient';
        if (role === 'patient') {
            patientFields.style.display = 'block';
            doctorFields.style.display = 'none';
        } else {
            patientFields.style.display = 'none';
            doctorFields.style.display = 'block';
        }
    }

    // Handle login
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = loginRoleMessage.innerText.includes('patient') ? 'patient' : 'doctor';

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Login successful') {
                    if (role === 'patient') {
                        window.location.href = 'patient-dashboard.html';
                    } else if (role === 'doctor') {
                        window.location.href = 'doctor-dashboard.html';
                    }
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        });

        document.getElementById('signup-link').addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'register.html';
        });

        document.getElementById('patient-login-tab').addEventListener('click', function() {
            showMessage('patient', loginMessage, loginRoleMessage, switchRoleLoginButton);
        });

        document.getElementById('doctor-login-tab').addEventListener('click', function() {
            showMessage('doctor', loginMessage, loginRoleMessage, switchRoleLoginButton);
        });

        switchRoleLoginButton.addEventListener('click', function() {
            const currentRole = loginRoleMessage.innerText.includes('patient') ? 'patient' : 'doctor';
            const newRole = currentRole === 'patient' ? 'doctor' : 'patient';
            showMessage(newRole, loginMessage, loginRoleMessage, switchRoleLoginButton);
            if (newRole === 'doctor') {
                document.getElementById('doctor-login-tab').classList.add('active');
                document.getElementById('patient-login-tab').classList.remove('active');
            } else {
                document.getElementById('patient-login-tab').classList.add('active');
                document.getElementById('doctor-login-tab').classList.remove('active');
            }
        });
    }

    // Handle registration
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('patient-name').value || document.getElementById('doctor-name').value;
            const password = document.getElementById('patient-password').value || document.getElementById('doctor-password').value;
            const role = patientFields.style.display === 'block' ? 'patient' : 'doctor';
            const data = {
                username,
                password,
                name: role === 'patient' ? document.getElementById('patient-name').value : document.getElementById('doctor-name').value,
                city: role === 'patient' ? document.getElementById('patient-city').value : '',
                phone: document.getElementById('patient-phone').value || document.getElementById('doctor-phone').value,
                email: document.getElementById('patient-email').value || document.getElementById('doctor-email').value,
                age: role === 'patient' ? document.getElementById('patient-age').value : '',
                sex: role === 'patient' ? document.getElementById('patient-sex').value : '',
                qualification: role === 'doctor' ? document.getElementById('doctor-qualification').value : '',
                hospitalName: role === 'doctor' ? document.getElementById('hospital-name').value : '',
                address: role === 'doctor' ? document.getElementById('doctor-address').value : ''
            };

            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.message === 'Registration successful') {
                    window.location.href = `login.html?role=${role}`;
                }
            })
            .catch(error => console.error('Error:', error));
        });

        document.getElementById('patient-register-tab').addEventListener('click', function() {
            showRegisterMessage('patient');
        });

        document.getElementById('doctor-register-tab').addEventListener('click', function() {
            showRegisterMessage('doctor');
        });

        switchRoleRegisterButton.addEventListener('click', function() {
            const currentRole = registerRoleMessage.innerText.includes('patient') ? 'patient' : 'doctor';
            const newRole = currentRole === 'patient' ? 'doctor' : 'patient';
            showRegisterMessage(newRole);
        });
    }
});
