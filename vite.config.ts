// vite.config.ts - 修复API代理配置
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:9191",
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api/, "/api"),
			},
			"/public": {
				target: "http://localhost:9191",
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
