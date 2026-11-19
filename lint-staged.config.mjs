// Windows'ta komut satırı ~8K karakterle sınırlı: çok dosyada listeyi geçmek yerine
// Prettier'ı tüm repoda çalıştır (.prettierignore kapsamı sınırlar).
const MAX_FILES = 40

export default {
  "*.{ts,tsx,mts,mjs,js,json,md,css,yaml}": (files) =>
    files.length > MAX_FILES
      ? "prettier --write --ignore-unknown ."
      : `prettier --write --ignore-unknown ${files.map((f) => JSON.stringify(f)).join(" ")}`,
}
