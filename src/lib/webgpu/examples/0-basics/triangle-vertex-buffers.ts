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
			entryPoint: 'vsMain',
			buffers: [
				{
					arrayStride: 2 * 4, // 2 floats * 4 bytes
					attributes: [
						{ shaderLocation: 0, offset: 0, format: 'float32x2' } // position
					]
				},
				{
					arrayStride: 4 * 4, // 4 floats * 4 bytes
					attributes: [
						{ shaderLocation: 1, offset: 0, format: 'float32x4' } // color
					]
				}
			]
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

	// prettier-ignore
	const vertexData = new Float32Array([
		0.2,  0.5, 
		0.5, -0.6, 
	   -0.5, -0.2
   ]);

	// prettier-ignore
	const colorData = new Float32Array([
		1.0, 0.0, 0.0, 1.0, 
		0.0, 1.0, 0.0, 1.0, 
		0.0, 0.0, 1.0, 1.0
	]);

	const vertexBuffer = wgpu.device.createBuffer({
		label: 'triangle vertex buffer',
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});

	const colorBuffer = wgpu.device.createBuffer({
		label: 'triangle color buffer',
		size: colorData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});

	wgpu.device.queue.writeBuffer(vertexBuffer, 0, vertexData);
	wgpu.device.queue.writeBuffer(colorBuffer, 0, colorData);

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
		pass.setVertexBuffer(0, vertexBuffer);
		pass.setVertexBuffer(1, colorBuffer);
		pass.draw(3);

		pass.end();

		wgpu.device.queue.submit([encoder.finish()]);
	};
}

const shader = /*wgsl*/ `
	struct VertexInput {
		@location(0) position : vec2f,
		@location(1) color : vec4f
	}


	struct VertexOutput {
		@builtin(position) position : vec4f,
		@location(0) color : vec4f
	}

	@vertex
	fn vsMain(vsInput : VertexInput) -> VertexOutput {
		var output : VertexOutput;
		output.position = vec4f(vsInput.position, 0.0, 1.0);
		output.color = vsInput.color;
		return output;
	}

	@fragment
	fn fsMain(fsInput : VertexOutput) -> @location(0) vec4f {
		// return vec4f(0.2, 0.8, 0.2, 1.0);
		return fsInput.color;
	}
`;
