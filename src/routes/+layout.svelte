<script lang="ts">
	import { page } from '$app/stores';
	import { MetaTags } from 'svelte-meta-tags';
	import extend from 'just-extend';
	import clsx from 'clsx';

	import '@/styles/app.css';

	let { children, data } = $props();

	const { groupedExamples } = $derived(data);

	let search = $state('');

	const filteredExamples = $derived(
		groupedExamples
			.flatMap(({ group, examples }) => ({
				group,
				examples: examples.filter(({ title }) => title.toLowerCase().includes(search.toLowerCase()))
			}))
			.filter(({ examples }) => examples.length > 0)
	);

	const metaTags = $derived(extend(true, {}, data.baseMetaTags, $page.data.pageMetaTags));
</script>

<MetaTags {...metaTags} />

<div class="relative flex h-screen flex-col">
	<div class="grid flex-1 grid-cols-[280px_1fr]">
		<aside class="border-r">
			<div class="flex flex-col px-6 py-6 pr-6 lg:py-8">
				<div class="pb-4">
					<a
						href="/"
						class={clsx(
							'text-xl font-medium hover:underline',
							$page.url.pathname === '/' ? 'text-blue-500 underline opacity-100' : 'opacity-65'
						)}
					>
						WebGPU Examples
					</a>
				</div>

				<div class="pb-2">
					<input
						oninput={(event) => {
							search = event.currentTarget.value;
						}}
						type="text"
						class="h-9 w-full rounded-md border px-2 focus-within:outline-none"
						placeholder="Search"
					/>
				</div>

				{#each filteredExamples as { group, examples }}
					<div class="pb-2">
						<span class="block pb-1 text-xl capitalize text-gray-400">{group}</span>
						<div class="flex flex-col">
							{#each examples as { href, title }}
								<a
									{href}
									class={clsx(
										'py-0.5 capitalize hover:underline',
										$page.url.pathname === href ? 'text-blue-500 underline' : 'text-gray-500'
									)}
								>
									{title}
								</a>
							{/each}
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
