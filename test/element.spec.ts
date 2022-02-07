import test from "ava";
import { Element } from "..";
import { HTMLRewriter, mutationsMacro, wait } from ".";

const elementMutationsInput = "<p>test</p>";
const elementMutationsExpected = {
  beforeAfter: [
    "&lt;span&gt;before&lt;/span&gt;",
    "<span>before html</span>",
    "<p>",
    "test",
    "</p>",
    "<span>after html</span>",
    "&lt;span&gt;after&lt;/span&gt;",
  ].join(""),
  replace: "&lt;span&gt;replace&lt;/span&gt;",
  replaceHtml: "<span>replace</span>",
  remove: "",
};

test("handles element properties", async (t) => {
  t.plan(6);
  const res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        t.is(element.tagName, "p");
        element.tagName = "h1";
        t.false(element.removed);
        t.is(element.namespaceURI, "http://www.w3.org/1999/xhtml");

        // Check element.attributes is an IterableIterator
        t.deepEqual(element.attributes.next(), {
          value: ["class", "red"],
          done: false,
        });
        t.deepEqual([...element.attributes], [["class", "red"]]);
      },
    })
    .transform('<p class="red">test</p>');
  t.is(res, '<h1 class="red">test</h1>');
});
test("handles element attribute methods", async (t) => {
  t.plan(5);
  const res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        t.is(element.getAttribute("class"), "red");
        t.is(element.getAttribute("id"), null);
        t.true(element.hasAttribute("class"));
        t.false(element.hasAttribute("id"));
        element.setAttribute("id", "header");
        element.removeAttribute("class");
      },
    })
    .transform('<p class="red">test</p>');
  t.is(res, '<p id="header">test</p>');
});
test(
  "handles element mutations",
  mutationsMacro,
  (rw, element) => rw.on("p", { element }),
  elementMutationsInput,
  elementMutationsExpected
);
test("handles element specific mutations", async (t) => {
  // prepend/append
  let res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.prepend("<span>prepend</span>");
        element.prepend("<span>prepend html</span>", { html: true });
        element.append("<span>append</span>");
        element.append("<span>append html</span>", { html: true });
      },
    })
    .transform("<p>test</p>");
  t.is(
    res,
    [
      "<p>",
      "<span>prepend html</span>",
      "&lt;span&gt;prepend&lt;/span&gt;",
      "test",
      "&lt;span&gt;append&lt;/span&gt;",
      "<span>append html</span>",
      "</p>",
    ].join("")
  );

  // setInnerContent
  res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.setInnerContent("<span>replace</span>");
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p>&lt;span&gt;replace&lt;/span&gt;</p>");
  res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.setInnerContent("<span>replace</span>", { html: true });
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p><span>replace</span></p>");

  // removeAndKeepContent
  res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.removeAndKeepContent();
      },
    })
    .transform("<p>test</p>");
  t.is(res, "test");
});
test("element allows chaining", async (t) => {
  t.plan(10);
  await new HTMLRewriter()
    .on("p", {
      element(element) {
        t.is(element.before(""), element);
        t.is(element.after(""), element);
        t.is(element.replace(""), element);
        t.is(element.remove(), element);
        t.is(element.setAttribute("test", ""), element);
        t.is(element.removeAttribute("test"), element);
        t.is(element.prepend(""), element);
        t.is(element.append(""), element);
        t.is(element.setInnerContent(""), element);
        t.is(element.removeAndKeepContent(), element);
      },
    })
    .transform("<p>test</p>");
});
test.serial("handles element async handler", async (t) => {
  const res = await new HTMLRewriter()
    .on("p", {
      async element(element) {
        await wait(50);
        element.setInnerContent("new");
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p>new</p>");
});
test("handles element class handler", async (t) => {
  class Handler {
    constructor(private content: string) {}
    // noinspection JSUnusedGlobalSymbols
    element(element: Element) {
      element.setInnerContent(this.content);
    }
  }
  const res = await new HTMLRewriter()
    .on("p", new Handler("new"))
    .transform("<p>test</p>");
  t.is(res, "<p>new</p>");
});

test("handles end tag properties", async (t) => {
  const res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.onEndTag(function (end) {
          t.is(this, element);
          t.is(end.name, "p");
          end.name = "h1";
        });
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p>test</h1>");
});
test("handles end tag mutations", async (t) => {
  const input = "<p>test</p>";
  const beforeAfterExpected = [
    "<p>",
    "test",
    "&lt;span&gt;before&lt;/span&gt;",
    "<span>before html</span>",
    "</p>",
    "<span>after html</span>",
    "&lt;span&gt;after&lt;/span&gt;",
  ].join("");
  const removeExpected = "<p>test";

  // before/after
  let res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        const that = this;
        element.onEndTag((end) => {
          t.is(this, that);
          end.before("<span>before</span>");
          end.before("<span>before html</span>", { html: true });
          end.after("<span>after</span>");
          end.after("<span>after html</span>", { html: true });
        });
      },
    })
    .transform(input);
  t.is(res, beforeAfterExpected);

  // remove
  res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.onEndTag((end) => {
          end.remove();
        });
      },
    })
    .transform(input);
  t.is(res, removeExpected);
});
test("end tag allows chaining", async (t) => {
  t.plan(3);
  await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.onEndTag((end) => {
          t.is(end.before(""), end);
          t.is(end.after(""), end);
          t.is(end.remove(), end);
        });
      },
    })
    .transform("<p>test</p>");
});
test.serial("handles end tag async handler", async (t) => {
  const res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.onEndTag(async (end) => {
          await wait(50);
          end.before("!");
        });
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p>test!</p>");
});
test("uses last end tag handler", async (t) => {
  const res = await new HTMLRewriter()
    .on("p", {
      element(element) {
        element.onEndTag((end) => {
          end.before("1");
        });
        element.onEndTag((end) => {
          end.before("2");
        });
      },
    })
    .transform("<p>test</p>");
  t.is(res, "<p>test2</p>");
});
test("throws error on no end tag", async (t) => {
  const res = new HTMLRewriter()
    .on("img", {
      element(element) {
        element.onEndTag(() => t.fail());
      },
    })
    .transform('<img src="" alt="">');
  await t.throwsAsync(res, {
    instanceOf: TypeError,
    message: "Parser error: No end tag.",
  });
});
