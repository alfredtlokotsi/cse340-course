import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';

// Import models with error handling
let getAllOrganizations, getAllProjects, getAllCategories;

try {
    const orgModule = await import('./src/models/organizations.js');
    getAllOrganizations = orgModule.getAllOrganizations;
    console.log('✅ Organizations model loaded');
} catch (error) {
    console.error('❌ Failed to load organizations model:', error.message);
    getAllOrganizations = async () => [];
}

try {
    const projectModule = await import('./src/models/projects.js');
    getAllProjects = projectModule.getAllProjects;
    console.log('✅ Projects model loaded');
} catch (error) {
    console.error('❌ Failed to load projects model:', error.message);
    getAllProjects = async () => [];
}

try {
    const categoryModule = await import('./src/models/categories.js');
    getAllCategories = categoryModule.getAllCategories;
    console.log('✅ Categories model loaded');
} catch (error) {
    console.error('❌ Failed to load categories model:', error.message);
    getAllCategories = async () => [];
}

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
console.log(`📁 Views path: ${path.join(__dirname, 'src/views')}`);
console.log(`📁 Models path: ${path.join(__dirname, 'src/models')}`);

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

// Pass BASE_URL to all views
app.use((req, res, next) => {
    res.locals.BASE_URL = BASE_URL;
    next();
});
console.log('✅ BASE_URL middleware configured');

/**
 * Routes
 */

// Test route - should work even if database fails
app.get('/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running!',
        environment: NODE_ENV,
        baseUrl: BASE_URL
    });
});
console.log('✅ Test route configured');

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        environment: NODE_ENV,
        baseUrl: BASE_URL,
        timestamp: new Date().toISOString()
    });
});
console.log('✅ Health route configured');

// Debug images route
import fs from 'fs';
app.get('/debug-images', (req, res) => {
    const imagesPath = path.join(__dirname, 'public', 'images');
    try {
        const files = fs.readdirSync(imagesPath);
        res.json({
            success: true,
            path: imagesPath,
            files: files,
            baseUrl: BASE_URL
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            path: imagesPath
        });
    }
});
console.log('✅ Debug-images route configured');

// Home route
app.get('/', async (req, res) => {
    try {
        const title = 'Home';
        res.render('home', { title });
    } catch (error) {
        console.error('Error in / route:', error);
        res.status(500).send('Error loading home page');
    }
});
console.log('✅ Home route configured');

// Organizations route
app.get('/organizations', async (req, res) => {
    console.log('📋 Organizations route called');
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        console.log(`Found ${organizations.length} organizations`);
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error('Error in /organizations route:', error);
        res.status(500).render('error', {
            message: 'Error loading organizations',
            error: error.message
        });
    }
});
console.log('✅ Organizations route configured');

// Projects route
app.get('/projects', async (req, res) => {
    console.log('📁 Projects route called');
    try {
        const projects = await getAllProjects();
        const title = 'Service Projects';
        console.log(`Found ${projects.length} projects`);
        res.render('projects', { title, projects });
    } catch (error) {
        console.error('Error in /projects route:', error);
        res.status(500).render('error', {
            message: 'Error loading projects',
            error: error.message
        });
    }
});
console.log('✅ Projects route configured');

// Categories route
app.get('/categories', async (req, res) => {
    console.log('🏷️ Categories route called');
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        console.log(`Found ${categories.length} categories`);
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('Error in /categories route:', error);
        res.status(500).render('error', {
            message: 'Error loading categories',
            error: error.message
        });
    }
});
console.log('✅ Categories route configured');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: err.message
    });
});
console.log('✅ Error handler configured');

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Base URL: ${BASE_URL}`);
    
    // Test database connection but don't crash if it fails
    try {
        await testConnection();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('⚠️ Database connection failed:', error.message);
        console.log('ℹ️ Server is running but database is not connected');
    }
    
    console.log('\n📋 Available routes:');
    console.log(`   GET  / - Home`);
    console.log(`   GET  /test - Test`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /debug-images - Debug images`);
    console.log(`   GET  /organizations - Organizations`);
    console.log(`   GET  /projects - Projects`);
    console.log(`   GET  /categories - Categories`);
});