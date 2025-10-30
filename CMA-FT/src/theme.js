import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#525C6D', 
        },
        secondary: {
            main: '#A3B6D4',
        },
        background: {
            default: '#EDEDF3',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#525C6D',
            secondary: '#A3B6D4',
        },
        info: {
            main: '#D4DAF1',
        }
    },
    typography: {
        fontFamily: 'Segoe UI, Roboto, sans-serif',
    },
});