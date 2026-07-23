// Import any needed model functions (none are needed for the home page)

/**
 * Controller for the home page
 * Renders the home view with the title
 */
const showHomePage = async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
};

// Export the controller functions
export { showHomePage };