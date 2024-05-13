const modules = Object.keys(import.meta.glob('$lib/webgpu/examples/**/*.ts'));

export const load = async ({ params }) => {
	const { group, example } = params;

	const [modulePath] = modules.filter((path) => path.includes(group));
	const [folder] = modulePath.split('/').slice(-2);

	return { group: folder, example };
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
