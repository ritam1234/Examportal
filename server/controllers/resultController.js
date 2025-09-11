// server/controllers/resultController.js

// --- Dependencies ---
const mongoose = require("mongoose"); // For ObjectId validation
const Result = require("../models/Result"); // Ensure path is correct
const Exam = require("../models/Exam"); // Ensure path is correct
const Question = require("../models/Question"); // Often not directly needed if populating, but good practice to import if referenced
const dayjs = require("dayjs"); // For reliable time validation

class ResultController {
  // --- Constructor for Binding 'this' ---
  // Use this approach if you prefer over arrow functions for methods
  constructor() {
    this.submitExam = this.submitExam.bind(this);
    this.getMyResults = this.getMyResults.bind(this);
    this.getResultDetails = this.getResultDetails.bind(this);
    this.getAllResults = this.getAllResults.bind(this);
  }

  // --- SUBMIT EXAM ANSWERS ---
  /**
   * @desc    Submit answers for an exam, calculate score, save result
   * @route   POST /api/results/submit/:examId
   * @access  Private/Student (Requires protect & isStudent middleware)
   */
  async submitExam(req, res) {
    const { examId } = req.params;
    const { answers } = req.body; // Expected: Array [{ questionId: String, selectedOption: String|null }]
    const studentId = req.user._id; // Provided by 'protect' middleware

    console.log(
      `[ResultController:submitExam] Begin - Exam: ${examId}, Student: ${studentId}`
    );

    // 1. --- Input Validation ---
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      console.error(`[Submit Fail] Invalid examId format: ${examId}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Exam ID format provided." });
    }
    if (!answers || !Array.isArray(answers)) {
      console.error(
        `[Submit Fail] Invalid answers format for exam ${examId}. Type: ${typeof answers}`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "Answers must be submitted as an array.",
        });
    }
    // Deep check answer structure and questionId validity
    if (
      answers.some(
        (a) =>
          !a || !a.questionId || !mongoose.Types.ObjectId.isValid(a.questionId)
      )
    ) {
      console.error(
        `[Submit Fail] Invalid structure or questionId format within answers array for exam ${examId}.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Answers array contains invalid items or invalid question IDs.",
        });
    }

    try {
      // 2. --- Fetch Exam & Perform Checks ---
      console.log(
        `[Submit DB] Fetching Exam ${examId} with questions (_id, correctAnswer)...`
      );
      // Populate only necessary fields for efficiency
      const exam = await Exam.findById(examId)
        .populate({
          path: "questions",
          select: "_id correctAnswer", // Only need ID and correct answer
        })
        .lean(); // Use lean() for faster read operations and plain JS objects

      if (!exam) {
        console.warn(`[Submit Fail] Exam ${examId} not found.`);
        return res
          .status(404)
          .json({ success: false, message: "Exam not found." });
      }
      console.log(`[Submit Check] Exam found: "${exam.title}"`);

      // Check Assignment - Safely convert ObjectId/String for comparison
      const isAssigned = exam.assignedTo?.some(
        (id) => id.toString() === studentId.toString()
      );
      if (!isAssigned) {
        console.warn(
          `[Submit Fail] Auth Denied: Student ${studentId} NOT assigned to Exam ${examId}.`
        );
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not assigned to take this exam.",
          });
      }
      console.log(`[Submit Check] Student ${studentId} is assigned.`);

      // Check Timing
      const now = dayjs(); // Use reliable library for time comparisons
      if (!exam.startTime || dayjs(exam.startTime).isAfter(now)) {
        console.warn(
          `[Submit Fail] Timing Violation: Exam ${examId} hasn't started. Start: ${exam.startTime}`
        );
        return res
          .status(400)
          .json({ success: false, message: "Exam has not started yet." });
      }
      const examEndTime = exam.endTime
        ? dayjs(exam.endTime)
        : dayjs(exam.startTime).add(exam.duration, "minute"); // Calculate end if not stored
      if (examEndTime.isBefore(now)) {
        console.warn(
          `[Submit Fail] Timing Violation: Exam ${examId} already ended. Ends: ${examEndTime.toISOString()}`
        );
        return res
          .status(400)
          .json({
            success: false,
            message: "The submission deadline for this exam has passed.",
          });
      }
      console.log(`[Submit Check] Timing OK.`);

      // Check for Previous Submission (Crucial for "take once" rule)
      console.log(`[Submit DB] Checking for existing Result...`);
      const existingResult = await Result.findOne({
        exam: examId,
        student: studentId,
      }).lean();
      if (existingResult) {
        console.warn(
          `[Submit Fail] Duplicate Attempt: Student ${studentId} already submitted Exam ${examId}.`
        );
        return res
          .status(400)
          .json({
            success: false,
            message: "You have already submitted result for this exam.",
          });
      }
      console.log(`[Submit Check] No existing result found.`);

      // 3. --- Process Answers & Calculate Score ---
      console.log(`[Submit Logic] Processing answers and calculating score...`);
      const examQuestions = exam.questions || []; // Use empty array if no questions found
      if (examQuestions.length === 0) {
        console.warn(
          `[Submit Logic] Exam ${examId} has no questions. Result will be 0/0.`
        );
      }

      let score = 0;
      const processedAnswers = []; // Format: [{ questionId, selectedOption, isCorrect }]
      const examQuestionsMap = new Map(
        examQuestions.map((q) => [q._id.toString(), q.correctAnswer])
      );
      const submittedAnswersMap = new Map(
        answers.map((a) => [a.questionId?.toString(), a.selectedOption])
      );

      // Iterate over the questions *from the exam* to ensure accuracy
      for (const examQuestion of examQuestions) {
        const qIdStr = examQuestion._id.toString();
        const selectedOption = submittedAnswersMap.get(qIdStr) ?? null;
        const correctAnswer = examQuestionsMap.get(qIdStr); // Already mapped

        // Log a warning if a question in the exam itself misses the answer somehow (schema validation should prevent)
        if (correctAnswer === undefined) {
          console.error(
            `[Submit Logic ERROR] Exam Question ${qIdStr} has no 'correctAnswer' defined!`
          );
        }

        // Check correctness carefully, ensuring correctAnswer is defined and not null
        const isCorrect =
          correctAnswer != null && selectedOption === correctAnswer;
        if (isCorrect) {
          score++;
        }

        processedAnswers.push({
          questionId: examQuestion._id, // Use the actual ObjectId
          selectedOption: selectedOption,
          isCorrect: isCorrect,
        });
      }

      const totalQuestions = examQuestions.length;
      const percentage =
        totalQuestions > 0
          ? parseFloat(((score / totalQuestions) * 100).toFixed(2))
          : 0;
      console.log(
        `[Submit Logic] Score Calculated: ${score}/${totalQuestions} (${percentage}%)`
      );

      // 4. --- Create Result Document ---
      const resultDataToSave = {
        exam: examId,
        student: studentId,
        answers: processedAnswers,
        score,
        totalQuestions,
        percentage,
        submittedAt: new Date(), // Use server timestamp
      };
      console.log(`[Submit DB] Attempting to create Result document...`);
      const result = await Result.create(resultDataToSave);
      console.log(
        `[Submit Success] Result ${result._id} created successfully.`
      );

      // 5. --- Send Success Response ---
      res.status(201).json({
        // Use 201 Created status code
        success: true,
        message: "Exam submitted successfully!",
        data: {
          _id: result._id, // Return essential info for redirection
          // Optionally return score details if needed immediately by frontend
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
        },
      });
    } catch (error) {
      console.error(
        `[Submit Error] Catch block entered for Exam ${examId}, Student ${studentId}:`,
        error
      );
      // Handle specific DB/Validation errors first
      if (error.code === 11000) {
        return res
          .status(409)
          .json({ success: false, message: "Duplicate submission error." });
      } // 409 Conflict
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res
          .status(400)
          .json({ success: false, message: messages.join(". ") });
      }
      if (error.kind === "ObjectId" || error.message?.includes("invalid")) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid ID format: ${error.message}`,
          });
      }
      // Handle errors thrown manually (e.g., timing, assignment)
      if (error.status) {
        // If we threw an error with a specific status earlier
        return res
          .status(error.status)
          .json({ success: false, message: error.message });
      }
      // Generic fallback server error
      res
        .status(500)
        .json({
          success: false,
          message:
            error.message ||
            "Server error processing your submission. Please try again later.",
        });
    }
  } // end submitExam

  // --- GET MY RESULTS (List for Student) ---
  async getMyResults(req, res) {
    const studentId = req.user._id;
    console.log(`[API] GET /api/results/my-results for Student ${studentId}`);
    try {
      const results = await Result.find({ student: studentId })
        .populate({
          path: "exam",
          select: "title description startTime duration",
        }) // Populate exam details
        .select("-answers") // Usually exclude detailed answers from list view
        .sort({ submittedAt: -1 });
      res
        .status(200)
        .json({ success: true, count: results.length, data: results });
    } catch (error) {
      console.error("[API] Get My Results Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error fetching results." });
    }
  }

  // --- GET RESULT DETAILS (Admin or Specific Student) ---
  async getResultDetails(req, res) {
    const { resultId } = req.params;
    console.log(
      `[API] GET /api/results/${resultId} request by User ${req.user._id} (Role: ${req.user.role})`
    );
    try {
      if (!mongoose.Types.ObjectId.isValid(resultId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Result ID format." });
      }

      // Populate thoroughly for detailed review
      const result = await Result.findById(resultId)
        .populate({ path: "exam", select: "title" }) // Exam Title
        .populate({ path: "student", select: "name email _id" }) // Student Info
        .populate({
          // Populate questions within answers array
          path: "answers.questionId",
          select: "questionText options correctAnswer _id", // Get all details needed for review
        });

      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "Result not found." });
      }

      // --- Authorization ---
      // Check if the requester is the student who owns the result OR an admin
      if (
        result.student._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        console.warn(
          `[Auth Denied] User ${req.user._id} trying to access result ${resultId} owned by ${result.student._id}`
        );
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized to view this result.",
          });
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(`[API] Get Result Details Error for ${resultId}:`, error);
      if (error.kind === "ObjectId")
        return res
          .status(400)
          .json({ success: false, message: "Invalid Result ID format." });
      res
        .status(500)
        .json({
          success: false,
          message: "Server error fetching result details.",
        });
    }
  }

  // --- GET ALL RESULTS (Admin View with optional filtering) ---
  async getAllResults(req, res) {
    const { examId, studentId } = req.query; // Get potential filters from query params
    console.log(
      `[API] GET /api/results request by Admin ${req.user._id}. Filters:`,
      req.query
    );
    try {
      const filter = {};
      if (examId && mongoose.Types.ObjectId.isValid(examId))
        filter.exam = examId;
      if (studentId && mongoose.Types.ObjectId.isValid(studentId))
        filter.student = studentId;

      // Use pagination in real applications for large result sets
      // const page = parseInt(req.query.page, 10) || 1;
      // const limit = parseInt(req.query.limit, 10) || 20;
      // const skip = (page - 1) * limit;

      const results = await Result.find(filter)
        .populate({ path: "exam", select: "title" }) // Populate Exam Title
        .populate({ path: "student", select: "name email _id" }) // Populate Student Name/Email
        .select("-answers") // Exclude detailed answers from admin list view initially
        .sort({ submittedAt: -1 }); // Sort by most recent
      // .skip(skip)
      // .limit(limit);

      // const totalResults = await Result.countDocuments(filter); // Needed for pagination

      res.status(200).json({
        success: true,
        count: results.length, // Or totalResults for pagination
        // pagination: { currentPage: page, totalPages: Math.ceil(totalResults / limit), limit }, // Pagination info
        data: results,
      });
    } catch (error) {
      console.error("[API] Get All Results Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error fetching results." });
    }
  }
} // end ResultController class

module.exports = new ResultController();
