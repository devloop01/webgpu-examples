<script lang="ts">
	import { WebGPU } from '@/lib/webgpu';

	type Resource = {
		title: string;
		href: string;
	};

	const resources: Resource[] = [
		{
			title: 'WebGPU Fundamentals',
			href: 'https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html'
		},
		{
			title: 'Tour of WGSL',
			href: 'https://google.github.io/tour-of-wgsl/'
		},
		{
			title: 'WebGPU Samples',
			href: 'https://webgpu.github.io/webgpu-samples/'
		}
	];

	let isWebGPUSupported = $state(true);

	$effect(() => {
		WebGPU.getGPU()
			.then(() => (isWebGPUSupported = true))
			.catch(() => (isWebGPUSupported = false));
	});
</script>

<div class="flex flex-col gap-4 px-6 py-6 pr-6 lg:py-8">
	<article class="prose">
		<h1>WebGPU Examples</h1>
		<h3>This project is aimed at learning WebGPU</h3>
		<p>
			WebGPU is a new web standard for graphics and compute, designed from the ground up for the modern web.
			It provides modern features such as low-level GPU access, multithreading, and more direct control over
			the GPU. WebGPU is based on the Vulkan API and is designed to provide a lower-level alternative to
			WebGL.
		</p>

		{#if !isWebGPUSupported}
			<h3 class="text-red-500">WebGPU is not supported in this browser.</h3>
			<p>
				see <a href="https://caniuse.com/?search=webgpu" target="_blank">caniuse.com</a> for more information.
			</p>
		{/if}

		<h3>Resources</h3>
		<ul>
			{#each resources as { href, title }}
				<li class="w-fit">
					<a {href} target="_blank" class="group flex items-center">
						<span>{title}</span>
						<svg
							class="size-5 -translate-x-full opacity-0 group-[:hover]:translate-x-0 group-[:hover]:opacity-100"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M7 7h10v10" />
							<path d="M7 17 17 7" />
						</svg>
					</a>
				</li>
			{/each}
		</ul>
	</article>
</div>

<style lang="postcss">
</style>
