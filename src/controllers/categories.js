// ============================================
// Categories Controller
// Handles category-related page rendering
// ============================================

import { 
    getAllCategories,
    getCategoriesByServiceProjectId,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

/**
 * Display the categories listing page
 */
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('❌ Error in showCategoriesPage:', error);
        next(error);
    }
};

/**
 * Display the assign categories form
 */
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        console.log(`📋 Loading assign categories form for project ID: ${projectId}`);

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

        // Get all categories
        const allCategories = await getAllCategories();

        // Get categories already assigned to this project
        const assignedCategories = await getCategoriesByServiceProjectId(projectId);
        const assignedCategoryIds = assignedCategories.map(c => c.category_id);

        const title = `Assign Categories to Project: ${project.title}`;

        res.render('assign-categories', {
            title,
            project,
            allCategories,
            assignedCategoryIds
        });
    } catch (error) {
        console.error('❌ Error in showAssignCategoriesForm:', error);
        next(error);
    }
};

/**
 * Process the assign categories form submission
 */
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        console.log(`📝 Processing category assignments for project ID: ${projectId}`);

        // Validate that the ID is a number
        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }

        // Get selected category IDs from the form
        // req.body.categories will be an array if multiple checkboxes are selected
        let categoryIds = req.body.categories;

        // If no categories selected, pass an empty array
        if (!categoryIds) {
            categoryIds = [];
        } else if (!Array.isArray(categoryIds)) {
            // If only one checkbox is selected, it comes as a string
            categoryIds = [categoryIds];
        }

        // Get project details for the success message
        const project = await getProjectDetails(projectId);

        // Update the category assignments
        await updateCategoryAssignments(projectId, categoryIds);

        console.log(`✅ Category assignments updated for project: ${project.title}`);

        // Set a success flash message
        req.flash('success', `Categories updated successfully for "${project.title}"!`);

        // Redirect to the project details page
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('❌ Error in processAssignCategoriesForm:', error);

        // Set an error flash message
        req.flash('error', 'Failed to update categories. Please try again.');

        // Redirect back to the assign categories form
        res.redirect(`/project/${req.params.projectId}/assign-categories`);
    }
};

/**
 * Get categories as JSON (API endpoint)
 */
const getCategoriesJSON = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// Export all controller functions
export {
    showCategoriesPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    getCategoriesJSON
};