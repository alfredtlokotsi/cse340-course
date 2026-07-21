import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * Configure Express middleware
 */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

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

app.get('/categories', async (req, res) => {
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

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        environment: NODE_ENV 
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
        console.log(`Server is running at http://127.0.0.1:${PORT} (without database)`);
        console.log(`Environment: ${NODE_ENV}`);
    }
});