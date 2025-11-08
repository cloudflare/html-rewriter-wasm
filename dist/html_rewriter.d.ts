/* tslint:disable */
/* eslint-disable */
/**
*/
export class Comment {
  free(): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  before(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  after(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  replace(content: string, content_type?: any): void;
/**
*/
  remove(): void;
/**
* @returns {boolean}
*/
  readonly removed: boolean;
/**
* @returns {string}
*/
  text: string;
}
/**
*/
export class Doctype {
  free(): void;
/**
* @returns {any}
*/
  readonly name: any;
/**
* @returns {any}
*/
  readonly publicId: any;
/**
* @returns {any}
*/
  readonly systemId: any;
}
/**
*/
export class DocumentEnd {
  free(): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  append(content: string, content_type?: any): void;
}
/**
*/
export class Element {
  free(): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  before(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  after(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  replace(content: string, content_type?: any): void;
/**
*/
  remove(): void;
/**
* @param {string} name
* @returns {any}
*/
  getAttribute(name: string): any;
/**
* @param {string} name
* @returns {boolean}
*/
  hasAttribute(name: string): boolean;
/**
* @param {string} name
* @param {string} value
*/
  setAttribute(name: string, value: string): void;
/**
* @param {string} name
*/
  removeAttribute(name: string): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  prepend(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  append(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  setInnerContent(content: string, content_type?: any): void;
/**
*/
  removeAndKeepContent(): void;
/**
* @param {any} handler
*/
  onEndTag(handler: any): void;
/**
* @returns {any}
*/
  readonly attributes: any;
/**
* @returns {any}
*/
  readonly namespaceURI: any;
/**
* @returns {boolean}
*/
  readonly removed: boolean;
/**
* @returns {string}
*/
  tagName: string;
}
/**
*/
export class EndTag {
  free(): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  before(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  after(content: string, content_type?: any): void;
/**
*/
  remove(): void;
/**
* @returns {string}
*/
  name: string;
}
/**
*/
export class HTMLRewriter {
  free(): void;
/**
* @param {any} output_sink
* @param {any | undefined} options
*/
  constructor(output_sink: any, options?: any);
/**
* @param {string} selector
* @param {any} handlers
*/
  on(selector: string, handlers: any): void;
/**
* @param {any} handlers
*/
  onDocument(handlers: any): void;
/**
* @param {Uint8Array} chunk
*/
  write(chunk: Uint8Array): void;
/**
*/
  end(): void;
/**
* @returns {number}
*/
  readonly asyncifyStackPtr: number;
}
/**
*/
export class TextChunk {
  free(): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  before(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  after(content: string, content_type?: any): void;
/**
* @param {string} content
* @param {any | undefined} content_type
*/
  replace(content: string, content_type?: any): void;
/**
*/
  remove(): void;
/**
* @returns {boolean}
*/
  readonly lastInTextNode: boolean;
/**
* @returns {boolean}
*/
  readonly removed: boolean;
/**
* @returns {string}
*/
  readonly text: string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_endtag_free: (a: number) => void;
  readonly endtag_name: (a: number, b: number) => void;
  readonly endtag_set_name: (a: number, b: number, c: number) => void;
  readonly endtag_before: (a: number, b: number, c: number, d: number) => void;
  readonly endtag_after: (a: number, b: number, c: number, d: number) => void;
  readonly endtag_remove: (a: number) => void;
  readonly __wbg_documentend_free: (a: number) => void;
  readonly documentend_append: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_htmlrewriter_free: (a: number) => void;
  readonly htmlrewriter_new: (a: number, b: number) => number;
  readonly htmlrewriter_on: (a: number, b: number, c: number, d: number) => void;
  readonly htmlrewriter_onDocument: (a: number, b: number) => void;
  readonly htmlrewriter_write: (a: number, b: number, c: number) => void;
  readonly htmlrewriter_end: (a: number) => void;
  readonly htmlrewriter_asyncify_stack_ptr: (a: number) => number;
  readonly __wbg_comment_free: (a: number) => void;
  readonly comment_before: (a: number, b: number, c: number, d: number) => void;
  readonly comment_after: (a: number, b: number, c: number, d: number) => void;
  readonly comment_replace: (a: number, b: number, c: number, d: number) => void;
  readonly comment_remove: (a: number) => void;
  readonly comment_removed: (a: number) => number;
  readonly comment_text: (a: number, b: number) => void;
  readonly comment_set_text: (a: number, b: number, c: number) => void;
  readonly __wbg_element_free: (a: number) => void;
  readonly element_before: (a: number, b: number, c: number, d: number) => void;
  readonly element_after: (a: number, b: number, c: number, d: number) => void;
  readonly element_replace: (a: number, b: number, c: number, d: number) => void;
  readonly element_remove: (a: number) => void;
  readonly element_removed: (a: number) => number;
  readonly element_tag_name: (a: number, b: number) => void;
  readonly element_set_tag_name: (a: number, b: number, c: number) => void;
  readonly element_namespace_uri: (a: number) => number;
  readonly element_attributes: (a: number) => number;
  readonly element_getAttribute: (a: number, b: number, c: number) => number;
  readonly element_hasAttribute: (a: number, b: number, c: number) => number;
  readonly element_setAttribute: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly element_removeAttribute: (a: number, b: number, c: number) => void;
  readonly element_prepend: (a: number, b: number, c: number, d: number) => void;
  readonly element_append: (a: number, b: number, c: number, d: number) => void;
  readonly element_setInnerContent: (a: number, b: number, c: number, d: number) => void;
  readonly element_removeAndKeepContent: (a: number) => void;
  readonly element_onEndTag: (a: number, b: number) => void;
  readonly __wbg_textchunk_free: (a: number) => void;
  readonly textchunk_before: (a: number, b: number, c: number, d: number) => void;
  readonly textchunk_after: (a: number, b: number, c: number, d: number) => void;
  readonly textchunk_replace: (a: number, b: number, c: number, d: number) => void;
  readonly textchunk_remove: (a: number) => void;
  readonly textchunk_removed: (a: number) => number;
  readonly textchunk_text: (a: number, b: number) => void;
  readonly textchunk_last_in_text_node: (a: number) => number;
  readonly __wbg_doctype_free: (a: number) => void;
  readonly doctype_name: (a: number) => number;
  readonly doctype_public_id: (a: number) => number;
  readonly doctype_system_id: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
