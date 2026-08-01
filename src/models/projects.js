// ============================================
// Service Projects Model
// Handles all service project database operations
// ============================================

import db from './db.js';

/**
 * Get all service projects with their organization names
 * @returns {Promise<Array>} Array of project objects
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
            o.contact_email AS organization_email,
            o.description AS organization_description
        FROM service_projects sp
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        ORDER BY sp.project_date;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('❌ Error fetching all projects:', error);
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
        console.error('❌ Error fetching upcoming projects:', error);
        throw error;
    }
};

/**
 * Get projects by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of project objects with organization data
 */
const getProjectsByCategory = async (categoryId) => {
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
            o.description AS organization_description,
            c.name AS category_name
        FROM service_projects sp
        INNER JOIN organization o ON sp.organization_id = o.organization_id
        INNER JOIN project_categories pc ON sp.project_id = pc.project_id
        INNER JOIN categories c ON pc.category_id = c.category_id
        WHERE pc.category_id = $1
        ORDER BY sp.project_date;
    `;

    try {
        const result = await db.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error(`❌ Error fetching projects for category ${categoryId}:`, error);
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
        console.error(`❌ Error fetching project details for ID ${id}:`, error);
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
        console.error(`❌ Error fetching projects for organization ${organizationId}:`, error);
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
        console.error(`❌ Error fetching project by ID ${id}:`, error);
        throw error;
    }
};

/**
 * Create a new service project in the database
 * @param {string} title - Project title
 * @param {string} description - Project description
 * @param {string} location - Project location
 * @param {string} date - Project date
 * @param {number} organizationId - ID of the organization
 * @returns {number} The ID of the newly created project
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO service_projects (title, description, location, project_date, organization_id, status)
        VALUES ($1, $2, $3, $4, $5, 'Upcoming')
        RETURNING project_id;
    `;

    const queryParams = [title, description, location, date, organizationId];
    
    try {
        const result = await db.query(query, queryParams);

        if (result.rows.length === 0) {
            throw new Error('Failed to create project');
        }

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('✅ Created new project with ID:', result.rows[0].project_id);
        }

        return result.rows[0].project_id;
    } catch (error) {
        console.error('❌ Error creating project:', error);
        throw error;
    }
};

/**
 * Update an existing service project in the database
 * @param {number} id - Project ID
 * @param {string} title - Updated project title
 * @param {string} description - Updated project description
 * @param {string} location - Updated project location
 * @param {string} date - Updated project date
 * @param {number} organizationId - Updated organization ID
 * @param {string} status - Updated project status
 * @param {number} maxVolunteers - Updated max volunteers
 * @param {number} currentVolunteers - Updated current volunteers
 * @returns {Promise<Object>} The updated project record
 */
const updateProject = async (id, title, description, location, date, organizationId, status, maxVolunteers, currentVolunteers) => {
    const query = `
        UPDATE service_projects
        SET 
            title = $1,
            description = $2,
            location = $3,
            project_date = $4,
            organization_id = $5,
            status = $6,
            max_volunteers = $7,
            current_volunteers = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $9
        RETURNING project_id, title, description, location, project_date, organization_id, status, max_volunteers, current_volunteers;
    `;

    const queryParams = [title, description, location, date, organizationId, status, maxVolunteers, currentVolunteers, id];
    
    try {
        const result = await db.query(query, queryParams);

        if (result.rows.length === 0) {
            throw new Error(`Project with ID ${id} not found`);
        }

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log(`✅ Updated project with ID: ${id}`);
        }

        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error updating project ${id}:`, error);
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

/**
 * Format date for input (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string for input
 */
const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Export all functions
export {
    getAllProjects,
    getUpcomingProjects,
    getProjectsByCategory,
    getProjectDetails,
    getProjectsByOrganizationId,
    getProjectById,
    createProject,
    updateProject,
    formatDate,
    formatDateForInput
};