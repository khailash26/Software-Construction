const db = require('../db');
const auth = require('./auth');

async function getCart(req, res) {
    try {
        const user = await auth.getUserFromRequest(req);
        if (!user) return res.json(401, { message: 'Unauthorized' });

        const query = `
            SELECT c.id as cart_item_id, c.quantity, p.* 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `;
        const [rows] = await db.query(query, [user.id]);
        
        res.json(200, { cart: rows });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error fetching cart' });
    }
}

async function addToCart(req, res) {
    try {
        const user = await auth.getUserFromRequest(req);
        if (!user) return res.json(401, { message: 'Unauthorized' });

        const { productId, quantity = 1 } = req.body;
        if (!productId) return res.json(400, { message: 'Product ID required' });

        // Check if exists
        const [existing] = await db.query('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', [user.id, productId]);
        
        if (existing.length > 0) {
            // Update quantity
            await db.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            // Insert new
            await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user.id, productId, quantity]);
        }

        res.json(200, { message: 'Added to cart' });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error adding to cart' });
    }
}

async function removeFromCart(req, res) {
    try {
        const user = await auth.getUserFromRequest(req);
        if (!user) return res.json(401, { message: 'Unauthorized' });

        const productId = req.params.id; // It's actually product_id from route
        await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [user.id, productId]);
        
        res.json(200, { message: 'Removed from cart' });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error removing from cart' });
    }
}

// Sync local storage cart to DB upon login
async function syncCart(req, res) {
    try {
        const user = await auth.getUserFromRequest(req);
        if (!user) return res.json(401, { message: 'Unauthorized' });

        const { items } = req.body; // Array of { productId, quantity }
        if (items && items.length > 0) {
            for (const item of items) {
                 const [existing] = await db.query('SELECT id FROM cart WHERE user_id = ? AND product_id = ?', [user.id, item.product_id]);
                 if (existing.length === 0) {
                     await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user.id, item.product_id, item.quantity]);
                 }
            }
        }
        res.json(200, { message: 'Cart synchronized' });
    } catch (error) {
         console.error(error);
         res.json(500, { message: 'Error syncing cart' });
    }
}

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    syncCart
};
