// ============================================
// Error Controller
// Handles error page rendering and testing
// ============================================

/**
 * Test route for 500 errors (development only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

/**
 * Test route for 404 errors (development only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const test404Error = (req, res, next) => {
    const err = new Error('This is a 404 test error');
    err.status = 404;
    next(err);
};

/**
 * Catch-all route for 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const show404Page = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    err.requestedUrl = req.url;
    next(err);
};

/**
 * Global error handler
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleError = (err, req, res, next) => {
    const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
    
    // Log error details for debugging
    console.error('❌ Error occurred:', err.message);
    console.error('📚 Stack trace:', err.stack);
    
    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack,
        NODE_ENV: NODE_ENV
    };
    
    // Add requested URL for 404 errors
    if (status === 404 && err.requestedUrl) {
        context.requestedUrl = err.requestedUrl;
    }
    
    // Render the appropriate error template
    res.status(status).render(`errors/${template}`, context);
};

// Export ALL error controller functions
export { 
    testErrorPage, 
    test404Error, 
    show404Page, 
    handleError 
};