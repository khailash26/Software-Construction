document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = '/products.html';
        return;
    }

    let currentProduct = null;

    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        currentProduct = data.product;

        const loadingView = document.getElementById('loadingView');
        if(loadingView) loadingView.style.display = 'none';
        
        document.getElementById('pdImage').src = currentProduct.image_url;
        
        const catEl = document.getElementById('bcCategory');
        if(catEl) catEl.textContent = currentProduct.category.charAt(0).toUpperCase() + currentProduct.category.slice(1);
        
        const bcName = document.getElementById('bcName');
        if(bcName) bcName.textContent = currentProduct.name;
        
        const titleEl = document.getElementById('pdTitle');
        if(titleEl) titleEl.textContent = currentProduct.name;
        
        const priceNum = Number(currentProduct.price);
        document.getElementById('pdPrice').textContent = priceNum.toLocaleString('en-US', {minimumFractionDigits:2});
        document.getElementById('pdPriceAction').textContent = priceNum.toLocaleString('en-US', {minimumFractionDigits:2});
        
        const mrpEl = document.getElementById('pdMrp');
        if(mrpEl) mrpEl.textContent = (priceNum * 1.2).toLocaleString('en-US', {minimumFractionDigits:2});
        
        const ratingEl = document.getElementById('pdRatingVal');
        if(ratingEl) ratingEl.textContent = currentProduct.rating;
        
        const stockEl = document.getElementById('pdStock');
        const btnCart = document.getElementById('btnAddCart');
        const btnBuy = document.getElementById('btnBuyNow');

        if (currentProduct.stock <= 0) {
            stockEl.className = 'stock-status out';
            stockEl.textContent = `Currently unavailable.`;
            if(btnCart) { btnCart.disabled = true; btnCart.style.opacity = '0.5'; }
            if(btnBuy) { btnBuy.disabled = true; btnBuy.style.opacity = '0.5'; }
        } else if (currentProduct.stock < 10) {
            stockEl.className = 'stock-status low';
            stockEl.textContent = `Only ${currentProduct.stock} left in stock - order soon.`;
        } else {
            stockEl.className = 'stock-status';
            stockEl.textContent = `In Stock`;
        }

        const descEl = document.getElementById('pdDesc');
        if(descEl) descEl.textContent = currentProduct.description;

        const view = document.getElementById('productView');
        if(view) view.style.display = 'block';

        if(window.refreshAnimations) window.refreshAnimations();

        if(window.feather) window.feather.replace();

        if(btnCart) {
            btnCart.onclick = async () => {
                const qtyVal = document.getElementById('pdQty');
                const qty = qtyVal ? parseInt(qtyVal.value) : 1;
                
                if (App.user) {
                    try {
                        const r = await fetch('/api/cart', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${App.token}`
                            },
                            body: JSON.stringify({ productId: currentProduct.id, quantity: qty })
                        });
                        if (r.ok) {
                            window.showToast(`Added to Cart`, 'success');
                            if(App.updateCartCount) App.updateCartCount(); // Needs server fetch ideally
                        } else {
                            window.showToast('Please sign in again.', 'error');
                        }
                    } catch (e) {
                        window.showToast('Network error.', 'error');
                    }
                } else {
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const exist = cart.find(i => i.product_id === currentProduct.id);
                    if (exist) {
                         exist.quantity += qty;
                    } else {
                         cart.push({ product_id: currentProduct.id, quantity: qty, name: currentProduct.name });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    App.updateCartCount();
                    window.showToast(`Added to Cart`, 'success');
                }
            };
        }

        if(btnBuy) {
            btnBuy.onclick = () => {
                const qtyVal = document.getElementById('pdQty');
                const qty = qtyVal ? parseInt(qtyVal.value) : 1;
                window.location.href = `/checkout.html?id=${productId}&qty=${qty}`;
            };
        }

        // --- Reviews Logic ---
        const reviewForm = document.getElementById('reviewForm');
        const reviewAuthMsg = document.getElementById('review-auth-msg');
        
        // Use a callback to handle auth state changes (from app.js)
        window.onAuthStateChange = (user) => {
            if (user) {
                reviewForm.style.display = 'block';
                reviewAuthMsg.style.display = 'none';
            } else {
                reviewForm.style.display = 'none';
                reviewAuthMsg.style.display = 'block';
            }
        };

        // Initial check in case App already initialized
        if (App.user) {
            window.onAuthStateChange(App.user);
        }

        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = document.getElementById('reviewRating').value;
            const comment = document.getElementById('reviewText').value;
            const respDiv = document.getElementById('review-resp');

            try {
                respDiv.textContent = 'Submitting...';
                respDiv.style.color = '#333';
                const r = await fetch(`/api/products/${productId}/reviews`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${App.token}`
                    },
                    body: JSON.stringify({ rating: parseInt(rating), comment })
                });

                const data = await r.json();
                if (r.ok) {
                    respDiv.textContent = 'Review submitted successfully!';
                    respDiv.style.color = 'green';
                    reviewForm.reset();
                    loadReviews(); // Refresh reviews list
                } else {
                    respDiv.textContent = data.message || 'Error submitting review';
                    respDiv.style.color = 'red';
                }
            } catch (err) {
                respDiv.textContent = 'Network error during submission';
                respDiv.style.color = 'red';
            }
        });

        async function loadReviews() {
            const reviewsList = document.getElementById('reviewsList');
            try {
                const r = await fetch(`/api/products/${productId}/reviews`);
                if (!r.ok) throw new Error('Failed to fetch reviews');
                const data = await r.json();
                
                if (data.reviews && data.reviews.length > 0) {
                    let html = '';
                    data.reviews.forEach(rv => {
                        const stars = '★'.repeat(rv.rating) + '☆'.repeat(5 - rv.rating);
                        const date = new Date(rv.created_at).toLocaleDateString();
                        html += `
                            <div style="margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                                    <div style="width:30px; height:30px; border-radius:50%; background:#e0e0e0; display:flex; justify-content:center; align-items:center; font-weight:bold; color:#555;">
                                        ${rv.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <strong>${rv.user_name}</strong>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                                    <span style="color:#ffa41c; font-size:1.1rem; letter-spacing:2px;">${stars}</span>
                                    <span style="color:#878787; font-size:0.85rem;">Reviewed on ${date}</span>
                                </div>
                                <p style="font-size:0.95rem; line-height:1.5; color:#333; white-space:pre-wrap;">${rv.comment || ''}</p>
                            </div>
                        `;
                    });
                    reviewsList.innerHTML = html;
                } else {
                    reviewsList.innerHTML = '<p style="color:#878787; font-style:italic;">No customer reviews yet. Be the first to review this product!</p>';
                }
            } catch (err) {
                reviewsList.innerHTML = '<p style="color:red;">Failed to load reviews.</p>';
            }
        }

        loadReviews();

    } catch (err) {
        window.showToast('Unable to locate product.', 'error');
        setTimeout(() => window.location.href = '/products.html', 2000);
    }
});
