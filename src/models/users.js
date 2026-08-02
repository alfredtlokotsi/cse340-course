// ============================================
// Users Model
// Handles user-related database operations
// ============================================

import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Create a new user in the database
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} passwordHash - Hashed password
 * @returns {Promise<Object>} The created user
 */
const createUser = async (name, email, passwordHash) => {
    // Get the 'user' role ID
    const roleQuery = `SELECT role_id FROM roles WHERE role_name = 'user'`;
    const roleResult = await db.query(roleQuery);
    
    if (roleResult.rows.length === 0) {
        throw new Error('Default role "user" not found in database');
    }
    
    const roleId = roleResult.rows[0].role_id;
    
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, name, email, role_id, created_at;
    `;

    try {
        const result = await db.query(query, [name, email.toLowerCase().trim(), passwordHash, roleId]);
        
        if (result.rows.length === 0) {
            throw new Error('Failed to create user');
        }

        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('✅ Created new user with ID:', result.rows[0].user_id);
        }

        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique violation
            throw new Error('Email already registered. Please use a different email.');
        }
        console.error('❌ Error creating user:', error);
        throw error;
    }
};

/**
 * Find a user by email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} User object or null
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT user_id, name, email, password_hash, role_id 
        FROM users 
        WHERE email = $1
    `;
    
    try {
        const result = await db.query(query, [email.toLowerCase().trim()]);
        
        if (result.rows.length === 0) {
            return null; // User not found
        }
        
        return result.rows[0];
    } catch (error) {
        console.error(`❌ Error finding user by email ${email}:`, error);
        throw error;
    }
};

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} passwordHash - Stored password hash
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticate a user by email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object without password_hash, or null if authentication fails
 */
const authenticateUser = async (email, password) => {
    try {
        // Find the user by email
        const user = await findUserByEmail(email);
        
        // If no user found, return null
        if (!user) {
            return null;
        }
        
        // Verify the password
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        
        // If password is invalid, return null
        if (!isPasswordValid) {
            return null;
        }
        
        // Remove password_hash from user object
        const { password_hash, ...userWithoutPassword } = user;
        
        return userWithoutPassword;
    } catch (error) {
        console.error('❌ Error authenticating user:', error);
        throw error;
    }
};

/**
 * Get a user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 */
const getUserById = async (userId) => {
    const query = `
        SELECT 
            u.user_id,
            u.name,
            u.email,
            u.role_id,
            u.created_at,
            r.role_name
        FROM users u
        INNER JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1;
    `;

    try {
        const result = await db.query(query, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`❌ Error fetching user by ID ${userId}:`, error);
        throw error;
    }
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
    authenticateUser,
    getUserById
};