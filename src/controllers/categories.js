// ============================================
// Categories Controller
// ============================================

import { getAllCategories } from '../models/categories.js';

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
    getCategoriesJSON 
};