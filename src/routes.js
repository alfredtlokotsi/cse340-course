// ============================================
// Routes Configuration
// All application routes are defined here
// ============================================

import express from 'express';
import { showHomePage } from './controllers/index.js';
import { 
    showOrganizationsPage, 
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation,
    getOrganizationsJSON 
} from './controllers/organizations.js';
import { 
    showProjectsPage, 
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation,
    getProjectsJSON 
} from './controllers/projects.js';
import { 
    showCategoriesPage,
    showProjectsByCategory,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    getCategoriesJSON 
} from './controllers/categories.js';
import { 
    testErrorPage, 
    test404Error, 
    show404Page, 
    handleError 
} from './controllers/errors.js';

const router = express.Router();

// ============================================
// HTML Routes (Pages)
// ============================================

// Home page
router.get('/', showHomePage);

// Organizations pages
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// New Organization form
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);

// Edit Organization form
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);

// Projects pages
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

// New Project form
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);

// Edit Project form
router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);

// Categories pages
router.get('/categories', showCategoriesPage);

// Category Projects page (NEW - shows projects for a specific category)
router.get('/category/:id', showProjectsByCategory);

// Assign Categories to Project
router.get('/project/:projectId/assign-categories', showAssignCategoriesForm);
router.post('/project/:projectId/assign-categories', processAssignCategoriesForm);

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

export default router;