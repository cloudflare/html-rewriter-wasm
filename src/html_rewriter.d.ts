export interface ContentTypeOptions {
  html?: boolean;
}

// TODO: test chaining apis

export class Element {
  before(content: string, options?: ContentTypeOptions): Element;
  after(content: string, options?: ContentTypeOptions): Element;
  replace(content: string, options?: ContentTypeOptions): Element;
  remove(): Element;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  setAttribute(name: string, value: string): Element;
  removeAttribute(name: string): Element;
  prepend(content: string, options?: ContentTypeOptions): Element;
  append(content: string, options?: ContentTypeOptions): Element;
  setInnerContent(content: string, options?: ContentTypeOptions): Element;
  removeAndKeepContent(): Element;
  readonly attributes: [string, string][];
  readonly namespaceURI: string;
  readonly removed: boolean;
  tagName: string;
}

export class Comment {
  before(content: string, options?: ContentTypeOptions): Comment;
  after(content: string, options?: ContentTypeOptions): Comment;
  replace(content: string, options?: ContentTypeOptions): Comment;
  remove(): Comment;
  readonly removed: boolean;
  text: string;
}

export class TextChunk {
  before(content: string, options?: ContentTypeOptions): TextChunk;
  after(content: string, options?: ContentTypeOptions): TextChunk;
  replace(content: string, options?: ContentTypeOptions): TextChunk;
  remove(): TextChunk;
  readonly lastInTextNode: boolean;
  readonly removed: boolean;
  readonly text: string;
}

export class Doctype {
  // TODO: test these return null if not defined
  readonly name: string | null;
  readonly publicId: string | null;
  readonly systemId: string | null;
}

export class DocumentEnd {
  append(content: string, options?: ContentTypeOptions): DocumentEnd;
}

export interface ElementHandlers {
  element?(element: Element): void | Promise<void>;
  comments?(comment: Comment): void | Promise<void>;
  text?(text: TextChunk): void | Promise<void>;
}

export interface DocumentHandlers {
  doctype?(doctype: Doctype): void | Promise<void>;
  comments?(comment: Comment): void | Promise<void>;
  text?(text: TextChunk): void | Promise<void>;
  end?(end: DocumentEnd): void | Promise<void>;
}

export class HTMLRewriter {
  constructor(outputSink: (chunk: Uint8Array) => void);
  on(selector: string, handlers: ElementHandlers): HTMLRewriter;
  onDocument(handlers: DocumentHandlers): HTMLRewriter;
  write(chunk: Uint8Array): Promise<void>;
  end(): Promise<void>;
}
