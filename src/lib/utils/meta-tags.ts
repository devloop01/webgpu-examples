import type { MetaTagsProps } from 'svelte-meta-tags';

export const createMetaTags = (metaTags: MetaTagsProps) => {
	return Object.freeze<MetaTagsProps>(metaTags);
};
