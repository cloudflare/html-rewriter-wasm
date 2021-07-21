import test, { Macro } from "ava";
import { Comment } from "..";
import { HTMLRewriter, mutationsMacro, wait } from ".";

const commentsMutationsInput = "<p><!--test--></p>";
const commentsMutationsExpected = {
  beforeAfter: [
    "<p>",
    "&lt;span&gt;before&lt;/span&gt;",
    "<span>before html</span>",
    "<!--test-->",
    "<span>after html</span>",
    "&lt;span&gt;after&lt;/span&gt;",
    "</p>",
  ].join(""),
  replace: "<p>&lt;span&gt;replace&lt;/span&gt;</p>",
  replaceHtml: "<p><span>replace</span></p>",
  remove: "<p></p>",
};

const commentPropertiesMacro: Macro<
  [(rw: HTMLRewriter, comments: (comment: Comment) => void) => HTMLRewriter]
> = async (t, func) => {
  t.plan(3);
  const res = await func(new HTMLRewriter(), (comment) => {
    t.false(comment.removed);
    t.is(comment.text, "test");
    comment.text = "new";
  }).transform("<p><!--test--></p>");
  t.is(res, "<p><!--new--></p>");
};
test("handles comment properties", commentPropertiesMacro, (rw, comments) =>
  rw.on("p", { comments })
);
test(
  "handles comment mutations",
  mutationsMacro,
  (rw, comments) => rw.on("p", { comments }),
  commentsMutationsInput,
  commentsMutationsExpected
);
test("comment allows chaining", async (t) => {
  t.plan(4);
  await new HTMLRewriter()
    .on("p", {
      comments(comment) {
        t.is(comment.before(""), comment);
        t.is(comment.after(""), comment);
        t.is(comment.replace(""), comment);
        t.is(comment.remove(), comment);
      },
    })
    .transform("<p><!--test--></p>");
});
const commentAsyncHandlerMacro: Macro<
  [(rw: HTMLRewriter, comments: (c: Comment) => Promise<void>) => HTMLRewriter]
> = async (t, func) => {
  const res = await func(new HTMLRewriter(), async (comment) => {
    await wait(50);
    comment.text = "new";
  }).transform("<p><!--test--></p>");
  t.is(res, "<p><!--new--></p>");
};
test(
  "handles comment async handler",
  commentAsyncHandlerMacro,
  (rw, comments) => rw.on("p", { comments })
);
const commentClassHandlerMacro: Macro<
  [(rw: HTMLRewriter, h: { comments: (c: Comment) => void }) => HTMLRewriter]
> = async (t, func) => {
  class Handler {
    constructor(private content: string) {}
    // noinspection JSUnusedGlobalSymbols
    comments(comment: Comment) {
      comment.text = this.content;
    }
  }
  const res = await func(new HTMLRewriter(), new Handler("new")).transform(
    "<p><!--test--></p>"
  );
  t.is(res, "<p><!--new--></p>");
};
test("handles comment class handler", commentClassHandlerMacro, (rw, handler) =>
  rw.on("p", handler)
);

test(
  "handles document comment properties",
  commentPropertiesMacro,
  (rw, comments) => rw.onDocument({ comments })
);
test(
  "handles document comment mutations",
  mutationsMacro,
  (rw, comments) => rw.onDocument({ comments }),
  commentsMutationsInput,
  commentsMutationsExpected
);
test(
  "handles document comment async handler",
  commentAsyncHandlerMacro,
  (rw, comments) => rw.onDocument({ comments })
);
test(
  "handles document comment class handler",
  commentClassHandlerMacro,
  (rw, handler) => rw.onDocument(handler)
);
