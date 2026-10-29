// Blog bodies come from the admin textarea as plain text: blank lines between
// paragraphs, "* " bullets, "1. Heading" section titles, "---" dividers and
// **bold**. Older posts may already be HTML, which is passed through untouched.

const HTML_TAG = /<\/?(p|div|h[1-6]|ul|ol|li|br|hr|strong|em|b|i|a|blockquote|img)\b/i
const BULLET = /^[*•-]\s+/
const NUMBERED = /^\d+[.)]\s+/
const DIVIDER = /^([-*_])\1{2,}$/

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inline(text: string) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
}

/** Turns an admin-written blog body into HTML that keeps its paragraphs, lists and headings. */
export function formatBlogBody(body: string): string {
  if (HTML_TAG.test(body)) return body

  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean)
      if (lines.length === 1 && DIVIDER.test(lines[0])) return "<hr>"
      if (lines.every((line) => BULLET.test(line))) {
        return `<ul>${lines.map((line) => `<li>${inline(line.replace(BULLET, ""))}</li>`).join("")}</ul>`
      }
      if (lines.length === 1 && NUMBERED.test(lines[0])) return `<h3>${inline(lines[0])}</h3>`
      if (lines.every((line) => NUMBERED.test(line))) {
        return `<ol>${lines.map((line) => `<li>${inline(line.replace(NUMBERED, ""))}</li>`).join("")}</ol>`
      }
      return `<p>${lines.map(inline).join("<br>")}</p>`
    })
    .join("\n")
}

/** Plain-text teaser of roughly `limit` characters, cut at a word boundary. */
export function blogTeaser(body: string, limit = 100): string {
  const text = body
    .replace(/<[^>]+>/g, " ")
    .replace(/\*\*/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/, "")}…`
}
