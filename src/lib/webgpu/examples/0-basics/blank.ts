import type { WebGPU } from '$lib/webgpu';

export default function (wgpu: WebGPU) {
	return () => {
		const encoder = wgpu.device.createCommandEncoder();

		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: wgpu.context.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0.2, 0.4, 0.8, 1]
				}
			]
		});

		pass.end();

		wgpu.device.queue.submit([encoder.finish()]);
	};
}
