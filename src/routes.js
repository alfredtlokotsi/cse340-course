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
    registerVolunteerForProject,
    projectValidation,
    getProjectsJSON 
} from './controllers/projects.js';
import { 
    showCategoriesPage,
    showProjectsByCategory,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    getCategoriesJSON 
} from './controllers/categories.js';
import { 
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage,
    userValidation
} from './controllers/users.js';
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

// User registration
router.get('/register', showUserRegistrationForm);
router.post('/register', userValidation, processUserRegistrationForm);

// User login
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);

// User logout
router.get('/logout', processLogout);

// Protected dashboard route
router.get('/dashboard', requireLogin, showDashboard);

// Users management (Admin only)
router.get('/users', requireRole('admin'), showUsersPage);

// Organizations pages
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// New Organization form (Admin only)
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireRole('admin'), organizationValidation, processNewOrganizationForm);

// Edit Organization form (Admin only)
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireRole('admin'), organizationValidation, processEditOrganizationForm);

// Projects pages
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

// Register volunteer for project (POST)
router.post('/project/:id/register', registerVolunteerForProject);

// New Project form (Admin only)
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);

// Edit Project form (Admin only)
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireRole('admin'), projectValidation, processEditProjectForm);

// Categories pages
router.get('/categories', showCategoriesPage);

// Category Projects page (shows projects for a specific category)
router.get('/category/:id', showProjectsByCategory);

// New Category form (Admin only)
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidation, processNewCategoryForm);

// Edit Category form (Admin only)
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireRole('admin'), categoryValidation, processEditCategoryForm);

// Assign Categories to Project (Admin only)
router.get('/project/:projectId/assign-categories', requireRole('admin'), showAssignCategoriesForm);
router.post('/project/:projectId/assign-categories', requireRole('admin'), processAssignCategoriesForm);

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