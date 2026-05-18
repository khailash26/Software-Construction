class CartManager {
    constructor() {
        this.cartListItems = document.getElementById('cartListItems');
        this.cartContent = document.getElementById('cartContent');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.checkoutBtnMob = document.getElementById('placeOrderBtnMob');
        
        this.items = [];
        this.init();
    }

    async init() {
        setTimeout(async () => {
            if (App.user) {
                await this.fetchServerCart();
            } else {
                this.loadLocalCart();
            }
        }, 300);
    }

    async fetchServerCart() {
        try {
            const res = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${App.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                this.items = data.cart || [];
                // map server format
                this.items = this.items.map(i => ({
                    cart_item_id: i.cart_item_id,
                    product_id: i.id,
                    name: i.name,
                    price: i.price,
                    image_url: i.image_url,
                    quantity: i.quantity
                }));
                this.render();
            } else {
                window.showToast('Failed to load secure cart', 'error');
            }
        } catch (e) {
            console.error('Cart fetch err', e);
        }
    }

    async loadLocalCart() {
        const localItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (localItems.length === 0) {
            this.items = [];
            this.render();
            return;
        }

        if(this.loadingIndicator) this.loadingIndicator.style.display = 'block';
        if(this.cartContent) this.cartContent.style.display = 'none';

        try {
            const res = await fetch('/api/products?category=all');
            const data = await res.json();
            const allProducts = data.products || [];

            this.items = localItems.map(local => {
                const fullInfo = allProducts.find(p => p.id == local.product_id);
                if (fullInfo) {
                    return {
                        product_id: fullInfo.id,
                        name: fullInfo.name,
                        price: fullInfo.price,
                        image_url: fullInfo.image_url,
                        quantity: local.quantity
                    };
                }
                return null;
            }).filter(i => i !== null);

            this.render();
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        if(this.loadingIndicator) this.loadingIndicator.style.display = 'none';
        if(this.cartContent) this.cartContent.style.display = 'grid';

        if (this.items.length === 0) {
            if(this.cartListItems) {
                this.cartListItems.innerHTML = `
                    <div class="empty-state">
                        <img src="https://m.media-amazon.com/images/G/01/cart/empty/kettle-desaturated._CB445243794_.svg" style="width:200px; margin-bottom:20px; opacity:0.8;">
                        <h2>Your NovaMart Cart is empty</h2>
                        <a href="/products.html" style="color:var(--primary-color); font-weight:500;">Shop today's deals</a>
                    </div>
                `;
            }
            if(this.checkoutBtn) {
                this.checkoutBtn.style.opacity = '0.5';
                this.checkoutBtn.style.pointerEvents = 'none';
            }
            if(this.checkoutBtnMob) {
                this.checkoutBtnMob.style.opacity = '0.5';
                this.checkoutBtnMob.style.pointerEvents = 'none';
            }
            this.updateSummary(0);
            return;
        }

        if(this.checkoutBtn) {
            this.checkoutBtn.style.opacity = '1';
            this.checkoutBtn.style.pointerEvents = 'auto';
        }
        if(this.checkoutBtnMob) {
            this.checkoutBtnMob.style.opacity = '1';
            this.checkoutBtnMob.style.pointerEvents = 'auto';
        }

        let html = '';
        let subtotal = 0;

        document.getElementById('sumItems').textContent = this.items.length;

        this.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            html += `
                <div class="cart-item reveal fade-up">
                    <img src="${item.image_url}" class="cart-img" alt="${item.name.replace(/"/g, '')}">
                    <div class="cart-info">
                        <div class="cart-title">${item.name}</div>
                        <span class="cart-stock">In Stock</span>
                        <div class="cart-price">$${Number(item.price).toLocaleString('en-US', {minimumFractionDigits:2})}</div>
                        
                        <div class="cart-controls">
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="cartManager.changeQty(${item.product_id}, ${item.cart_item_id || 'null'}, -1)">-</button>
                                <input type="number" class="qty-input" value="${item.quantity}" readonly>
                                <button class="qty-btn" onclick="cartManager.changeQty(${item.product_id}, ${item.cart_item_id || 'null'}, 1)">+</button>
                            </div>
                            <button class="remove-link" onclick="cartManager.removeItem(${item.product_id}, ${item.cart_item_id || 'null'})">Delete</button>
                            <span style="color:#d5d9d9;">|</span>
                            <button class="remove-link" onclick="window.location.href='/products.html'">Save for later</button>
                        </div>
                    </div>
                </div>
            `;
        });

        if(this.cartListItems) this.cartListItems.innerHTML = html;
        this.updateSummary(subtotal);
        if(typeof initScrollAnimations === 'function') initScrollAnimations();
        if(window.feather) window.feather.replace();
    }

    updateSummary(subtotal) {
        const subEl = document.getElementById('sumSubtotal');
        if(subEl) subEl.textContent = subtotal.toLocaleString('en-US', {minimumFractionDigits:2});
        
        const totalEl = document.getElementById('sumTotal');
        if(totalEl) totalEl.textContent = subtotal.toLocaleString('en-US', {minimumFractionDigits:2});
        
        const saveEl = document.getElementById('sumDiscount');
        if(saveEl && subtotal > 0) saveEl.textContent = (subtotal * 0.1).toLocaleString('en-US', {minimumFractionDigits:2});
        
        const saveTextEl = document.getElementById('saveAmount');
        if(saveTextEl && subtotal > 0) saveTextEl.textContent = (subtotal * 0.1).toLocaleString('en-US', {minimumFractionDigits:2});
    }

    async changeQty(productId, cartItemId, change) {
        if (App.user) {
            window.showToast('Please remove item and add again for specific quantities.', 'info');
        } else {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const exist = cart.find(i => i.product_id === productId);
            if (exist) {
                exist.quantity += change;
                if(exist.quantity < 1) exist.quantity = 1;
                localStorage.setItem('cart', JSON.stringify(cart));
            }
            this.loadLocalCart();
        }
        App.updateCartCount();
    }

    async removeItem(productId, cartItemId) {
        if (App.user) {
            try {
                await fetch(`/api/cart/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${App.token}` }
                });
                window.showToast('Item deleted from cart', 'success');
                this.fetchServerCart();
            } catch (e) {
                console.error(e);
            }
        } else {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart = cart.filter(i => i.product_id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            window.showToast('Item removed', 'success');
            this.loadLocalCart();
        }
        App.updateCartCount();
    }
}

// Global scope
let cartManager;
window.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});
