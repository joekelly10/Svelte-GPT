import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 1337,
		strictPort: true
	},
	preview: {
		port: 1337,
		strictPort: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
