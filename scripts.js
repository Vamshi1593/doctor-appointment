document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginRoleMessage = document.getElementById('login-role-message');
    const registerRoleMessage = document.getElementById('register-role-message');
    const patientFields = document.getElementById('patient-fields');
    const doctorFields = document.getElementById('doctor-fields');
    const patientLoginTab = document.getElementById('patient-login-tab');
    const doctorLoginTab = document.getElementById('doctor-login-tab');
    const patientRegisterTab = document.getElementById('patient-register-tab');
    const doctorRegisterTab = document.getElementById('doctor-register-tab');

    function toggleActiveTab(selectedTab, otherTab) {
        selectedTab.classList.add('active');
        otherTab.classList.remove('active');
    }

    function showMessageAndFields(role, isLogin) {
        const messageElement = isLogin ? loginRoleMessage : registerRoleMessage;
        const isPatient = role === 'patient';

        messageElement.innerText = `${isLogin ? 'Logging in' : 'Registering'} as ${role}`;
        if (!isLogin) {
            patientFields.style.display = isPatient ? 'block' : 'none';
            doctorFields.style.display = isPatient ? 'none' : 'block';
        }
    }

    // Handle login
    if (loginForm) {
        patientLoginTab.addEventListener('click', () => {
            toggleActiveTab(patientLoginTab, doctorLoginTab);
            showMessageAndFields('patient', true);
        });

        doctorLoginTab.addEventListener('click', () => {
            toggleActiveTab(doctorLoginTab, patientLoginTab);
            showMessageAndFields('doctor', true);
        });

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = loginRoleMessage.innerText.includes('patient') ? 'patient' : 'doctor';

            if (!username || !password) {
                alert('Username and password are required.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role })
                });
                const data = await response.json();

                if (data.message === 'Login successful') {
                    localStorage.setItem('token', data.token);
                    alert(data.message);
                    window.location.href = `${role}-dashboard.html?username=${data.user.username}`;
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your request. Please try again later.');
            }
        });
    }

    // Handle registration
    if (registerForm) {
        patientRegisterTab.addEventListener('click', () => {
            toggleActiveTab(patientRegisterTab, doctorRegisterTab);
            showMessageAndFields('patient', false);
        });

        doctorRegisterTab.addEventListener('click', () => {
            toggleActiveTab(doctorRegisterTab, patientRegisterTab);
            showMessageAndFields('doctor', false);
        });

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const isPatient = registerRoleMessage.innerText.includes('patient');
            const formData = isPatient
                ? {
                    name: document.getElementById('patient-name').value.trim(),
                    city: document.getElementById('patient-city').value.trim(),
                    phone: document.getElementById('patient-phone').value.trim(),
                    email: document.getElementById('patient-email').value.trim(),
                    password: document.getElementById('patient-password').value.trim(),
                    age: document.getElementById('patient-age').value.trim(),
                    sex: document.getElementById('patient-sex').value
                }
                : {
                    name: document.getElementById('doctor-name').value.trim(),
                    password: document.getElementById('doctor-password').value.trim(),
                    qualification: document.getElementById('doctor-qualification').value.trim(),
                    hospital: document.getElementById('hospital-name').value.trim(),
                    email: document.getElementById('doctor-email').value.trim(),
                    phone: document.getElementById('doctor-phone').value.trim(),
                    address: document.getElementById('doctor-address').value.trim()
                };

            for (const field in formData) {
                if (!formData[field]) {
                    alert(`Please fill in the ${field.replace(/-/g, ' ')} field.`);
                    return;
                }
            }

            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.message === 'Registration successful') {
                    alert(data.message);
                    window.location.href = 'login.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your request. Please try again later.');
            }
        });
    }
});
