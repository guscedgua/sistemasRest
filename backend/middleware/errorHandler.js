const  errorHandler = (err, req, res, next) => {
    // Determine the status code: if response status is still 200 (default), it's a server error (500),
    // otherwise, use the status code already set (e.g., by another middleware or controller).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode); // Set the HTTP status code for the response

    // Send a JSON response with the error message
    res.json({
        message: err.message, // The error message
        // In production, hide the stack trace for security reasons
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, 
    });
};

export { errorHandler };
