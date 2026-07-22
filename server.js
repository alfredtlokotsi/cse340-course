import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

console.log('🚀 Starting server...');

// ============================================
// IMPORT MODELS WITH DETAILED ERROR LOGGING
// ============================================

let db, testConnection, getAllOrganizations, getAllProjects, getAllCategories;

// Try to import db.js
try {
    console.log('📦 Attempting to import db.js...');
    const dbModule = await import('./src/models/db.js');
    db = dbModule.default;
    testConnection = dbModule.testConnection;
    console.log('✅ db.js loaded successfully');
} catch (error) {
    console.error('❌ Failed to load db.js:', error.message);
    console.error('Stack trace:', error.stack);
    // Create a fallback
    db = {
        async query(text) {
            console.log('⚠️ Fallback query called with:', text);
            return { rows: [] };
        }
    };
    testConnection = async () => { 
        console.log('⚠️ Fallback testConnection called');
        return false; 
    };
}

// Try to import organizations.js
try {
    console.log('📦 Attempting to import organizations.js...');
    const orgModule = await import('./src/models/organizations.js');
    getAllOrganizations = orgModule.getAllOrganizations;
    console.log('✅ organizations.js loaded successfully');
} catch (error) {
    console.error('❌ Failed to load organizations.js:', error.message);
    console.error('Stack trace:', error.stack);
    getAllOrganizations = async () => {
        console.log('⚠️ Fallback getAllOrganizations called');
        return [];
    };
}

// Try to import projects.js
try {
    console.log('📦 Attempting to import projects.js...');
    const projectModule = await import('./src/models/projects.js');
    getAllProjects = projectModule.getAllProjects;
    console.log('✅ projects.js loaded successfully');
} catch (error) {
    console.error('❌ Failed to load projects.js:', error.message);
    console.error('Stack trace:', error.stack);
    getAllProjects = async () => {
        console.log('⚠️ Fallback getAllProjects called');
        return [];
    };
}

// Try to import categories.js
try {
    console.log('📦 Attempting to import categories.js...');
    const categoryModule = await import('./src/models/categories.js');
    getAllCategories = categoryModule.getAllCategories;
    console.log('✅ categories.js loaded successfully');
} catch (error) {
    console.error('❌ Failed to load categories.js:', error.message);
    console.error('Stack trace:', error.stack);
    getAllCategories = async () => {
        console.log('⚠️ Fallback getAllCategories called');
        return [];
    };
}

// ============================================
// EXPRESS SETUP
// ============================================

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`📂 __dirname: ${__dirname}`);
console.log(`📁 Views path: ${path.join(__dirname, 'src/views')}`);
console.log(`📁 Models path: ${path.join(__dirname, 'src/models')}`);

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

try {
    // Serve static files from the public directory
    app.use(express.static(path.join(__dirname, 'public')));
    console.log('✅ Static files configured');
} catch (error) {
    console.error('❌ Failed to configure static files:', error.message);
}

try {
    // Set EJS as the templating engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'src/views'));
    console.log('✅ EJS configured');
} catch (error) {
    console.error('❌ Failed to configure EJS:', error.message);
}

try {
    // Pass BASE_URL to all views
    app.use((req, res, next) => {
        res.locals.BASE_URL = BASE_URL;
        next();
    });
    console.log('✅ BASE_URL middleware configured');
} catch (error) {
    console.error('❌ Failed to configure BASE_URL middleware:', error.message);
}

// ============================================
// ROUTES
// ============================================

console.log('\n📋 Registering routes...');

// Test route - should work even if database fails
app.get('/test', (req, res) => {
    console.log('✅ /test route called');
    res.json({ 
        status: 'ok', 
        message: 'Server is running!',
        environment: NODE_ENV,
        baseUrl: BASE_URL,
        timestamp: new Date().toISOString()
    });
});
console.log('  ✅ /test route registered');

// Health check route
app.get('/health', (req, res) => {
    console.log('✅ /health route called');
    res.status(200).json({ 
        status: 'healthy', 
        environment: NODE_ENV,
        baseUrl: BASE_URL,
        timestamp: new Date().toISOString()
    });
});
console.log('  ✅ /health route registered');

// Debug images route
import fs from 'fs';
app.get('/debug-images', (req, res) => {
    console.log('✅ /debug-images route called');
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
        console.error('❌ Error in /debug-images:', error.message);
        res.json({
            success: false,
            error: error.message,
            path: imagesPath
        });
    }
});
console.log('  ✅ /debug-images route registered');

// Home route
app.get('/', async (req, res) => {
    console.log('✅ / route called');
    try {
        const title = 'Home';
        res.render('home', { title });
    } catch (error) {
        console.error('❌ Error in / route:', error);
        res.status(500).send(`Error loading home page: ${error.message}`);
    }
});
console.log('  ✅ / route registered');

// Organizations route
app.get('/organizations', async (req, res) => {
    console.log('📋 /organizations route called');
    try {
        console.log('Calling getAllOrganizations...');
        const organizations = await getAllOrganizations();
        console.log(`Found ${organizations.length} organizations`);
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error('❌ Error in /organizations route:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).render('error', {
            message: 'Error loading organizations',
            error: error.message
        });
    }
});
console.log('  ✅ /organizations route registered');

// Projects route
app.get('/projects', async (req, res) => {
    console.log('📁 /projects route called');
    try {
        const projects = await getAllProjects();
        console.log(`Found ${projects.length} projects`);
        const title = 'Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        console.error('❌ Error in /projects route:', error);
        res.status(500).render('error', {
            message: 'Error loading projects',
            error: error.message
        });
    }
});
console.log('  ✅ /projects route registered');

// Categories route
app.get('/categories', async (req, res) => {
    console.log('🏷️ /categories route called');
    try {
        const categories = await getAllCategories();
        console.log(`Found ${categories.length} categories`);
        const title = 'Service Project Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('❌ Error in /categories route:', error);
        res.status(500).render('error', {
            message: 'Error loading categories',
            error: error.message
        });
    }
});
console.log('  ✅ /categories route registered');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: err.message
    });
});
console.log('  ✅ Error handler configured');

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', async () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🔗 Base URL: ${BASE_URL}`);
    console.log('='.repeat(50) + '\n');
    
    // Test database connection
    try {
        if (testConnection) {
            await testConnection();
            console.log('✅ Database connected successfully');
        } else {
            console.log('⚠️ testConnection function not available');
        }
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
    console.log('\n' + '='.repeat(50));
});