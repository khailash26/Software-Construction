/**
 * AI Product Assistant Component
 * Provides a conversational interface for product discovery.
 */
class NovaAssistant {
    constructor() {
        this.isOpen = false;
        this.products = [];
        this.container = null;
        this.init();
    }

    async init() {
        // Create UI Elements
        this.renderUI();
        
        // Load initial products from API to have a local "knowledge base"
        try {
            const res = await fetch('/api/products?category=all');
            const data = await res.json();
            this.products = data.products || [];
        } catch (e) {
            console.error("Assistant failed to load products", e);
        }

        // Event Listeners
        this.setupEventListeners();
    }

    renderUI() {
        this.container = document.createElement('div');
        this.container.id = 'nova-assistant';
        this.container.innerHTML = `
            <div class="assistant-window" id="assistantWindow">
                <div class="assistant-header">
                    <h3>Nova AI Assistant</h3>
                    <button id="closeAssistant" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">&times;</button>
                </div>
                <div class="assistant-messages" id="assistantMessages">
                    <div class="msg ai">Hello! I'm your NovaMart assistant. Ask me anything like "Laptops under $1000" or "Show me red shoes".</div>
                </div>
                <form class="assistant-input" id="assistantForm">
                    <input type="text" id="assistantInput" placeholder="How can I help you?">
                    <button type="submit">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
            <div class="assistant-bubble" id="assistantBubble">
                <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
        `;
        document.body.appendChild(this.container);
    }

    setupEventListeners() {
        const bubble = document.getElementById('assistantBubble');
        const windowEl = document.getElementById('assistantWindow');
        const closeBtn = document.getElementById('closeAssistant');
        const form = document.getElementById('assistantForm');
        const input = document.getElementById('assistantInput');

        bubble.onclick = () => {
            this.isOpen = !this.isOpen;
            windowEl.style.display = this.isOpen ? 'flex' : 'none';
        };

        closeBtn.onclick = () => {
            this.isOpen = false;
            windowEl.style.display = 'none';
        };

        form.onsubmit = (e) => {
            e.preventDefault();
            const query = input.value.trim();
            if (query) {
                this.handleUserMessage(query);
                input.value = '';
            }
        };
    }

    addMessage(text, type = 'ai', products = []) {
        const msgContainer = document.getElementById('assistantMessages');
        const msgEl = document.createElement('div');
        msgEl.className = `msg ${type}`;
        msgEl.textContent = text;
        
        if (products.length > 0) {
            const prodContainer = document.createElement('div');
            prodContainer.className = 'ai-product-suggestions';
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'mini-card';
                card.innerHTML = `
                    <img src="${p.image_url}" alt="${p.name}">
                    <div>${p.name}</div>
                    <span style="color:#388e3c; font-weight:bold;">$${p.price}</span>
                `;
                card.onclick = () => window.location.href = `/product.html?id=${p.id}`;
                prodContainer.appendChild(card);
            });
            msgEl.appendChild(prodContainer);
        }

        msgContainer.appendChild(msgEl);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    handleUserMessage(query) {
        this.addMessage(query, 'user');
        
        // Simulate AI "processing"
        setTimeout(() => {
            const results = this.filterProducts(query);
            if (results.length > 0) {
                this.addMessage(`I found ${results.length} products that might interest you:`, 'ai', results);
            } else {
                this.addMessage("I couldn't find exactly what you're looking for. Try a different term or category?", 'ai');
            }
        }, 500);
    }

    filterProducts(query) {
        const q = query.toLowerCase();
        
        // Extract price if any (e.g., "under 500")
        const priceMatch = q.match(/under\s*\$?(\d+)/) || q.match(/below\s*\$?(\d+)/);
        const maxPrice = priceMatch ? parseInt(priceMatch[1]) : Infinity;

        return this.products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(q.replace(/under.*|below.*/, '').trim());
            const descMatch = p.description.toLowerCase().includes(q.replace(/under.*|below.*/, '').trim());
            const catMatch = p.category.toLowerCase().includes(q.replace(/under.*|below.*/, '').trim());
            const priceOk = parseFloat(p.price) <= maxPrice;

            // Simple keyword matching
            const keywords = q.split(' ');
            const kwMatch = keywords.some(kw => 
                kw.length > 3 && (p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw))
            );

            return (nameMatch || descMatch || catMatch || kwMatch) && priceOk;
        }).slice(0, 4); // Show top 4
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new NovaAssistant();
});
