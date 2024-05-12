const modules = import.meta.glob('$lib/webgpu/examples/**/*.ts');

export const load = async ({ params }) => {
	const { group, example } = params;

	return { group, example };
};

export const entries = () => {
	const paths = Object.keys(modules).map((path) => {
		// eslint-disable-next-line prefer-const
		let [group, example] = path.split('/').slice(-2);

		example = example.replace('.ts', '');

		return { group, example };
	});

	return paths;
};
