import test, { Macro } from "ava";
import { TextChunk } from "..";
import { HTMLRewriter, mutationsMacro, wait } from ".";

const textMutationsInput = "<p>t</p>"; // Single character will be single chunk
const textMutationsExpected = {
  beforeAfter: [
    "<p>",
    "&lt;span&gt;before&lt;/span&gt;",
    "<span>before html</span>",
    "t",
    "<span>after html</span>",
    "&lt;span&gt;after&lt;/span&gt;",
    "</p>",
  ].join(""),
  replace: "<p>&lt;span&gt;replace&lt;/span&gt;</p>",
  replaceHtml: "<p><span>replace</span></p>",
  remove: "<p></p>",
};

const textPropertiesMacro: Macro<
  [(rw: HTMLRewriter, text: (text: TextChunk) => void) => HTMLRewriter]
> = async (t, func) => {
  t.plan(6);
  const res = await func(new HTMLRewriter(), (text) => {
    // This handler should get called twice, once with lastInTextNode true
    t.false(text.removed);
    if (text.lastInTextNode) {
      t.pass();
      t.is(text.text, "");
    } else {
      t.is(text.text, "t");
    }
  }).transform("<p>t</p>");
  t.is(res, "<p>t</p>");
};
test("handles text properties", textPropertiesMacro, (rw, text) =>
  rw.on("p", { text })
);
test(
  "handles text mutations",
  mutationsMacro,
  (rw, text) => rw.on("p", { text }),
  textMutationsInput,
  textMutationsExpected
);
test("text allows chaining", async (t) => {
  t.plan(4);
  await new HTMLRewriter()
    .on("p", {
      text(text) {
        if (text.text === "t") {
          t.is(text.before(""), text);
          t.is(text.after(""), text);
          t.is(text.replace(""), text);
          t.is(text.remove(), text);
        }
      },
    })
    .transform("<p>t</p");
});
const textAsyncHandlerMacro: Macro<
  [(rw: HTMLRewriter, text: (t: TextChunk) => Promise<void>) => HTMLRewriter]
> = async (t, func) => {
  const res = await func(new HTMLRewriter(), async (text) => {
    if (text.text === "t") {
      await wait(50);
      text.after(" new");
    }
  }).transform("<p>t</p>");
  t.is(res, "<p>t new</p>");
};
test("handles text async handler", textAsyncHandlerMacro, (rw, text) =>
  rw.on("p", { text })
);
const textClassHandlerMacro: Macro<
  [
    (
      rw: HTMLRewriter,
      handler: { text: (text: TextChunk) => void }
    ) => HTMLRewriter
  ]
> = async (t, func) => {
  class Handler {
    constructor(private content: string) {}
    text(text: TextChunk) {
      if (text.text === "t") text.after(this.content);
    }
  }
  const res = await func(new HTMLRewriter(), new Handler(" new")).transform(
    "<p>t</p>"
  );
  t.is(res, "<p>t new</p>");
};
test("handles text class handler", textClassHandlerMacro, (rw, handler) =>
  rw.on("p", handler)
);

test("handles document text properties", textPropertiesMacro, (rw, text) =>
  rw.onDocument({ text })
);
test(
  "handles document text mutations",
  mutationsMacro,
  (rw, text) => rw.onDocument({ text }),
  textMutationsInput,
  textMutationsExpected
);
test("handles document text async handler", textAsyncHandlerMacro, (rw, text) =>
  rw.onDocument({ text })
);
test(
  "handles document text class handler",
  textClassHandlerMacro,
  (rw, handler) => rw.onDocument(handler)
);
