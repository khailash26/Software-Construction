const http = require('http');
const fs = require('fs');
const path = require('path');
const configRouter = require('./router');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    // Basic CORS (if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Try API routes first
    const isApiRoute = await configRouter(req, res);
    
    // If router handles it, we are done
    if (isApiRoute) {
        return;
    }

    // Otherwise, serve static files
    serveStaticFile(req, res);
});

function serveStaticFile(req, res) {
    // Default to index.html for root route
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query string if present
    filePath = filePath.split('?')[0];
    
    // Map /products, /cart etc to their html files for clean URLs (optional, but good for SPA feel)
    const cleanRoutes = ['/products', '/product', '/cart', '/checkout', '/orders', '/auth'];
    if (cleanRoutes.includes(filePath)) {
        filePath += '.html';
    }

    let extname = String(path.extname(filePath)).toLowerCase();
    
    // If no extension, and not a clean route, default it to .html
    if (!extname) {
        filePath += '.html';
        extname = '.html';
    }

    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    const absoluteFilePath = path.join(PUBLIC_DIR, filePath);

    fs.readFile(absoluteFilePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Return 404 page or just 404 message
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found - Welcome to the Void</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

server.listen(PORT, () => {
    console.log(`[NovaMart] Server running at http://localhost:${PORT}/`);
    console.log(`[NovaMart] Cyberpunk systems online.`);
});
