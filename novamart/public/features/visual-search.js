/**
 * Visual Search Component
 * Simulates product matching via image upload.
 */
class VisualSearch {
    constructor() {
        this.modal = null;
        this.products = [];
        this.init();
    }

    async init() {
        this.renderUI();
        this.injectIcon();
        
        try {
            const res = await fetch('/api/products?category=all');
            const data = await res.json();
            this.products = data.products || [];
        } catch (e) {
            console.error("Visual Search failed to load products", e);
        }

        this.setupEventListeners();
    }

    injectIcon() {
        // Inject into search bars across the site
        const searchContainers = document.querySelectorAll('.nav-search');
        searchContainers.forEach(container => {
            const btn = document.createElement('button');
            btn.className = 'vs-icon-btn';
            btn.type = 'button';
            btn.title = 'Search by image';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            `;
            btn.onclick = (e) => {
                e.preventDefault();
                this.openModal();
            };
            container.appendChild(btn);
        });
    }

    renderUI() {
        this.modal = document.createElement('div');
        this.modal.className = 'vs-modal';
        this.modal.innerHTML = `
            <div class="vs-content">
                <button class="vs-close" style="position:absolute; right:20px; top:15px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                <h2 style="margin-top:0;">Visual Search</h2>
                <p style="color:#666;">Upload an image to find similar products in NovaMart.</p>
                
                <div class="vs-drop-zone" id="vsDropZone">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ccc" stroke-width="1" fill="none" style="margin-bottom:10px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <p>Drag & Drop or Click to Upload</p>
                    <input type="file" id="vsInput" hidden accept="image/*">
                </div>

                <div class="vs-loader" id="vsLoader"></div>

                <div class="vs-results" id="vsResults">
                    <h3 style="font-size:1rem; border-top:1px solid #eee; padding-top:15px;">Matched Products</h3>
                    <div class="vs-grid" id="vsGrid"></div>
                    <button class="action-btn" style="margin-top:20px; background:#eee; color:#333;" id="vsReset">Try Another</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    setupEventListeners() {
        const dropZone = document.getElementById('vsDropZone');
        const input = document.getElementById('vsInput');
        const closeBtn = this.modal.querySelector('.vs-close');
        const resetBtn = document.getElementById('vsReset');

        dropZone.onclick = () => input.click();

        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                this.handleUpload(e.target.files[0]);
            }
        };

        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        };

        dropZone.ondragleave = () => dropZone.classList.remove('dragover');

        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleUpload(e.dataTransfer.files[0]);
            }
        };

        closeBtn.onclick = () => this.closeModal();
        resetBtn.onclick = () => this.reset();

        // Close on outside click
        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.closeModal();
        };
    }

    openModal() {
        this.modal.style.display = 'flex';
        this.reset();
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    reset() {
        document.getElementById('vsDropZone').style.display = 'block';
        document.getElementById('vsResults').style.display = 'none';
        document.getElementById('vsLoader').style.display = 'none';
    }

    handleUpload(file) {
        document.getElementById('vsDropZone').style.display = 'none';
        document.getElementById('vsLoader').style.display = 'block';

        // Simulate AI analysis time
        setTimeout(() => {
            document.getElementById('vsLoader').style.display = 'none';
            this.showResults(file.name);
        }, 1500);
    }

    showResults(filename) {
        const resultsEl = document.getElementById('vsResults');
        const grid = document.getElementById('vsGrid');
        grid.innerHTML = '';

        // Simulate matching based on filename keywords or random category
        const fname = filename.toLowerCase();
        let matched = [];

        if (fname.includes('shoe') || fname.includes('footwear')) {
            matched = this.products.filter(p => p.category === 'fashion').slice(0, 4);
        } else if (fname.includes('phone') || fname.includes('electro') || fname.includes('gadget')) {
            matched = this.products.filter(p => p.category === 'electronics').slice(0, 4);
        } else {
            // Random matching for demo
            const categories = ['electronics', 'fashion', 'home', 'appliances'];
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            matched = this.products.filter(p => p.category === randomCat).slice(0, 4);
        }

        matched.forEach(p => {
            const item = document.createElement('div');
            item.className = 'mini-card';
            item.style.minWidth = 'auto'; // override assistant style
            item.innerHTML = `
                <img src="${p.image_url}" alt="${p.name}" style="height:80px;">
                <div style="font-weight:600; margin-top:5px;">${p.name}</div>
                <div style="color:var(--primary-color);">$${p.price}</div>
            `;
            item.onclick = () => window.location.href = `/product.html?id=${p.id}`;
            grid.appendChild(item);
        });

        resultsEl.style.display = 'block';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new VisualSearch();
});
