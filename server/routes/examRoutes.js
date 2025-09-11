const express = require('express');
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware'); 
const router = express.Router();

router.use(authMiddleware.protect);

router.route('/')
    .post(authMiddleware.isAdmin, examController.createExam)
    .get(authMiddleware.isAdmin, examController.getAllExams);


router.get('/my-exams', authMiddleware.isStudent, examController.getMyAssignedExams);

router.route('/:id')

    .get(examController.getExamById)
    .put(authMiddleware.isAdmin, examController.updateExam)
    .delete(authMiddleware.isAdmin, examController.deleteExam);
    
router.put('/:examId/assign/:studentId',
    authMiddleware.isAdmin,
    examController.assignStudentToExam 
);


module.exports = router;