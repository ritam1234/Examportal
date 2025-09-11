// src/theme.js
import { alpha, createTheme } from '@mui/material/styles';
import { teal, pink, deepOrange, grey } from '@mui/material/colors';
import React from 'react';

// Define base font sizes for responsiveness if needed
// const breakpoints = { ... };
export const ColorModeContext = React.createContext({
    toggleColorMode: () => {}, // Placeholder function
    mode: 'light', // Default mode
});
export const getAppTheme = (mode) => createTheme({
    palette: {
        mode: mode, // Dynamically set the mode ('light' or 'dark')
        ...(mode === 'light'
            ? { // --- Light Mode Palette ---
                primary: { main: teal[600], light: teal[400], dark: teal[800], contrastText: '#fff' },
                secondary: { main: pink[500], light: pink[300], dark: pink[700], contrastText: '#fff' },
                error: { main: deepOrange[600] },
                background: { default: '#f0f4f8', paper: '#ffffff' },
                text: { primary: '#263238', secondary: '#546e7a', disabled: grey[400] },
                action: { active: teal[500], hover: alpha(teal[500], 0.08), selected: alpha(teal[500], 0.16), disabled: alpha(grey[500], 0.3), disabledBackground: alpha(grey[500], 0.12), focus: alpha(teal[500], 0.12)}, // Added action colors
              }
            : { // --- Dark Mode Palette ---
                primary: { main: teal[300], light: teal[100], dark: teal[500], contrastText: grey[900] }, // Adjusted contrast for dark
                secondary: { main: pink[300], light: pink[100], dark: pink[500], contrastText: grey[900] },
                error: { main: deepOrange[400] },
                background: { default: grey[900], paper: grey[800] }, // Darker backgrounds
                text: { primary: grey[50], secondary: grey[400], disabled: grey[600] }, // Lighter text for dark mode
                action: { active: teal[200], hover: alpha(teal[200], 0.1), selected: alpha(teal[200], 0.2), disabled: alpha(grey[500], 0.3), disabledBackground: alpha(grey[500], 0.12), focus: alpha(teal[200], 0.15) },
              }),
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700, color: mode === 'light' ? teal[800] : teal[200] }, // Adjust color for mode
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { color: mode === 'light' ? '#37474f' : grey[400] },
    },
    shape: {
        borderRadius: 5,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // Use a different shadow or background for dark mode AppBar if desired
                    boxShadow: mode === 'light' ? '0px 2px 4px -1px rgba(0,0,0,0.1)' : '0px 2px 4px -1px rgba(0,0,0,0.3)',
                    // backgroundColor: mode === 'dark' ? grey[800] : undefined, // Example
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                 },
                 elevation1: { boxShadow: mode === 'light' ? '0px 2px 8px rgba(0,0,0,0.05)' : '0px 2px 8px rgba(255,255,255,0.05)' },
                 elevation2: { boxShadow: mode === 'light' ? '0px 4px 12px rgba(0,0,0,0.07)' : '0px 4px 12px rgba(255,255,255,0.07)' },
                 elevation3: { boxShadow: mode === 'light' ? '0px 6px 16px rgba(0,0,0,0.09)' : '0px 6px 16px rgba(255,255,255,0.09)' },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', borderRadius: '6px', padding: '8px 16px' },
                containedPrimary: {
                    '&:hover': {
                         backgroundColor: mode === 'light' ? teal[700] : teal[400], // Adjust hover for mode
                         boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                     },
                },
                 containedSecondary: {
                    '&:hover': {
                         backgroundColor: mode === 'light' ? pink[600] : pink[400],
                         boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
            },
            defaultProps: { disableElevation: true }
        },
        MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
        MuiSelect: { defaultProps: { variant: 'outlined', size: 'small' } },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ ownerState, theme: currentTheme }) => ({ // Access currentTheme inside
                     borderRadius: '6px',
                     transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                    // Example of using currentTheme directly for hover
                    // '&:hover': {
                    //      backgroundColor: alpha(currentTheme.palette.primary.main, currentTheme.palette.action.hoverOpacity),
                    // }
                 }),
            },
        },
        MuiChip: { styleOverrides: { root: { borderRadius: '6px' } } },
        MuiDrawer: { // Style the drawer paper for different modes
            styleOverrides: {
                paper: {
                    borderRight: mode === 'dark' ? `1px solid ${grey[700]}` : `1px solid ${grey[300]}`, // Adjust border for dark mode
                }
            }
        }
    },
});

export const theme = createTheme({
    palette: {
        mode: 'light', // Or 'dark'
        primary: {
            main: teal[600], // A modern teal
            light: teal[400],
            dark: teal[800],
        },
        secondary: {
            main: pink[500], // Vibrant accent
            light: pink[300],
            dark: pink[700],
        },
        error: {
            main: deepOrange[600],
        },
        background: {
            default: '#f0f4f8', // Lighter background
            paper: '#ffffff',
        },
        text: {
            primary: '#263238', // Darker grey for primary text
            secondary: '#546e7a', // Lighter grey
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700, color: teal[800] }, // Bold headings with primary color
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { color: '#37474f' }, // Slightly darker subtitle
    },
    shape: {
        borderRadius: 2, // Slightly more rounded corners
    },
    // --- Component Overrides for Modern Look ---
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)', // Softer shadow
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                     // Slightly more prominent shadow for emphasis papers?
                     // boxShadow: '0px 5px 15px rgba(0,0,0,0.08)',
                 },
                 elevation1: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }, // Softer default elevation
                 elevation2: { boxShadow: '0px 4px 12px rgba(0,0,0,0.07)' },
                 elevation3: { boxShadow: '0px 6px 16px rgba(0,0,0,0.09)' },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Common modern practice
                    borderRadius: '6px',   // Match global border radius
                    padding: '8px 16px', // Adjust padding
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: teal[700],
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
                 containedSecondary: {
                    '&:hover': {
                        backgroundColor: pink[600],
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
            },
            defaultProps: {
                 disableElevation: true, // Use flat buttons more often
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            }
        },
        MuiSelect: {
             defaultProps: {
                 variant: 'outlined',
                 size: 'small',
             }
        },
         MuiListItemButton: {
             styleOverrides: {
                 root: {
                     borderRadius: '6px',
                     transition: 'background-color 0.2s ease-in-out',
                     '&:hover': {
                          // backgroundColor: alpha(theme.palette.primary.light, 0.1), // Subtle hover
                          // Handled better inline now
                     }
                 }
             }
        },
         MuiChip: {
             styleOverrides: {
                 root: {
                      borderRadius: '6px',
                  },
              }
         }
        // Add more overrides as needed (MuiCard, MuiList, etc.)
    },
});

const defaultInitialTheme = getAppTheme('light'); // Or read from localStorage here for initial default

export default defaultInitialTheme;