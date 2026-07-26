// ============================================
// Projects Controller
// Handles project-related page rendering
// ============================================

// Import model functions
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
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        
        res.render('projects', { 
            title, 
            projects,
            formatDate: formatDate
        });
    } catch (error) {
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
        
        const title = project.title;
        
        res.render('project', {
            title,
            project,
            formatDate: formatDate
        });
    } catch (error) {
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

/**
 * Get upcoming projects as JSON (API endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUpcomingProjectsJSON = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || NUMBER_OF_UPCOMING_PROJECTS;
        const projects = await getUpcomingProjects(limit);
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

// Export controller functions
export { 
    showProjectsPage, 
    showProjectDetailsPage,
    getProjectsJSON,
    getUpcomingProjectsJSON
};