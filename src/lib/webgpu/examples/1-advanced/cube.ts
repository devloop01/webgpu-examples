import type { WebGPU } from '$lib/webgpu';

export default function render(wgpu: WebGPU) {
	const encoder = wgpu.device.createCommandEncoder();

	const pass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: wgpu.context.getCurrentTexture().createView(),
				loadOp: 'clear',
				storeOp: 'store',
				clearValue: [0.1, 0.7, 0.2, 1.0]
			}
		]
	});

	pass.end();

	wgpu.device.queue.submit([encoder.finish()]);
}