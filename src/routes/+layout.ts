import { groupBy } from '@/lib/utils';

type Example = {
	group?: string;
	title: string;
	href: string;
};

export const load = async () => {
	const examples: Example[] = [
		{
			group: 'Basics',
			title: 'Blank',
			href: '/basics-blank'
		},
		{
			group: 'Basics',
			title: 'Triangle',
			href: '/basics-triangle'
		},

		{
			group: 'Advanced',
			title: 'Cube',
			href: '/advanced-cube'
		}
	];

	const groupedExamples = Object.entries(groupBy(examples, ({ group }) => group || '')).map(
		([group, examples]) => ({ group, examples })
	);

	return {
		groupedExamples
	};
};

export const prerender = true;
