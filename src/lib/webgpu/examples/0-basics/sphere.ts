import type { WebGPU } from '$lib/webgpu';
import { mat4, vec3 } from 'wgpu-matrix';
import { degToRad } from '$lib/utils/math';

export default function (wgpu: WebGPU) {
	const module = wgpu.device.createShaderModule({
		label: 'sphere shader',
		code: shader
	});

	const pipeline = wgpu.device.createRenderPipeline({
		label: 'sphere pipeline',
		layout: 'auto',
		vertex: {
			module,
			entryPoint: 'vsMain',
			buffers: [
				{
					arrayStride: (3 + 3 + 2) * 4, // 3 position, 3 normal, 2 uv
					attributes: [
						{ shaderLocation: 0, offset: 0, format: 'float32x3' }, // position
						{ shaderLocation: 1, offset: 3 * 4, format: 'float32x3' }, // normal
						{ shaderLocation: 2, offset: 6 * 4, format: 'float32x2' } // uv
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
			cullMode: 'back'
		}
	});

	const { vertexData, numVertices } = createSphereVertices(300);

	const vertexBuffer = wgpu.device.createBuffer({
		label: 'sphere vertex buffer',
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});

	wgpu.device.queue.writeBuffer(vertexBuffer, 0, vertexData);

	const uniformBufferSize = 16 * 4; // 16 floats, 4 bytes per float

	const uniformBuffer = wgpu.device.createBuffer({
		label: 'sphere uniform buffer',
		size: uniformBufferSize,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	const uniformValues = new Float32Array(uniformBufferSize / 4);

	// uniform offsets
	const kMatrixOffset = 0;
	const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);

	const bindGroup = wgpu.device.createBindGroup({
		label: 'sphere bind group',
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
	});

	let t = 0;

	return () => {
		t++;

		const aspect = wgpu.canvas.clientWidth / wgpu.canvas.clientHeight;
		const projectionMatrix = mat4.perspective(degToRad(45), aspect, 1, 2000);

		const eye = [0, 0, -1000];
		const center = [0, 0, 0];
		const up = [0, 1, 0];

		const viewMatrix = mat4.lookAt(eye, center, up);

		const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);

		const modelMatrix = mat4.identity();
		mat4.rotateX(modelMatrix, degToRad(t * -0.25), modelMatrix);
		mat4.rotateY(modelMatrix, degToRad(t * 0.25), modelMatrix);

		mat4.multiply(viewProjectionMatrix, modelMatrix, modelMatrix);

		matrixValue.set(modelMatrix);

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
        @location(1) normal : vec3f,
        @location(2) uv : vec2f,
	}

	struct VertexOutput {
		@builtin(position) position : vec4f,
        @location(0) normal : vec3f,
        @location(1) uv : vec2f,
	}

	@group(0) @binding(0) var<uniform> uniforms : Uniforms;

	@vertex
	fn vsMain(vsInput : VertexInput) -> VertexOutput {
		var output : VertexOutput;
		output.position = uniforms.matrix * vec4f(vsInput.position, 1.0);
        output.normal = (uniforms.matrix * vec4f(vsInput.normal, 0.0)).xyz;
        output.uv = vsInput.uv;
		return output;
	}

	@fragment
	fn fsMain(fsInput : VertexOutput) -> @location(0) vec4f {
        return vec4f(fsInput.uv, 0.0, 1.0);
	}
`;

// https://github.com/mrdoob/three.js/blob/dev/src/geometries/SphereGeometry.js
function createSphereVertices(
	radius = 1,
	widthSegments = 32,
	heightSegments = 16,
	phiStart = 0,
	phiLength = Math.PI * 2,
	thetaStart = 0,
	thetaLength = Math.PI
) {
	widthSegments = Math.max(3, Math.floor(widthSegments));
	heightSegments = Math.max(2, Math.floor(heightSegments));

	const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

	let index = 0;
	const grid = [];

	const vertex = vec3.create();
	const normal = vec3.create();

	// buffers

	const indices = [];
	const vertices = [];
	const normals = [];
	const uvs = [];

	// generate vertices, normals and uvs

	for (let iy = 0; iy <= heightSegments; iy++) {
		const verticesRow = [];

		const v = iy / heightSegments;

		// special case for the poles

		let uOffset = 0;

		if (iy === 0 && thetaStart === 0) {
			uOffset = 0.5 / widthSegments;
		} else if (iy === heightSegments && thetaEnd === Math.PI) {
			uOffset = -0.5 / widthSegments;
		}

		for (let ix = 0; ix <= widthSegments; ix++) {
			const u = ix / widthSegments;

			// vertex

			const x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
			const y = radius * Math.cos(thetaStart + v * thetaLength);
			const z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

			vec3.set(x, y, z, vertex);
			vertices.push(x, y, z);

			// normal

			vec3.copy(vec3.normalize(vertex), normal);
			normals.push(normal[0], normal[1], normal[2]);

			// uv

			uvs.push(u + uOffset, 1 - v);

			verticesRow.push(index++);
		}

		grid.push(verticesRow);
	}

	// indices

	for (let iy = 0; iy < heightSegments; iy++) {
		for (let ix = 0; ix < widthSegments; ix++) {
			const a = grid[iy][ix + 1];
			const b = grid[iy][ix];
			const c = grid[iy + 1][ix];
			const d = grid[iy + 1][ix + 1];

			if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
			if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
		}
	}

	const numVertices = indices.length;
	const dataSize = 3 + 3 + 2; // vertex, normal, uv
	const vertexData = new Float32Array(numVertices * dataSize);

	for (let i = 0; i < numVertices; i++) {
		const positionNdx = indices[i] * 3;
		const position = vertices.slice(positionNdx, positionNdx + 3);
		vertexData.set(position, i * dataSize);

		const normalNdx = indices[i] * 3;
		const normal = normals.slice(normalNdx, normalNdx + 3);
		vertexData.set(normal, i * dataSize + 3);

		const uvNdx = indices[i] * 2;
		const uv = uvs.slice(uvNdx, uvNdx + 2);
		vertexData.set(uv, i * dataSize + 6);
	}

	return { vertexData, numVertices };
}
