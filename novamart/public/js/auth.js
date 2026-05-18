document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('logEmail').value;
            const password = document.getElementById('logPassword').value;
            const btn = loginForm.querySelector('button');
            const originalText = btn.innerText;
            
            try {
                btn.innerText = 'Signing in...';
                btn.disabled = true;

                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.showToast('Successfully signed in.', 'success');
                    setTimeout(() => window.location.href = '/', 1500);
                } else {
                    window.showToast(data.message || 'Invalid credentials.', 'error');
                }
            } catch(e) {
                window.showToast('Network error. Try again.', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signName').value;
            const email = document.getElementById('signEmail').value;
            const password = document.getElementById('signPassword').value;
            const btn = signupForm.querySelector('button');
            const originalText = btn.innerText;

            try {
                btn.innerText = 'Creating account...';
                btn.disabled = true;

                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.showToast('Account created successfully.', 'success');
                    setTimeout(() => window.showToast('Welcome to NovaMart!', 'info'), 1500);
                    setTimeout(() => window.location.href = '/', 3500);
                } else {
                    window.showToast(data.message || 'Registration failed.', 'error');
                }
            } catch(e) {
                window.showToast('Network error. Try again.', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});
