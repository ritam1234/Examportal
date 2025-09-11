// server/models/Exam.js
const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required']
    },
    description: {
        type: String
    },
    questions: [{ // Array of question ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    assignedTo: [{ // Array of student User ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    duration: { // Duration in minutes
        type: Number,
        required: [true, 'Exam duration is required'],
        min: [1, 'Duration must be at least 1 minute']
    },
    startTime: { // Optional start time for the exam
        type: Date,
        default: null
    },
    endTime: { // Optional end time for the exam
        type: Date,
        default: null
    },
    createdBy: { // Link to admin User
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add an index for faster lookups of exams assigned to a specific user
ExamSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Exam', ExamSchema);