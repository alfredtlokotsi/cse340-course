// ============================================
// Categories Controller
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

const showProjectsByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!/^\d+$/.test(categoryId)) {
            const err = new Error('Invalid category ID');
            err.status = 400;
            return next(err);
        }
        const category = await getCategoryById(categoryId);
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        const projects = await getProjectsByCategory(categoryId);
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

const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    res.render('new-category', { title });
};

const processNewCategoryForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-category');
        }
        const { name, description, iconClass } = req.body;
        const categoryId = await createCategory(name, description, iconClass);
        req.flash('success', `Category "${name}" added successfully!`);
        res.redirect('/categories');
    } catch (error) {
        console.error('❌ Error processing new category form:', error);
        req.flash('error', 'Failed to create category. Please try again.');
        res.redirect('/new-category');
    }
};

const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!/^\d+$/.test(categoryId)) {
            const err = new Error('Invalid category ID');
            err.status = 400;
            return next(err);
        }
        const category = await getCategoryById(categoryId);
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        const title = `Edit Category: ${category.name}`;
        res.render('edit-category', { title, category });
    } catch (error) {
        console.error('❌ Error in showEditCategoryForm:', error);
        next(error);
    }
};

const processEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if (!/^\d+$/.test(categoryId)) {
            const err = new Error('Invalid category ID');
            err.status = 400;
            return next(err);
        }
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-category/${categoryId}`);
        }
        const { name, description, iconClass, isActive } = req.body;
        await updateCategory(categoryId, name, description, iconClass, isActive === 'on' || isActive === true);
        req.flash('success', `Category "${name}" updated successfully!`);
        res.redirect('/categories');
    } catch (error) {
        console.error('❌ Error processing edit category form:', error);
        req.flash('error', 'Failed to update category. Please try again.');
        res.redirect(`/edit-category/${req.params.id}`);
    }
};

const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
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

const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
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
        req.flash('success', `Categories updated successfully for "${project.title}"!`);
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('❌ Error in processAssignCategoriesForm:', error);
        req.flash('error', 'Failed to update categories. Please try again.');
        res.redirect(`/project/${req.params.projectId}/assign-categories`);
    }
};

const getCategoriesJSON = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

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