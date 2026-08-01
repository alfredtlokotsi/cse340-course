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

const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        next(error);
    }
};

const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
            err.status = 400;
            return next(err);
        }
        const organizationDetails = await getOrganizationDetails(organizationId);
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

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-organization');
        }
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';
        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
        req.flash('success', `Organization "${name}" added successfully!`);
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('❌ Error processing new organization form:', error);
        req.flash('error', 'Failed to create organization. Please try again.');
        res.redirect('/new-organization');
    }
};

const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
            err.status = 400;
            return next(err);
        }
        const organizationDetails = await getOrganizationDetails(organizationId);
        if (!organizationDetails) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }
        const title = `Edit ${organizationDetails.name}`;
        res.render('edit-organization', { title, organizationDetails });
    } catch (error) {
        console.error('❌ Error in showEditOrganizationForm:', error);
        next(error);
    }
};

const processEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        if (!/^\d+$/.test(organizationId)) {
            const err = new Error('Invalid organization ID');
            err.status = 400;
            return next(err);
        }
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-organization/${organizationId}`);
        }
        const { name, description, contactEmail, logoFilename } = req.body;
        await updateOrganization(organizationId, name, description, contactEmail, logoFilename);
        req.flash('success', `Organization "${name}" updated successfully!`);
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('❌ Error processing edit organization form:', error);
        req.flash('error', 'Failed to update organization. Please try again.');
        res.redirect(`/edit-organization/${req.params.id}`);
    }
};

const getOrganizationsJSON = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.json(organizations);
    } catch (error) {
        next(error);
    }
};

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