import test, { Macro } from "ava";
import { HTMLRewriter } from ".";

const selectorMacro: Macro<
  [selector: string, input: string, expected: string]
> = async (t, selector, input, expected) => {
  const res = await new HTMLRewriter()
    .on(selector, {
      element(element) {
        element.setInnerContent("new");
      },
    })
    .transform(input);
  t.is(res, expected);
};
selectorMacro.title = (providedTitle) => `handles ${providedTitle} selector`;

test("*", selectorMacro, "*", "<h1>1</h1><p>2</p>", "<h1>new</h1><p>new</p>");
test("E", selectorMacro, "p", "<h1>1</h1><p>2</p>", "<h1>1</h1><p>new</p>");
test(
  "E:nth-child(n)",
  selectorMacro,
  "p:nth-child(2)",
  "<div><p>1</p><p>2</p><p>3</p></div>",
  "<div><p>1</p><p>new</p><p>3</p></div>"
);
test(
  "E:first-child",
  selectorMacro,
  "p:first-child",
  "<div><p>1</p><p>2</p><p>3</p></div>",
  "<div><p>new</p><p>2</p><p>3</p></div>"
);
test(
  "E:nth-of-type(n)",
  selectorMacro,
  "p:nth-of-type(2)",
  "<div><p>1</p><h1>2</h1><p>3</p><h1>4</h1><p>5</p></div>",
  "<div><p>1</p><h1>2</h1><p>new</p><h1>4</h1><p>5</p></div>"
);
test(
  "E:first-of-type",
  selectorMacro,
  "p:first-of-type",
  "<div><h1>1</h1><p>2</p><p>3</p></div>",
  "<div><h1>1</h1><p>new</p><p>3</p></div>"
);
test(
  "E:not(s)",
  selectorMacro,
  "p:not(:first-child)",
  "<div><p>1</p><p>2</p><p>3</p></div>",
  "<div><p>1</p><p>new</p><p>new</p></div>"
);
test(
  "E.class",
  selectorMacro,
  "p.red",
  '<p class="red">1</p><p>2</p>',
  '<p class="red">new</p><p>2</p>'
);
test(
  "E#id",
  selectorMacro,
  "h1#header",
  '<h1 id="header">1</h1><h1>2</h1>',
  '<h1 id="header">new</h1><h1>2</h1>'
);
test(
  "E[attr]",
  selectorMacro,
  "p[data-test]",
  "<p data-test>1</p><p>2</p>",
  "<p data-test>new</p><p>2</p>"
);
test(
  'E[attr="value"]',
  selectorMacro,
  'p[data-test="one"]',
  '<p data-test="one">1</p><p data-test="two">2</p>',
  '<p data-test="one">new</p><p data-test="two">2</p>'
);
test(
  'E[attr="value" i]',
  selectorMacro,
  'p[data-test="one" i]',
  '<p data-test="one">1</p><p data-test="OnE">2</p><p data-test="two">3</p>',
  '<p data-test="one">new</p><p data-test="OnE">new</p><p data-test="two">3</p>'
);
test(
  'E[attr="value" s]',
  selectorMacro,
  'p[data-test="one" s]',
  '<p data-test="one">1</p><p data-test="OnE">2</p><p data-test="two">3</p>',
  '<p data-test="one">new</p><p data-test="OnE">2</p><p data-test="two">3</p>'
);
test(
  'E[attr~="value"]',
  selectorMacro,
  'p[data-test~="two"]',
  '<p data-test="one two three">1</p><p data-test="one two">2</p><p data-test="one">3</p>',
  '<p data-test="one two three">new</p><p data-test="one two">new</p><p data-test="one">3</p>'
);
test(
  'E[attr^="value"]',
  selectorMacro,
  'p[data-test^="a"]',
  '<p data-test="a1">1</p><p data-test="a2">2</p><p data-test="b1">3</p>',
  '<p data-test="a1">new</p><p data-test="a2">new</p><p data-test="b1">3</p>'
);
test(
  'E[attr$="value"]',
  selectorMacro,
  'p[data-test$="1"]',
  '<p data-test="a1">1</p><p data-test="a2">2</p><p data-test="b1">3</p>',
  '<p data-test="a1">new</p><p data-test="a2">2</p><p data-test="b1">new</p>'
);
test(
  'E[attr*="value"]',
  selectorMacro,
  'p[data-test*="b"]',
  '<p data-test="abc">1</p><p data-test="ab">2</p><p data-test="a">3</p>',
  '<p data-test="abc">new</p><p data-test="ab">new</p><p data-test="a">3</p>'
);
test(
  'E[attr|="value"]',
  selectorMacro,
  'p[data-test|="a"]',
  '<p data-test="a">1</p><p data-test="a-1">2</p><p data-test="a2">3</p>',
  '<p data-test="a">new</p><p data-test="a-1">new</p><p data-test="a2">3</p>'
);
test(
  "E F",
  selectorMacro,
  "div span",
  "<div><h1><span>1</span></h1><span>2</span><b>3</b></div>",
  "<div><h1><span>new</span></h1><span>new</span><b>3</b></div>"
);
test(
  "E > F",
  selectorMacro,
  "div > span",
  "<div><h1><span>1</span></h1><span>2</span><b>3</b></div>",
  "<div><h1><span>1</span></h1><span>new</span><b>3</b></div>"
);

test("throws error on unsupported selector", async (t) => {
  t.plan(1);
  const res = new HTMLRewriter()
    .on("p:last-child", {
      element(element) {
        element.setInnerContent("new");
      },
    })
    .transform("<p>old</p>");
  await t.throwsAsync(res, {
    instanceOf: TypeError,
    message:
      "Parser error: Unsupported pseudo-class or pseudo-element in selector.",
  });
});
