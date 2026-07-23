// Import any needed model functions
import { getAllCategories } from '../models/categories.js';

/**
 * Controller for the categories page
 * Fetches all categories from the database and renders the categories view
 */
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        console.log(`Found ${categories.length} categories`);
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('Error in showCategoriesPage:', error);
        const err = new Error('Error loading categories');
        err.status = 500;
        next(err);
    }
};

// Export the controller functions
export { showCategoriesPage };