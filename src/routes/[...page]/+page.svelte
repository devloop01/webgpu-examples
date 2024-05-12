<script lang="ts">
	import { WebGPU } from '$lib/webgpu';
	import { renderBasic } from '$lib/webgpu/examples/basics';

	const { data } = $props();

	let canvas = $state<HTMLCanvasElement | undefined>();
	let wgpu = $state<WebGPU | undefined>();
	let rafId = $state(0);

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

	function render() {
		if (!wgpu) return;

		wgpu.render(() => {
			renderBasic(wgpu!);
		});

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
