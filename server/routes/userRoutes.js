// server/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply protect and isAdmin to all user management routes
router.use(protect, isAdmin);

// Route to get all users or just students
router.get('/', userController.getAllUsers);           // GET /api/users
router.get('/students', userController.getAllStudents);  // GET /api/users/students

// Routes for specific user ID
router.route('/:id')
    .get(userController.getUserById)   // GET /api/users/:id
    .put(userController.updateUser)    // PUT /api/users/:id
    .delete(userController.deleteUser); // DELETE /api/users/:id

module.exports = router;