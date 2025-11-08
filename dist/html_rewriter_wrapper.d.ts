import { DocumentHandlers, ElementHandlers } from './types';
declare class HTMLRewriter {
    static initPromise?: Promise<void>;
    constructor(options?: any);
    elementHandlers: [selector: string, handlers: ElementHandlers][];
    documentHandlers: DocumentHandlers[];
    on(selector: string, handlers: ElementHandlers): this;
    onDocument(handlers: DocumentHandlers): this;
    transform(response: Response): Response;
}
export declare function HTMLRewriterWrapper(initPromise: Promise<any>): typeof HTMLRewriter;
export {};
