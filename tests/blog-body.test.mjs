// Run: node --experimental-strip-types tests/blog-body.test.mjs
import assert from "node:assert/strict"
import { blogTeaser, formatBlogBody } from "../src/lib/blog-body.ts"

const body = [
  "Intro line one\r\nstill intro",
  "",
  "3. Don't squeeze <your> pimples",
  "",
  "* Genetics\n* **Hormones**",
  "",
  "---",
  "",
  "1. First\n2. Second",
].join("\n")

assert.equal(
  formatBlogBody(body),
  [
    "<p>Intro line one<br>still intro</p>",
    "<h3>3. Don't squeeze &lt;your&gt; pimples</h3>",
    "<ul><li>Genetics</li><li><strong>Hormones</strong></li></ul>",
    "<hr>",
    "<ol><li>First</li><li>Second</li></ol>",
  ].join("\n")
)

const html = "<p>Already <strong>HTML</strong></p>"
assert.equal(formatBlogBody(html), html)

assert.equal(blogTeaser("Short text."), "Short text.")
const teaser = blogTeaser("word ".repeat(40))
assert.ok(teaser.endsWith("…") && teaser.length <= 101, teaser)
assert.ok(!blogTeaser("<p>a <strong>b</strong></p>").includes("<"))

console.log("blog-body: all checks passed")
