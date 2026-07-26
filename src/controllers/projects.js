// ============================================
// Projects Controller
// ============================================

import { 
    getAllProjects, 
    getUpcomingProjects, 
    getProjectDetails,
    formatDate 
} from '../models/projects.js';

// Configuration
const NUMBER_OF_UPCOMING_PROJECTS = 5;

/**
 * Display the upcoming projects page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
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
 * Display the project details page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        console.log(`📋 Fetching project details for ID: ${projectId}`);
        
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
 * Get all projects as JSON (API endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProjectsJSON = async (req, res, next) => {
    try {
        const projects = await getAllProjects();
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

// Export ALL controller functions
export { 
    showProjectsPage, 
    showProjectDetailsPage,
    getProjectsJSON 
};