// ============================================
// Projects Controller
// Handles project-related page rendering
// ============================================

import { 
    getAllProjects, 
    getUpcomingProjects, 
    getProjectDetails,
    createProject,
    updateProject,
    formatDate,
    formatDateForInput
} from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// ============================================
// Validation Rules
// ============================================

const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ max: 1000 })
        .withMessage('Project description cannot exceed 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Project location is required')
        .isLength({ max: 200 })
        .withMessage('Location cannot exceed 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Project date is required')
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Please provide a valid date in YYYY-MM-DD format')
        .custom((value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                throw new Error('Project date must be today or in the future');
            }
            return true;
        }),
    body('organizationId')
        .notEmpty()
        .withMessage('Please select an organization')
        .isInt({ min: 1 })
        .withMessage('Invalid organization selection')
];

// ============================================
// Controller Functions
// ============================================

/**
 * Display the upcoming projects page
 */
const showProjectsPage = async (req, res, next) => {
    try {
        console.log('📋 Fetching upcoming projects...');
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        console.log(`✅ Found ${projects.length} upcoming projects`);
        
        const title = 'Upcoming Service Projects';
        
        res.render('projects', { 
            title, 
            projects,
            formatDate: formatDate
        });
    } catch (error) {
        console.error('❌ Error in showProjectsPage:', error);
        next(error);
    }
};

/**
 * Display a single project detail page
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        console.log(`🔍 Fetching project details for ID: ${projectId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        
        // Get project details
        const project = await getProjectDetails(projectId);
        console.log(`✅ Project found: ${project ? project.title : 'Not found'}`);
        
        // If project not found, return 404
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        const title = project.title;
        
        res.render('project', {
            title,
            project,
            formatDate: formatDate
        });
    } catch (error) {
        console.error('❌ Error in showProjectDetailsPage:', error);
        next(error);
    }
};

/**
 * Display the new project form
 */
const showNewProjectForm = async (req, res, next) => {
    try {
        // Get all organizations for the dropdown
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        
        res.render('new-project', {
            title,
            organizations
        });
    } catch (error) {
        console.error('❌ Error in showNewProjectForm:', error);
        next(error);
    }
};

/**
 * Process the new project form submission with validation
 */
const processNewProjectForm = async (req, res, next) => {
    try {
        // Check for validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            // Validation failed - loop through errors and add to flash
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            // Redirect back to the new project form
            return res.redirect('/new-project');
        }

        // Validation passed - process the form data
        const { title, description, location, date, organizationId } = req.body;
        
        console.log('📝 Creating new project:', { 
            title, 
            description, 
            location, 
            date, 
            organizationId 
        });
        
        // Create the project
        const projectId = await createProject(title, description, location, date, organizationId);
        
        console.log(`✅ Project created with ID: ${projectId}`);
        
        // Set a success flash message
        req.flash('success', `Project "${title}" added successfully!`);
        
        // Redirect to the projects list page
        res.redirect('/projects');
    } catch (error) {
        console.error('❌ Error processing new project form:', error);
        
        // Set an error flash message
        req.flash('error', 'Failed to create project. Please try again.');
        
        // Redirect back to the form
        res.redirect('/new-project');
    }
};

/**
 * Display the edit project form
 */
const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        console.log(`📝 Loading edit form for project ID: ${projectId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        
        // Get project details
        const project = await getProjectDetails(projectId);
        
        // If project not found, return 404
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        // Get all organizations for the dropdown
        const organizations = await getAllOrganizations();
        
        const title = `Edit Project: ${project.title}`;
        
        // Format the date for the date input
        const formattedDate = formatDateForInput(project.project_date);
        
        res.render('edit-project', {
            title,
            project,
            organizations,
            formattedDate,
            formatDate: formatDate
        });
    } catch (error) {
        console.error('❌ Error in showEditProjectForm:', error);
        next(error);
    }
};

/**
 * Process the edit project form submission with validation
 */
const processEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        console.log(`📝 Processing edit form for project ID: ${projectId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }
        
        // Check for validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            // Validation failed - loop through errors and add to flash
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            // Redirect back to the edit project form
            return res.redirect(`/edit-project/${projectId}`);
        }

        // Validation passed - process the form data
        const { 
            title, 
            description, 
            location, 
            date, 
            organizationId,
            status,
            maxVolunteers,
            currentVolunteers
        } = req.body;
        
        console.log(`📝 Updating project ${projectId}:`, { 
            title, 
            description, 
            location, 
            date, 
            organizationId,
            status,
            maxVolunteers,
            currentVolunteers
        });
        
        // Update the project
        const updatedProject = await updateProject(
            projectId,
            title,
            description,
            location,
            date,
            organizationId,
            status || 'Upcoming',
            maxVolunteers || 0,
            currentVolunteers || 0
        );
        
        console.log(`✅ Project ${projectId} updated successfully`);
        
        // Set a success flash message
        req.flash('success', `Project "${title}" updated successfully!`);
        
        // Redirect to the project's detail page
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('❌ Error processing edit project form:', error);
        
        // Set an error flash message
        req.flash('error', 'Failed to update project. Please try again.');
        
        // Redirect back to the edit form
        res.redirect(`/edit-project/${req.params.id}`);
    }
};

/**
 * Get all projects as JSON (API endpoint)
 */
const getProjectsJSON = async (req, res, next) => {
    try {
        const projects = await getAllProjects();
        res.json(projects);
    } catch (error) {
        console.error('❌ Error in getProjectsJSON:', error);
        next(error);
    }
};

// Export all controller functions
export { 
    showProjectsPage, 
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation,
    getProjectsJSON
};