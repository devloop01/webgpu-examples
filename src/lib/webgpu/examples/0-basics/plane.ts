import type { WebGPU } from '$lib/webgpu';

export default function (wgpu: WebGPU) {
	const module = wgpu.device.createShaderModule({
		label: 'plane shader',
		code: shader
	});

	const pipeline = wgpu.device.createRenderPipeline({
		label: 'plane pipeline',
		layout: 'auto',
		vertex: {
			module,
			entryPoint: 'vsMain',
			buffers: [
				{
					arrayStride: (3 + 4) * 4, // 3 floats for position, 4 floats for color, (4 bytes per float)
					attributes: [
						{ shaderLocation: 0, offset: 0, format: 'float32x3' }, // position
						{ shaderLocation: 1, offset: 3 * 4, format: 'float32x4' } // color
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

	const { vertexData, indices } = createPlaneVertices();

	const vertexBuffer = wgpu.device.createBuffer({
		label: 'plane vertex buffer',
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});

	wgpu.device.queue.writeBuffer(vertexBuffer, 0, vertexData);

	const indexBuffer = wgpu.device.createBuffer({
		label: 'plane index buffer',
		size: indices.byteLength,
		usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
	});

	wgpu.device.queue.writeBuffer(indexBuffer, 0, indices);

	const scale = 0.75;
	// prettier-ignore
	const scaleMatrix = new Float32Array([
		scale, 0.0,   0.0,   0.0,
		0.0,   scale, 0.0,   0.0,
		0.0,   0.0,   scale, 0.0,
		0.0,   0.0,   0.0,   1.0
	])

	const uniformBuffer = wgpu.device.createBuffer({
		label: 'plane uniform buffer',
		size: scaleMatrix.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	wgpu.device.queue.writeBuffer(uniformBuffer, 0, scaleMatrix);

	const bindGroup = wgpu.device.createBindGroup({
		label: 'plane bind group',
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
	});

	return () => {
		const encoder = wgpu.device.createCommandEncoder();

		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: wgpu.context.getCurrentTexture().createView(),
					loadOp: 'clear',
					storeOp: 'store',
					clearValue: [0.1, 0.1, 0.1, 1.0]
				}
			]
		});

		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.setVertexBuffer(0, vertexBuffer);
		pass.setIndexBuffer(indexBuffer, 'uint16');
		pass.drawIndexed(indices.length);

		pass.end();

		wgpu.device.queue.submit([encoder.finish()]);
	};
}

export const shader = /*wgsl*/ `
	struct Uniforms {
		scale : mat4x4f
	}

	struct VertexInput {
		@location(0) position : vec3f,
		@location(1) color : vec4f
	}

	struct VertexOutput {
		@builtin(position) position : vec4f,
		@location(0) color : vec4f
	}

	@group(0) @binding(0) var<uniform> uniforms : Uniforms;

	@vertex
	fn vsMain(vsInput : VertexInput) -> VertexOutput {
		var output : VertexOutput;
		output.position = uniforms.scale * vec4f(vsInput.position, 1.0);
		output.color = vsInput.color;
		return output;
	}

	@fragment
	fn fsMain(fsInput : VertexOutput) -> @location(0) vec4f {
		return fsInput.color;
	}
`;

function createPlaneVertices() {
	// prettier-ignore
	const positions = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0
    ]

	// prettier-ignore
	const colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0
    ]

	const vertexData = new Float32Array(positions.length + colors.length);

	let offset = 0;

	for (let i = 0; i < positions.length / 3; i++) {
		const pi = i * 3;
		const ci = i * 4;

		vertexData[offset++] = positions[pi + 0];
		vertexData[offset++] = positions[pi + 1];
		vertexData[offset++] = positions[pi + 2];
		vertexData[offset++] = colors[ci + 0];
		vertexData[offset++] = colors[ci + 1];
		vertexData[offset++] = colors[ci + 2];
		vertexData[offset++] = colors[ci + 3];
	}

	// prettier-ignore
	const indices = new Uint16Array([
        0, 1, 2, // first triangle
        2, 1, 3  // second triangle
    ]);

	return { vertexData, indices };
}
