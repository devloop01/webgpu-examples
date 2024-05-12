<script lang="ts">
	import '@/styles/app.css';

	let { children } = $props();

	let search = $state('');

	type Example = {
		group?: string;
		title: string;
		href: string;
	};

	const examples = $state<Example[]>([
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
	]);

	const groupedExamples = $derived(
		Object.entries(Object.groupBy(examples, ({ group }) => group || '')).map(
			([group, examples]) => ({ group, examples })
		)
	);

	const filteredGroupedExamples = $derived(
		groupedExamples.filter(({ examples }) =>
			examples?.some(({ title }) => title.toLowerCase().includes(search.toLowerCase()))
		)
	);
</script>

<div class="relative flex h-screen flex-col">
	<div class="grid flex-1 grid-cols-[280px_1fr]">
		<aside>
			<div class="flex flex-col gap-4 px-6 py-6 pr-6 lg:py-8">
				<div>
					<input
						oninput={(event) => {
							search = event.currentTarget.value;
						}}
						type="text"
						class="h-9 w-full rounded-md border px-2 focus-within:outline-none"
						placeholder="Search"
					/>
				</div>
				{#each filteredGroupedExamples as { group, examples }}
					<div>
						<span class="text-gray-500">{group}</span>
						<div class="flex flex-col">
							{#if examples}
								{#each examples as { href, title }}
									<a {href} class="hover:underline">{title}</a>
								{/each}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</aside>
		<main class="relative">
			{@render children()}
		</main>
	</div>
</div>
