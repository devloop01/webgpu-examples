<script lang="ts">
	import { WebGPU } from '$lib/webgpu';

	let { data } = $props();

	const { group, example } = $derived(data);

	let canvas: HTMLCanvasElement | undefined;
	let wgpu: WebGPU | undefined;
	let rafId = 0;

	let renderFn: (wgpu: WebGPU) => void | undefined;

	$effect(() => {
		import(`$lib/webgpu/examples/${group}/${example}.ts`).then((m) => {
			renderFn = m.default;
		});
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

		wgpu.render(renderFn);

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
