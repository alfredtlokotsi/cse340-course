// ============================================
// Categories Model
// Handles all category-related database operations
// ============================================

import db from './db.js';

/**
 * Get all categories from the database
 * @returns {Promise<Array>} Array of category objects
 */
const getAllCategories = async () => {
    const query = `
        SELECT 
            c.category_id,
            c.name,
            c.description,
            c.icon_class,
            c.is_active,
            c.created_at,
            COUNT(pc.project_id) AS project_count
        FROM categories c
        LEFT JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE c.is_active = true
        GROUP BY c.category_id, c.name, c.description, c.icon_class, c.is_active, c.created_at
        ORDER BY c.name;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Get a single category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Category object
 */
const getCategoryById = async (id) => {
    const query = `
        SELECT 
            c.*,
            COUNT(pc.project_id) AS project_count
        FROM categories c
        LEFT JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE c.category_id = $1
        GROUP BY c.category_id
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        throw error;
    }
};

/**
 * Get projects for a specific category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of project objects
 */
const getProjectsByCategory = async (categoryId) => {
    const query = `
        SELECT 
            sp.project_id,
            sp.title,
            sp.description,
            sp.location,
            sp.project_date,
            sp.status,
            o.name AS organization_name
        FROM service_projects sp
        INNER JOIN project_categories pc ON sp.project_id = pc.project_id
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY sp.project_date;
    `;

    try {
        const result = await db.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects by category:', error);
        throw error;
    }
};

// Export ALL functions
export { 
    getAllCategories,
    getCategoryById,
    getProjectsByCategory
};