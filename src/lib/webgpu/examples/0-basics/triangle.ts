import type { WebGPU } from '$lib/webgpu';

export default function (wgpu: WebGPU) {
	const module = wgpu.device.createShaderModule({
		label: 'triangle shader',
		code: shader
	});

	const pipeline = wgpu.device.createRenderPipeline({
		label: 'triangle pipeline',
		layout: 'auto',
		vertex: {
			module,
			entryPoint: 'vsMain'
		},
		fragment: {
			module,
			entryPoint: 'fsMain',
			targets: [{ format: wgpu.presentationFormat }]
		},
		primitive: {
			topology: 'triangle-list'
		}
	});

	return () => {
		const encoder = wgpu.device.createCommandEncoder();

		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: wgpu.context.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0.95, 0.95, 0.95, 1.0]
				}
			]
		});

		pass.setPipeline(pipeline);
		pass.draw(3);

		pass.end();

		wgpu.device.queue.submit([encoder.finish()]);
	};
}

export const shader = /*wgsl*/ `
	struct VertexOutput {
		@builtin(position) position : vec4f
	}

	@vertex
	fn vsMain(
		@builtin(vertex_index) vertex_index : u32
	) -> VertexOutput {
		const pos = array<vec2f, 3>(
			vec2f( 0.0,  0.5),
			vec2f(-0.5, -0.5),
			vec2f( 0.5, -0.5)
		);

		let xy = pos[vertex_index];

		var output : VertexOutput;
		output.position = vec4f(xy, 0.0, 1.0);
		return output;
	}

	@fragment
	fn fsMain(fsInput : VertexOutput) -> @location(0) vec4f {
		return vec4f(1.0, 0.0, 0.0, 1.0);
	}
`;
