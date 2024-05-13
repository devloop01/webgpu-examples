import { groupBy } from '@/lib/utils';

const modules = Object.keys(import.meta.glob('$lib/webgpu/examples/**/*.ts'));

type Example = {
	group?: string;
	title: string;
	href: string;
};

export const load = async () => {
	const examples = modules.map((path) => {
		let [group, title] = path.split('/').slice(-2);

		// remove the file extension
		title = title.replace('.ts', '');

		// remove the leading number and dash
		group = group.replace(/(\d+)-/, '');

		const href = `/${group}/${title}`;

		// replace dashes with spaces
		group = group.replace(/-/g, ' ');
		title = title.replace(/-/g, ' ');

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
