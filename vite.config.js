import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 54321,
		strictPort: true
	},
	preview: {
		port: 54321,
		strictPort: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
