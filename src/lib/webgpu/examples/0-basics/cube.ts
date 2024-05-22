import type { WebGPU } from '$lib/webgpu';
import { mat4 } from 'wgpu-matrix';
import { degToRad } from '$lib/utils/math';

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
					arrayStride: (3 + 1) * 4, // 3 floats for position, 1 float for color, 4 bytes per float
					attributes: [
						{ shaderLocation: 0, offset: 0, format: 'float32x3' }, // position
						{ shaderLocation: 1, offset: 3 * 4, format: 'unorm8x4' } // color
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
			cullMode: 'front'
		}
	});

	const { vertexData, numVertices } = createCubeVertices();

	const vertexBuffer = wgpu.device.createBuffer({
		label: 'plane vertex buffer',
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});

	wgpu.device.queue.writeBuffer(vertexBuffer, 0, vertexData);

	const uniformBufferSize = 16 * 4; // 16 floats, 4 bytes per float

	const uniformBuffer = wgpu.device.createBuffer({
		label: 'plane uniform buffer',
		size: uniformBufferSize,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	const uniformValues = new Float32Array(uniformBufferSize / 4);

	// uniform offsets
	const kMatrixOffset = 0;
	const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);

	const bindGroup = wgpu.device.createBindGroup({
		label: 'plane bind group',
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
	});

	let t = 0;

	const matrix = mat4.identity();

	return () => {
		t++;

		const aspect = wgpu.canvas.clientWidth / wgpu.canvas.clientHeight;

		mat4.perspective(degToRad(55), aspect, 1, 2000, matrix);

		mat4.translate(matrix, [0, 0, -1000], matrix);
		mat4.scale(matrix, [0.5, 0.5, 1.0], matrix);
		mat4.rotateX(matrix, degToRad(t * -0.5), matrix);
		mat4.rotateY(matrix, degToRad(t * 0.5), matrix);

		matrixValue.set(matrix);

		wgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

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
		pass.setVertexBuffer(0, vertexBuffer);
		pass.setBindGroup(0, bindGroup);
		pass.draw(numVertices);

		pass.end();

		wgpu.device.queue.submit([encoder.finish()]);
	};
}

export const shader = /*wgsl*/ `
	struct Uniforms {
		matrix : mat4x4f
	}

	struct VertexInput {
		@location(0) position : vec3f,
		@location(1) color : vec4f,
	}

	struct VertexOutput {
		@builtin(position) position : vec4f,
		@location(0) color : vec4f,
	}

	@group(0) @binding(0) var<uniform> uniforms : Uniforms;

	@vertex
	fn vsMain(vsInput : VertexInput) -> VertexOutput {
		var output : VertexOutput;
		output.position = uniforms.matrix * vec4f(vsInput.position, 1.0);
		output.color = vsInput.color;
		return output;
	}

	@fragment
	fn fsMain(fsInput : VertexOutput) -> @location(0) vec4f {
		return fsInput.color;
	}
`;

function createCubeVertices(size = 500) {
	// prettier-ignore
	const positions = [
        -0.5,  0.5, 0.5, // 0
         0.5,  0.5, 0.5, // 1
		-0.5, -0.5, 0.5, // 2 
         0.5, -0.5, 0.5, // 3

		-0.5,  0.5, -0.5, // 4
         0.5,  0.5, -0.5, // 5
		-0.5, -0.5, -0.5, // 6
         0.5, -0.5, -0.5, // 7
    ]
	.map((v) => v * size);

	// prettier-ignore
	const indices = [
        0, 1, 2, 2, 1, 3, // front
		4, 6, 5, 6, 7, 5, // back
		4, 0, 6, 6, 0, 2, // left
		1, 5, 3, 3, 5, 7, // right
		4, 5, 0, 0, 5, 1, // top
		2, 3, 6, 6, 3, 7, // bottom
    ];

	// prettier-ignore
	const colors = [
		255, 0,   0,   // front
		0,   255, 0,   // back
		0,   0,   255, // left
		255, 255, 0,   // right
		0,   255, 255, // top
		255, 0,   255, // bottom
	]

	const numVertices = indices.length;
	const vertexData = new Float32Array(numVertices * (3 + 1)); // xyz + color
	const colorData = new Uint8Array(vertexData.buffer);

	for (let i = 0; i < numVertices; i++) {
		const positionNdx = indices[i] * 3;
		const position = positions.slice(positionNdx, positionNdx + 3);
		vertexData.set(position, i * 4);

		const quadNdx = Math.floor(i / 6) * 3;
		const color = colors.slice(quadNdx, quadNdx + 3);
		colorData.set(color, i * 16 + 12);
		colorData[i * 16 + 15] = 255;
	}

	return { vertexData, numVertices };
}
