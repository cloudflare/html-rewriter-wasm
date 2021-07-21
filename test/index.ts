import { TextEncoder, TextDecoder } from "util";
import { Macro } from "ava";
import {
  Comment,
  DocumentHandlers,
  Element,
  ElementHandlers,
  HTMLRewriter as RawHTMLRewriter,
  TextChunk,
} from "..";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class HTMLRewriter {
  private elementHandlers: [selector: string, handlers: ElementHandlers][] = [];
  private documentHandlers: DocumentHandlers[] = [];

  on(selector: string, handlers: ElementHandlers): this {
    this.elementHandlers.push([
      selector,
      {
        element: handlers.element?.bind(handlers),
        comments: handlers.comments?.bind(handlers),
        text: handlers.text?.bind(handlers),
      },
    ]);
    return this;
  }

  onDocument(handlers: DocumentHandlers): this {
    this.documentHandlers.push({
      doctype: handlers.doctype?.bind(handlers),
      comments: handlers.comments?.bind(handlers),
      text: handlers.text?.bind(handlers),
      end: handlers.end?.bind(handlers),
    });
    return this;
  }

  async transform(input: string): Promise<string> {
    let output = "";
    const rewriter = new RawHTMLRewriter((chunk) => {
      output += decoder.decode(chunk);
      if (chunk.length === 0) queueMicrotask(() => rewriter.free());
    });
    for (const [selector, handlers] of this.elementHandlers) {
      rewriter.on(selector, handlers);
    }
    for (const handlers of this.documentHandlers) {
      rewriter.onDocument(handlers);
    }
    await rewriter.write(encoder.encode(input));
    await rewriter.end();
    return output;
  }
}

export function wait(t: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, t));
}

export const mutationsMacro: Macro<
  [
    (
      rw: HTMLRewriter,
      handler: (token: Element | TextChunk | Comment) => void
    ) => HTMLRewriter,
    string,
    {
      beforeAfter: string;
      replace: string;
      replaceHtml: string;
      remove: string;
    }
  ]
> = async (t, func, input, expected) => {
  // In all these tests, only process text chunks containing text. All test
  // inputs for text handlers will be single characters, so we'll only process
  // text nodes once.

  // before/after
  let res = await func(new HTMLRewriter(), (token) => {
    if ("text" in token && !token.text) return;
    token.before("<span>before</span>");
    token.before("<span>before html</span>", { html: true });
    token.after("<span>after</span>");
    token.after("<span>after html</span>", { html: true });
  }).transform(input);
  t.is(res, expected.beforeAfter);

  // replace
  res = await func(new HTMLRewriter(), (token) => {
    if ("text" in token && !token.text) return;
    token.replace("<span>replace</span>");
  }).transform(input);
  t.is(res, expected.replace);
  res = await func(new HTMLRewriter(), (token) => {
    if ("text" in token && !token.text) return;
    token.replace("<span>replace</span>", { html: true });
  }).transform(input);
  t.is(res, expected.replaceHtml);

  // remove
  res = await func(new HTMLRewriter(), (token) => {
    if ("text" in token && !token.text) return;
    t.false(token.removed);
    token.remove();
    t.true(token.removed);
  }).transform(input);
  t.is(res, expected.remove);
};
