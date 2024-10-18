import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { APP_PORT } from './src/lib/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: APP_PORT,
		strictPort: true
	},
	preview: {
		port: APP_PORT,
		strictPort: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
