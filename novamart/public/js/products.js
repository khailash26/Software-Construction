class ProductsManager {
    constructor() {
        this.productsContainer = document.getElementById('productGrid');
        this.loadingIndicator = document.getElementById('loadingGrid');
        
        // Sorting
        this.sortSelect = document.getElementById('sortSelect');
        if(this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.sortProducts());
        }

        this.categoryButtons = document.querySelectorAll('.cat-btn');
        
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.products = [];

        this.init();
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('category');
        const searchParam = urlParams.get('search');
        
        if (catParam) this.currentCategory = catParam;
        if (searchParam) {
            this.currentSearch = searchParam;
            // Optionally populate a local search input if it exists
        }

        this.updateCategoryUI();

        // Event Listeners for Sidebar Categories
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.getAttribute('data-cat');
                this.updateCategoryUI();
                
                const url = new URL(window.location);
                url.searchParams.set('category', this.currentCategory);
                url.searchParams.delete('search'); // Clear search on category click
                this.currentSearch = '';
                window.history.pushState({}, '', url);

                this.fetchProducts();
            });
        });

        this.fetchProducts();
    }

    updateCategoryUI() {
        this.categoryButtons.forEach(btn => {
            if (btn.getAttribute('data-cat') === this.currentCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    async fetchProducts() {
        if(this.productsContainer) this.productsContainer.style.display = 'none';
        if(this.loadingIndicator) this.loadingIndicator.style.display = 'grid';

        let url = `/api/products?category=${this.currentCategory}`;
        if (this.currentSearch) {
            url += `&search=${encodeURIComponent(this.currentSearch)}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();
            this.products = data.products || [];
            
            // Default sort if needed
            this.sortProducts(false); // don't render yet
            
            this.renderProducts();
        } catch (error) {
            console.error('Failed to fetch products', error);
            window.showToast('Error loading products.', 'error');
        } finally {
            if(this.loadingIndicator) this.loadingIndicator.style.display = 'none';
            if(this.productsContainer) this.productsContainer.style.display = 'grid';
        }
    }

    sortProducts(render = true) {
        if(!this.sortSelect) return;
        const val = this.sortSelect.value;
        
        if(val === 'low') {
            this.products.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (val === 'high') {
            this.products.sort((a,b) => parseFloat(b.price) - parseFloat(a.price));
        } else {
            // default popularity, assuming rating or ID
            this.products.sort((a,b) => b.rating - a.rating);
        }
        if(render) this.renderProducts();
    }

    renderProducts() {
        if(!this.productsContainer) return;
        
        this.productsContainer.innerHTML = '';
        
        const countSpan = document.getElementById('resultCount');
        if(countSpan) countSpan.textContent = `(Showing ${this.products.length} results)`;

        if (this.products.length === 0) {
            this.productsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background:#fff; border-radius:4px; box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                    <i data-feather="search" style="width: 48px; height: 48px; color: #ccc; margin-bottom:20px;"></i>
                    <h3>No products found</h3>
                    <p style="color:#878787;">Try adjusting your filters or search terms.</p>
                </div>
            `;
            if(window.feather) window.feather.replace();
            return;
        }

        this.products.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card reveal fade-up card-hover'; 
            
            card.onclick = (e) => {
                if(!e.target.closest('button')) {
                    window.location.href = `/product.html?id=${product.id}`;
                }
            };

            // Format price
            const price = Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 });

            card.innerHTML = `
                <div class="pd-img-container">
                    <img src="${product.image_url}" alt="${product.name}">
                </div>
                <h3 class="pd-title">${product.name}</h3>
                <div class="pd-rating">
                    <span>${product.rating} ★</span> (1,234)
                </div>
                <div class="pd-price">$${price}</div>
                <button class="pd-add-btn" onclick="addToCart(event, ${product.id}, '${product.name.replace(/'/g, "\\'")}')">
                    Add to Cart
                </button>
            `;
            this.productsContainer.appendChild(card);
        });

        // Trigger the animation observer to pick up new elements
        if (typeof initScrollAnimations === 'function') initScrollAnimations();

        if(window.feather) window.feather.replace();
    }
}

// Global Cart Function (called from card)
async function addToCart(event, productId, name) {
    if(event) event.stopPropagation(); 
    
    if (App.user) {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${App.token}`
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            if (res.ok) {
                window.showToast(`${name} added to cart.`, 'success');
                // Trigger cart count fetch from App if available
                if(App.fetchCartCount) App.fetchCartCount();
            } else {
                window.showToast('Authentication error.', 'error');
            }
        } catch (e) {
            window.showToast('Network error.', 'error');
        }
    } else {
        // Guest
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(i => i.product_id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ product_id: productId, quantity: 1, name: name });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        App.updateCartCount();
        window.showToast(`${name} added to cart.`, 'success');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new ProductsManager();
});
