document.addEventListener('DOMContentLoaded', () => {
    
    const btnPlaceOrder = document.getElementById('btnPlaceOrder');
    const finalizeTotal = document.getElementById('finalizeTotal');
    const checkoutForm = document.getElementById('checkoutForm');

    const urlParams = new URLSearchParams(window.location.search);
    const buyNowId = urlParams.get('id');
    const buyNowQty = urlParams.get('qty') || 1;

    let checkoutItems = [];

    setTimeout(async () => {
        let subtotal = 0;
        if (!App.user) {
            window.showToast('Authentication required for secure checkout.', 'error');
            setTimeout(() => window.location.href = '/auth.html', 1500);
            return;
        }

        try {
            if (buyNowId) {
                // Buy Now flow
                const res = await fetch(`/api/products/${buyNowId}`);
                if (res.ok) {
                    const data = await res.json();
                    const p = data.product;
                    subtotal = p.price * buyNowQty;
                    checkoutItems = [{ product_id: p.id, quantity: parseInt(buyNowQty), price: p.price }];
                    
                    // Show message that it's a Buy Now purchase
                    const label = document.getElementById('userCheckLabel');
                    if(label) label.textContent = `Buy Now: ${p.name}`;
                }
            } else {
                // Regular cart flow
                const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${App.token}` } });
                const data = await res.json();
                checkoutItems = data.cart || [];
                checkoutItems.forEach(i => subtotal += (i.price * i.quantity));
            }
        } catch(e) {
            console.error("Checkout refresh failed", e);
        }

        if(subtotal === 0) {
            window.showToast('Nothing to checkout.', 'error');
            setTimeout(() => window.location.href = '/', 1500);
            return;
        }

        const delivery = 0; 
        const total = subtotal + delivery;
        finalizeTotal.textContent = `${total.toFixed(2)}`;
        
        const payBtnAmt = document.getElementById('btnPayAmount');
        if(payBtnAmt) payBtnAmt.textContent = total.toFixed(2);
        
        const sumSubtotal = document.getElementById('sumSubtotal');
        if(sumSubtotal) sumSubtotal.textContent = subtotal.toFixed(2);

    }, 500); 

    window.checkoutItems = () => checkoutItems; // Accessible for submit handler
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const paymentMethod = document.querySelector('input[name="payType"]:checked').value;
        const items = window.checkoutItems();

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${App.token}`
                },
                body: JSON.stringify({ 
                    address: document.getElementById('chkAddress').value,
                    paymentMethod: paymentMethod,
                    items: items // Send explicit items for the order
                })
            });

            const data = await res.json();

            if (res.ok) {
                window.showToast(`Order Placed Successfully!`, 'success');
                setTimeout(() => window.location.href = '/orders.html', 2000);
            } else {
                window.showToast(data.message || 'Transaction Failed', 'error');
                btnPlaceOrder.innerText = 'Try Again';
                btnPlaceOrder.disabled = false;
            }

        } catch (error) {
            window.showToast('Network error during processing.', 'error');
            btnPlaceOrder.innerText = 'Try Again';
            btnPlaceOrder.disabled = false;
        }
    });
});
