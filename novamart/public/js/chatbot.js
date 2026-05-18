// Professional Customer Support Chatbot Logic
document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Styles for the new chatbot UI
    const chatStyle = document.createElement('style');
    chatStyle.textContent = `
        #chatbot-widget {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            font-family: var(--font-main);
        }
        #chat-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.2s, background 0.2s;
        }
        #chat-btn:hover {
            transform: scale(1.05);
            background: #0056d2;
        }
        #chat-window {
            display: none;
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 450px;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            border: 1px solid #e0e0e0;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #chat-header {
            background: var(--primary-color);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
        }
        #chat-close {
            background: none; border: none; color: white; cursor: pointer;
        }

        #chat-body {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .chat-msg {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        .msg-bot {
            background: #e0e0e0;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            color: #212121;
        }
        .msg-user {
            background: var(--primary-color);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        #chat-footer {
            padding: 15px;
            background: #fff;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        #chat-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #d4d5d9;
            border-radius: 20px;
            outline: none;
            font-size: 0.95rem;
        }
        #chat-input:focus { border-color: var(--primary-color); }
        #chat-send {
            background: var(--primary-color);
            color: white;
            border: none;
            width: 40px; height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex; justify-content: center; align-items: center;
        }
        @media (max-width: 480px) {
            #chatbot-widget { bottom: 20px; right: 20px; }
            #chat-window { width: calc(100vw - 40px); height: 400px; }
        }
    `;
    document.head.appendChild(chatStyle);

    // Inject HTML
    const container = document.createElement('div');
    container.id = 'chatbot-widget';
    container.innerHTML = `
        <div id="chat-window">
            <div id="chat-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:8px; height:8px; background:#00ff00; border-radius:50%;"></div>
                    Customer Support
                </div>
                <button id="chat-close"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div id="chat-body">
                <div class="chat-msg msg-bot">Hello! I'm the NovaMart virtual assistant. How can I help you with your shopping today?</div>
            </div>
            <div id="chat-footer">
                <input type="text" id="chat-input" placeholder="Type a message...">
                <button id="chat-send"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
            </div>
        </div>
        <button id="chat-btn">
            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
    `;
    document.body.appendChild(container);

    // Interactions
    const btn = document.getElementById('chat-btn');
    const win = document.getElementById('chat-window');
    const close = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const body = document.getElementById('chat-body');

    let isOpen = false;

    btn.onclick = () => {
        isOpen = !isOpen;
        win.style.display = isOpen ? 'flex' : 'none';
        if(isOpen) input.focus();
    };

    close.onclick = () => {
        isOpen = false;
        win.style.display = 'none';
    };

    function appendMsg(text, sender) {
        const msg = document.createElement('div');
        msg.className = `chat-msg msg-${sender}`;
        msg.textContent = text;
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
    }

    function handleSend() {
        const text = input.value.trim();
        if(!text) return;
        
        appendMsg(text, 'user');
        input.value = '';

        // Simulate Support AI logic (Professional retail responses)
        setTimeout(() => {
            const lower = text.toLowerCase();
            let reply = "I'm sorry, I'm just a virtual assistant and our live agents are currently busy. Could you please check the product description for more details, or let me know if you need help with tracking, returns, or shipping?";
            
            if(lower.includes('order') || lower.includes('track') || lower.includes('where')) {
                reply = "You can track your orders by visiting the 'Orders' section from the top navigation menubar once you are logged in.";
            } else if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
                reply = "We offer a 7-day replacement policy on most electronics and appliances. Please review the item details for specific return windows.";
            } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
                reply = "Hello! Welcome to NovaMart support. Are you looking for any specific deals today?";
            } else if (lower.includes('price') || lower.includes('discount') || lower.includes('sale')) {
                reply = "We are currently running the Big Savings Sale with up to 70% off. Check our homepage for the Deal of the Day!";
            } else if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('ship')) {
                reply = "We provide free 2-day delivery on eligible orders over $50. Standard shipping applies otherwise.";
            } else if (lower.includes('payment') || lower.includes('card') || lower.includes('pay')) {
                reply = "We accept all major credit cards, PayPal, and NovaMart Store Credit. Checkout is 100% secure.";
            } else if (lower.includes('account') || lower.includes('login') || lower.includes('password')) {
                reply = "You can manage your account and reset your password by going to the Login section at the top right.";
            } else if (lower.includes('contact') || lower.includes('call') || lower.includes('agent')) {
                reply = "You can contact our live human support team at 1-800-NOVAMART between 9 AM and 8 PM EST.";
            } else if (lower.includes('review') || lower.includes('rating') || lower.includes('feedback')) {
                reply = "We appreciate your feedback! You can leave a review by going to the product page and scrolling down.";
            }

            appendMsg(reply, 'bot');
        }, 800);
    }

    send.onclick = handleSend;
    input.onkeypress = (e) => {
        if(e.key === 'Enter') handleSend();
    };
});
