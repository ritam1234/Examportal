// src/components/Common/AdminLayout.js
import React, { useState, createContext, useContext } from 'react'; // Added createContext, useContext
import { Outlet, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar'; // For spacing under AppBar
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'; // For responsiveness

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BarChartIcon from '@mui/icons-material/BarChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // For collapsing
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton'; // For collapse button
import Divider from '@mui/material/Divider';
import { Typography } from '@mui/material';

// Create a context for the mobile drawer state if Header needs to control it from outside
export const MobileDrawerContext = createContext({
    mobileOpen: false,
    setMobileOpen: () => {},
    handleDrawerToggle: () => {},
});


const drawerWidth = 250; // Standard width
const collapsedDrawerWidth = 65; // Width when collapsed (icon only)

const AdminLayout = ({ onMobileMenuClick, showMobileMenuButton }) => { // Added props if Header is external
    const location = useLocation();
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up('md')); // Check for medium screens and up

    // State for mobile drawer (temporary variant)
    const [mobileOpen, setMobileOpen] = useState(false);
    // State for permanent drawer collapse (on larger screens)
    const [isPermanentDrawerCollapsed, setIsPermanentDrawerCollapsed] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handlePermanentDrawerCollapseToggle = () => {
        setIsPermanentDrawerCollapsed(!isPermanentDrawerCollapsed);
    };

    const currentDrawerWidth = isMdUp ? (isPermanentDrawerCollapsed ? collapsedDrawerWidth : drawerWidth) : drawerWidth;


    const menuItems = [
        { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { text: 'Manage Questions', path: '/admin/manage-questions', icon: <QuestionAnswerIcon /> },
        { text: 'Manage Exams', path: '/admin/manage-exams', icon: <AssignmentIcon /> },
        { text: 'Assign Exam', path: '/admin/assign-exam', icon: <AssignmentIndIcon /> },
        { text: 'View All Results', path: '/admin/results', icon: <BarChartIcon /> },
        { text: 'Analytics', path: '/admin/analytics', icon: <AnalyticsIcon /> },
    ];

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Optional: Toolbar spacer if this Drawer is under a global AppBar */}
            {/* <Toolbar /> */}
            {/* Optional: Logo or App Name in Sidebar */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: isPermanentDrawerCollapsed && isMdUp ? 'center' : 'space-between' }}>
                {! (isPermanentDrawerCollapsed && isMdUp) && (
                    <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight="bold">
                        Admin Panel
                    </Typography>
                )}
                {/* Collapse button for permanent drawer on mdUp screens */}
                {isMdUp && (
                    <IconButton onClick={handlePermanentDrawerCollapseToggle} size="small">
                        {isPermanentDrawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                )}
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflowY: 'auto', px: isPermanentDrawerCollapsed && isMdUp ? 0.5 : 1.5 }}> {/* Adjust padding when collapsed */}
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                    return (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block', my: 0.5 }}>
                            <ListItemButton
                                component={RouterNavLink}
                                to={item.path}
                                title={item.text} // Tooltip for collapsed icons
                                sx={{
                                    minHeight: 48,
                                    justifyContent: (isPermanentDrawerCollapsed && isMdUp) ? 'center' : 'initial', // Center icon when collapsed
                                    px: 2, // Consistent padding
                                    borderRadius: theme.shape.borderRadius,
                                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    fontWeight: isActive ? 'bold' : 'regular',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.dark,
                                    },
                                    transition: theme.transitions.create(['background-color', 'color'], {
                                        easing: theme.transitions.easing.sharp,
                                        duration: theme.transitions.duration.enteringScreen,
                                    }),
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: (isPermanentDrawerCollapsed && isMdUp) ? 'auto' : 2.5, // Adjust margin when collapsed
                                        justifyContent: 'center',
                                        color: 'inherit', // Inherit color from ListItemButton
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        whiteSpace: 'nowrap', // Prevent text wrapping
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                    sx={{ opacity: (isPermanentDrawerCollapsed && isMdUp) ? 0 : 1, transition: theme.transitions.create('opacity') }} // Hide text when collapsed
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        // Provide context value if Header is external and needs to control mobileOpen
        <MobileDrawerContext.Provider value={{ mobileOpen, setMobileOpen, handleDrawerToggle }}>
            <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 'calc(100vh - 64px)' /* Assuming 64px Header */ }}>
                <CssBaseline />
                {/* Sidebar Drawer */}
                <Drawer
                    variant={isMdUp ? "permanent" : "temporary"} // Change variant based on screen size
                    open={isMdUp ? true : mobileOpen} // Permanent is always "open", temporary uses state
                    onClose={handleDrawerToggle} // For temporary drawer: close on backdrop click
                    sx={{
                        width: currentDrawerWidth,
                        flexShrink: 0,
                        whiteSpace: 'nowrap', // Prevent content from wrapping during transition
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        [`& .MuiDrawer-paper`]: {
                            width: currentDrawerWidth,
                            boxSizing: 'border-box',
                            borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` }, // No border on mobile temporary
                            // Position relative to allow content to flow next to it
                            // If Header is part of App.js, ensure Drawer is under it or use variant="persistent" with content shifting
                            position: 'relative',
                            overflowX: 'hidden', // Hide horizontal scrollbar during collapse
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                    ModalProps={{ keepMounted: true }} // Better SEO for temporary drawer
                >
                    {drawerContent}
                </Drawer>

                {/* Main Content Area */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 }, // Responsive padding
                        bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], // Light grey background
                        width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` }, // Adjust width based on drawer
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        //ml: { md: `${currentDrawerWidth}px` }, // MarginLeft only needed if drawer is 'fixed'/'absolute' variant
                    }}
                >
                    {/* Optional: Toolbar spacer if this area is under a global AppBar */}
                    {/* <Toolbar /> */}
                    <Outlet /> {/* Where nested admin pages render */}
                </Box>
            </Box>
        </MobileDrawerContext.Provider>
    );
};

export default AdminLayout;