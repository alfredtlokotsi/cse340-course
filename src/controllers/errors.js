// ============================================
// Error Controller
// ============================================

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

const test404Error = (req, res, next) => {
    const err = new Error('This is a 404 test error');
    err.status = 404;
    next(err);
};

const show404Page = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    err.requestedUrl = req.url;
    next(err);
};

const handleError = (err, req, res, next) => {
    const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
    
    console.error('❌ Error occurred:', err.message);
    console.error('📚 Stack trace:', err.stack);
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack,
        NODE_ENV: NODE_ENV
    };
    
    if (status === 404 && err.requestedUrl) {
        context.requestedUrl = err.requestedUrl;
    }
    
    res.status(status).render(`errors/${template}`, context);
};

export { 
    testErrorPage, 
    test404Error, 
    show404Page, 
    handleError 
};