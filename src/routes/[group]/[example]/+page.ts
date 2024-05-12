const modules = import.meta.glob('$lib/webgpu/examples/**/*.ts');

export const load = async ({ params }) => {
	const { group, example } = params;

	return { group, example };
};

export const entries = () => {
	const paths = Object.keys(modules).map((path) => {
		const [group, example] = path.split('/').slice(-2);
		return { group, example: example.replace('.ts', '') };
	});

	return paths;
};
