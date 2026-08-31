import { createClient } from "@supabase/supabase-js"
import fs from "node:fs"

const envPath = process.argv[2]
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=")
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.log("MISSING_CREDS", { hasUrl: !!url, hasKey: !!serviceKey })
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
const buffer = Buffer.from(pngBase64, "base64")
const bucket = "apmo_bucket"
const path = `diagnostic-test/${Date.now()}-test.png`

console.log("Uploading Buffer, path:", path)
const upRes = await supabase.storage.from(bucket).upload(path, buffer, {
  contentType: "image/png",
  upsert: true,
  cacheControl: "3600",
})
console.log("upload result error:", upRes.error)
console.log("upload result data:", upRes.data)

const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
console.log("public url:", pub.publicUrl)

try {
  const res = await fetch(pub.publicUrl)
  console.log("fetch status:", res.status, res.headers.get("content-type"), res.headers.get("content-length"))
  const buf = Buffer.from(await res.arrayBuffer())
  console.log("fetched bytes:", buf.length, "matches upload:", buf.length === buffer.length)
} catch (e) {
  console.log("fetch error:", e)
}

// cleanup
const rm = await supabase.storage.from(bucket).remove([path])
console.log("cleanup error:", rm.error)

// Also check bucket config
const { data: bucketInfo, error: bucketErr } = await supabase.storage.getBucket(bucket)
console.log("bucket info:", bucketInfo, "err:", bucketErr)
