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
        console.error('❌ Error fetching organizations:', error);
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
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error(`❌ Error fetching organization details for ID ${organizationId}:`, error);
        throw error;
    }
};

/**
 * Creates a new organization in the database.
 * @param {string} name - The name of the organization.
 * @param {string} description - A description of the organization.
 * @param {string} contactEmail - The contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo.
 * @returns {number} The id of the newly created organization record.
 */
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

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('✅ Created new organization with ID:', result.rows[0].organization_id);
        }

        return result.rows[0].organization_id;
    } catch (error) {
        console.error('❌ Error creating organization:', error);
        throw error;
    }
};

/**
 * Updates an existing organization in the database.
 * @param {number} id - The ID of the organization to update.
 * @param {string} name - The updated name of the organization.
 * @param {string} description - The updated description of the organization.
 * @param {string} contactEmail - The updated contact email for the organization.
 * @param {string} logoFilename - The updated filename of the organization's logo.
 * @returns {Promise<Object>} The updated organization record.
 */
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

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log(`✅ Updated organization with ID: ${id}`);
        }

        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error updating organization ${id}:`, error);
        throw error;
    }
};

// Export ALL functions
export {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization,
    updateOrganization
};