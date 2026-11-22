/*
 * Kadife ailesi — ortak etkileşimler:
 *  - Perde ön yükleyici (yüzde sayacı; görseller ve fontlar hazır olunca açılır)
 *  - Özel imleç (yalnızca hassas işaretçi + hareket serbest) ve mıknatıslı düğmeler [data-magnet]
 *  - Grenli film dokusu
 * Hepsi dekoratiftir: dokunmatikte, hareket azaltmada ve JS yokken sayfa eksiksiz çalışır.
 */
;(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches

  // ── Ön yükleyici ─────────────────────────────────────────────
  const pre = document.querySelector(".preloader")
  if (pre) {
    if (reduced) pre.remove()
    else {
      const num = pre.querySelector("[data-count]")
      const imgs = [...document.images].filter(
        (i) =>
          !i.loading ||
          i.loading === "eager" ||
          i.getAttribute("fetchpriority") === "high",
      )
      let done = 0
      const total = Math.max(1, imgs.length + 1)
      let shown = 0
      const target = () => Math.round((done / total) * 100)
      const tick = () => {
        shown += (target() - shown) * 0.12 + 0.4
        if (shown > target()) shown = target()
        if (num) num.textContent = String(Math.floor(shown)).padStart(2, "0")
        if (shown >= 100) return open()
        requestAnimationFrame(tick)
      }
      const inc = () => {
        done++
      }
      imgs.forEach((i) =>
        i.complete
          ? inc()
          : (i.addEventListener("load", inc, { once: true }),
            i.addEventListener("error", inc, { once: true })),
      )
      ;(document.fonts?.ready ?? Promise.resolve()).then(inc)
      // En fazla 3,5 sn bekle
      setTimeout(() => {
        done = total
      }, 3500)
      requestAnimationFrame(tick)
      function open() {
        pre.classList.add("open")
        document.dispatchEvent(new CustomEvent("kadife:ready"))
        setTimeout(() => pre.remove(), 1400)
      }
    }
  }

  // ── Grenli doku ─────────────────────────────────────────────
  if (!document.querySelector(".grain")) {
    const g = document.createElement("div")
    g.className = "grain"
    g.setAttribute("aria-hidden", "true")
    document.body.appendChild(g)
  }

  if (reduced || !fine) return

  // ── Özel imleç ──────────────────────────────────────────────
  const dot = document.createElement("div")
  dot.className = "cursor"
  dot.setAttribute("aria-hidden", "true")
  dot.innerHTML = '<span class="cursor-label"></span>'
  document.body.appendChild(dot)
  document.documentElement.classList.add("has-cursor")
  const label = dot.querySelector(".cursor-label")
  let x = innerWidth / 2,
    y = innerHeight / 2,
    tx = x,
    ty = y,
    raf = 0
  const loop = () => {
    x += (tx - x) * 0.2
    y += (ty - y) * 0.2
    dot.style.transform = `translate(${x}px, ${y}px)`
    raf =
      Math.abs(tx - x) + Math.abs(ty - y) > 0.3
        ? requestAnimationFrame(loop)
        : 0
  }
  addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX
      ty = e.clientY
      if (!raf) raf = requestAnimationFrame(loop)
    },
    { passive: true },
  )
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest?.("a, button, [data-cursor]")
    dot.classList.toggle("is-link", Boolean(t))
    const text = t?.getAttribute("data-cursor") ?? ""
    label.textContent = text
    dot.classList.toggle("has-label", Boolean(text))
  })
  addEventListener("blur", () => dot.classList.add("hidden"))
  addEventListener("focus", () => dot.classList.remove("hidden"))
  document.addEventListener("pointerleave", () => dot.classList.add("hidden"))
  document.addEventListener("pointerenter", () =>
    dot.classList.remove("hidden"),
  )

  // ── Mıknatıslı düğmeler ─────────────────────────────────────
  document.querySelectorAll("[data-magnet]").forEach((el) => {
    const strength = Number(el.getAttribute("data-magnet") || 0.35)
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect()
      const mx = (e.clientX - (r.left + r.width / 2)) * strength
      const my = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.transform = `translate(${mx}px, ${my}px)`
    })
    el.addEventListener("pointerleave", () => {
      el.style.transform = ""
    })
  })
})()
