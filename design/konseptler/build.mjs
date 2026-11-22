// Konsept kaynaklarındaki {{KOD:genişlik}} görsel belirteçlerini Unsplash adreslerine çevirir.
// Görseller Unsplash Lisansı ile ücretsizdir; yalnızca konsept amaçlıdır.
//   node design/konseptler/build.mjs
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dir = path.dirname(fileURLToPath(import.meta.url))
const IMAGES = {
  W1: "photo-1686668572519-1793f1f5f37f",
  W2: "photo-1670607231621-c00fd76d2387",
  W3: "photo-1686668572494-278de081af6a",
  W4: "photo-1689914667397-a77effb740da",
  W5: "photo-1697647916715-f5b8bf94c8bf",
  W6: "photo-1570800944273-d194d9c4cde0",
  W7: "photo-1570800944256-13bc68bfb2bc",
  W8: "photo-1760473004054-eb0fd50ea9ae",
  W9: "photo-1784047704771-58a53faadf33",
  W10: "photo-1654077813634-9ff6b843caab",
  W11: "photo-1596703263926-eb0762ee17e4",
  W12: "photo-1770576568723-c557b096394b",
  W13: "photo-1760615095065-33da9ea0aff9",
  W14: "photo-1562692158-7e4cbe83716f",
  W15: "photo-1553145478-5b0fee29e4fc",
  W16: "photo-1789110519471-74ac17dd1cf6",
  W17: "photo-1792731410749-6a5a768964a7",
  W18: "photo-1551489186-ccb95a1ea6a3",
  W19: "photo-1559334417-1adb87b6e97f",
  W20: "photo-1770254082274-97be020349b6",
  W21: "photo-1792588220212-848f3ad91966",
  W22: "photo-1779398646547-8fe51e5b5c23",
  W23: "photo-1768610284937-05943995407c",
  W24: "photo-1527189919029-aeb3d997547d",
  M1: "photo-1668069226492-508742b03147",
  M2: "photo-1614252235316-8c857d38b5f4",
  M3: "photo-1603191659812-ee978eeeef76",
  M4: "photo-1646139498425-5bceb422ba6a",
  M5: "photo-1563433337461-5b65f0834f3a",
  M6: "photo-1777987601431-8d27d2039cc4",
  M7: "photo-1563434564528-8fdf5996e622",
  M8: "photo-1549290127-7f758fdadff7",
  M9: "photo-1563434649554-58f91d22ec2c",
  M10: "photo-1616696038562-574c18066055",
  M11: "photo-1774868678834-e2537f930143",
  M12: "photo-1617137977259-bb83e191f377",
  M13: "photo-1764937572078-5e2f75649219",
  M15: "photo-1658837407083-308b902ee99d",
  A1: "photo-1477517787936-70ba786643fd",
  A2: "photo-1787005241178-c9006ea9610b",
  A3: "photo-1790253719855-e6f58150fc7f",
  A4: "photo-1768550005921-8782adcb798c",
  A5: "photo-1648343615199-03567050abbb",
  A6: "photo-1716726317165-6973ccdcf260",
}

const src = path.join(dir, "src")
for (const f of (await readdir(src)).filter((n) => n.endsWith(".html"))) {
  const html = (await readFile(path.join(src, f), "utf8")).replace(
    /\{\{([A-Z]\d+):(\d+)\}\}/g,
    (_, k, w) => {
      if (!IMAGES[k]) throw new Error(`${f}: bilinmeyen görsel ${k}`)
      return `https://images.unsplash.com/${IMAGES[k]}?w=${w}&q=80&auto=format&fit=crop`
    },
  )
  await writeFile(path.join(dir, f), html)
  console.log("✓", f)
}
