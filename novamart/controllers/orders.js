const db = require('../db');
const auth = require('./auth');

async function createOrder(req, res) {
    try {
        const user = await auth.getUserFromRequest(req);
        if (!user) return res.json(401, { message: 'Unauthorized' });

        const { address, paymentMethod, items } = req.body;
        let orderItems = items;

        // If no items provided, fetch from cart (Cart Checkout)
        if (!orderItems || orderItems.length === 0) {
            const [cartRows] = await db.query(`
                SELECT c.product_id, c.quantity, p.price, p.stock 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?
            `, [user.id]);
            orderItems = cartRows;
        }

        if (!orderItems || orderItems.length === 0) {
            return res.json(400, { message: 'No items to order' });
        }

        // Calculate total and points
        let totalPrice = 0;
        orderItems.forEach(item => {
            totalPrice += Number(item.price) * item.quantity;
        });

        const pointsEarned = Math.floor(totalPrice / 10); // 1 point per $10

        // Create Order
        const status = (paymentMethod === 'pod') ? 'pending' : 'completed';

        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_price, points_earned, status, payment_method) VALUES (?, ?, ?, ?, ?)',
            [user.id, totalPrice, pointsEarned, status, paymentMethod || 'card']
        );
        const orderId = orderResult.insertId;

        // Insert Order Items and Update Stock
        for (const item of orderItems) {
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await db.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear Cart ONLY if checking out entire cart
        if (!items || items.length === 0) {
            await db.query('DELETE FROM cart WHERE user_id = ?', [user.id]);
        }

        // Update User Points
        await db.query('UPDATE users SET nova_points = nova_points + ? WHERE id = ?', [pointsEarned, user.id]);

        res.json(201, { 
            message: 'Order placed successfully', 
            orderId,
            pointsEarned,
            totalPrice
        });

    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error placing order' });
    }
}

async function getOrders(req, res) {
    try {
        const user = await auth.getUserFromRequest(req);
        if (!user) return res.json(401, { message: 'Unauthorized' });

        const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
        
        // Fetch items for each order (could be optimized with a join and grouping)
        for (let order of orders) {
             const [items] = await db.query(`
                SELECT oi.quantity, oi.price, p.name, p.image_url 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
             `, [order.id]);
             order.items = items;
        }

        res.json(200, { orders });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error fetching orders' });
    }
}

module.exports = {
    createOrder,
    getOrders
};
