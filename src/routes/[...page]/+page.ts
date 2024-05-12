import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	return {
		page: params.page
	};
}) satisfies PageLoad;

export const entries = () => {
	return [
		// Basics
		{ page: 'basics-blank' },
		{ page: 'basics-triangle' },

		// Advanced
		{ page: 'advanced-cube' }
	];
};
