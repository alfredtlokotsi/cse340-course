import { pool } from '../db.js';

/**
 * Get all organizations from the database
 * @returns {Promise<Array>} Array of organization objects
 */
const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM organizations
        ORDER BY name ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

export { getAllOrganizations };