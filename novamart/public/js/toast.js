/*
CSS to be injected or added to main.css for Toasts
.toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; }
.toast { background: var(--bg-glass); backdrop-filter: blur(10px); padding: 15px 25px; border-radius: 8px; border-left: 4px solid var(--neon-cyan); color: white; display: flex; align-items: center; gap: 10px; transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast.show { transform: translateX(0); }
.toast.error { border-color: var(--neon-pink); }
.toast.success { border-color: #00ff00; }
*/

class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 10000; 
                display: flex; flex-direction: column; gap: 10px;
            `;
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info') {
        this.init();

        const toast = document.createElement('div');
        toast.className = `glass toast ${type}`;
        
        // Inline styles for toast base, classes handle variants in main.css
        toast.style.cssText = `
            padding: 15px 25px; border-radius: 8px; color: var(--text-primary);
            display: flex; align-items: center; gap: 10px;
            transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            font-family: var(--font-body); font-weight: 600;
        `;

        if (type === 'error') {
            toast.style.borderLeft = '4px solid var(--neon-pink)';
            toast.style.boxShadow = 'var(--shadow-pink)';
        } else if (type === 'success') {
            toast.style.borderLeft = '4px solid #00ff00';
            toast.style.boxShadow = '0 0 10px rgba(0,255,0,0.3)';
        } else {
            toast.style.borderLeft = '4px solid var(--neon-cyan)';
            toast.style.boxShadow = 'var(--shadow-cyan)';
        }

        toast.innerHTML = `<span>${message}</span>`;
        this.container.appendChild(toast);

        // Slide in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Remove after 3s
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 3000);
    }
}

window.showToast = Toast.show.bind(Toast);
