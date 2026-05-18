const bcrypt = require('bcryptjs');
const db = require('../db');

// In-memory session store for simplicity (UUID -> userId)
// In production, use Redis or DB
const sessions = new Map();

function generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

// Utility to get user from request headers
async function getUserFromRequest(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return null;

    const userId = sessions.get(token);
    if (!userId) return null;

    try {
        const [rows] = await db.query('SELECT id, name, email, nova_points FROM users WHERE id = ?', [userId]);
        return rows[0] || null;
    } catch (err) {
        return null;
    }
}

async function signup(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json(400, { message: 'All fields are required' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.json(400, { message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, nova_points) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 50] // Bonus 50 points on signup
        );

        const token = generateToken();
        sessions.set(token, result.insertId);

        res.json(201, {
            message: 'User created successfully',
            token,
            user: { id: result.insertId, name, email, nova_points: 50 }
        });

    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error creating user' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json(400, { message: 'Email and password required' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.json(401, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.json(401, { message: 'Invalid credentials' });
        }

        const token = generateToken();
        sessions.set(token, user.id);

        res.json(200, {
            message: 'Logged in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, nova_points: user.nova_points }
        });
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Error logging in' });
    }
}

async function me(req, res) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return res.json(401, { message: 'Unauthorized' });
    }
    res.json(200, { user });
}

async function logout(req, res) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        sessions.delete(token);
    }
    res.json(200, { message: 'Logged out' });
}

module.exports = {
    signup,
    login,
    me,
    logout,
    getUserFromRequest
};
