// ============================================
// Organizations Model
// ============================================

import db from './db.js';

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
        console.error('❌ Error fetching organizations:', error);
        throw error;
    }
};

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
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error(`❌ Error fetching organization details for ID ${organizationId}:`, error);
        throw error;
    }
};

const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id
    `;

    const queryParams = [name, description, contactEmail, logoFilename];
    
    try {
        const result = await db.query(query, queryParams);
        if (result.rows.length === 0) {
            throw new Error('Failed to create organization');
        }
        return result.rows[0].organization_id;
    } catch (error) {
        console.error('❌ Error creating organization:', error);
        throw error;
    }
};

const updateOrganization = async (id, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE organization
        SET 
            name = $1,
            description = $2,
            contact_email = $3,
            logo_filename = $4
        WHERE organization_id = $5
        RETURNING organization_id, name, description, contact_email, logo_filename;
    `;

    const queryParams = [name, description, contactEmail, logoFilename, id];
    
    try {
        const result = await db.query(query, queryParams);
        if (result.rows.length === 0) {
            throw new Error(`Organization with ID ${id} not found`);
        }
        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error updating organization ${id}:`, error);
        throw error;
    }
};

export {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
};