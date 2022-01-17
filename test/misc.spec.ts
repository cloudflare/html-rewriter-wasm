import { TextEncoder, TextDecoder } from "util";
import vm from "vm";
import test from "ava";
import { HTMLRewriter as RawHTMLRewriter, ElementHandlers } from "..";
import { HTMLRewriter, wait } from ".";

test("handles multiple element handlers", async (t) => {
  const res = await new HTMLRewriter()
    .on("h1", {
      element(element) {
        element.setInnerContent("new h1");
      },
    })
    .on("h2", {
      element(element) {
        element.setInnerContent("new h2");
      },
    })
    .on("p", {
      element(element) {
        element.setInnerContent("new p");
      },
    })
    .transform("<h1>old h1</h1><h2>old h2</h2><p>old p</p>");
  t.is(res, "<h1>new h1</h1><h2>new h2</h2><p>new p</p>");
});

test("handles streaming", async (t) => {
  t.plan(8); // 6 for text handler + 2 at the end
  const expectedTextChunks = ["te", "st", ""];

  const outputChunks: string[] = [];
  const decoder = new TextDecoder();
  const rewriter = new RawHTMLRewriter((chunk) =>
    outputChunks.push(decoder.decode(chunk))
  ).on("p", {
    text(text) {
      t.is(text.text, expectedTextChunks.shift());
      t.is(text.lastInTextNode, text.text === "");
    },
  });

  const inputChunks = [
    '<html lang="en">',
    "<bo",
    "dy>",
    "<p>",
    "te",
    "st",
    "</p></body>",
    "</html>",
  ];
  const encoder = new TextEncoder();
  for (const chunk of inputChunks) {
    await rewriter.write(encoder.encode(chunk));
    await wait(50);
  }
  await rewriter.end();

  t.true(outputChunks.length >= 2);
  t.is(
    outputChunks.join(""),
    '<html lang="en"><body><p>test</p></body></html>'
  );
});

test("handles empty chunk", async (t) => {
  const res = await new HTMLRewriter().transform("");
  t.is(res, "");
});

test("rethrows error thrown in handler", async (t) => {
  const rewriter = new RawHTMLRewriter(() => {}).on("p", {
    element() {
      throw new Error("Whoops!");
    },
  });

  const promise = rewriter.write(new TextEncoder().encode("<p>test</p>"));
  await t.throwsAsync(promise, { message: "Whoops!" });
});

test("rethrows error thrown in async handler", async (t) => {
  const rewriter = new RawHTMLRewriter(() => {}).on("p", {
    async element() {
      throw new Error("Whoops!");
    },
  });

  const promise = rewriter.write(new TextEncoder().encode("<p>test</p>"));
  await t.throwsAsync(promise, { message: "Whoops!" });
});

test.serial("handles concurrent rewriters with async handlers", async (t) => {
  // Note this test requires the "safe" HTMLRewriter, see comments in
  // src/modules/rewriter.ts for more details
  const rewriter = (i: number) =>
    new HTMLRewriter()
      .on("p", {
        async element(element) {
          await wait(50);
          element.setInnerContent(`new ${i}`);
        },
      })
      .transform(`<p>old ${i}</p>`);

  const res1 = rewriter(1);
  const res2 = rewriter(2);
  t.is(await res1, "<p>new 1</p>");
  t.is(await res2, "<p>new 2</p>");

  const res3 = rewriter(3);
  const res4 = rewriter(4);
  const texts = await Promise.all([res3, res4]);
  t.deepEqual(texts, ["<p>new 3</p>", "<p>new 4</p>"]);
});

test.serial("handles many async handlers for single chunk write", async (t) => {
  const rewriter = new HTMLRewriter();
  rewriter.on("h1", {
    async element(element) {
      await wait(50);
      element.setInnerContent("new h1");
    },
  });
  rewriter.on("p", {
    async element(element) {
      await wait(50);
      element.setInnerContent("new p");
    },
  });
  const res = await rewriter.transform("<h1>old h1</h1><p>old p</p>");
  t.is(res, "<h1>new h1</h1><p>new p</p>");
});

test("rewriter allows chaining", (t) => {
  const rewriter = new RawHTMLRewriter(() => {});
  t.is(rewriter.on("p", {}), rewriter);
  t.is(rewriter.onDocument({}), rewriter);
});

test.serial("handles async handler in different realm", async (t) => {
  const context = vm.createContext({ HTMLRewriter, wait });
  const res = await vm.runInContext(
    `
  const rewriter = new HTMLRewriter();
  rewriter.on("p", {
    async element(element) {
      await wait(50);
      element.setInnerContent("new");
    },
  });
  rewriter.transform("<p>old</p>");
  `,
    context
  );
  t.is(res, "<p>new</p>");
});

test("treats esi tags as void tags if option enabled", async (t) => {
  const handlers: ElementHandlers = {
    element(element) {
      element.replace("replacement");
    },
  };

  const input = '<span><esi:include src="a" /> text<span>';

  // Check with option disabled
  let res = await new HTMLRewriter()
    .on("esi\\:include", handlers)
    .transform(input);
  t.is(res, "<span>replacement");

  // Check with option enabled
  res = await new HTMLRewriter({ enableEsiTags: true })
    .on("esi\\:include", handlers)
    .transform(input);
  t.is(res, "<span>replacement text<span>");
});
