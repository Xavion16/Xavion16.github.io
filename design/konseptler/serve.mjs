// Konseptler için basit yerel sunucu (3D modeller file:// üzerinden yüklenemez).
//   node design/konseptler/serve.mjs  →  http://localhost:5510/
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(fileURLToPath(import.meta.url))
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".glb": "model/gltf-binary",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".json": "application/json",
}
const port = Number(process.env.PORT ?? 5510)

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost")
  let file = path.normalize(path.join(root, decodeURIComponent(url.pathname)))
  if (!file.startsWith(root)) {
    res.writeHead(403).end()
    return
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html")
    const body = await readFile(file)
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    })
    res.end(body)
  } catch {
    res
      .writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
      .end("Bulunamadı")
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Konseptler: http://localhost:${port}/`),
)
