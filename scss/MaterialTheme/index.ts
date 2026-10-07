import { common } from '@mui/material/colors';
import { ThemeOptions } from '@mui/material/styles';

export const light: ThemeOptions = {
	palette: {
		mode: 'light',
		background: {
			default: '#f9f9ff',
			paper: common.white,
		},
		primary: {
			contrastText: '#ffffff',
			main: '#006194',
		},
		secondary: {
			main: '#006399',
		},
		text: {
			primary: '#141b2b',
			secondary: '#3f4850',
		},
	},
	typography: {
		fontFamily: ['Inter', 'sans-serif'].join(','),
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					boxShadow: 'none',
				},
			},
		},
	},
};
