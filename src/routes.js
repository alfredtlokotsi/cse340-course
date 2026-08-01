// ============================================
// Routes Configuration
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
    testErrorPage, 
    test404Error, 
    show404Page, 
    handleError 
} from './controllers/errors.js';

const router = express.Router();

// ============================================
// HTML Routes (Pages)
// ============================================

router.get('/', showHomePage);

// Organizations
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);

router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);

// Projects
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);

router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);

router.post('/project/:id/register', registerVolunteerForProject);

// Categories
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showProjectsByCategory);

router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);

router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);

router.get('/project/:projectId/assign-categories', showAssignCategoriesForm);
router.post('/project/:projectId/assign-categories', processAssignCategoriesForm);

// ============================================
// API Routes
// ============================================

router.get('/api/organizations', getOrganizationsJSON);
router.get('/api/projects', getProjectsJSON);
router.get('/api/categories', getCategoriesJSON);

// ============================================
// Test Routes
// ============================================

router.get('/test-error', testErrorPage);
router.get('/test-404', test404Error);

// ============================================
// Error Handling
// ============================================

router.use(show404Page);
router.use(handleError);

export default router;