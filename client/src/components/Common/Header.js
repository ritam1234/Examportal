// src/components/Common/Header.js
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon
import { useTheme } from '@mui/material/styles'; // To access theme
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Assume ColorModeContext is created and provided in App.js or theme setup
import { ColorModeContext } from '../../theme'; // Adjust path if needed
import PropTypes from 'prop-types';

// Add new props: onMobileMenuClick and showMobileMenuButton
const Header = ({ onMobileMenuClick, showMobileMenuButton = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const colorMode = React.useContext(ColorModeContext); // If using a context for theme toggle

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        return user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    }

    return (
        <AppBar
            position="sticky" // Sticky for better UX
            elevation={1} // Softer shadow from theme
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} // Ensure above permanent drawer if needed
        >
            <Toolbar>
                {/* Mobile Menu Button (conditionally rendered) */}
                {showMobileMenuButton && onMobileMenuClick && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onMobileMenuClick}
                        sx={{ mr: 2, display: { md: 'none' } }} // Show only on screens smaller than md
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}
                >
                    Exam Portal
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                   
                    {user ? (
                        <>
                           <Button
                                color="inherit"
                                startIcon={<DashboardIcon />}
                                component={RouterLink}
                                to={getDashboardLink()}
                                sx={{ mr: 1, display: { xs: 'none', sm: 'flex' } }} // Hide on extra small
                           >
                                Dashboard
                           </Button>
                            <Button
                                color="inherit"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" startIcon={<LoginIcon />} component={RouterLink} to="/login" sx={{ mr: 1 }}> Login </Button>
                            <Button color="inherit" startIcon={<AppRegistrationIcon />} component={RouterLink} to="/register"> Register </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

// Add prop types if using PropTypes
Header.propTypes = {
    onMobileMenuClick: PropTypes.func,
    showMobileMenuButton: PropTypes.bool,
};

export default Header;