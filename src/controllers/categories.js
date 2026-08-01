// ============================================
// Categories Controller
// Handles category-related page rendering
// ============================================

import { 
    getAllCategories,
    getCategoryById,
    getCategoriesByServiceProjectId,
    createCategory,
    updateCategory,
    deleteCategory,
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
 * Display the new category form
 */
const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    res.render('new-category', { title });
};

/**
 * Process the new category form submission with validation
 */
const processNewCategoryForm = async (req, res, next) => {
    try {
        // Check for validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-category');
        }

        // Validation passed - process the form data
        const { name, description, iconClass } = req.body;
        
        console.log('📝 Creating new category:', { name, description, iconClass });
        
        // Create the category
        const categoryId = await createCategory(name, description, iconClass);
        
        console.log(`✅ Category created with ID: ${categoryId}`);
        
        // Set a success flash message
        req.flash('success', `Category "${name}" added successfully!`);
        
        // Redirect to the categories list page
        res.redirect('/categories');
    } catch (error) {
        console.error('❌ Error processing new category form:', error);
        
        // Set an error flash message
        req.flash('error', 'Failed to create category. Please try again.');
        
        // Redirect back to the form
        res.redirect('/new-category');
    }
};

/**
 * Display the edit category form
 */
const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        console.log(`📝 Loading edit form for category ID: ${categoryId}`);
        
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
        
        const title = `Edit Category: ${category.name}`;
        
        res.render('edit-category', {
            title,
            category
        });
    } catch (error) {
        console.error('❌ Error in showEditCategoryForm:', error);
        next(error);
    }
};

/**
 * Process the edit category form submission with validation
 */
const processEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        console.log(`📝 Processing edit form for category ID: ${categoryId}`);
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(categoryId)) {
            const err = new Error('Invalid category ID');
            err.status = 400;
            return next(err);
        }
        
        // Check for validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-category/${categoryId}`);
        }

        // Validation passed - process the form data
        const { name, description, iconClass, isActive } = req.body;
        
        console.log(`📝 Updating category ${categoryId}:`, { 
            name, 
            description, 
            iconClass,
            isActive
        });
        
        // Update the category
        const updatedCategory = await updateCategory(
            categoryId,
            name,
            description,
            iconClass,
            isActive === 'on' || isActive === true
        );
        
        console.log(`✅ Category ${categoryId} updated successfully`);
        
        // Set a success flash message
        req.flash('success', `Category "${name}" updated successfully!`);
        
        // Redirect to the categories list page
        res.redirect('/categories');
    } catch (error) {
        console.error('❌ Error processing edit category form:', error);
        
        // Set an error flash message
        req.flash('error', 'Failed to update category. Please try again.');
        
        // Redirect back to the edit form
        res.redirect(`/edit-category/${req.params.id}`);
    }
};

/**
 * Display the assign categories form
 */
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        console.log(`📋 Loading assign categories form for project ID: ${projectId}`);

        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }

        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }

        const allCategories = await getAllCategories();
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

        if (!/^\d+$/.test(projectId)) {
            const err = new Error('Invalid project ID');
            err.status = 400;
            return next(err);
        }

        let categoryIds = req.body.categories;

        if (!categoryIds) {
            categoryIds = [];
        } else if (!Array.isArray(categoryIds)) {
            categoryIds = [categoryIds];
        }

        const project = await getProjectDetails(projectId);

        await updateCategoryAssignments(projectId, categoryIds);

        console.log(`✅ Category assignments updated for project: ${project.title}`);

        req.flash('success', `Categories updated successfully for "${project.title}"!`);
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('❌ Error in processAssignCategoriesForm:', error);
        req.flash('error', 'Failed to update categories. Please try again.');
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
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation,
    getCategoriesJSON
};