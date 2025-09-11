// src/pages/StudentDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

import ExamList from "../components/Student/ExamList";
import ResultList from "../components/Student/ResultList";
import { getMyAssignedExamsStudent } from "../api/exams";
import { getMyResultsList } from "../api/results";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import useAuth from "../hooks/useAuth";

// Animation variants (can be kept or removed if not desired)
const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [pendingExams, setPendingExams] = useState([]);
  const [completedResults, setCompletedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [examsResponse, resultsResponse] = await Promise.all([
        getMyAssignedExamsStudent(),
        getMyResultsList(),
      ]);
      if (!examsResponse.success)
        throw new Error("Failed to fetch assigned exams.");
      if (!resultsResponse.success) throw new Error("Failed to fetch results.");
      const assignedExams = examsResponse.data || [];
      const results = resultsResponse.data || [];
      setCompletedResults(results);
      const completedExamIds = new Set(
        results.map((r) => r.exam?._id || r.exam)
      );
      const pending = assignedExams.filter(
        (exam) => !completedExamIds.has(exam._id)
      );
      setPendingExams(pending);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error loading dashboard data."
      );
      setPendingExams([]);
      setCompletedResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Add user dependency if fetchData depends on it indirectly via hooks

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    // Container remains useful for centering and max-width control
    <Container
      maxWidth="lg" // Changed to medium for better vertical layout focus
      sx={{
        mt: 3, // Adjusted top margin
        mb: 4,
        display: "flex", // Use flexbox on the container
        flexDirection: "column", // Stack children vertically
        alignItems: "flex-start", // Center children horizontally
      }}
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", textAlign: "center" }} // Center text
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: "primary.dark" }}
        >
          Welcome, {user?.name?.split(" ")[0]}!
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, fontWeight: 400 }}
        >
          Here are your exams:
        </Typography>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            width: "100%",
            maxWidth: "600px" /* Limit alert width */,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Main Content - Stacked Cards */}
      {!isLoading && (
        // No need for Grid container here, use Box or Fragments to stack
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Card 1: Pending Exams */}
          {/* Each card now controls its own width, e.g., 50% of the CONTAINER width */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            style={{
              width: "50%",
              alignSelf: "center" /* Center the card itself */,
            }} // SET WIDTH AND ALIGN
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 }, // Responsive padding
                display: "flex",
                flexDirection: "column",
                // Removed fixed height: let content determine height
                borderLeft: `5px solid ${theme.palette.primary.main}`,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "medium", color: "primary.main" }}
              >
                Pending Exams
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Ensure the Box allows shrinking and has a reasonable base height */}
              <Box
                sx={{
                  overflowY: "auto",
                  minHeight: "150px", // Give it a min height
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "action.selected",
                    borderRadius: "3px",
                  },
                }}
              >
                <ExamList exams={pendingExams} isLoading={false} />
              </Box>
            </Paper>
          </motion.div>

          {/* Card 2: Completed Exams */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            style={{ width: "50%", alignSelf: "center" }} // SET WIDTH AND ALIGN
          >
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: "column",
                borderLeft: `5px solid ${theme.palette.success.main}`,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "medium", color: "success.main" }}
              >
                Completed Exams
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  overflowY: "auto",
                  minHeight: "150px",
                  "&::-webkit-scrollbar": { width: "10px" },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "action.selected",
                    borderRadius: "3px",
                  },
                }}
              >
                <ResultList results={completedResults} isLoading={false} />
              </Box>
            </Paper>
          </motion.div>
        </Box>
      )}
    </Container>
  );
};

export default StudentDashboard;
