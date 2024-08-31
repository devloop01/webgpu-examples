import { capitalize } from '@/lib/utils/index.js';
import { createMetaTags } from '@/lib/utils/meta-tags.js';
import type { WebGPU } from '@/lib/webgpu/index.js';

type InitFn = (webgpu: WebGPU) => () => void;

const modules = Object.keys(import.meta.glob('$lib/examples/**/*.ts'));

const getGithubLink = (group: string, example: string) =>
	`https://github.com/devloop01/webgpu-examples/blob/main/src/lib/examples/${group}/${example}.ts`;

export const load = async ({ params }) => {
	let { group, example } = params;

	const [modulePath] = modules.filter((path) => path.includes(group));
	const [folder] = modulePath.split('/').slice(-2);

	const module = await import(`$lib/examples/${folder}/${example}.ts`);
	const initFn = module.default as InitFn;

	const githubLink = getGithubLink(folder, example);

	// remove the leading number and dash
	group = group.replace(/(\d+)-/, '');
	example = example.replace(/(\d+)-/, '');

	// replace dashes with spaces
	group = group.replace(/-/g, ' ');
	example = example.replace(/-/g, ' ');

	return {
		initFn,
		githubLink,
		pageMetaTags: createMetaTags({
			title: `${capitalize(example)} - ${capitalize(group)}`
		})
	};
};

export const entries = () => {
	const paths = modules.map((path) => {
		// eslint-disable-next-line prefer-const
		let [group, example] = path.split('/').slice(-2);

		// remove the file extension
		example = example.replace('.ts', '');

		return { group, example };
	});

	return paths;
};
