// ============================================
// Service Projects Model
// Handles all service project database operations
// ============================================

import db from './db.js';

/**
 * Get all service projects with their organization names
 * @returns {Promise<Array>} Array of project objects with organization data
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
            sp.max_volunteers,
            sp.current_volunteers,
            sp.created_at,
            sp.updated_at,
            o.name AS organization_name,
            o.logo_filename AS organization_logo,
            o.contact_email AS organization_email
        FROM service_projects sp
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        ORDER BY sp.project_date;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

/**
 * Get upcoming service projects (limited to specified number)
 * @param {number} numberOfProjects - Maximum number of projects to return
 * @returns {Promise<Array>} Array of upcoming project objects
 */
const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT 
            sp.project_id,
            sp.title,
            sp.description,
            sp.project_date,
            sp.location,
            sp.organization_id,
            o.name AS organization_name
        FROM service_projects sp
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.project_date >= CURRENT_DATE
        ORDER BY sp.project_date ASC
        LIMIT $1;
    `;

    try {
        const result = await db.query(query, [numberOfProjects]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching upcoming projects:', error);
        throw error;
    }
};

/**
 * Get a single service project by ID with organization details
 * @param {number} id - Project ID
 * @returns {Promise<Object>} Project object with organization data
 */
const getProjectDetails = async (id) => {
    const query = `
        SELECT 
            sp.project_id,
            sp.organization_id,
            sp.title,
            sp.description,
            sp.location,
            sp.project_date,
            sp.status,
            sp.max_volunteers,
            sp.current_volunteers,
            sp.created_at,
            sp.updated_at,
            o.name AS organization_name,
            o.logo_filename AS organization_logo,
            o.contact_email AS organization_email,
            o.description AS organization_description
        FROM service_projects sp
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.project_id = $1;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
    }
};

/**
 * Get projects by organization ID
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Array>} Array of project objects
 */
const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
            project_id,
            organization_id,
            title,
            description,
            location,
            project_date,
            status,
            max_volunteers,
            current_volunteers
        FROM service_projects
        WHERE organization_id = $1
        ORDER BY project_date;
    `;

    try {
        const result = await db.query(query, [organizationId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects by organization:', error);
        throw error;
    }
};

/**
 * Get a single service project by ID (basic version)
 * @param {number} id - Project ID
 * @returns {Promise<Object>} Project object
 */
const getProjectById = async (id) => {
    const query = `
        SELECT 
            sp.*,
            o.name AS organization_name,
            o.logo_filename AS organization_logo,
            o.contact_email AS organization_email
        FROM service_projects sp
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.project_id = $1;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching project by ID:', error);
        throw error;
    }
};

/**
 * Create a new service project
 * @param {Object} data - Project data
 * @returns {Promise<Object>} Created project
 */
const createProject = async (data) => {
    const { 
        organization_id, 
        title, 
        description, 
        location, 
        project_date, 
        status, 
        max_volunteers 
    } = data;
    
    const query = `
        INSERT INTO service_projects (
            organization_id, 
            title, 
            description, 
            location, 
            project_date, 
            status, 
            max_volunteers
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [
            organization_id, 
            title, 
            description, 
            location, 
            project_date, 
            status, 
            max_volunteers
        ]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

/**
 * Update a service project
 * @param {number} id - Project ID
 * @param {Object} data - Updated project data
 * @returns {Promise<Object>} Updated project
 */
const updateProject = async (id, data) => {
    const { 
        title, 
        description, 
        location, 
        project_date, 
        status, 
        max_volunteers,
        current_volunteers
    } = data;
    
    const query = `
        UPDATE service_projects
        SET 
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            location = COALESCE($3, location),
            project_date = COALESCE($4, project_date),
            status = COALESCE($5, status),
            max_volunteers = COALESCE($6, max_volunteers),
            current_volunteers = COALESCE($7, current_volunteers),
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $8
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [
            title, 
            description, 
            location, 
            project_date, 
            status, 
            max_volunteers,
            current_volunteers,
            id
        ]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

/**
 * Delete a service project
 * @param {number} id - Project ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteProject = async (id) => {
    const query = `
        DELETE FROM service_projects
        WHERE project_id = $1
        RETURNING project_id;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    if (!date) return 'Date TBD';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Export all functions
export {
    getAllProjects,
    getUpcomingProjects,
    getProjectDetails,
    getProjectsByOrganizationId,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    formatDate
};