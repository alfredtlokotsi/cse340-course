// Import any needed model functions (none are needed for error pages)

/**
 * Test route for 500 errors
 * Creates a test error and passes it to the error handler
 */
const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

// Export the controller functions
export { testErrorPage };