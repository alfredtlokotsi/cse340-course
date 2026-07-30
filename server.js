// ============================================
// Main Server File
// Application setup and configuration
// ============================================

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database connection
import db, { testConnection } from './src/models/db.js';

// Import routes
import router from './src/routes.js';

// Define environment variables
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

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

// 1. Middleware to log all incoming requests (development only)
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }
    next();
});

// 2. Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// 3. Middleware to make current year available to all templates
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

// 4. Body Parser Middleware - CRITICAL for handling POST form data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.json()); // Parse JSON data

// 5. Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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
    console.log('=================================');
    
    try {
        // Test the database connection
        await testConnection();
        console.log('✅ Application ready to handle requests');
    } catch (error) {
        console.error('❌ Application failed to connect to the database:');
        console.error('   Please check your DB_URL in the .env file');
        console.error('   The application will continue running but database features will not work');
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