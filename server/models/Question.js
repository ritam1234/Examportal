// server/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required']
    },
    options: {
        type: [String], // Array of possible answers
        required: true,
        validate: [ // Ensure at least two options
            val => val.length >= 2,
            'Must provide at least two options'
        ]
    },
    correctAnswer: {
        type: String, // Store the correct answer string itself
        required: [true, 'Correct answer is required'],
        // Validation to ensure correctAnswer is one of the options
        validate: {
             validator: function(value) {
                // 'this' refers to the document being validated
                return this.options.includes(value);
            },
            message: 'Correct answer must be one of the provided options'
        }
    },
    createdBy: { // Link to admin user who created the question
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', QuestionSchema);