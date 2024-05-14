import adapter from '@sveltejs/adapter-static';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@': './src',
			$components: './src/lib/components',
			$icons: './src/lib/components/icons'
		}
	}
};

export default config;
