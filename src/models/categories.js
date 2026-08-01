// ============================================
// Categories Model
// ============================================

import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT 
            c.category_id,
            c.name,
            c.description,
            c.icon_class,
            c.is_active,
            c.created_at,
            COUNT(pc.project_id) AS project_count
        FROM categories c
        LEFT JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE c.is_active = true
        GROUP BY c.category_id, c.name, c.description, c.icon_class, c.is_active, c.created_at
        ORDER BY c.name;
    `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
    }
};

const getCategoryById = async (id) => {
    const query = `
        SELECT 
            c.category_id,
            c.name,
            c.description,
            c.icon_class,
            c.is_active,
            c.created_at,
            COUNT(pc.project_id) AS project_count
        FROM categories c
        LEFT JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE c.category_id = $1
        GROUP BY c.category_id, c.name, c.description, c.icon_class, c.is_active, c.created_at;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`❌ Error fetching category by ID ${id}:`, error);
        throw error;
    }
};

const getCategoriesByServiceProjectId = async (projectId) => {
    const query = `
        SELECT 
            c.category_id,
            c.name,
            c.description,
            c.icon_class
        FROM categories c
        INNER JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;

    try {
        const result = await db.query(query, [projectId]);
        return result.rows;
    } catch (error) {
        console.error(`❌ Error fetching categories for project ${projectId}:`, error);
        throw error;
    }
};

const createCategory = async (name, description = null, iconClass = 'fas fa-tag') => {
    const query = `
        INSERT INTO categories (name, description, icon_class, is_active)
        VALUES ($1, $2, $3, true)
        RETURNING category_id;
    `;

    try {
        const result = await db.query(query, [name.trim(), description, iconClass]);
        if (result.rows.length === 0) {
            throw new Error('Failed to create category');
        }
        return result.rows[0].category_id;
    } catch (error) {
        console.error('❌ Error creating category:', error);
        throw error;
    }
};

const updateCategory = async (id, name, description = null, iconClass = 'fas fa-tag', isActive = true) => {
    const query = `
        UPDATE categories
        SET 
            name = $1,
            description = $2,
            icon_class = $3,
            is_active = $4
        WHERE category_id = $5
        RETURNING category_id, name, description, icon_class, is_active, created_at;
    `;

    try {
        const result = await db.query(query, [name.trim(), description, iconClass, isActive, id]);
        if (result.rows.length === 0) {
            throw new Error(`Category with ID ${id} not found`);
        }
        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error updating category ${id}:`, error);
        throw error;
    }
};

const deleteCategory = async (id) => {
    const query = `
        UPDATE categories
        SET is_active = false
        WHERE category_id = $1
        RETURNING category_id;
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error(`❌ Error deleting category ${id}:`, error);
        throw error;
    }
};

const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO project_categories (project_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (project_id, category_id) DO NOTHING
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [projectId, categoryId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`❌ Error assigning category ${categoryId} to project ${projectId}:`, error);
        throw error;
    }
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    const deleteQuery = `
        DELETE FROM project_categories
        WHERE project_id = $1;
    `;

    try {
        await db.query(deleteQuery, [projectId]);

        if (!categoryIds || categoryIds.length === 0) {
            return;
        }

        const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
        const validIds = ids.filter(id => id && id !== '');

        for (const categoryId of validIds) {
            await assignCategoryToProject(projectId, parseInt(categoryId));
        }
    } catch (error) {
        console.error(`❌ Error updating category assignments for project ${projectId}:`, error);
        throw error;
    }
};

export {
    getAllCategories,
    getCategoryById,
    getCategoriesByServiceProjectId,
    createCategory,
    updateCategory,
    deleteCategory,
    assignCategoryToProject,
    updateCategoryAssignments
};