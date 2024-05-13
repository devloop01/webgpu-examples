import { clamp } from './utils/math';

export type WebGPUOptions = {
	canvas: HTMLCanvasElement;
	debug?: boolean;
};

export class WebGPU {
	canvas: HTMLCanvasElement;
	debug: boolean;

	isSupported: boolean;
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
	}

	init() {
		return new Promise<this>((resolve, reject) => {
			this.setup()
				.then(() => {
					if (this.isSupported) resolve(this);
					else reject('WebGPU is not supported');
				})
				.catch(reject);
		});
	}

	private async setup() {
		try {
			const { adapter, device } = await WebGPU.getGPU();
			const { context, prsentationFormat } = this.getGPUContext(device);

			this.adapter = adapter;
			this.device = device;
			this.context = context;
			this.presentationFormat = prsentationFormat;

			this.setupResize();

			this.initialized = true;
			this.log('Initialized!');

			this.isSupported = true;
		} catch (error) {
			const err = error as Error;
			this.log('Could not be initialized!');
			this.log(err.message);

			this.isSupported = false;
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
		if (!this.initialized) return;

		this.#resizeObserver.disconnect();

		this.destroyed = true;

		this.log('Destroyed!');
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

	static async getGPU() {
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
}
