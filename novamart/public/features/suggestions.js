/**
 * Smart Cart Suggestions Component
 * Recommends items based on current cart categories.
 */
class SmartSuggestions {
    constructor() {
        this.allProducts = [];
        this.init();
    }

    async init() {
        if (!window.location.pathname.includes('cart.html')) return;

        try {
            const res = await fetch('/api/products?category=all');
            const data = await res.json();
            this.allProducts = data.products || [];
            
            this.renderSuggestions();
        } catch (e) {
            console.error("Suggestions failed to load products", e);
        }
    }

    renderSuggestions() {
        const cartContent = document.getElementById('cartContent');
        if (!cartContent) return;

        // Get categories currently in cart
        let cartItems = [];
        if (typeof App !== 'undefined' && App.user && App.user.cart) {
            cartItems = App.user.cart;
        } else {
            cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        }

        if (cartItems.length === 0) return;

        // Identify categories (mapping IDs to categories if possible, or just using category list)
        // Since we have allProducts, we can find the categories of items in the cart
        const cartProductIds = cartItems.map(i => i.product_id || i.id);
        const cartCategories = [...new Set(
            this.allProducts
                .filter(p => cartProductIds.includes(p.id))
                .map(p => p.category)
        )];

        // Filter products from these categories that are NOT in the cart
        const suggestions = this.allProducts
            .filter(p => cartCategories.includes(p.category) && !cartProductIds.includes(p.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        if (suggestions.length === 0) return;

        // Inject UI
        const suggestionSection = document.createElement('div');
        suggestionSection.className = 'cart-list-container reveal fade-up';
        suggestionSection.style.marginTop = '20px';
        suggestionSection.innerHTML = `
            <div class="cart-header">
                <h1 style="font-size: 1.2rem;">Recommended for You</h1>
                <p style="font-size: 0.85rem; color: #878787;">Based on items in your cart</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 20px;">
                ${suggestions.map(p => `
                    <div class="product-card" style="height: auto;" onclick="window.location.href='/product.html?id=${p.id}'">
                        <div class="pd-img-container" style="height: 120px;">
                            <img src="${p.image_url}" alt="${p.name}">
                        </div>
                        <div class="pd-title" style="font-size: 0.85rem;">${p.name}</div>
                        <div class="pd-price" style="font-size: 1rem;">$${p.price}</div>
                        <button class="pd-add-btn" style="display:block; font-size: 0.8rem; padding: 8px;">View Details</button>
                    </div>
                `).join('')}
            </div>
        `;

        // Insert before the footer or after the cart content
        const cartPage = document.querySelector('.cart-page');
        if (cartPage && cartPage.firstChild) {
            cartPage.insertBefore(suggestionSection, cartPage.firstChild.nextSibling);
        } else {
            cartContent.appendChild(suggestionSection);
        }

        if (window.refreshAnimations) window.refreshAnimations();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new SmartSuggestions();
});
