const authController = require('./controllers/auth');
const productsController = require('./controllers/products');
const cartController = require('./controllers/cart');
const ordersController = require('./controllers/orders');

// Helper to parse JSON body
function getPostData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(body ? JSON.parse(body) : {});
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Helper for sending JSON response
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Extract query params and path segments
function parseUrl(urlStr) {
    const [path, queryString] = urlStr.split('?');
    const query = {};
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            query[key] = decodeURIComponent(value || '');
        });
    }
    return { path, query };
}

async function router(req, res) {
    const { path, query } = parseUrl(req.url);

    // Only handle API routes here, static files handled in server.js
    if (!path.startsWith('/api/')) return false;

    // Attach helpers to req/res for easier controller logic
    req.query = query;
    res.json = (statusCode, data) => sendJson(res, statusCode, data);

    try {
        // ---- AUTH ROUTES ----
        if (path === '/api/auth/signup' && req.method === 'POST') {
            req.body = await getPostData(req);
            await authController.signup(req, res);
        }
        else if (path === '/api/auth/login' && req.method === 'POST') {
            req.body = await getPostData(req);
            await authController.login(req, res);
        }
        else if (path === '/api/auth/me' && req.method === 'GET') {
            await authController.me(req, res);
        }
        else if (path === '/api/auth/logout' && req.method === 'POST') {
            await authController.logout(req, res);
        }

        // ---- PRODUCT ROUTES ----
        else if (path === '/api/products' && req.method === 'GET') {
            await productsController.getProducts(req, res);
        }
        else if (path === '/api/products/recommendations' && req.method === 'GET') {
            await productsController.getRecommendations(req, res);
        }
        else if (path.match(/\/api\/products\/([0-9]+)\/reviews/) && req.method === 'GET') {
            const id = path.split('/')[3];
            req.params = { id };
            await productsController.getReviews(req, res);
        }
        else if (path.match(/\/api\/products\/([0-9]+)\/reviews/) && req.method === 'POST') {
            const id = path.split('/')[3];
            req.params = { id };
            req.body = await getPostData(req);
            await productsController.addReview(req, res);
        }
        else if (path.match(/\/api\/products\/([0-9]+)/) && req.method === 'GET') {
            const id = path.split('/')[3];
            req.params = { id };
            await productsController.getProductDetail(req, res);
        }

        // ---- CART ROUTES ----
        else if (path === '/api/cart' && req.method === 'GET') {
            await cartController.getCart(req, res);
        }
        else if (path === '/api/cart' && req.method === 'POST') {
            req.body = await getPostData(req);
            await cartController.addToCart(req, res);
        }
        else if (path.match(/\/api\/cart\/([0-9]+)/) && req.method === 'DELETE') {
            const id = path.split('/')[3];
            req.params = { id };
            await cartController.removeFromCart(req, res);
        }
        else if (path === '/api/cart/sync' && req.method === 'POST') {
             // For guest -> logged in sync
             req.body = await getPostData(req);
             await cartController.syncCart(req, res);
        }

        // ---- ORDER ROUTES ----
        else if (path === '/api/orders' && req.method === 'POST') {
            req.body = await getPostData(req);
            await ordersController.createOrder(req, res);
        }
        else if (path === '/api/orders' && req.method === 'GET') {
            await ordersController.getOrders(req, res);
        }

        // Route not found
        else {
            res.json(404, { message: 'API Route Not Found' });
        }

        return true; // We handled the route
    } catch (error) {
        console.error(error);
        res.json(500, { message: 'Internal Server Error' });
        return true;
    }
}

module.exports = router;
