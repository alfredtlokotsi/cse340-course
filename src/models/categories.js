import { pool } from '../db.js';

/**
 * Get all categories from the database
 * @returns {Promise<Array>} Array of category objects
 */
const getAllCategories = async () => {
    const query = `
        SELECT category_id, name, description
        FROM categories
        ORDER BY name ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

export { getAllCategories };