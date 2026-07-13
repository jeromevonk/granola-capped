import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// MUI derives every component's colors from palette.mode; we only tune
// the brand colors, which need lighter tones on dark backgrounds
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#26a69a' : '#008080',
    },
    secondary: {
      main: mode === 'dark' ? '#64b5f6' : '#0e609e',
    },
    error: {
      main: red.A400,
    }
  },
});

// Static light theme — used by _document.js for the theme-color meta tag
const theme = getTheme('light');

export default theme;
export { getTheme };
