import test from "ava";
import { DocumentEnd } from "..";
import { HTMLRewriter, wait } from ".";

test("handles document end specific mutations", async (t) => {
  // append
  const res = await new HTMLRewriter()
    .onDocument({
      end(end) {
        end.append("<span>append</span>");
        end.append("<span>append html</span>", { html: true });
      },
    })
    .transform("<p>test</p>");
  t.is(
    res,
    [
      "<p>",
      "test",
      "</p>",
      "&lt;span&gt;append&lt;/span&gt;",
      "<span>append html</span>",
    ].join("")
  );
});
test("document end allows chaining", async (t) => {
  t.plan(1);
  await new HTMLRewriter()
    .onDocument({
      end(end) {
        t.is(end.append(""), end);
      },
    })
    .transform("<p>test</p>");
});
test("handles document end async handler", async (t) => {
  const res = await new HTMLRewriter()
    .onDocument({
      async end(end) {
        await wait(50);
        end.append("<span>append html</span>", { html: true });
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p>test</p><span>append html</span>");
});
test("handles document end class handler", async (t) => {
  class Handler {
    constructor(private content: string) {}
    // noinspection JSUnusedGlobalSymbols
    end(end: DocumentEnd) {
      end.append(this.content, { html: true });
    }
  }
  const res = await new HTMLRewriter()
    .onDocument(new Handler("<span>append html</span>"))
    .transform("<p>test</p>");
  t.is(res, "<p>test</p><span>append html</span>");
});
