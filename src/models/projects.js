import db from './db.js';

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
            o.contact_email as organization_email,
            o.logo_filename as organization_logo
        FROM service_projects sp
        JOIN organizations o ON sp.organization_id = o.organization_id
        ORDER BY sp.project_date DESC, sp.title ASC;
    `;

    const result = await db.query(query);
    return result.rows;
};

/**
 * Get projects by organization ID
 * @param {number} organizationId - The organization ID
 * @returns {Promise<Array>} Array of project objects
 */
const getProjectsByOrganization = async (organizationId) => {
    const query = `
        SELECT 
            sp.project_id,
            sp.title,
            sp.description,
            sp.location,
            sp.project_date,
            sp.status,
            o.name as organization_name
        FROM service_projects sp
        JOIN organizations o ON sp.organization_id = o.organization_id
        WHERE sp.organization_id = $1
        ORDER BY sp.project_date DESC;
    `;

    const result = await db.query(query, [organizationId]);
    return result.rows;
};

/**
 * Get project by ID with full details
 * @param {number} projectId - The project ID
 * @returns {Promise<Object>} Project object with details
 */
const getProjectById = async (projectId) => {
    const query = `
        SELECT 
            sp.*,
            o.name as organization_name,
            o.contact_email as organization_email
        FROM service_projects sp
        JOIN organizations o ON sp.organization_id = o.organization_id
        WHERE sp.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0];
};

export { getAllProjects, getProjectsByOrganization, getProjectById };