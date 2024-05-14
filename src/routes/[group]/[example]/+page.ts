import { captalize } from '@/lib/utils/index.js';
import { createMetaTags } from '@/lib/utils/meta-tags.js';
import type { WebGPU } from '@/lib/webgpu/index.js';

type InitFn = (webgpu: WebGPU) => () => void;

const modules = Object.keys(import.meta.glob('$lib/webgpu/examples/**/*.ts'));

const getGithubLink = (group: string, example: string) =>
	`https://github.com/devloop01/webgpu-examples/blob/main/src/lib/webgpu/examples/${group}/${example}.ts`;

export const load = async ({ params }) => {
	const { group, example } = params;

	const [modulePath] = modules.filter((path) => path.includes(group));
	const [folder] = modulePath.split('/').slice(-2);

	const module = await import(`$lib/webgpu/examples/${folder}/${example}.ts`);

	const initFn = module.default as InitFn;

	return {
		initFn,
		githubLink: getGithubLink(folder, example),
		pageMetaTags: createMetaTags({
			title: `${captalize(example)} - ${captalize(group)}`
		})
	};
};

export const entries = () => {
	const paths = modules.map((path) => {
		let [group, example] = path.split('/').slice(-2);

		example = example.replace('.ts', '');
		group = group.replace(/(\d+)-/, '');

		return { group, example };
	});

	return paths;
};
