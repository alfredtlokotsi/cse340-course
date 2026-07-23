import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Get the base URL for absolute paths
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('🚀 Starting server...');
console.log(`📂 __dirname: ${__dirname}`);
console.log(`🌐 Environment: ${NODE_ENV}`);

/**
 * Configure Express middleware
 */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
console.log('✅ Static files configured');

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));
console.log('✅ EJS configured');

// ============================================
// CUSTOM MIDDLEWARE
// ============================================

/**
 * Middleware 1: Log all incoming requests
 * This runs for every request and logs the method and URL
 */
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }
    next();
});
console.log('✅ Request logging middleware configured');

/**
 * Middleware 2: Make NODE_ENV available to all templates
 * This stores the environment variable in res.locals for EJS access
 */
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});
console.log('✅ NODE_ENV middleware configured');

/**
 * Middleware 3: Make BASE_URL available to all templates
 */
app.use((req, res, next) => {
    res.locals.BASE_URL = BASE_URL;
    next();
});
console.log('✅ BASE_URL middleware configured');

// ============================================
// ROUTES
// ============================================

// Use the imported router to handle routes
app.use(router);
console.log('✅ Routes loaded');

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

/**
 * Catch-all route for 404 errors
 * This must come AFTER all your real routes
 */
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});
console.log('✅ 404 catch-all configured');

/**
 * Global error handler
 * Note: Four parameters (err, req, res, next) identifies this as error middleware
 */
app.use((err, req, res, next) => {
    // Log error details for debugging
    console.error('❌ Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack,
        NODE_ENV: NODE_ENV
    };
    
    // Render the appropriate error template
    res.status(status).render(`errors/${template}`, context);
});
console.log('✅ Global error handler configured');

/**
 * Start the server
 */
app.listen(PORT, '0.0.0.0', async () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Base URL: ${BASE_URL}`);
    console.log('='.repeat(50) + '\n');
    
    // Test database connection
    try {
        await testConnection();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('⚠️ Database connection failed:', error.message);
        console.log('ℹ️ Server is running but database is not connected');
    }
    
    console.log('\n📋 Available routes:');
    console.log(`   GET  / - Home`);
    console.log(`   GET  /organizations - Organizations`);
    console.log(`   GET  /projects - Projects`);
    console.log(`   GET  /categories - Categories`);
    console.log(`   GET  /test-error - Test 500 error`);
    console.log(`   GET  /any-other-url - 404 Not Found`);
    
    console.log('\n🔧 Middleware active:');
    console.log(`   ✅ Request logging (${NODE_ENV === 'development' ? 'active' : 'inactive'})`);
    console.log(`   ✅ NODE_ENV available to templates`);
    console.log(`   ✅ BASE_URL available to templates`);
    console.log('\n' + '='.repeat(50));
});