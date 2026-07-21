import { pool } from '../db.js';

/**
 * Get all projects with their organization names
 * @returns {Promise<Array>} Array of project objects with organization names
 */
const getAllProjects = async () => {
    const query = `
        SELECT 
            sp.project_id,
            sp.organization_id,
            sp.title,
            sp.description,
            sp.location,
            sp.project_date,
            sp.status,
            sp.created_at,
            o.name as organization_name,
            o.contact_email as organization_email
        FROM service_projects sp
        JOIN organizations o ON sp.organization_id = o.organization_id
        ORDER BY sp.project_date DESC, sp.title ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

export { getAllProjects };