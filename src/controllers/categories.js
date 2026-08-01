// ============================================
// Categories Controller
// Handles category-related page rendering
// ============================================

import { 
    getAllCategories,
    getCategoryById,
    getCategoriesByServiceProjectId,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails, getProjectsByCategory, formatDate } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// ============================================
// Validation Rules
// ============================================

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-&']+$/)
        .withMessage('Category name contains invalid characters')
];

// ============================================
// Controller Functions
// ============================================

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
 * Display projects by category
 */
const showProjectsByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        console.log(`📋 Fetching projects for category ID: ${categoryId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(categoryId)) {
            const err = new Error('Invalid category ID');
            err.status = 400;
            return next(err);
        }
        
        // Get category details
        const category = await getCategoryById(categoryId);
        
        // If category not found, return 404
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        
        // Get projects for this category
        const projects = await getProjectsByCategory(categoryId);
        console.log(`✅ Found ${projects.length} projects for category: ${category.name}`);
        
        const title = `Projects in: ${category.name}`;
        
        res.render('projects', {
            title,
            projects,
            formatDate: formatDate
        });
    } catch (error) {
        console.error('❌ Error in showProjectsByCategory:', error);
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
    showProjectsByCategory,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    getCategoriesJSON
};