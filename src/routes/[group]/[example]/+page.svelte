<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	import { WebGPU } from '$lib/webgpu';

	import Code from '$icons/code.svelte';
	import X from '$icons/x.svelte';

	let { data } = $props();

	const { initFn, moduleHTML } = $derived(data);

	let canvas: HTMLCanvasElement | undefined;
	let wgpu: WebGPU | undefined;
	let rafId = 0;

	let renderFn: (() => void) | undefined;

	type Langs = keyof typeof moduleHTML;

	let showCode = $state(false);
	let activeTab = $state<Langs>('javascript');

	$effect(() => {
		initFn;

		if (canvas) {
			wgpu = new WebGPU({
				canvas
				// debug: true
			});

			wgpu.init().then((gpu) => {
				renderFn = initFn(gpu);
			});
		}

		rafId = requestAnimationFrame(render);

		return () => {
			wgpu?.destroy();
			cancelAnimationFrame(rafId);
		};
	});

	async function render() {
		if (!wgpu) return;

		wgpu.render(renderFn);

		rafId = requestAnimationFrame(render);
	}
</script>

<div class="canvas-wrapper">
	<canvas bind:this={canvas}></canvas>
</div>

{#if showCode}
	<div class="absolute bottom-0 left-0 right-0" transition:slide={{ duration: 250, easing: cubicInOut }}>
		<div class="flex h-[500px] min-h-24 w-full flex-col">
			<div class="flex justify-between bg-[#101215]">
				<div class="flex">
					{#each Object.keys(moduleHTML) as lang}
						<button
							data-active={activeTab === lang}
							class="select-none px-4 py-1 text-white data-[active='true']:bg-[#282c34]"
							onclick={() => (activeTab = lang as Langs)}>{lang}</button
						>
					{/each}
				</div>
				<button
					class="p-2 text-white"
					onclick={() => {
						showCode = false;
					}}
				>
					<X class="size-6" />
				</button>
			</div>
			<div class="h-full flex-1 overflow-y-scroll bg-[#282c34]">
				{@html moduleHTML[activeTab]}
			</div>
		</div>
	</div>
{/if}

<div class="fixed bottom-0 right-0 p-4">
	<button
		onclick={() => (showCode = !showCode)}
		class="flex size-14 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-300"
	>
		<Code class="size-6" />
	</button>
</div>

<style lang="postcss">
	.canvas-wrapper {
		width: 100%;
		height: 100vh;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
