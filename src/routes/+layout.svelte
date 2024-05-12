<script lang="ts">
	import { page } from '$app/stores';
	import clsx from 'clsx';

	import '@/styles/app.css';

	let { children, data } = $props();

	const { groupedExamples } = data;

	let search = $state('');

	const filteredExamples = $derived(
		groupedExamples
			.flatMap(({ group, examples }) => ({
				group,
				examples: examples.filter(({ title }) => title.toLowerCase().includes(search.toLowerCase()))
			}))
			.filter(({ examples }) => examples.length > 0)
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
				<div class="flex flex-col gap-4">
					<div>
						<a
							href="/"
							class={clsx('w-fit hover:underline', $page.url.pathname === '/' ? 'opacity-100' : 'opacity-65')}
						>
							About
						</a>
					</div>

					<div class="flex flex-col gap-4">
						{#each filteredExamples as { group, examples }}
							<div>
								<span class="text-xl capitalize text-gray-400">{group}</span>
								<div class="flex flex-col">
									{#each examples as { href, title }}
										<a
											{href}
											class={clsx(
												'w-fit capitalize hover:underline',
												$page.url.pathname === href ? 'text-black underline' : 'text-gray-600'
											)}>{title}</a
										>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</aside>
		<main class="relative">
			{@render children()}
		</main>
	</div>
</div>
