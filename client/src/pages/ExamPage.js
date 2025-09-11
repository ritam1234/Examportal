// src/pages/ExamPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";

// Ensure paths to components are correct
import CountdownTimer from "../components/ExamInterface/CountdownTimer";
import Timer from "../components/ExamInterface/Timer";
import QuestionListSidebar from "../components/ExamInterface/QuestionListSidebar";
import QuestionDisplay from "../components/ExamInterface/QuestionDisplay";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import { getExamDetails } from "../api/exams";
import { submitExamAnswers, getMyResultsList } from "../api/results";
import dayjs from "dayjs";

const drawerWidth = 240;

const ExamPage = () => {
  // --- State Declarations ---
  const { examId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null); // Full exam details object
  const [questions, setQuestions] = useState([]); // Array of question objects from exam
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(""); // User-facing error message
  const [apiErrorDetails, setApiErrorDetails] = useState(null); // Detailed error object for console
  const [successMessage, setSuccessMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null); // Exam duration countdown
  const [examStartTime, setExamStartTime] = useState(null); // From DB (Dayjs object)
  const [canStartExam, setCanStartExam] = useState(false);
  const [hasAlreadyTaken, setHasAlreadyTaken] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const hasFetchedExam = useRef(false); // Prevent fetch loops in StrictMode

  // --- Data Fetching Callbacks ---
  const checkExamTakenStatus = useCallback(async () => {
    if (!examId || !user) {
      setIsCheckingStatus(false);
      return false;
    }
    try {
      const { success, data: resultsData } = await getMyResultsList();
      if (success) {
        const taken = resultsData.some(
          (r) => r.exam === examId || r.exam?._id === examId
        );
        setHasAlreadyTaken(taken);
        if (taken) {
          setError(`You have already completed this exam.`);
        }
        return taken;
      } else {
        console.warn("Could not verify taken status");
        setHasAlreadyTaken(false);
        return false;
      }
    } catch (err) {
      console.error("Error checking results:", err);
      setError("Error checking previous attempts.");
      setHasAlreadyTaken(false);
      return false;
    }
    // No finally needed, handled by setting state directly
  }, [examId, user]); // Dependencies needed

  const fetchExam = useCallback(async () => {
    if (
      !examId ||
      !user ||
      authLoading ||
      isCheckingStatus ||
      hasAlreadyTaken ||
      hasFetchedExam.current
    ) {
      return;
    }
    setIsLoading(true);
    setError((prev) => (prev.includes("completed") ? prev : ""));
    hasFetchedExam.current = true;
    try {
      const { success, data } = await getExamDetails(examId);
      if (!success || !data) throw new Error("Failed to load exam details.");

      // Check assignment right after fetch
      if (
        user.role === "student" &&
        !data.assignedTo?.some((s) => s._id === user._id)
      )
        throw new Error("You are not assigned to this exam.");

      setExam(data);
      setQuestions(data.questions || []); // Set questions state
      if (!data.questions?.length)
        setError("This exam currently has no questions."); // Warning, but maybe allow view?

      if (!data.startTime) throw new Error("Exam start time is missing.");
      const start = dayjs(data.startTime);
      setExamStartTime(start);
      const now = dayjs();

      if (start.isAfter(now)) {
        setCanStartExam(false); // Cannot start yet
      } else {
        const examEndTime = start.add(data.duration, "minute");
        const remainingSeconds = examEndTime.diff(now, "second");
        if (remainingSeconds > 0) {
          setTimeLeft(remainingSeconds); // Set countdown for active exam
          setCanStartExam(true); // Can start now
        } else {
          throw new Error("This exam has already ended."); // Exam already over
        }
      }
    } catch (err) {
      setError((prev) => prev || err.message || "Error loading exam."); // Show error only if no previous one (like 'already taken')
      console.error("Fetch exam error:", err);
      setExam(null);
      setQuestions([]);
      setCanStartExam(false);
    } finally {
      setIsLoading(false); // Stop main loading indicator
    }
  }, [examId, user, authLoading, isCheckingStatus, hasAlreadyTaken]); // Correct dependencies

  // --- Sequential Data Loading Effects ---
  useEffect(() => {
    setIsCheckingStatus(true); // Explicitly start checking
    checkExamTakenStatus()
      .catch((err) =>
        console.error("Silent failure in taken status check:", err)
      ) // Handle promise rejection if any
      .finally(() => setIsCheckingStatus(false)); // Mark check complete regardless of outcome
  }, [checkExamTakenStatus]);

  useEffect(() => {
    // Trigger fetch only AFTER status check is done AND exam wasn't already taken
    if (!isCheckingStatus && !hasAlreadyTaken) {
      // Avoid refetching if already fetched in this session unless specific conditions change
      if (!hasFetchedExam.current) {
        fetchExam();
      }
    } else if (!isCheckingStatus && hasAlreadyTaken) {
      // If already taken, ensure loading stops
      setIsLoading(false);
    }
  }, [isCheckingStatus, hasAlreadyTaken, fetchExam]); // Dependencies

  // --- Action Callbacks ---
  const handleSelectAnswer = useCallback((questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  }, []);
  const goToQuestion = useCallback(
    (index) => {
      if (index >= 0 && index < (questions?.length || 0))
        setCurrentQuestionIndex(index);
    },
    [questions]
  ); // Use safe length check
  const handleCountdownEnd = useCallback(() => {
    console.log("Exam countdown ended. Refetching...");
    hasFetchedExam.current = false;
    fetchExam();
  }, [fetchExam]);

  // --- DEFINE handleFinalSubmit FIRST (as it's needed by handleTimeUp) ---
  const handleFinalSubmit = useCallback(async () => {
    if (
      !exam ||
      !user ||
      isSubmitting ||
      !questions ||
      questions.length === 0
    ) {
      console.warn(
        "Submit blocked: Missing exam/user/questions or already submitting."
      );
      if (!exam || !questions || questions.length === 0)
        setError("Cannot submit: Exam/question data missing.");
      setIsSubmitting(false);
      setConfirmSubmitOpen(false);
      return;
    }
    setConfirmSubmitOpen(false);
    setIsSubmitting(true);
    setError("");
    setApiErrorDetails(null);
    setSuccessMessage("");
    console.log(
      "[Frontend] Starting final submission process for exam:",
      examId
    );

    // Construct payload ensuring all exam questions are included
    const formattedAnswersPayload = (questions || []).map((q) => ({
      questionId: q._id,
      selectedOption: answers[q._id] || null, // Use answer state, default null
    }));
    console.log("[Frontend] Sending payload:", formattedAnswersPayload);

    try {
      const response = await submitExamAnswers(examId, formattedAnswersPayload);
      console.log("[Frontend] Submit API Response:", response);

      if (response?.success && response.data?._id) {
        console.log(
          "[Frontend] Submission successful! Result ID:",
          response.data._id
        );
        setSuccessMessage("Exam submitted successfully! Redirecting...");
        // Delay allows user to see success message briefly
        setTimeout(
          () =>
            navigate(`/results/${response.data._id}?submitted=true`, {
              replace: true,
            }),
          1500
        );
      } else {
        // Handle logical failure from backend
        const serverMessage =
          response?.message || "Submission failed. Server reported an issue.";
        console.error("[Frontend] Submission API Failure:", serverMessage);
        setError(serverMessage);
        setApiErrorDetails(response);
        setIsSubmitting(false); // IMPORTANT: Reset submitting state on failure
      }
    } catch (err) {
      console.error("[Frontend] Submit API Exception:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "An unexpected network or server error occurred.";
      setError(errMsg);
      setApiErrorDetails(err.response?.data || { message: err.message });
      setIsSubmitting(false); // IMPORTANT: Reset submitting state on exception
    }
    // `finally` block removed - explicit state resets done above
  }, [exam, user, questions, examId, answers, navigate, isSubmitting]); // Dependencies for submit callback

  // --- DEFINE handleTimeUp AFTER handleFinalSubmit ---
  const handleTimeUp = useCallback(() => {
    // Added console log for debugging timer trigger
    console.log(`[Timer] handleTimeUp called. isSubmitting=${isSubmitting}`);
    if (!isSubmitting) {
      alert("Time is up! Your answers will be submitted automatically.");
      handleFinalSubmit(); // Call the defined submission function
    } else {
      console.log("[Timer] Time is up, but submission is already in progress.");
    }
  }, [handleFinalSubmit, isSubmitting]); // Ensure `handleFinalSubmit` is stable reference

  // --- Close Snackbar ---
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessMessage("");
    setError("");
  };

  // --- Get Current Question ---
  // Use optional chaining and check questions array length for safety
  const currentQuestion =
    questions && questions.length > currentQuestionIndex
      ? questions[currentQuestionIndex]
      : null;

  // ======================== RENDER LOGIC ========================

  // 1. --- Primary Loading State ---
  if (
    authLoading ||
    isCheckingStatus ||
    (isLoading && !error && !hasAlreadyTaken)
  ) {
    // Show loader if auth loading, or checking status, or loading exam data AND no error/already taken flags
    return <LoadingSpinner fullScreen />;
  }

  // 2. --- Critical Error/State Display ---
  // If an error exists AND we cannot start the exam (covers not assigned, ended, already taken, fetch error)
  if (error && !canStartExam) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert
          severity={hasAlreadyTaken ? "warning" : "error"}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/student/dashboard")}
            >
              Go to Dashboard
            </Button>
          }
        >
          {error} {/* Display the error message */}
        </Alert>
      </Container>
    );
  }

  // 3. --- Countdown Timer Display ---
  // Show if exam time is valid, not yet started, not loading, no critical error, and not already taken
  if (
    !isLoading &&
    examStartTime &&
    !canStartExam &&
    !hasAlreadyTaken &&
    !error
  ) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          {exam?.title ?? "Exam Details"}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Starts In:
        </Typography>
        <Paper
          elevation={3}
          sx={{ p: 3, display: "inline-block", minWidth: 200 }}
        >
          <CountdownTimer
            targetTime={examStartTime}
            onEnd={handleCountdownEnd}
          />
        </Paper>
        <Button
          variant="outlined"
          onClick={() => navigate("/student/dashboard")}
          sx={{ mt: 4, display: "block", mx: "auto" }}
        >
          Dashboard
        </Button>
      </Container>
    );
  }

  // 4. --- Main Exam Interface Display ---
  // Show if allowed to start and the exam data is loaded
  if (canStartExam && exam) {
    return (
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {" "}
        {/* Main container */}
        {/* Exam Page AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            top: "64px",
            bgcolor: "background.paper",
            boxShadow: 1,
            borderBottom: 1,
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              noWrap
              sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {exam.title}
            </Typography>
            {/* Exam Duration Timer */}
            {timeLeft !== null && (
              <Timer initialTime={timeLeft} onTimeUp={handleTimeUp} />
            )}
            {/* Finish Button -> Confirmation Dialog */}
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={
                isSubmitting ||
                isLoading ||
                !questions ||
                questions.length === 0
              }
              sx={{ ml: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Finish & Submit"
              )}
            </Button>
          </Toolbar>
        </AppBar>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              top: "112px",
              /* Adjusted top relative to main App bar and dense inner bar */ height:
                "calc(100% - 112px)",
            },
          }}
        >
          <Box sx={{ overflow: "auto", p: 1 }}>
            <QuestionListSidebar
              questions={questions}
              currentIndex={currentQuestionIndex}
              onQuestionSelect={goToQuestion}
              answers={answers}
            />
          </Box>
        </Drawer>
        {/* Question Display Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 3 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: "48px",
            /* Margin Top for dense toolbar */ height: "calc(100% - 48px)",
            overflowY: "auto",
          }}
        >
          {currentQuestion ? (
            <QuestionDisplay
              key={currentQuestion._id} // Helps React differentiate between questions
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestion._id] || ""} // Ensure controlled input
              onAnswerSelect={handleSelectAnswer}
              onNext={() => goToQuestion(currentQuestionIndex + 1)}
              onPrevious={() => goToQuestion(currentQuestionIndex - 1)}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === questions.length - 1}
            />
          ) : (
            <Typography
              sx={{ textAlign: "center", pt: 5, color: "text.secondary" }}
            >
              {questions && questions.length > 0
                ? "Select a question from the sidebar."
                : "No questions found for this exam."}
            </Typography>
          )}
        </Box>
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmSubmitOpen}
          onClose={() => !isSubmitting && setConfirmSubmitOpen(false)}
        >
          <DialogTitle>Confirm Submission</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to finish and submit your answers? This
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmSubmitOpen(false)}
              disabled={isSubmitting}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalSubmit}
              variant="contained"
              color="primary"
              autoFocus
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} /> : "Submit Now"}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar for Success/Error feedback during submit */}
        <Snackbar
          open={!!successMessage || !!error}
          autoHideDuration={6000} // Longer duration
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={successMessage ? "success" : "error"}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {successMessage || error}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Fallback / Loading State (should be covered above but as safe default)
  return (
    <Container sx={{ mt: 4 }}>
      <Typography>Loading exam interface...</Typography>
    </Container>
  );
};

export default ExamPage;
