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

	const uniformBufferSize = 1 * 4; // 1 float, 4 bytes
	const uniformBuffer = wgpu.device.createBuffer({
		size: uniformBufferSize,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	const uniformValues = new Float32Array(uniformBufferSize / 4);

	const kTimeOffset = 0;

	const bindGroup = wgpu.device.createBindGroup({
		label: 'triangle bind group',
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
	});

	let time = 0;

	return () => {
		time += 0.01;

		uniformValues.set([time], kTimeOffset); // time

		wgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

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
		pass.setBindGroup(0, bindGroup);
		pass.draw(3);

		pass.end();

		wgpu.device.queue.submit([encoder.finish()]);
	};
}

export const shader = /*wgsl*/ `
struct Uniforms {
	time : f32,
}

struct VertexOutput {
	@builtin(position) position : vec4f,
	@location(0) uv : vec2f,
}

const positions = array(
	vec2f(-1.0, -1.0),
	vec2f( 3.0, -1.0),
	vec2f(-1.0,  3.0),
);
const uvs = array(
	vec2f(0.0, 0.0),
	vec2f(2.0, 0.0),
	vec2f(0.0, 2.0),
);

@group(0) @binding(0) var<uniform> uniforms : Uniforms;

@vertex
fn vsMain(
	@builtin(vertex_index) vertex_index : u32
) -> VertexOutput {
	let xy = positions[vertex_index];

	var output : VertexOutput;
	output.position = vec4f(xy, 0.0, 1.0);
	output.uv = uvs[vertex_index];
	return output;
}

@fragment
fn fsMain(fsInput : VertexOutput) -> @location(0) vec4f {
	let color = vec3(0.2, 0.5, 1.0) + 
				cos(fsInput.uv.xyx + uniforms.time) * 0.25;
	return vec4f(color, 1.0);
}
`;
