// ============================================
// Organizations Controller
// ============================================

import { 
    getAllOrganizations, 
    getOrganizationDetails,
    createOrganization,
    updateOrganization
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// ============================================
// Validation Rules
// ============================================

const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

// ============================================
// Controller Functions
// ============================================

/**
 * Display the organizations list page
 */
const showOrganizationsPage = async (req, res, next) => {
    try {
        console.log('📋 Fetching organizations...');
        const organizations = await getAllOrganizations();
        console.log(`✅ Found ${organizations.length} organizations`);
        
        const title = 'Our Partner Organizations';
        res.render('organizations', { 
            title, 
            organizations 
        });
    } catch (error) {
        console.error('❌ Error in showOrganizationsPage:', error);
        next(error);
    }
};

/**
 * Display the organization details page
 */
const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        console.log(`🔍 Fetching organization details for ID: ${organizationId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
            err.status = 400;
            return next(err);
        }
        
        // Get organization details
        const organizationDetails = await getOrganizationDetails(organizationId);
        
        // If organization not found, return 404
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        
        // Get projects for this organization
        const projects = await getProjectsByOrganizationId(organizationId);
        const title = organizationDetails.name;
        
        res.render('organization', {
            title,
            organizationDetails,
            projects,
            formatDate: res.locals.formatDate
        });
    } catch (error) {
        console.error('❌ Error in showOrganizationDetailsPage:', error);
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
 * Process the new organization form submission with validation
 */
const processNewOrganizationForm = async (req, res, next) => {
    try {
        // Check for validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            // Validation failed - loop through errors and add to flash
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            // Redirect back to the new organization form
            return res.redirect('/new-organization');
        }

        // Validation passed - process the form data
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png'; // Use placeholder logo
        
        console.log('📝 Creating new organization:', { name, description, contactEmail });
        
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
 * Display the edit organization form
 */
const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        console.log(`📝 Loading edit form for organization ID: ${organizationId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
            err.status = 400;
            return next(err);
        }
        
        // Get organization details
        const organizationDetails = await getOrganizationDetails(organizationId);
        
        // If organization not found, return 404
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        
        const title = `Edit ${organizationDetails.name}`;
        
        res.render('edit-organization', {
            title,
            organizationDetails
        });
    } catch (error) {
        console.error('❌ Error in showEditOrganizationForm:', error);
        next(error);
    }
};

/**
 * Process the edit organization form submission with validation
 */
const processEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        console.log(`📝 Processing edit form for organization ID: ${organizationId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
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
            // Redirect back to the edit organization form
            return res.redirect(`/edit-organization/${organizationId}`);
        }

        // Validation passed - process the form data
        const { name, description, contactEmail, logoFilename } = req.body;
        
        console.log(`📝 Updating organization ${organizationId}:`, { 
            name, 
            description, 
            contactEmail,
            logoFilename 
        });
        
        // Update the organization
        const updatedOrganization = await updateOrganization(
            organizationId,
            name,
            description,
            contactEmail,
            logoFilename || 'placeholder-logo.png'
        );
        
        console.log(`✅ Organization ${organizationId} updated successfully`);
        
        // Set a success flash message
        req.flash('success', `Organization "${name}" updated successfully!`);
        
        // Redirect to the organization's detail page
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('❌ Error processing edit organization form:', error);
        
        // Set an error flash message
        req.flash('error', 'Failed to update organization. Please try again.');
        
        // Redirect back to the edit form
        res.redirect(`/edit-organization/${req.params.id}`);
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
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation,
    getOrganizationsJSON 
};