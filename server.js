import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllOrganizations } from './models/organizations.js';
import { getAllCategories } from './models/categories.js';
import { getAllProjects } from './models/projects.js';
import { pool } from './db.js';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home page
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Service Project Tracker'
    });
});

// Organizations route
app.get('/organizations', async (req, res) => {
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

// Projects route - This is the only projects route needed for the activity
app.get('/projects', async (req, res) => {
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

// Categories route
app.get('/categories', async (req, res) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('Error in /categories route:', error);
        res.status(500).render('error', {
            message: 'Error loading categories',
            error: error.message
        });
    }
});

// Health check route
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'healthy',
            timestamp: result.rows[0].now,
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`🌐 Visit http://localhost:${port}`);
    console.log(`📋 Organizations: http://localhost:${port}/organizations`);
    console.log(`📁 Projects: http://localhost:${port}/projects`);
    console.log(`🏷️ Categories: http://localhost:${port}/categories`);
    console.log(`🏥 Health Check: http://localhost:${port}/health`);
});