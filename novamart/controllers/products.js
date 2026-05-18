const db = require('../db');
const authController = require('./auth');

async function getProducts(req, res) {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Add sorting later if needed, default to new first
        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(200, { products: rows });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error fetching products' });
    }
}

async function getProductDetail(req, res) {
    try {
        const productId = req.params.id;
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        
        if (rows.length === 0) {
            return res.json(404, { message: 'Product not found' });
        }
        
        res.json(200, { product: rows[0] });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error fetching product' });
    }
}

async function getRecommendations(req, res) {
    try {
        // Simulated AI recommendation - randomly pick 3 products or base on recent categories
        // In a real app, this would use ML inference or complex SQL based on user history
        const [rows] = await db.query('SELECT * FROM products ORDER BY RAND() LIMIT 3');
        res.json(200, { recommendations: rows });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error fetching recommendations' });
    }
}

async function getReviews(req, res) {
    try {
        const productId = req.params.id;
        const query = 'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC';
        const [rows] = await db.query(query, [productId]);
        res.json(200, { reviews: rows });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error fetching reviews' });
    }
}

async function addReview(req, res) {
    try {
        const productId = req.params.id;
        const { rating, comment } = req.body;
        
        const user = await authController.getUserFromRequest(req);
        if (!user) {
            return res.json(401, { message: 'Unauthorized. Please log in to leave a review.' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.json(400, { message: 'Valid rating between 1 and 5 is required' });
        }

        await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [productId, user.id, rating, comment || null]
        );

        // Update the average product rating
        const [avg] = await db.query('SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?', [productId]);
        if (avg[0].avg_rating) {
            await db.query('UPDATE products SET rating = ? WHERE id = ?', [parseFloat(avg[0].avg_rating).toFixed(1), productId]);
        }

        res.json(201, { message: 'Review added successfully' });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error adding review' });
    }
}

module.exports = {
    getProducts,
    getProductDetail,
    getRecommendations,
    getReviews,
    addReview
};
