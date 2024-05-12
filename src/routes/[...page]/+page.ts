import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	return {
		page: params.page
	};
}) satisfies PageLoad;
