import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import axiosInstance from '../api/axiousInstance'; // Import the configured instance
import { loginUser, registerUser, getUserProfile } from '../api/auth'; // Import API calls
import LoadingSpinner from '../components/Common/LoadingSpinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start loading until token check is done

    // Helper to set token in localStorage and Axios defaults
    const setAuthData = (token) => {
        if (token) {
            localStorage.setItem('authToken', token);
            // Axios interceptor in axiosInstance.js now handles setting the header
        } else {
            localStorage.removeItem('authToken');
             // Optional: explicit removal from defaults if interceptor wasn't enough? Usually covered.
             delete axiosInstance.defaults.headers.common['Authorization'];
        }
    };


    // Fetch user profile using token - Refactored slightly
     const fetchProfile = useCallback(async (currentToken) => {
          if (!currentToken) {
               setLoading(false);
               setUser(null); // Clear user if no token
               return;
          }
           try {
                // Ensure token is set for the request (interceptor should handle this)
               const { success, user: profileData } = await getUserProfile();
               if (success && profileData) {
                   setUser(profileData);
               } else {
                    // Profile fetch failed or returned invalid data, treat as logged out
                    console.error("Profile fetch unsuccessful or data invalid.");
                    logout(); // Clear invalid state
               }
           } catch (error) {
               console.error("Failed to fetch user profile:", error);
               logout(); // Log out on error (e.g., token invalid/expired)
           } finally {
                setLoading(false); // Stop loading once profile fetch attempt completes
           }
     }, []);

    // Login Function
    const login = async (email, password) => {
        setLoading(true);
        try {
             const { success, token, user: userData } = await loginUser(email, password);
            if (success && token && userData) {
                setAuthData(token); // Set token
                setUser(userData);  // Set user state immediately
                setLoading(false);
                return true; // Indicate success
            } else {
                // Handle login failure message if needed
                 console.error("Login failed: No token or user data received");
                 setAuthData(null); // Clear any potentially bad token
                 setUser(null);
                 setLoading(false);
                 return false;
            }
        } catch (error) {
            console.error('Login API failed:', error.response ? error.response.data : error.message);
            setAuthData(null); // Clear token on failure
            setUser(null);
            setLoading(false);
            throw error; // Re-throw for the component to handle displaying message
        }
    };

    // Register Function
    const register = async (name, email, password, role = 'student') => {
         setLoading(true);
        try {
             const { success, token, user: userData } = await registerUser(name, email, password, role);
            if (success && token && userData) {
                 setAuthData(token);
                 setUser(userData);
                 setLoading(false);
                 return true; // Success
            } else {
                  console.error("Registration failed: No token or user data received");
                 setAuthData(null);
                 setUser(null);
                 setLoading(false);
                 return false;
            }
        } catch (error) {
            console.error('Registration API failed:', error.response ? error.response.data : error.message);
             setAuthData(null);
             setUser(null);
            setLoading(false);
            throw error; // Re-throw
        }
    };

    // Logout Function
    const logout = useCallback(() => {
        setAuthData(null); // Clear token from storage and axios defaults (via setAuthData)
        setUser(null);
        // Navigation handled by components/Header using useNavigate
    }, []); // Add empty dependency array

    // Check for existing token on initial load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
             try {
                 const decoded = jwtDecode(token);
                 const currentTime = Date.now() / 1000;
                 if (decoded.exp > currentTime) {
                    // Token exists and seems valid, fetch profile to confirm
                     fetchProfile(token); // Fetch user info
                 } else {
                      // Token expired
                     logout(); // Clear expired token and user state
                      setLoading(false); // Done loading
                 }
             } catch (e) {
                  // Invalid token format
                 console.error("Invalid token on load:", e);
                  logout();
                  setLoading(false);
             }
        } else {
             setLoading(false); // No token found, done loading
             setUser(null); // Explicitly set user to null if no token
        }
     }, [logout, fetchProfile]); // Depend on logout/fetchProfile callback


    const value = { user, loading, login, logout, register, fetchProfile, setLoading };

    return <AuthContext.Provider value={value}>{!loading ? children : <LoadingSpinner />}</AuthContext.Provider>;
};

export default AuthContext;