/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		// 禁用一些与 MUI 冲突的样式
		preflight: false,
	},
};
