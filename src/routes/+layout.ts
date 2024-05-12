import { groupBy } from '@/lib/utils';

const modules = import.meta.glob('$lib/webgpu/examples/**/*.ts');

type Example = {
	group?: string;
	title: string;
	href: string;
};

export const load = async () => {
	const examples = Object.keys(modules).map((path) => {
		// eslint-disable-next-line prefer-const
		let [group, title] = path.split('/').slice(-2);

		title = title.replace('.ts', '');

		return { group, title, href: `/${group}/${title}` } satisfies Example;
	});

	const groupedExamples = Object.entries(groupBy(examples, ({ group }) => group || '')).map(
		([group, examples]) => ({ group, examples })
	);

	return {
		groupedExamples
	};
};

export const prerender = true;
