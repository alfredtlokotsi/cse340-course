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
// Middleware
// ============================================

// 1. Session Management
app.use(session({
    secret: SESSION_SECRET || 'fallback-secret-key-for-development-only',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 60 * 60 * 1000,
        secure: NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// 2. Flash Message Middleware
app.use(flash);

// 3. Request logging
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }
    next();
});

// 4. Make NODE_ENV available to templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// 5. Make current year available to templates
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// 6. Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 7. Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// Routes
// ============================================

app.use(router);

// ============================================
// Start Server
// ============================================

app.listen(PORT, async () => {
    console.log('=================================');
    console.log(`🚀 Server is running at http://127.0.0.1:${PORT}`);
    console.log(`🔧 Environment: ${NODE_ENV}`);
    console.log(`📊 SQL Logging: ${process.env.ENABLE_SQL_LOGGING === 'true' ? 'Enabled' : 'Disabled'}`);
    console.log(`🔐 Session: ${SESSION_SECRET ? 'Configured ✅' : 'Missing ❌'}`);
    console.log('=================================');
    
    try {
        await testConnection();
        console.log('✅ Application ready to handle requests');
        console.log('=================================');
    } catch (error) {
        console.error('❌ Application failed to connect to the database:');
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
    console.log('👋 Server shutdown complete');
    process.exit(0);
});

process.on('uncaughtException', async (err) => {
    console.error('💥 Uncaught Exception:', err);
    try {
        if (db && typeof db.close === 'function') {
            await db.close();
        }
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise);
    console.error('💥 Reason:', reason);
    try {
        if (db && typeof db.close === 'function') {
            await db.close();
        }
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
    process.exit(1);
});

export default app;