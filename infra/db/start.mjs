// ARION — Docker'sız yerel PostgreSQL (DECISIONS #006)
// Resmi PostgreSQL binary'lerini `embedded-postgres` npm paketiyle çalıştırır.
// Veri: infra/db/.data (git'e girmez). Sadece yerel geliştirme içindir.
import EmbeddedPostgres from "embedded-postgres"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const here = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(here, ".data")

const port = Number(process.env.ARION_DB_PORT ?? 5432)
const user = process.env.ARION_DB_USER ?? "postgres"
const password = process.env.ARION_DB_PASSWORD ?? "arion_dev"
const database = process.env.ARION_DB_NAME ?? "arion"

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user,
  password,
  port,
  persistent: true,
  // Türkçe Windows'ta sistem locale'i "Turkish_Türkiye.1254" ASCII dışı karakter içerir,
  // initdb bunu reddeder. C locale + UTF-8: deterministik sıralama, Türkçe İ/ı tuzağı yok.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
})

const firstRun = !existsSync(path.join(dataDir, "PG_VERSION"))
if (firstRun) {
  console.log("[db] İlk çalıştırma: veritabanı kümesi oluşturuluyor…")
  await pg.initialise()
}

await pg.start()

if (firstRun) {
  await pg.createDatabase(database)
  console.log(`[db] '${database}' veritabanı oluşturuldu.`)
}

console.log(
  `[db] PostgreSQL hazır → postgres://${user}:***@localhost:${port}/${database}`,
)
console.log("[db] Durdurmak için Ctrl+C.")

const stop = async () => {
  console.log("\n[db] Durduruluyor…")
  await pg.stop()
  process.exit(0)
}
process.on("SIGINT", stop)
process.on("SIGTERM", stop)

// Süreci açık tut
setInterval(() => {}, 1 << 30)
