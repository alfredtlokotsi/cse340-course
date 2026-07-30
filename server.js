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
    console.error('Add it to your .env file as: SESSION_SECRET=your_generated_secret_here');
    // In production, you might want to exit the process
    // process.exit(1);
}

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// ============================================
// View Engine Setup
// ============================================

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

// ============================================
// Middleware
// ============================================

// 1. Session Management (MUST be before any route handlers)
app.use(session({
    secret: SESSION_SECRET || 'fallback-secret-key-for-development-only',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 60 * 60 * 1000, // Session expires after 1 hour of inactivity
        secure: NODE_ENV === 'production', // Only send cookie over HTTPS in production
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        sameSite: 'lax' // Protects against CSRF attacks
    }
}));

// 2. Flash Message Middleware (MUST be after session middleware)
app.use(flash);

// 3. Middleware to log all incoming requests (development only)
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }
    next();
});

// 4. Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// 5. Middleware to make current year available to all templates
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// 6. Body Parser Middleware - CRITICAL for handling POST form data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.json()); // Parse JSON data

// 7. Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// 8. Middleware to make formatDate available to all templates (if needed)
// This is typically done in the controller, but can be done globally
// app.locals.formatDate = formatDate;

// ============================================
// Routes
// ============================================

// Use the imported router to handle all routes
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
    console.log(`📁 Views: ${path.join(__dirname, 'src/views')}`);
    console.log(`📁 Public: ${path.join(__dirname, 'public')}`);
    console.log('=================================');
    
    try {
        // Test the database connection
        await testConnection();
        console.log('✅ Application ready to handle requests');
        console.log('=================================');
    } catch (error) {
        console.error('❌ Application failed to connect to the database:');
        console.error('   Please check your DB_URL in the .env file');
        console.error('   The application will continue running but database features will not work');
        console.log('=================================');
    }
});

// ============================================
// Graceful Shutdown
// ============================================

// Handle SIGINT (Ctrl+C) for graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    
    try {
        // Close database connection pool
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

// Handle SIGTERM (kill command) for graceful shutdown
process.on('SIGTERM', async () => {
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

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
    console.error('💥 Uncaught Exception:', err);
    console.error('📚 Stack trace:', err.stack);
    
    // Close database connection before exiting
    try {
        if (db && typeof db.close === 'function') {
            await db.close();
        }
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
    
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise);
    console.error('💥 Reason:', reason);
    
    // Close database connection before exiting
    try {
        if (db && typeof db.close === 'function') {
            await db.close();
        }
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
    
    process.exit(1);
});

// ============================================
// Export app for testing purposes
// ============================================

export default app;