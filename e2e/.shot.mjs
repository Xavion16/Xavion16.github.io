import { chromium } from "@playwright/test"
const [url, out, w, h] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({
  viewport: { width: +w, height: +h },
  reducedMotion: "reduce",
})
await p.goto(url)
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(800)
await p.screenshot({ path: out })
await p.getByRole("button", { name: "Tercihleri Yönet" }).click()
await p.waitForTimeout(300)
await p.screenshot({ path: out.replace(".png", "-prefs.png") })
await b.close()
