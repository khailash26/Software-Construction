# NovaMart - Professional E-Commerce

A futuristic, full-stack, AI-enhanced e-commerce platform built strictly without major frontend or backend frameworks. Fully responsive and professionally branded.

## 🚀 Tech Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript. Custom animation engine.
- **Backend**: Pure Node.js (`http` module), without Express.
- **Database**: MySQL.

## ✨ Advanced Features Included
1. **AI Product Assistant**: Floating chat interface for natural language product discovery (e.g., "smartwatch under 200").
2. **Visual Search**: Image-based product matching modal (upload an image to find similar items).
3. **Lucky Spin Gamification**: Interactive spin wheel on the cart page for exclusive discount coupons.
4. **Smart Cart Suggestions**: Personalized "Recommended for You" section based on current cart categories.
5. **Modern Catalog**: 15+ premium products with high-resolution retail imagery.
6. **Cyberpunk Theme**: Clean, professional UI with glassmorphism and smooth scroll-triggered animations.

## 🛠️ Run Instructions

### 1. Database Setup
1. Ensure you have MySQL installed (e.g., via XAMPP or MySQL Installer).
2. Create a database named `novamart`.
3. Import the provided schema:
   ```bash
   mysql -u root -p novamart < sql/schema.sql
   ```
4. **Database Connection Configuration**:
   Open `db.js` and ensure the credentials match your MySQL setup:
   ```js
   const pool = mysql.createPool({
       host: 'localhost',
       user: 'root',
       password: 'YOUR_PASSWORD', // Update this based on your setup
       database: 'novamart',
       // ...
   });
   ```

### 2. Node.js Setup
1. Open a terminal in the project root (`novamart/`).
2. Install dependencies:
   ```bash
   npm install
   ```

### 3. Run Server
1. Start the server:
   ```bash
   npm start
   ```
2. For development (auto-restart on changes):
   ```bash
   npm run dev
   ```

### 4. Visit Site
Open your browser and navigate to:
**http://localhost:3000**

---
*Developed for a premium retail experience.*

## ❓ Troubleshooting

### PowerShell "running scripts is disabled" Error
If you see an error about `npm.ps1` not being loaded:
1. Open PowerShell as **Administrator**.
2. Run this command:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter. Now `npm install` will work!

Alternatively, use `npm.cmd install` in your terminal.
