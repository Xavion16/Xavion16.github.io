/*
 * ARION konsept sayfaları — ortak hareket sistemi.
 * GSAP + ScrollTrigger tek animasyon sistemi; Lenis tek yumuşak kaydırma motoru.
 * prefers-reduced-motion: Lenis ve kaydırmaya bağlı zaman çizelgeleri hiç kurulmaz, son haller görünür.
 * JavaScript yoksa sayfa statik olarak eksiksizdir (tüm metin ve görseller HTML'de).
 */
;(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  document.documentElement.classList.add(reduced ? "rm" : "motion")
  if (reduced || !window.gsap) return

  gsap.registerPlugin(ScrollTrigger)

  // Lenis ↔ ScrollTrigger
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"))
      if (target) {
        e.preventDefault()
        lenis.scrollTo(target, { offset: -40 })
      }
    }),
  )

  // Kelime kelime başlık: erişilebilir ad bölünmez (aria-label), kelimeler dekoratif.
  // İç işaretleme (em, i, span.renk) korunur: her kelime kendi sarmalayıcısının kopyası içinde kalır.
  const wrapWord = (w) => {
    const o = document.createElement("span")
    o.className = "w"
    o.setAttribute("aria-hidden", "true")
    const i = document.createElement("span")
    i.className = "wi"
    i.textContent = w
    o.appendChild(i)
    return o
  }
  const walk = (node, into) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          into.appendChild(
            /^\s+$/.test(part) ? document.createTextNode(" ") : wrapWord(part),
          )
        })
      } else if (n.nodeName === "BR") {
        into.appendChild(document.createElement("br"))
      } else if (n.nodeType === 1) {
        const c = n.cloneNode(false)
        into.appendChild(c)
        walk(n, c)
      }
    })
  }
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "))
    const frag = document.createElement("div")
    walk(el, frag)
    el.replaceChildren(...frag.childNodes)
    const words = el.querySelectorAll(".wi")
    const hero = el.hasAttribute("data-hero")
    gsap.from(words, {
      yPercent: 115,
      rotate: hero ? 4 : 2,
      duration: hero ? 1.25 : 1,
      ease: "expo.out",
      stagger: hero ? 0.07 : 0.045,
      // Perde ön yükleyici varsa kahraman başlığı perde açılırken gelir
      delay: hero ? (document.querySelector(".preloader") ? 1.5 : 0.25) : 0,
      scrollTrigger: hero ? undefined : { trigger: el, start: "top 85%" },
    })
  })

  gsap.utils.toArray("[data-reveal]").forEach((el) =>
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    }),
  )

  gsap.utils.toArray("[data-clip]").forEach((el) =>
    gsap.from(el, {
      clipPath:
        el.dataset.clip === "x" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)",
      duration: 1.4,
      ease: "expo.inOut",
      scrollTrigger: { trigger: el, start: "top 85%" },
    }),
  )

  gsap.utils.toArray("[data-parallax]").forEach((el) =>
    gsap.fromTo(
      el,
      { yPercent: -Number(el.dataset.parallax || 10) },
      {
        yPercent: Number(el.dataset.parallax || 10),
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    ),
  )

  gsap.utils
    .toArray("[data-zoom]")
    .forEach((el) =>
      gsap.fromTo(
        el,
        { scale: 1.18 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      ),
    )

  // Sayfaya özel hareketler
  window.ARION_MOTION = { gsap, ScrollTrigger, lenis }
  // Sayfa betikleri ortak.js sonrasında yüklenir: olay bir sonraki görevde yayınlanır
  setTimeout(() => document.dispatchEvent(new CustomEvent("arion:motion")), 0)
  window.addEventListener("load", () => ScrollTrigger.refresh())
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
})()
