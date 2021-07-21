import test from "ava";
import { Doctype } from "..";
import { HTMLRewriter, wait } from ".";

const doctypeInput =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html lang="en"></html>';
test("handles document doctype properties", async (t) => {
  t.plan(4);
  const res = await new HTMLRewriter()
    .onDocument({
      doctype(doctype) {
        t.is(doctype.name, "html");
        t.is(doctype.publicId, "-//W3C//DTD HTML 4.01//EN");
        t.is(doctype.systemId, "http://www.w3.org/TR/html4/strict.dtd");
      },
    })
    .transform(doctypeInput);
  t.is(res, doctypeInput);
});
test("handles document doctype properties for empty doctype", async (t) => {
  t.plan(3);
  await new HTMLRewriter()
    .onDocument({
      doctype(doctype) {
        t.is(doctype.name, null);
        t.is(doctype.publicId, null);
        t.is(doctype.systemId, null);
      },
    })
    .transform("<!DOCTYPE>");
});
test("handles document doctype async handler", async (t) => {
  const res = await new HTMLRewriter()
    .onDocument({
      async doctype(doctype) {
        await wait(50);
        t.is(doctype.name, "html");
      },
    })
    .transform(doctypeInput);
  t.is(res, doctypeInput);
});
test("handles document doctype class handler", async (t) => {
  class Handler {
    constructor(private content: string) {}
    // noinspection JSUnusedGlobalSymbols
    doctype(doctype: Doctype) {
      t.is(doctype.name, "html");
      t.is(this.content, "new");
    }
  }
  const res = await new HTMLRewriter()
    .onDocument(new Handler("new"))
    .transform(doctypeInput);
  t.is(res, doctypeInput);
});
