// ============================================
// Users Controller
// Handles user registration and authentication
// ============================================

import bcrypt from 'bcrypt';
import { createUser, authenticateUser, findUserByEmail } from '../models/users.js';
import { body, validationResult } from 'express-validator';

const saltRounds = 10;

// ============================================
// Validation Rules
// ============================================

const userValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
];

// ============================================
// Middleware
// ============================================

/**
 * Middleware to require login for protected routes
 */
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

// ============================================
// Controller Functions
// ============================================

/**
 * Display the registration form
 */
const showUserRegistrationForm = (req, res) => {
    const title = 'Register';
    res.render('register', { title });
};

/**
 * Process the registration form submission with validation
 */
const processUserRegistrationForm = async (req, res, next) => {
    try {
        // Check for validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/register');
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            req.flash('error', 'Email already registered. Please use a different email.');
            return res.redirect('/register');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create the user
        const newUser = await createUser(name, email, passwordHash);

        console.log(`✅ User registered: ${newUser.email} (ID: ${newUser.user_id})`);

        // Set a success flash message
        req.flash('success', `Welcome, ${newUser.name}! Your account has been created successfully.`);

        // Redirect to login page
        res.redirect('/login');
    } catch (error) {
        console.error('❌ Error processing registration:', error);
        
        if (error.message.includes('Email already registered')) {
            req.flash('error', error.message);
            return res.redirect('/register');
        }
        
        req.flash('error', 'Failed to create account. Please try again.');
        res.redirect('/register');
    }
};

/**
 * Display the login form
 */
const showLoginForm = (req, res) => {
    // If user is already logged in, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    
    const title = 'Login';
    res.render('login', { title });
};

/**
 * Process the login form submission
 */
const processLoginForm = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            req.flash('error', 'Email and password are required');
            return res.redirect('/login');
        }

        // Authenticate the user
        const user = await authenticateUser(email, password);

        if (user) {
            // Store user in session
            req.session.user = user;
            
            console.log(`✅ User logged in: ${user.email} (ID: ${user.user_id})`);
            
            // Set success flash message
            req.flash('success', `Welcome back, ${user.name}!`);
            
            // Redirect to dashboard
            return res.redirect('/dashboard');
        } else {
            // Authentication failed
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('❌ Error processing login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

/**
 * Process logout
 */
const processLogout = (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Error destroying session:', err);
            req.flash('error', 'Failed to logout. Please try again.');
            return res.redirect('/');
        }
        
        console.log('✅ User logged out');
        req.flash('success', 'You have been successfully logged out.');
        res.redirect('/login');
    });
};

/**
 * Display the dashboard page (protected route)
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const title = 'Dashboard';
    
    res.render('dashboard', { 
        title,
        name: user.name,
        email: user.email
    });
};

// Export controller functions
export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    showDashboard,
    userValidation
};