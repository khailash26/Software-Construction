/**
 * Gamified Discount System (Spin Wheel)
 * Allows users to spin for a discount code.
 */
class GamifiedRewards {
    constructor() {
        this.rewards = [
            { label: '10% OFF', code: 'NOVA10', value: 0.1 },
            { label: '20% OFF', code: 'SAVE20', value: 0.2 },
            { label: 'FREE SHIP', code: 'SHIPFREE', value: 0 },
            { label: '5% OFF', code: 'EXTRA5', value: 0.05 },
            { label: '15% OFF', code: 'LUCKY15', value: 0.15 },
            { label: 'BETTER LUCK', code: 'NONE', value: 0 }
        ];
        this.isSpinning = false;
        this.hasSpun = false;
        this.modal = null;
        this.init();
    }

    init() {
        this.renderUI();
        this.setupEventListeners();
        
        // Show automatically on Cart page if not spun yet
        if (window.location.pathname.includes('cart.html')) {
            setTimeout(() => {
                if (!localStorage.getItem('nova_coupon')) {
                    this.openModal();
                }
            }, 3000);
        }
    }

    renderUI() {
        this.modal = document.createElement('div');
        this.modal.className = 'vs-modal gamified-modal';
        this.modal.innerHTML = `
            <div class="vs-content" style="max-width: 400px;">
                <button class="vs-close" style="position:absolute; right:20px; top:15px; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                <h2 style="margin-bottom:10px;">Lucky Spin! 🎡</h2>
                <p>Spin the wheel to win exclusive discount coupons for your order!</p>
                
                <div class="wheel-container">
                    <div class="wheel-pointer"></div>
                    <div class="wheel" id="mainWheel">
                        <div class="wheel-inner">
                            ${this.rewards.map(r => `<div class="wheel-segment"><span>${r.label}</span></div>`).join('')}
                        </div>
                    </div>
                </div>

                <button class="action-btn orange" id="spinBtn" style="width:100%; padding:15px; font-weight:bold;">SPIN NOW</button>

                <div class="coupon-display" id="couponDisplay">
                    <h3>Congratulations! 🎉</h3>
                    <p>Use this code at checkout:</p>
                    <div class="coupon-code" id="couponCode">NOVA10</div>
                    <button class="action-btn" style="background:#2f3542; color:white;" id="copyCoupon">Copy & Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    setupEventListeners() {
        const spinBtn = document.getElementById('spinBtn');
        const wheel = document.getElementById('mainWheel');
        const closeBtn = this.modal.querySelector('.vs-close');
        const copyBtn = document.getElementById('copyCoupon');

        spinBtn.onclick = () => {
            if (this.isSpinning || this.hasSpun) return;
            this.spin();
        };

        closeBtn.onclick = () => this.closeModal();
        
        copyBtn.onclick = () => {
            const code = document.getElementById('couponCode').textContent;
            navigator.clipboard.writeText(code);
            localStorage.setItem('nova_coupon', code);
            if (window.showToast) window.showToast("Coupon copied to clipboard!", "success");
            this.closeModal();
        };
    }

    openModal() {
        this.modal.style.display = 'flex';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    spin() {
        this.isSpinning = true;
        const wheel = document.getElementById('mainWheel');
        const spinBtn = document.getElementById('spinBtn');
        
        // Randomly select a reward
        const randomIndex = Math.floor(Math.random() * this.rewards.length);
        const prize = this.rewards[randomIndex];
        
        // Calculate degree
        // Each segment is 60deg. 
        // 0: 0-60, 1: 60-120...
        const segmentDeg = 360 / this.rewards.length;
        const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
        const finalDeg = (extraSpins * 360) + (360 - (randomIndex * segmentDeg) - (segmentDeg/2));

        wheel.style.transform = `rotate(${finalDeg}deg)`;
        spinBtn.disabled = true;
        spinBtn.style.opacity = '0.5';

        setTimeout(() => {
            this.isSpinning = false;
            this.hasSpun = true;
            this.showPrize(prize);
        }, 4000);
    }

    showPrize(prize) {
        const display = document.getElementById('couponDisplay');
        const spinBtn = document.getElementById('spinBtn');
        const codeEl = document.getElementById('couponCode');

        spinBtn.style.display = 'none';
        
        if (prize.code === 'NONE') {
            display.querySelector('h3').textContent = "Aww! 🥺";
            display.querySelector('p').textContent = "Better luck next time. You still get our best prices!";
            codeEl.style.display = 'none';
        } else {
            codeEl.textContent = prize.code;
        }

        display.style.display = 'block';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new GamifiedRewards();
});
