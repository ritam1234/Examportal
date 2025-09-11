// src/App.js
import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AnimatePresence } from "framer-motion";

import defaultInitialTheme, { ColorModeContext, getAppTheme } from "./theme";

// Common Components & Layouts
import Header from "./components/Common/Header";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import AdminLayout, {
  MobileDrawerContext,
} from "./components/Common/AdminLayout";
import AnimatedPage from "./components/Common/AnimatedPresence"; // Assuming AnimatedPage.js exists

// Page Components
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManageQuestions from "./pages/manageQuestions"; // Corrected
import ManageExams from "./pages/manageExams"; // Corrected
import AssignExamPage from "./pages/AssignExamPage";
import ViewAllResults from "./pages/ViewAllResults";
import ViewAllResultDetails from "./pages/ViewAllResultDetails";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudentDashboard from "./pages/StudentDashboard";
import ExamPage from "./pages/ExamPage";
import ResultsPage from "./pages/ResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage"; 
import RequestPasswordResetPage from "./pages/RequestPasswordResetPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Hooks
import useAuth from "./hooks/useAuth";

function App() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const [mode, setMode] = useState(() => {
    try {
      const storedMode = localStorage.getItem("themeMode");
      return storedMode === "dark" || storedMode === "light"
        ? storedMode
        : "light";
    } catch (e) {
      console.error("localStorage error for themeMode", e);
      return "light";
    }
  });

  const activeTheme = useMemo(() => getAppTheme(mode), [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          try {
            localStorage.setItem("themeMode", newMode);
          } catch (e) {
            console.error("localStorage save themeMode error", e);
          }
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const isAdminPage = location.pathname.startsWith("/admin");
  const showMobileMenuButton = user?.role === "admin" && isAdminPage;

  if (authLoading) return <LoadingSpinner fullScreen />;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline enableColorScheme />
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Header
            onMobileMenuClick={handleDrawerToggle}
            showMobileMenuButton={showMobileMenuButton}
          />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* --- PUBLIC --- */}
              <Route
                path="/"
                element={
                  <AnimatedPage>
                    <Container
                      sx={{ pt: { xs: 2, md: 4 }, pb: 4, flexGrow: 1 }}
                    >
                      <HomePage />
                    </Container>
                  </AnimatedPage>
                }
              />
              <Route
                path="/login"
                element={
                  <AnimatedPage>
                    <AuthPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/register"
                element={
                  <AnimatedPage>
                    <AuthPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/email-verified"
                element={
                  <AnimatedPage>
                    <Container
                      sx={{ pt: { xs: 2, md: 4 }, pb: 4, flexGrow: 1 }}
                    >
                      <EmailVerifiedPage />
                    </Container>
                  </AnimatedPage>
                }
              />
              <Route
                path="/request-password-reset"
                element={
                  <AnimatedPage>
                    <RequestPasswordResetPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/verify-otp"
                element={
                  <AnimatedPage>
                    <VerifyOtpPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <AnimatedPage>
                    <ResetPasswordPage />
                  </AnimatedPage>
                }
              />

              {/* --- ADMIN --- */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route
                  path="/admin"
                  element={
                    <MobileDrawerContext.Provider
                      value={{ mobileOpen, setMobileOpen, handleDrawerToggle }}
                    >
                      <AdminLayout />
                    </MobileDrawerContext.Provider>
                  }
                >
                  <Route
                    index
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                  <Route
                    path="dashboard"
                    element={
                      <AnimatedPage>
                        <AdminDashboard />
                      </AnimatedPage>
                    }
                  />
                  <Route
                    path="manage-questions"
                    element={
                      <AnimatedPage>
                        <ManageQuestions />
                      </AnimatedPage>
                    }
                  />
                  <Route
                    path="manage-exams"
                    element={
                      <AnimatedPage>
                        <ManageExams />
                      </AnimatedPage>
                    }
                  />
                  <Route
                    path="assign-exam"
                    element={
                      <AnimatedPage>
                        <AssignExamPage />
                      </AnimatedPage>
                    }
                  />
                  <Route
                    path="results"
                    element={
                      <AnimatedPage>
                        <ViewAllResults />
                      </AnimatedPage>
                    }
                  />
                  <Route
                    path="results/:resultId"
                    element={
                      <AnimatedPage>
                        <ViewAllResultDetails />
                      </AnimatedPage>
                    }
                  />
                  <Route
                    path="analytics"
                    element={
                      <AnimatedPage>
                        <AnalyticsPage />
                      </AnimatedPage>
                    }
                  />
                </Route>
              </Route>

              {/* --- STUDENT --- */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route
                  path="/exam/:examId"
                  element={
                    <AnimatedPage>
                      <ExamPage />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/student/dashboard"
                  element={
                    <AnimatedPage>
                      <Container
                        sx={{ pt: { xs: 2, md: 4 }, pb: 4, flexGrow: 1 }}
                      >
                        <StudentDashboard />
                      </Container>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/results"
                  element={
                    <AnimatedPage>
                      <Container
                        sx={{ pt: { xs: 2, md: 4 }, pb: 4, flexGrow: 1 }}
                      >
                        <ResultsPage />
                      </Container>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/results/:resultId"
                  element={
                    <AnimatedPage>
                      <Container
                        sx={{ pt: { xs: 2, md: 4 }, pb: 4, flexGrow: 1 }}
                      >
                        <ViewAllResultDetails />
                      </Container>
                    </AnimatedPage>
                  }
                />
              </Route>

              {/* --- NOT FOUND --- */}
              <Route
                path="*"
                element={
                  <AnimatedPage>
                    <Container
                      sx={{ pt: { xs: 2, md: 4 }, pb: 4, flexGrow: 1 }}
                    >
                      <NotFoundPage />
                    </Container>
                  </AnimatedPage>
                }
              />
            </Routes>
          </AnimatePresence>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
