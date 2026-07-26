// ============================================
// Organizations Controller
// ============================================

import { 
    getAllOrganizations, 
    getOrganizationDetails 
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

/**
 * Display the organizations list page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        
        res.render('organizations', { 
            title, 
            organizations 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Display the organization details page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
            err.status = 400;
            return next(err);
        }
        
        // Get organization details and projects
        const organizationDetails = await getOrganizationDetails(organizationId);
        
        // If organization not found, return 404
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        
        const projects = await getProjectsByOrganizationId(organizationId);
        const title = organizationDetails.name;
        
        res.render('organization', {
            title,
            organizationDetails,
            projects,
            formatDate: res.locals.formatDate
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get organizations as JSON (API endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOrganizationsJSON = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.json(organizations);
    } catch (error) {
        next(error);
    }
};

// Export ALL controller functions
export { 
    showOrganizationsPage, 
    showOrganizationDetailsPage,
    getOrganizationsJSON 
};