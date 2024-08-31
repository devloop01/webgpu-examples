import { groupBy } from '$lib/utils';
import { createMetaTags } from '$lib/utils/meta-tags';

const modules = Object.keys(import.meta.glob('$lib/examples/**/*.ts'));

type Example = {
	group?: string;
	title: string;
	href: string;
};

const examples = modules.map((path) => {
	let [group, title] = path.split('/').slice(-2);

	// remove the file extension
	title = title.replace('.ts', '');

	const href = `/${group}/${title}`;

	// remove the leading number and dash
	group = group.replace(/(\d+)-/, '');
	title = title.replace(/(\d+)-/, '');

	// replace dashes with spaces
	group = group.replace(/-/g, ' ');
	title = title.replace(/-/g, ' ');

	return { group, title, href } satisfies Example;
});

const groupedExamples = Object.entries(groupBy(examples, ({ group }) => group || '')).map(
	([group, examples]) => ({ group, examples })
);

export const load = async ({ url }) => {
	const isHomePage = url.pathname === '/';

	const title = formatPathname(url.pathname) || 'WebGPU Examples';
	const description = 'A Collection of WebGPU Examples for learning and reference.';
	const siteUrl = url.origin;
	const author = 'Sikriti Dakua';

	const baseMetaTags = createMetaTags({
		title,
		titleTemplate: isHomePage ? '%s' : `%s | WebGPU Examples`,
		description,
		keywords: [
			'WebGPU',
			'WebGPU Examples',
			'WebGPU Learning',
			'Graphics Programming',
			'Graphics API',
			'Web Development'
		],
		robots: 'index,follow',

		canonical: siteUrl,
		openGraph: {
			type: 'website',
			url: siteUrl,
			title,
			description,
			siteName: title,
			images: [
				{
					url: `${siteUrl}/og.png`,
					width: 1200,
					height: 630,
					alt: 'WebGPU Examples',
					type: 'image/png',
					secureUrl: `${siteUrl}/og.png`
				}
			]
		},
		twitter: {
			site: '@DevLoop01',
			handle: '@DevLoop01',
			title,
			description,
			image: `${siteUrl}/og.png`,
			imageAlt: 'WebGPU Examples',
			cardType: 'summary'
		},

		additionalMetaTags: [
			{ name: 'author', content: author },
			{ name: 'publisher', content: author },
			{ name: 'msapplication-TileColor', content: '#000000' },
			{ name: 'theme-color', content: '#000000' }
		],

		additionalLinkTags: [
			{ rel: 'author', href: 'https://x.com/DevLoop01' },
			{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
			{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
			{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
			{ rel: 'manifest', href: '/site.webmanifest' },
			{ rel: 'mask-icon', color: '#000000', href: '/safari-pinned-tab.svg' },
			{ rel: 'shortcut icon', href: '/favicon.ico' }
		]
	});

	return {
		groupedExamples,
		baseMetaTags
	};
};

export const prerender = true;

function formatPathname(pathname: string) {
	pathname = pathname.replace(/^\/|\/$/g, '');
	let words = pathname.split(/[-_]/);
	words = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	return words.join(' ');
}
