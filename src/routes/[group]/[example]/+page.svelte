<script lang="ts">
	import { WebGPU } from '$lib/webgpu';

	import Code from '$icons/code.svelte';

	let { data } = $props();

	const { initFn, githubLink } = $derived(data);

	let canvas: HTMLCanvasElement | undefined;
	let wgpu: WebGPU | undefined;
	let rafId = 0;

	let renderFn: (() => void) | undefined;

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

<div class="fixed bottom-0 right-0 p-4">
	<a
		href={githubLink}
		target="_blank"
		class="flex size-14 items-center justify-center rounded-full bg-background text-foreground shadow-md transition-colors hover:bg-muted"
	>
		<Code class="size-6" />
	</a>
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
