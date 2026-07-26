// ============================================
// Organizations Model
// Handles all organization-related database operations
// ============================================

import db from './db.js';

/**
 * Get all organizations from the database
 * @returns {Promise<Array>} Array of organization objects
 */
const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        ORDER BY name;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
};

/**
 * Get organization details by ID
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Object>} Organization details object
 */
const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM organization
        WHERE organization_id = $1;
    `;

    try {
        const result = await db.query(query, [organizationId]);
        // Return the first row of the result set, or null if no rows are found
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error fetching organization details:', error);
        throw error;
    }
};

/**
 * Get organization with project count
 * @param {number} id - Organization ID
 * @returns {Promise<Object>} Organization with project counts
 */
const getOrganizationWithProjectCount = async (id) => {
    const query = `
        SELECT 
            o.*,
            COUNT(sp.project_id) AS total_projects,
            COUNT(sp.project_id) FILTER (WHERE sp.status = 'Active') AS active_projects,
            COUNT(sp.project_id) FILTER (WHERE sp.status = 'Completed') AS completed_projects
        FROM organization o
        LEFT JOIN service_projects sp ON o.organization_id = sp.organization_id
        WHERE o.organization_id = $1
        GROUP BY o.organization_id;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching organization with project count:', error);
        throw error;
    }
};

/**
 * Create a new organization
 * @param {Object} data - Organization data
 * @returns {Promise<Object>} Created organization
 */
const createOrganization = async (data) => {
    const { name, description, contact_email, logo_filename } = data;
    
    const query = `
        INSERT INTO public.organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id, name, description, contact_email, logo_filename;
    `;

    try {
        const result = await db.query(query, [name, description, contact_email, logo_filename]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating organization:', error);
        throw error;
    }
};

/**
 * Update an organization
 * @param {number} id - Organization ID
 * @param {Object} data - Updated organization data
 * @returns {Promise<Object>} Updated organization
 */
const updateOrganization = async (id, data) => {
    const { name, description, contact_email, logo_filename } = data;
    
    const query = `
        UPDATE public.organization
        SET 
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            contact_email = COALESCE($3, contact_email),
            logo_filename = COALESCE($4, logo_filename)
        WHERE organization_id = $5
        RETURNING organization_id, name, description, contact_email, logo_filename;
    `;

    try {
        const result = await db.query(query, [name, description, contact_email, logo_filename, id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error updating organization:', error);
        throw error;
    }
};

/**
 * Delete an organization
 * @param {number} id - Organization ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteOrganization = async (id) => {
    const query = `
        DELETE FROM public.organization
        WHERE organization_id = $1
        RETURNING organization_id;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting organization:', error);
        throw error;
    }
};

// Export ALL functions
export {
    getAllOrganizations,
    getOrganizationDetails,
    getOrganizationWithProjectCount,
    createOrganization,
    updateOrganization,
    deleteOrganization
};