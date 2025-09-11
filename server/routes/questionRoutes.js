// server/routes/questionRoutes.js
const express = require('express');
const questionController = require('../controllers/questionController');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Destructure methods
const router = express.Router();

// Apply protect and isAdmin middleware to all question routes for simplicity
router.use(protect, isAdmin); // All subsequent routes require login and admin role

router.route('/')
    .post(questionController.addQuestion)    // POST /api/questions
    .get(questionController.getAllQuestions); // GET /api/questions

router.route('/:id')
    .get(questionController.getQuestionById)   // GET /api/questions/:id
    .put(questionController.updateQuestion)    // PUT /api/questions/:id
    .delete(questionController.deleteQuestion); // DELETE /api/questions/:id

module.exports = router;