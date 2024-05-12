<script lang="ts">
	import { WebGPU } from '$lib/webgpu';

	let { data } = $props();

	const { group, example } = $derived(data);

	let canvas = $state<HTMLCanvasElement | undefined>();
	let wgpu = $state<WebGPU | undefined>();
	let rafId = $state(0);

	const renderFn = $derived.by(async () => {
		return (await import(`$lib/webgpu/examples/${group}/${example}.ts`)).default as (wgpu: WebGPU) => void;
	});

	$effect(() => {
		if (canvas) {
			wgpu = new WebGPU({
				canvas
				// debug: true
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

		const fn = await renderFn;
		wgpu.render(fn);

		rafId = requestAnimationFrame(render);
	}
</script>

<div class="canvas-wrapper">
	<canvas bind:this={canvas}></canvas>
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
