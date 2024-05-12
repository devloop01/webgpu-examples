import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
	plugins: [sveltekit(), glsl()]
});
