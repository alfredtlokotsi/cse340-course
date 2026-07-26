// ============================================
// Categories Controller
// Handles category-related page rendering
// ============================================

import { 
    getAllCategories,
    getCategoryById,
    getProjectsByCategory
} from '../models/categories.js';

/**
 * Display the categories page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        
        res.render('categories', { 
            title, 
            categories 
        });
    } catch (error) {
        console.error('Error in showCategoriesPage:', error);
        next(error);
    }
};

/**
 * Display a single category detail page with its projects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const showCategoryDetailPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        
        // Validate that the ID is a number
        if (!/^\d+$/.test(categoryId)) {
            const err = new Error('Invalid category ID');
            err.status = 400;
            return next(err);
        }
        
        // Get category details and its projects
        const category = await getCategoryById(categoryId);
        
        // If category not found, return 404
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        
        const projects = await getProjectsByCategory(categoryId);
        const title = category.name;
        
        res.render('category-detail', {
            title,
            category,
            projects,
            formatDate: res.locals.formatDate
        });
    } catch (error) {
        console.error('Error in showCategoryDetailPage:', error);
        next(error);
    }
};

/**
 * Get categories as JSON (API endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCategoriesJSON = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// Export ALL controller functions
export { 
    showCategoriesPage,
    showCategoryDetailPage,
    getCategoriesJSON
};