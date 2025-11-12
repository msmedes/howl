import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	build: {
		cssCodeSplit: true,
		cssMinify: true,
	},
	plugins: [
		tsConfigPaths(),
		tanstackStart({
			customViteReactPlugin: true,
			target: "bun",
		}),
		viteReact(),
	],
});
