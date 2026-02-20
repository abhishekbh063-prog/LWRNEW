// Configuration - Replace with your Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGMhmhM_vCsdp-Iuh9jpT_TDGzBEIDK-4nzfteHIQRkNKWftkktVLEG8PITRNuz2TCMg/exec';

// DOM Elements
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// Tab switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    clearMessages();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    clearMessages();
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.target;
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            e.currentTarget.textContent = '🙈';
        } else {
            input.type = 'password';
            e.currentTarget.textContent = '👁️';
        }
    });
});

// Show message
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function clearMessages() {
    loginMessage.style.display = 'none';
    registerMessage.style.display = 'none';
}

// Toggle button loading state
function toggleButtonLoading(form, isLoading) {
    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        btn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
    }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage(loginMessage, 'Please enter both username and password', 'error');
        return;
    }
    
    toggleButtonLoading(loginForm, true);
    clearMessages();
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('fullName', result.fullName);
            sessionStorage.setItem('userId', result.userId);
            
            showMessage(loginMessage, '✓ Login successful! Redirecting...', 'success');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(loginMessage, '✗ ' + (result.message || 'Invalid username or password'), 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(loginMessage, '✗ Login failed. Please check your connection and try again.', 'error');
    } finally {
        toggleButtonLoading(loginForm, false);
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pin = document.getElementById('registerPin').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const fullName = document.getElementById('registerFullName').value.trim();
    
    // Validation
    if (!pin || !username || !password || !confirmPassword || !fullName) {
        showMessage(registerMessage, 'Please fill in all fields', 'error');
        return;
    }
    
    if (username.length < 3) {
        showMessage(registerMessage, 'Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage(registerMessage, 'Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage(registerMessage, 'Passwords do not match', 'error');
        return;
    }
    
    toggleButtonLoading(registerForm, true);
    clearMessages();
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: 'register',
                pin: pin,
                username: username,
                password: password,
                fullName: fullName
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(registerMessage, '✓ Registration successful! Please login.', 'success');
            registerForm.reset();
            
            // Switch to login tab after 2 seconds
            setTimeout(() => {
                loginTab.click();
            }, 2000);
        } else {
            showMessage(registerMessage, '✗ ' + (result.message || 'Registration failed'), 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(registerMessage, '✗ Registration failed. Please check your connection and try again.', 'error');
    } finally {
        toggleButtonLoading(registerForm, false);
    }
});

// Check if already logged in
if (sessionStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'dashboard.html';
}
