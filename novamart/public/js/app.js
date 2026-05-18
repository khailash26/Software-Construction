// Global App State
const App = {
    user: null,
    token: localStorage.getItem('token'),
    
    async init() {
        // Handle Navbar Scroll
        const navbar = document.getElementById('navbar');
        if(navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            });
        }

        // Mobile Menu
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        if(menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Verify Auth
        if (this.token) {
            await this.verifyAuth();
        }

        this.updateUI();
        this.updateCartCount();
    },

    async verifyAuth() {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                this.user = data.user;
                // Sync cart if logging in
                this.syncCart();
            } else {
                this.logout(false); // Silent logout if token expired
            }
        } catch (e) {
            console.error('Auth verification failed', e);
        }
    },

    updateUI() {
        const authBtn = document.getElementById('authUserBtn');
        const ordersBtn = document.getElementById('ordersBtn');
        const userPointsBadge = document.getElementById('userPoints');
        const pointsValue = document.getElementById('pointsValue');

        if (this.user) {
            // Logged in
            if (authBtn) {
                // If there's an icon inside, change it. Otherwise change text.
                const icon = authBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-feather', 'log-out');
                    if (window.feather) window.feather.replace();
                } else {
                    authBtn.textContent = 'Logout';
                }
                authBtn.onclick = () => this.logout();
                authBtn.title = `Logged in as ${this.user.name}`;
            }

            if (ordersBtn) ordersBtn.style.display = 'inline-block';

            if (userPointsBadge && pointsValue) {
                userPointsBadge.style.display = 'flex';
                this.animateValue(pointsValue, 0, this.user.nova_points || 0, 1000);
            }
        } else {
            // Logged out
            if (authBtn) {
                const icon = authBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-feather', 'user');
                    if (window.feather) window.feather.replace();
                } else {
                    authBtn.textContent = 'Login';
                }
                authBtn.onclick = () => window.location.href = '/auth.html';
                authBtn.title = "Login";
            }

            if (ordersBtn) ordersBtn.style.display = 'none';
            if (userPointsBadge) userPointsBadge.style.display = 'none';
        }

        // Notify other scripts that auth state is ready/updated
        if (typeof window.onAuthStateChange === 'function') {
            window.onAuthStateChange(this.user);
        }
    },

    logout(redirect = true) {
        localStorage.removeItem('token');
        this.user = null;
        this.token = null;
        if(redirect) {
            if(window.showToast) window.showToast('Logged out successfully', 'success');
            setTimeout(() => window.location.href = '/', 1000);
        }
    },

    // Utilities
    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },

    updateCartCount() {
        const cartBadge = document.getElementById('cartCount');
        if (!cartBadge) return;
        
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        cartBadge.innerText = localCart.reduce((sum, item) => sum + item.quantity, 0);
    },

    async syncCart() {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length > 0) {
            try {
                await fetch('/api/cart/sync', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ items: localCart })
                });
                localStorage.removeItem('cart'); // Clear local after sync
                this.updateCartCount(); // Fetch from DB next time
            } catch (e) {
                console.error('Failed to sync cart', e);
            }
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
