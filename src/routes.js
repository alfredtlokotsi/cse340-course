// ============================================
// Routes Configuration
// All application routes are defined here
// ============================================

import express from 'express';

// Import controllers
import { showHomePage } from './controllers/index.js';
import { 
    showOrganizationsPage, 
    showOrganizationDetailsPage,
    getOrganizationsJSON 
} from './controllers/organizations.js';
import { 
    showProjectsPage, 
    showProjectDetailsPage,
    getProjectsJSON 
} from './controllers/projects.js';
import { 
    showCategoriesPage,
    showCategoryDetailPage,
    getCategoriesJSON 
} from './controllers/categories.js';
import { 
    testErrorPage, 
    test404Error, 
    show404Page, 
    handleError 
} from './controllers/errors.js';

// Create router instance
const router = express.Router();

// ============================================
// HTML Routes (Pages)
// ============================================

// Home page
router.get('/', showHomePage);

// Organizations pages
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// Projects pages
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

// Categories pages
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailPage);  // Category detail page

// ============================================
// API Routes (JSON endpoints)
// ============================================

router.get('/api/organizations', getOrganizationsJSON);
router.get('/api/projects', getProjectsJSON);
router.get('/api/categories', getCategoriesJSON);

// ============================================
// Test Routes (Development only)
// ============================================

router.get('/test-error', testErrorPage);
router.get('/test-404', test404Error);

// ============================================
// Error Handling Routes
// ============================================

// Catch-all route for 404 errors
router.use(show404Page);

// Global error handler
router.use(handleError);

// Export the router
export default router;