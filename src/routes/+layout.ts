import { groupBy } from '@/lib/utils';

const modules = import.meta.glob('$lib/webgpu/examples/**/*.ts');

type Example = {
	group?: string;
	title: string;
	href: string;
};

export const load = async () => {
	const examples = Object.keys(modules).map((path) => {
		let [group, title] = path.split('/').slice(-2);

		title = title.replace('.ts', '');

		const href = `/${group}/${title}`;

		group = group.replace(/(\d+)-/, '');
		group = group.replace(/-/g, ' ');

		return { group, title, href } satisfies Example;
	});

	const groupedExamples = Object.entries(groupBy(examples, ({ group }) => group || '')).map(
		([group, examples]) => ({ group, examples })
	);

	return {
		groupedExamples
	};
};

export const prerender = true;
