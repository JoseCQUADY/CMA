import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

// CMA blue color from logo
const CMA_BLUE = '#0060a0';
const CMA_BLUE_LIGHT = '#1976d2';
const CMA_BLUE_DARK = '#004c80';

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeContextProvider');
    }
    return context;
};

export const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light mode - Professional white theme with CMA blue
                            primary: {
                                main: CMA_BLUE,
                                light: CMA_BLUE_LIGHT,
                                dark: CMA_BLUE_DARK,
                                contrastText: '#ffffff',
                            },
                            secondary: {
                                main: '#42a5f5',
                                light: '#80d6ff',
                                dark: '#0077c2',
                                contrastText: '#ffffff',
                            },
                            background: {
                                default: '#f8fafc',
                                paper: '#ffffff',
                            },
                            text: {
                                primary: '#1e293b',
                                secondary: '#64748b',
                            },
                            divider: '#e2e8f0',
                            success: {
                                main: '#22c55e',
                                light: '#86efac',
                                dark: '#15803d',
                            },
                            warning: {
                                main: '#f59e0b',
                                light: '#fcd34d',
                                dark: '#d97706',
                            },
                            error: {
                                main: '#ef4444',
                                light: '#fca5a5',
                                dark: '#dc2626',
                            },
                            info: {
                                main: CMA_BLUE_LIGHT,
                                light: '#93c5fd',
                                dark: CMA_BLUE_DARK,
                            },
                        }
                        : {
                            // Dark mode - Professional dark theme with CMA blue accents
                            primary: {
                                main: '#42a5f5',
                                light: '#80d6ff',
                                dark: CMA_BLUE,
                                contrastText: '#ffffff',
                            },
                            secondary: {
                                main: '#90caf9',
                                light: '#c3fdff',
                                dark: '#5d99c6',
                                contrastText: '#000000',
                            },
                            background: {
                                default: '#0f172a',
                                paper: '#1e293b',
                            },
                            text: {
                                primary: '#f1f5f9',
                                secondary: '#94a3b8',
                            },
                            divider: '#334155',
                            success: {
                                main: '#4ade80',
                                light: '#86efac',
                                dark: '#22c55e',
                            },
                            warning: {
                                main: '#fbbf24',
                                light: '#fcd34d',
                                dark: '#f59e0b',
                            },
                            error: {
                                main: '#f87171',
                                light: '#fca5a5',
                                dark: '#ef4444',
                            },
                            info: {
                                main: '#60a5fa',
                                light: '#93c5fd',
                                dark: '#3b82f6',
                            },
                        }),
                },
                typography: {
                    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: {
                        fontWeight: 700,
                    },
                    h2: {
                        fontWeight: 700,
                    },
                    h3: {
                        fontWeight: 600,
                    },
                    h4: {
                        fontWeight: 600,
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                    button: {
                        textTransform: 'none',
                        fontWeight: 500,
                    },
                },
                shape: {
                    borderRadius: 8,
                },
                transitions: {
                    duration: {
                        shortest: 150,
                        shorter: 200,
                        short: 250,
                        standard: 300,
                        complex: 375,
                        enteringScreen: 225,
                        leavingScreen: 195,
                    },
                    easing: {
                        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
                        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
                        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                padding: '8px 16px',
                                boxShadow: 'none',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0, 96, 160, 0.15)',
                                    transform: 'translateY(-1px)',
                                },
                            },
                            contained: {
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0, 96, 160, 0.25)',
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                                transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
                            },
                            elevation1: {
                                boxShadow: mode === 'light' 
                                    ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)'
                                    : '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
                            },
                            elevation2: {
                                boxShadow: mode === 'light'
                                    ? '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)'
                                    : '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: mode === 'light'
                                        ? '0 12px 24px rgba(0, 0, 0, 0.1)'
                                        : '0 12px 24px rgba(0, 0, 0, 0.4)',
                                },
                            },
                        },
                    },
                    MuiTableContainer: {
                        styleOverrides: {
                            root: {
                                overflowX: 'auto',
                            },
                        },
                    },
                    MuiTableHead: {
                        styleOverrides: {
                            root: {
                                '& .MuiTableCell-root': {
                                    backgroundColor: mode === 'light' ? '#f1f5f9' : '#334155',
                                    fontWeight: 600,
                                    color: mode === 'light' ? '#1e293b' : '#f1f5f9',
                                    borderBottom: mode === 'light' ? '2px solid #e2e8f0' : '2px solid #475569',
                                },
                            },
                        },
                    },
                    MuiTableCell: {
                        styleOverrides: {
                            root: {
                                borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
                            },
                        },
                    },
                    MuiTableRow: {
                        styleOverrides: {
                            root: {
                                transition: 'background-color 0.15s ease-in-out',
                                '&:hover': {
                                    backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
                                },
                            },
                        },
                    },
                    MuiSkeleton: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === 'light' ? '#e2e8f0' : '#334155',
                            },
                        },
                    },
                    MuiFade: {
                        defaultProps: {
                            timeout: 400,
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'light'
                                    ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                                    : '0 1px 3px rgba(0, 0, 0, 0.3)',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                borderRight: 'none',
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                fontWeight: 500,
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: CMA_BLUE,
                                    },
                                },
                            },
                        },
                    },
                    MuiAvatar: {
                        styleOverrides: {
                            root: {
                                fontWeight: 600,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const value = useMemo(
        () => ({
            mode,
            toggleTheme,
            isDarkMode: mode === 'dark',
        }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={value}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
