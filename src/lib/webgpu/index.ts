import { clamp } from './utils/math';

export type WebGPUOptions = {
	canvas: HTMLCanvasElement;
	debug?: boolean;
};

export class WebGPU {
	canvas: HTMLCanvasElement;
	debug: boolean;

	initialized: boolean;
	destroyed: boolean;

	context: GPUCanvasContext;
	adapter: GPUAdapter;
	device: GPUDevice;
	presentationFormat: GPUTextureFormat;

	#resizeObserver: ResizeObserver;

	constructor({ canvas, debug }: WebGPUOptions) {
		this.canvas = canvas;
		this.debug = debug || false;

		this.initialized = false;
		this.destroyed = false;

		this.init().then(() => {
			this.setupResize();

			this.initialized = true;
		});
	}

	private async init() {
		try {
			const { adapter, device } = await this.getGPU();
			const { context, prsentationFormat } = this.getGPUContext(device);

			this.adapter = adapter;
			this.device = device;
			this.context = context;
			this.presentationFormat = prsentationFormat;

			this.log('Initialized!');
		} catch (error) {
			const err = error as Error;
			this.log('Could not be initialized!');
			this.log(err.message);
		}
	}

	render(callback?: (wgpu: this) => void) {
		if (!this.initialized) return;

		if (callback) callback(this);
	}

	private setupResize() {
		this.#resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentBoxSize[0].inlineSize;
				const height = entry.contentBoxSize[0].blockSize;

				this.resize(width, height);
			}
		});

		this.#resizeObserver.observe(this.canvas);
	}

	resize(width: number, height: number) {
		const cWidth = clamp(width, 1, this.device.limits.maxTextureDimension2D);
		const cHeight = clamp(height, 1, this.device.limits.maxTextureDimension2D);

		this.canvas.width = cWidth;
		this.canvas.height = cHeight;

		this.log(`Canvas resized to ${cWidth} x ${cHeight}`);
	}

	destroy() {
		this.#resizeObserver.disconnect();

		this.destroyed = true;

		this.log('Destroyed!');
	}

	private async getGPU() {
		if (!navigator.gpu) {
			throw new Error('This Browser does not support WebGPU!');
		}

		const adapter = await navigator.gpu.requestAdapter();

		if (!adapter) {
			throw new Error('No GPU adapter found');
		}

		const device = await adapter.requestDevice();

		return { adapter, device };
	}

	private getGPUContext(device: GPUDevice) {
		const context = this.canvas.getContext('webgpu');

		if (!context) {
			throw new Error('WebGPU context not available');
		}

		const prsentationFormat = navigator.gpu.getPreferredCanvasFormat();
		context.configure({ device, format: prsentationFormat });

		return { context, prsentationFormat };
	}

	private log(message: string) {
		if (this.debug) console.log(`[WebGPU]: ${message}`);
	}
}
