// Import any needed model functions
import { getAllProjects } from '../models/projects.js';

/**
 * Controller for the projects page
 * Fetches all projects from the database and renders the projects view
 */
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getAllProjects();
        const title = 'Service Projects';
        console.log(`Found ${projects.length} projects`);
        res.render('projects', { title, projects });
    } catch (error) {
        console.error('Error in showProjectsPage:', error);
        const err = new Error('Error loading projects');
        err.status = 500;
        next(err);
    }
};

// Export the controller functions
export { showProjectsPage };