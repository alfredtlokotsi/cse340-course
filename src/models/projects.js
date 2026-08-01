// ============================================
// Service Projects Model
// ============================================

import db from './db.js';

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
        return result.rows[0].project_id;
    } catch (error) {
        console.error('❌ Error creating project:', error);
        throw error;
    }
};

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
        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error updating project ${id}:`, error);
        throw error;
    }
};

const registerVolunteer = async (projectId, userId = 1) => {
    const checkQuery = `
        SELECT project_id, title, max_volunteers, current_volunteers
        FROM service_projects
        WHERE project_id = $1;
    `;

    const checkResult = await db.query(checkQuery, [projectId]);
    
    if (checkResult.rows.length === 0) {
        throw new Error('Project not found');
    }

    const project = checkResult.rows[0];
    
    if (project.max_volunteers && project.current_volunteers >= project.max_volunteers) {
        throw new Error('Project is full. No more volunteers can register.');
    }

    const updateQuery = `
        UPDATE service_projects
        SET 
            current_volunteers = current_volunteers + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $1
        RETURNING project_id, title, current_volunteers, max_volunteers;
    `;

    try {
        const result = await db.query(updateQuery, [projectId]);

        if (result.rows.length === 0) {
            throw new Error(`Project with ID ${projectId} not found`);
        }

        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error registering volunteer for project ${projectId}:`, error);
        throw error;
    }
};

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

const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

export {
    getAllProjects,
    getUpcomingProjects,
    getProjectsByCategory,
    getProjectDetails,
    getProjectsByOrganizationId,
    getProjectById,
    createProject,
    updateProject,
    registerVolunteer,
    formatDate,
    formatDateForInput
};