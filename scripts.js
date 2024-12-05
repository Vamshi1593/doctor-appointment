document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginRoleMessage = document.getElementById('login-role-message');
    const registerRoleMessage = document.getElementById('register-role-message');
    const patientFields = document.getElementById('patient-fields');
    const doctorFields = document.getElementById('doctor-fields');

    function showLoginMessage(role) {
        loginRoleMessage.innerText = `Logging in as ${role}`;
    }

    function showRegisterMessage(role) {
        registerRoleMessage.innerText = `Registering as ${role}`;
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

            // Fetch user details and validate credentials
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Login successful') {
                    alert(data.message);
                    if (role === 'patient') {
                        window.location.href = `patient-dashboard.html?username=${data.user.username}`;
                    } else if (role === 'doctor') {
                        window.location.href = `doctor-dashboard.html?username=${data.user.username}`;
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
            showLoginMessage('patient');
            document.getElementById('patient-login-tab').classList.add('active');
            document.getElementById('doctor-login-tab').classList.remove('active');
        });

        document.getElementById('doctor-login-tab').addEventListener('click', function() {
            showLoginMessage('doctor');
            document.getElementById('doctor-login-tab').classList.add('active');
            document.getElementById('patient-login-tab').classList.remove('active');
        });

        document.getElementById('switch-role-button').addEventListener('click', function() {
            const currentRole = loginRoleMessage.innerText.includes('patient') ? 'patient' : 'doctor';
            const newRole = currentRole === 'patient' ? 'doctor' : 'patient';
            showLoginMessage(newRole);
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
                city: document.getElementById('patient-city')?.value,
                phone: document.getElementById('patient-phone')?.value || document.getElementById('doctor-phone')?.value,
                email: document.getElementById('patient-email')?.value || document.getElementById('doctor-email')?.value,
                age: document.getElementById('patient-age')?.value,
                sex: document.getElementById('patient-sex')?.value,
                qualification: document.getElementById('doctor-qualification')?.value,
                hospitalName: document.getElementById('hospital-name')?.value,
                address: document.getElementById('doctor-address')?.value
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
                    window.location.href = 'login.html';
                }
            })
            .catch(error => console.error('Error:', error));
        });

        document.getElementById('patient-register-tab').addEventListener('click', function() {
            showRegisterMessage('patient');
            document.getElementById('patient-register-tab').classList.add('active');
            document.getElementById('doctor-register-tab').classList.remove('active');
        });

        document.getElementById('doctor-register-tab').addEventListener('click', function() {
            showRegisterMessage('doctor');
            document.getElementById('doctor-register-tab').classList.add('active');
            document.getElementById('patient-register-tab').classList.remove('active');
        });

        document.getElementById('switch-role-register-button').addEventListener('click', function() {
            const currentRole = registerRoleMessage.innerText.includes('patient') ? 'patient' : 'doctor';
            const newRole = currentRole === 'patient' ? 'doctor' : 'patient';
            showRegisterMessage(newRole);
            if (newRole === 'doctor') {
                document.getElementById('doctor-register-tab').classList.add('active');
                document.getElementById('patient-register-tab').classList.remove('active');
            } else {
                document.getElementById('patient-register-tab').classList.add('active');
                document.getElementById('doctor-register-tab').classList.remove('active');
            }
        });
    }
});
