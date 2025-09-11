// server/routes/resultRoutes.js
const express = require('express');
const resultController = require('../controllers/resultController');
const { protect, isAdmin, isStudent } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply protect middleware to all result routes
router.use(protect);

// Student route to submit an exam
router.post('/submit/:examId', isStudent, resultController.submitExam); // POST /api/results/submit/:examId (Student only)

// Student route to view their own results summary
router.get('/my-results', isStudent, resultController.getMyResults); // GET /api/results/my-results (Student only)

// Admin route to view all results (can add filtering query params)
router.get('/', isAdmin, resultController.getAllResults); // GET /api/results (Admin only)

// Route to get detailed view of a single result
router.get('/:resultId', resultController.getResultDetails); // GET /api/results/:resultId (Admin or Student owner)

module.exports = router;