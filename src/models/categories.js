import db from './db.js';

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

    const result = await db.query(query);
    return result.rows;
};

/**
 * Get categories for a specific project
 * @param {number} projectId - The project ID
 * @returns {Promise<Array>} Array of category objects
 */
const getCategoriesByProject = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name, c.description
        FROM categories c
        JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name ASC;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows;
};

/**
 * Get projects for a specific category
 * @param {number} categoryId - The category ID
 * @returns {Promise<Array>} Array of project objects
 */
const getProjectsByCategory = async (categoryId) => {
    const query = `
        SELECT sp.project_id, sp.title, sp.description, sp.project_date, sp.status,
               o.name as organization_name
        FROM service_projects sp
        JOIN project_categories pc ON sp.project_id = pc.project_id
        JOIN organizations o ON sp.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY sp.project_date DESC;
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows;
};

export { getAllCategories, getCategoriesByProject, getProjectsByCategory };