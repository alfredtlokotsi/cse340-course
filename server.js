// ============================================
// Main Server File
// Application setup and configuration
// ============================================

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';

// Load environment variables
dotenv.config();

// Import database connection
import db, { testConnection } from './src/models/db.js';

// Import routes
import router from './src/routes.js';

// Import flash middleware
import flash from './src/middleware/flash.js';

// Define environment variables
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Check if session secret is set
if (!SESSION_SECRET) {
    console.error('❌ SESSION_SECRET is not set in environment variables!');
    console.error('Please generate a secret using: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    if (NODE_ENV === 'production') {
        console.error('⚠️  WARNING: SESSION_SECRET is required in production!');
    }
}

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// ============================================
// View Engine Setup
// ============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ============================================
// Trust Proxy (Required for Render)
// ============================================

// Trust the first proxy (Render uses a proxy)
// This is CRITICAL for sessions to work on Render
app.set('trust proxy', 1);

// ============================================
// Middleware
// ============================================

// 1. Session Management
// IMPORTANT: Use a more permissive cookie configuration for production
app.use(session({
    secret: SESSION_SECRET || 'fallback-secret-key-for-development-only',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours instead of 1 hour
        secure: false, // Set to false for Render (uses HTTPS but proxy handles it)
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// 2. Flash Message Middleware
app.use(flash);

// 3. Middleware to log all incoming requests (development only)
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }
    // Always log session ID for debugging on Render
    if (NODE_ENV === 'production') {
        console.log(`📝 Session ID: ${req.sessionID}`);
        console.log(`📝 User in session: ${req.session.user ? 'Yes' : 'No'}`);
    }
    next();
});

// 4. Middleware to make NODE_ENV and login status available to all templates
app.use((req, res, next) => {
    // Set isLoggedIn based on session
    res.locals.isLoggedIn = false;
    res.locals.user = null;
    
    // Debug logging
    if (NODE_ENV === 'production') {
        console.log(`🔍 Checking session for user: ${req.session.user ? req.session.user.email : 'No user'}`);
    }
    
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
    }

    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// 5. Middleware to make current year available to all templates
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// 6. Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 7. Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// Routes
// ============================================

app.use(router);

// ============================================
// Start Server
// ============================================

app.listen(PORT, '0.0.0.0', async () => {
    console.log('=================================');
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔧 Environment: ${NODE_ENV}`);
    console.log(`🔐 Session: ${SESSION_SECRET ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`📁 Views: ${path.join(__dirname, 'src/views')}`);
    console.log(`📁 Public: ${path.join(__dirname, 'public')}`);
    console.log('=================================');
    
    try {
        await testConnection();
        console.log('✅ Application ready to handle requests');
        console.log('=================================');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('=================================');
    }
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    try {
        if (db && typeof db.close === 'function') {
            await db.close();
        }
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
    process.exit(0);
});

export default app;