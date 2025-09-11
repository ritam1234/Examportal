// server/controllers/questionController.js
const Question = require('../models/Question');

class QuestionController {

    /**
     * @desc    Add a new question
     * @route   POST /api/questions
     * @access  Private/Admin
     */
    async addQuestion(req, res) {
        const { questionText, options, correctAnswer } = req.body;

        try {
            // Validation already exists in Mongoose model, but extra checks can be added
             if (!questionText || !options || options.length < 2 || !correctAnswer) {
                 return res.status(400).json({ success: false, message: 'Please provide question text, at least two options, and a correct answer.' });
             }
             // Redundant model validation check: ensure correctAnswer is in options
            if (!options.includes(correctAnswer)) {
                 return res.status(400).json({ success: false, message: 'Correct answer must be one of the provided options.' });
            }


            const question = await Question.create({
                questionText,
                options,
                correctAnswer,
                createdBy: req.user._id // User ID from protect middleware
            });

            res.status(201).json({ success: true, data: question });
        } catch (error) {
            console.error("Add Question Error:", error);
             if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ success: false, message: messages.join(', ') });
            }
            res.status(500).json({ success: false, message: 'Server error adding question' });
        }
    }

    /**
     * @desc    Get all questions (for admin view) - Consider pagination for large sets
     * @route   GET /api/questions
     * @access  Private/Admin
     */
    async getAllQuestions(req, res) {
        try {
            // Fetch all questions, maybe populate creator info
             // Add filtering, sorting, pagination as needed (e.g., using req.query)
            const questions = await Question.find().populate('createdBy', 'name email'); // Populate creator's name and email

            res.status(200).json({ success: true, count: questions.length, data: questions });
        } catch (error) {
            console.error("Get Questions Error:", error);
            res.status(500).json({ success: false, message: 'Server error fetching questions' });
        }
    }

     /**
     * @desc    Get single question by ID
     * @route   GET /api/questions/:id
     * @access  Private/Admin (or Student if needed for review/practice)
     */
    async getQuestionById(req, res) {
         try {
             const question = await Question.findById(req.params.id).populate('createdBy', 'name');

             if (!question) {
                 return res.status(404).json({ success: false, message: `Question not found with id ${req.params.id}` });
             }
             res.status(200).json({ success: true, data: question });
         } catch (error) {
             console.error("Get Question By ID Error:", error);
              if (error.kind === 'ObjectId') { // Handle invalid MongoDB ID format
                 return res.status(400).json({ success: false, message: 'Invalid question ID format' });
             }
             res.status(500).json({ success: false, message: 'Server error fetching question' });
         }
     }


    /**
     * @desc    Update a question
     * @route   PUT /api/questions/:id
     * @access  Private/Admin
     */
    async updateQuestion(req, res) {
        const { questionText, options, correctAnswer } = req.body;
         // Optional: Add validation similar to addQuestion

        try {
            let question = await Question.findById(req.params.id);

            if (!question) {
                return res.status(404).json({ success: false, message: `Question not found with id ${req.params.id}` });
            }

            // Check if the user trying to update is the creator or an admin (flexible: creator check commented out)
            // if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            //    return res.status(403).json({ success: false, message: 'User not authorized to update this question' });
            // }

            // Update fields
             const updateData = {};
             if (questionText) updateData.questionText = questionText;
             if (options) {
                 // Validate new options and correctAnswer together if both are changing
                 if (correctAnswer && !options.includes(correctAnswer)) {
                      return res.status(400).json({ success: false, message: 'New correct answer must be within the new options list.' });
                 }
                 if (!correctAnswer && !options.includes(question.correctAnswer)) {
                     // If options change but correct answer doesn't, ensure old answer is still in new options
                     return res.status(400).json({ success: false, message: 'Previous correct answer is not present in the new options list. Please specify a new correct answer.' });
                 }
                  updateData.options = options;
            }
             if (correctAnswer) {
                  // Check if correctAnswer is valid with current or new options
                  const currentOptions = options || question.options;
                  if (!currentOptions.includes(correctAnswer)) {
                       return res.status(400).json({ success: false, message: 'Correct answer must be one of the provided options.' });
                  }
                   updateData.correctAnswer = correctAnswer;
             }


            question = await Question.findByIdAndUpdate(req.params.id, updateData, {
                new: true, // Return the modified document
                runValidators: true // Run model validations on update
            });

            res.status(200).json({ success: true, data: question });
        } catch (error) {
            console.error("Update Question Error:", error);
             if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ success: false, message: messages.join(', ') });
            }
             if (error.kind === 'ObjectId') {
                 return res.status(400).json({ success: false, message: 'Invalid question ID format' });
             }
            res.status(500).json({ success: false, message: 'Server error updating question' });
        }
    }

    /**
     * @desc    Delete a question
     * @route   DELETE /api/questions/:id
     * @access  Private/Admin
     */
    async deleteQuestion(req, res) {
        try {
            const question = await Question.findById(req.params.id);

            if (!question) {
                return res.status(404).json({ success: false, message: `Question not found with id ${req.params.id}` });
            }

             // Optional: Check if the user is authorized (creator or admin)
            // if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            //    return res.status(403).json({ success: false, message: 'User not authorized to delete this question' });
            // }

             // TODO: Add check if this question is currently used in any exams before deleting? Or handle cascading delete/update.
            // For now, direct delete:
            await Question.findByIdAndDelete(req.params.id);

            res.status(200).json({ success: true, message: 'Question deleted successfully', data: {} }); // Return empty data object or confirmation
        } catch (error) {
            console.error("Delete Question Error:", error);
             if (error.kind === 'ObjectId') {
                 return res.status(400).json({ success: false, message: 'Invalid question ID format' });
             }
            res.status(500).json({ success: false, message: 'Server error deleting question' });
        }
    }
}

module.exports = new QuestionController();