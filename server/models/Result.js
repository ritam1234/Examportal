// server/models/Result.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    selectedOption: {
        type: String // Stores the actual text of the selected option
    },
    isCorrect: { // Denormalized field for easier result display/analysis
       type: Boolean
    }
}, { _id: false }); // Prevent Mongoose from creating _id for subdocuments


const ResultSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [AnswerSchema], // Embed the student's answers directly
    score: { // Number of correct answers
        type: Number,
        required: true,
        default: 0
    },
    totalQuestions: { // Total number of questions in the exam
        type: Number,
        required: true
    },
    percentage: { // Calculated score percentage
        type: Number,
        required: true,
        default: 0.0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a student can submit results for a specific exam only once
ResultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);