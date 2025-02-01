/* tslint:disable */
/* eslint-disable */
export function run(): Promise<void>;
export class FrameStats {
  free(): void;
  constructor();
  update(frame_time: number): void;
  average_time(): number;
  get_saved_frame_times(): Float64Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_framestats_free: (a: number, b: number) => void;
  readonly framestats_new: () => number;
  readonly framestats_update: (a: number, b: number) => void;
  readonly framestats_average_time: (a: number) => number;
  readonly framestats_get_saved_frame_times: (a: number, b: number) => void;
  readonly run: () => void;
  readonly __wbindgen_export_0: () => number;
  readonly __wbindgen_export_1: WebAssembly.Table;
  readonly __wbindgen_export_2: (a: number) => void;
  readonly __wbindgen_export_3: (a: number, b: number) => number;
  readonly __wbindgen_export_4: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_5: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly closure6_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure4_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly closure204_externref_shim: (a: number, b: number, c: any) => void;
  readonly __wbindgen_export_10: (a: number, b: number) => void;
  readonly closure290_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure592_externref_shim: (a: number, b: number, c: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
