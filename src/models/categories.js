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
            c.category_id,
            c.name,
            c.description,
            c.icon_class,
            c.is_active,
            c.created_at,
            COUNT(pc.project_id) AS project_count
        FROM categories c
        LEFT JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE c.category_id = $1
        GROUP BY c.category_id, c.name, c.description, c.icon_class, c.is_active, c.created_at;
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
            o.name AS organization_name,
            o.organization_id
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

/**
 * Create a new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>} Created category
 */
const createCategory = async (data) => {
    const { name, description, icon_class, is_active } = data;
    
    const query = `
        INSERT INTO categories (name, description, icon_class, is_active)
        VALUES ($1, $2, $3, COALESCE($4, true))
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [name, description, icon_class, is_active]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>} Updated category
 */
const updateCategory = async (id, data) => {
    const { name, description, icon_class, is_active } = data;
    
    const query = `
        UPDATE categories
        SET 
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            icon_class = COALESCE($3, icon_class),
            is_active = COALESCE($4, is_active)
        WHERE category_id = $5
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [name, description, icon_class, is_active, id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteCategory = async (id) => {
    const query = `
        DELETE FROM categories
        WHERE category_id = $1
        RETURNING category_id;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// Export ALL functions
export {
    getAllCategories,
    getCategoryById,
    getProjectsByCategory,
    createCategory,
    updateCategory,
    deleteCategory
};