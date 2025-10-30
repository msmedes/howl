import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
        proxy: {
            "/agents": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
        },
	},
	plugins: [
		tsConfigPaths(),
		tanstackStart({ customViteReactPlugin: true }),
		viteReact(),
	],
});
