// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthMiddleware {
    // Protect routes - verify token and attach user to req
    async protect(req, res, next) {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                // Get token from header (Bearer TOKEN_STRING)
                token = req.headers.authorization.split(' ')[1];

                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user from the token (find by ID, exclude password)
                req.user = await User.findById(decoded.id).select('-password'); // Decoded contains { id: userId }

                if (!req.user) {
                    return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
                }

                next(); // Proceed to the next middleware/route handler
            } catch (error) {
                console.error('Token verification failed:', error.message);
                res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }
    }

    // Middleware to check for admin role
    isAdmin(req, res, next) {
        // Assumes 'protect' middleware runs first and attaches req.user
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Forbidden: Access restricted to admins' }); // 403 Forbidden
        }
    }

    // Middleware to check for student role
    isStudent(req, res, next) {
         // Assumes 'protect' middleware runs first
        if (req.user && req.user.role === 'student') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Forbidden: Access restricted to students' });
        }
    }
}

// Export an instance of the class
module.exports = new AuthMiddleware();