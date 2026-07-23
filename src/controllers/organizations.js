// Import any needed model functions
import { getAllOrganizations } from '../models/organizations.js';

/**
 * Controller for the organizations page
 * Fetches all organizations from the database and renders the organizations view
 */
const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        console.log(`Found ${organizations.length} organizations`);
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error('Error in showOrganizationsPage:', error);
        const err = new Error('Error loading organizations');
        err.status = 500;
        next(err);
    }
};

// Export the controller functions
export { showOrganizationsPage };