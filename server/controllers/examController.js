// server/controllers/examController.js
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const User = require("../models/User");
const dayjs = require("dayjs");

class ExamController {
  constructor() {
    this.createExam = this.createExam.bind(this);
    this.getAllExams = this.getAllExams.bind(this);
    this.getMyAssignedExams = this.getMyAssignedExams.bind(this);
    this.getExamById = this.getExamById.bind(this);
    this.updateExam = this.updateExam.bind(this); // Already bound
    this.deleteExam = this.deleteExam.bind(this);
    // *** ADD BINDING IF KEEPING THE ASSIGN ROUTE ***
    this.assignStudentToExam = this.assignStudentToExam.bind(this);
  }

  // --- CREATE EXAM ---
  async createExam(req, res) {
    /* ... (Code from previous correct response) ... */
    const { title, description, questions, duration, startTime, endTime } =
      req.body;
    const assignedToOnCreate = req.body.assignedTo ?? []; // Use nullish coalescing

    console.log("[API] POST /api/exams - Create request received.");
    console.log("[API] Received body:", req.body);

    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0 ||
      !duration
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Title, non-empty questions array, and duration are required.",
        });
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "Duration must be a positive number.",
        });

    let finalStartTime = null,
      finalEndTime = null;
    if (startTime != null && startTime !== "") {
      const pS = dayjs(startTime);
      if (!pS.isValid())
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid start time format: ${startTime}`,
          });
      finalStartTime = pS.toDate();
    }
    if (endTime != null && endTime !== "") {
      const pE = dayjs(endTime);
      if (!pE.isValid())
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid end time format: ${endTime}`,
          });
      finalEndTime = pE.toDate();
      if (finalStartTime && pE.isBefore(dayjs(finalStartTime)))
        return res
          .status(400)
          .json({
            success: false,
            message: "End time must be after start time.",
          });
    }

    try {
      if (questions.some((id) => !mongoose.Types.ObjectId.isValid(id)))
        throw new Error("Invalid question ID format.");
      const qCount = await Question.countDocuments({ _id: { $in: questions } });
      if (qCount !== questions.length)
        throw new Error("One or more question IDs do not exist.");
      if (assignedToOnCreate.length > 0) {
        if (
          assignedToOnCreate.some((id) => !mongoose.Types.ObjectId.isValid(id))
        )
          throw new Error("Invalid assigned student ID format.");
        const sCount = await User.countDocuments({
          _id: { $in: assignedToOnCreate },
          role: "student",
        });
        if (sCount !== assignedToOnCreate.length)
          throw new Error(
            "One or more assigned user IDs do not exist or are not students."
          );
      }

      const dataToCreate = {
        title: title.trim(),
        description: description?.trim() || null,
        questions,
        duration: parseInt(duration),
        startTime: finalStartTime,
        endTime: finalEndTime,
        assignedTo: assignedToOnCreate,
        createdBy: req.user._id,
      };
      console.log("[DB] Creating Exam with:", dataToCreate);
      const exam = await Exam.create(dataToCreate);
      console.log(`[DB] Exam created successfully: ${exam._id}`);
      res.status(201).json({ success: true, data: exam });
    } catch (error) {
      /* ... (Error handling) ... */ console.error(
        "[API] Create Exam Error:",
        error
      );
      res
        .status(500)
        .json({
          success: false,
          message: error.message || "Server error creating exam",
        });
    }
  }

  // --- GET ALL EXAMS ---
  async getAllExams(req, res) {
    /* ... (Code from previous correct response) ... */
    try {
      const exams = await Exam.find()
        .populate("createdBy", "name email")
        .populate("questions", "_id questionText")
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch (error) {
      console.error("[API] Get All Exams Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error fetching exams" });
    }
  }

  // --- GET MY ASSIGNED EXAMS ---
  async getMyAssignedExams(req, res) {
    /* ... (Code from previous correct response) ... */
    try {
      const studentId = req.user._id;
      const exams = await Exam.find({ assignedTo: studentId })
        .select("-assignedTo -createdBy -questions.correctAnswer")
        .populate("questions", "_id")
        .sort({ startTime: 1 });
      res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch (error) {
      console.error("[API] Get My Exams Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Server error fetching assigned exams",
        });
    }
  }

  // --- GET EXAM BY ID ---
  async getExamById(req, res) {
    /* ... (Code from previous correct response, handles student filtering) ... */
    const examId = req.params.id;
    try {
      const exam = await Exam.findById(examId)
        .populate("questions")
        .populate("createdBy", "name email")
        .populate({ path: "assignedTo", select: "name email _id" });
      if (!exam)
        return res
          .status(404)
          .json({
            success: false,
            message: `Exam not found with id ${examId}`,
          });
      if (req.user.role === "student") {
        const isAssigned = exam.assignedTo?.some((s) =>
          s._id.equals(req.user._id)
        );
        if (!isAssigned)
          return res
            .status(403)
            .json({
              success: false,
              message: "Forbidden: You are not assigned to this exam.",
            });
        try {
          const examObject = exam.toObject();
          examObject.questions?.forEach((q) => {
            delete q.correctAnswer;
          });
          return res.status(200).json({ success: true, data: examObject });
        } catch (popError) {
          console.error("Error removing correct answers:", popError);
        }
      }
      res.status(200).json({ success: true, data: exam });
    } catch (error) {
      console.error(`[API] Get Exam By ID Error for ${examId}:`, error);
      if (error.kind === "ObjectId")
        return res
          .status(400)
          .json({ success: false, message: "Invalid exam ID format" });
      res
        .status(500)
        .json({
          success: false,
          message: "Server error fetching exam details",
        });
    }
  }

  // --- UPDATE EXAM ---
  async updateExam(req, res) {
    /* ... (Code from previous correct response, carefully handling optional dates/fields) ... */
    const examId = req.params.id;
    const {
      title,
      description,
      duration,
      startTime,
      endTime,
      questions,
      assignedTo,
    } = req.body;
    console.log(`[API] PUT /api/exams/${examId} - Update request.`);
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: `Exam not found` });
      }
      const updateFields = {};
      let validStartTime = undefined,
        validEndTime = undefined;
      if (startTime !== undefined) {
        if (startTime === null || startTime === "") {
          updateFields.startTime = null;
        } else {
          const pS = dayjs(startTime);
          if (!pS.isValid()) throw new Error(`Invalid startTime: ${startTime}`);
          updateFields.startTime = pS.toDate();
        }
      }
      if (endTime !== undefined) {
        if (endTime === null || endTime === "") {
          updateFields.endTime = null;
        } else {
          const pE = dayjs(endTime);
          if (!pE.isValid()) throw new Error(`Invalid endTime: ${endTime}`);
          updateFields.endTime = pE.toDate();
        }
      }
      if (title !== undefined) updateFields.title = title.trim();
      if (description !== undefined)
        updateFields.description = description?.trim() ?? null;
      if (duration !== undefined) {
        const pD = parseInt(duration);
        if (isNaN(pD) || pD <= 0)
          throw new Error("Duration must be a positive number.");
        updateFields.duration = pD;
      }
      if (questions !== undefined) {
        if (
          !Array.isArray(questions) ||
          questions.some((id) => !mongoose.Types.ObjectId.isValid(id))
        )
          throw new Error("Invalid question ID(s).");
        updateFields.questions = questions;
      }
      if (assignedTo !== undefined) {
        if (
          !Array.isArray(assignedTo) ||
          assignedTo.some((id) => !mongoose.Types.ObjectId.isValid(id))
        )
          throw new Error("Invalid student ID(s) in assignedTo.");
        updateFields.assignedTo = assignedTo;
      }
      if (Object.keys(updateFields).length === 0)
        return res
          .status(200)
          .json({ success: true, message: "No changes applied.", data: exam });
      console.log(`[DB] Executing findByIdAndUpdate for ${examId}`);
      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        { $set: updateFields },
        { new: true, runValidators: true, context: "query" }
      );
      if (!updatedExam) throw new Error("Database update failed unexpectedly.");
      console.log(`[API] Exam ${examId} updated successfully.`);
      res.status(200).json({ success: true, data: updatedExam });
    } catch (error) {
      console.error(`[API] Update Exam Error for ${examId}:`, error);
      if (error.name === "ValidationError") {
        const m = Object.values(error.errors)
          .map((v) => v.message)
          .join(". ");
        return res.status(400).json({ success: false, message: m });
      }
      if (error.kind === "ObjectId" || error.message?.includes("invalid"))
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid ID format: ${error.message}`,
          });
      res
        .status(500)
        .json({
          success: false,
          message:
            error.message || "Server error during exam update. Check logs.",
        });
    }
  }

  // --- DELETE EXAM ---
  async deleteExam(req, res) {
    /* ... (Code from previous correct response) ... */
    const examId = req.params.id;
    console.log(`[API] DELETE /api/exams/${examId}`);
    try {
      const exam = await Exam.findById(examId);
      if (!exam)
        return res
          .status(404)
          .json({
            success: false,
            message: `Exam not found with id ${examId}`,
          });
      await Exam.findByIdAndDelete(examId);
      console.log(`[DB] Exam ${examId} deleted.`);
      res
        .status(200)
        .json({ success: true, message: "Exam deleted successfully" });
    } catch (error) {
      console.error(`[API] Delete Exam Error for ${examId}:`, error);
      if (error.kind === "ObjectId")
        return res
          .status(400)
          .json({ success: false, message: "Invalid exam ID format" });
      res
        .status(500)
        .json({ success: false, message: "Server error deleting exam" });
    }
  }

  // --- ASSIGN SINGLE STUDENT (Potentially Redundant) ---
  // Make sure this is bound in constructor if kept
  async assignStudentToExam(req, res) {
    const examId = req.params.examId;
    const studentId = req.params.studentId;
    console.log(`[API] PUT /api/exams/${examId}/assign/${studentId}`);
    try {
      if (
        !mongoose.Types.ObjectId.isValid(examId) ||
        !mongoose.Types.ObjectId.isValid(studentId)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid Exam or Student ID format",
          });
      }
      const [exam, student] = await Promise.all([
        Exam.findById(examId),
        User.findOne({ _id: studentId, role: "student" }), // Ensure user is a student
      ]);
      if (!exam)
        return res
          .status(404)
          .json({ success: false, message: "Exam not found" });
      if (!student)
        return res
          .status(404)
          .json({
            success: false,
            message: "Student not found or user is not a student",
          });

      // Use $addToSet to add the student only if they aren't already present
      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        { $addToSet: { assignedTo: studentId } }, // Safely adds without creating duplicates
        { new: true, runValidators: true }
      ).populate({ path: "assignedTo", select: "name email _id" }); // Populate for response clarity?

      if (!updatedExam)
        throw new Error("Failed to add student assignment after finding exam.");

      console.log(`[DB] Student ${studentId} assigned to Exam ${examId}`);
      res
        .status(200)
        .json({
          success: true,
          message: "Student assigned successfully",
          data: updatedExam,
        }); // Return updated exam
    } catch (error) {
      console.error(
        `[API] Assign Student Error (${examId}/${studentId}):`,
        error
      );
      if (error.kind === "ObjectId")
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid exam or student ID format",
          });
      res
        .status(500)
        .json({ success: false, message: "Server error assigning student" });
    }
  }
} // end ExamController class

module.exports = new ExamController();
