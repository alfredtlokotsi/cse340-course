// ============================================
// Organizations Controller
// ============================================

import { 
    getAllOrganizations, 
    getOrganizationDetails,
    createOrganization 
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

/**
 * Display the organizations list page
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
 * Display the new organization form
 */
const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

/**
 * Process the new organization form submission
 */
const processNewOrganizationForm = async (req, res, next) => {
    try {
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png'; // Use placeholder logo
        
        // Log the received data for debugging
        console.log('📝 Creating new organization:', { name, description, contactEmail });
        
        // Validate required fields
        if (!name || !description || !contactEmail) {
            const err = new Error('All fields are required: name, description, and contact email');
            err.status = 400;
            return next(err);
        }
        
        // Create the organization
        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
        
        console.log(`✅ Organization created with ID: ${organizationId}`);
        
        // Set a success flash message
        req.flash('success', `Organization "${name}" added successfully!`);
        
        // Redirect to the new organization's detail page
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('❌ Error processing new organization form:', error);
        
        // Set an error flash message
        req.flash('error', 'Failed to create organization. Please try again.');
        
        // Redirect back to the form
        res.redirect('/new-organization');
    }
};

/**
 * Get organizations as JSON (API endpoint)
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
    showNewOrganizationForm,
    processNewOrganizationForm,
    getOrganizationsJSON 
};