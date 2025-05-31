import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		primary: {
			main: "#667eea",
			light: "#9ca5ff",
			dark: "#3f51b5",
			contrastText: "#ffffff",
		},
		secondary: {
			main: "#764ba2",
			light: "#a47bd3",
			dark: "#4a2c73",
			contrastText: "#ffffff",
		},
		background: {
			default: "#f5f7fa",
			paper: "#ffffff",
		},
		success: {
			main: "#4caf50",
		},
		error: {
			main: "#f44336",
		},
		warning: {
			main: "#ff9800",
		},
		info: {
			main: "#2196f3",
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: "2.5rem",
			fontWeight: 600,
		},
		h2: {
			fontSize: "2rem",
			fontWeight: 600,
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 600,
		},
		h4: {
			fontSize: "1.5rem",
			fontWeight: 600,
		},
		h5: {
			fontSize: "1.25rem",
			fontWeight: 600,
		},
		h6: {
			fontSize: "1rem",
			fontWeight: 600,
		},
	},
	shape: {
		borderRadius: 12,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					borderRadius: 8,
					fontWeight: 600,
					boxShadow: "none",
					"&:hover": {
						boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
					},
				},
				containedPrimary: {
					background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
					"&:hover": {
						background: "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
					borderRadius: 16,
					"&:hover": {
						boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 10,
						"&:hover .MuiOutlinedInput-notchedOutline": {
							borderColor: "#667eea",
						},
						"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
							borderColor: "#667eea",
							borderWidth: 2,
						},
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 10,
					fontWeight: 500,
				},
			},
		},
	},
});
