import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const ENABLE_SMOOTH_SCROLL = true

const prefersReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]


// Smooth scrolling (Lenis + ScrollTrigger)

if (ENABLE_SMOOTH_SCROLL && !prefersReduced) {
  const lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    prevent: node => !!node.closest('#package-list, #mobile-menu, dialog')
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(time => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

// Helpers


const noTransition = els => els.forEach(el => (el.style.transition = 'none'))
const restoreTransition = els =>
  els.forEach(el => el.style.removeProperty('transition'))

function reveal(targets, { trigger, start = 'top 85%', ...vars } = {}) {
  const els = gsap.utils.toArray(targets).filter(Boolean)
  if (!els.length) return

  noTransition(els)

  gsap.from(els, {
    opacity: 0,
    y: 50,
    duration: 0.9,
    ease: 'power3.out',
    clearProps: 'opacity,transform',
    scrollTrigger: {
      trigger: trigger || els[0],
      start,
      toggleActions: 'play none none none'
    },
    onComplete: () => restoreTransition(els),
    ...vars
  })
}

// Animations

const mm = gsap.matchMedia()

mm.add('(prefers-reduced-motion: no-preference)', () => {
  // ---------- Hero ----------
  const hero = $('main > section:first-of-type')

  if (hero) {
    const heroContent = $('.max-w-xl', hero)
    const heroItems = $$('.max-w-xl > *', hero)

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })

  
    intro
      .from($('header nav', hero), {
        y: -30,
        opacity: 0,
        duration: 0.8,
        clearProps: 'opacity,transform'
      })
      .from(
        heroItems,
        {
          y: 50,
          opacity: 0,
          duration: 0.9,
          stagger: 0.14,
          clearProps: 'opacity,transform'
        },
        '-=0.4'
      )

  
    $$('.max-w-xl .border-t .font-heading', hero).forEach(el => {
      const match = el.textContent.trim().match(/^(\d+)(\D*)$/)
      if (!match) return

      const end = Number(match[1])
      const suffix = match[2]
      const counter = { value: 0 }

      el.textContent = `0${suffix}`

      intro.to(
        counter,
        {
          value: end,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${Math.round(counter.value)}${suffix}`
          }
        },
        '-=0.9'
      )
    })


    if (heroContent) {
      gsap.to(heroContent, {
        y: -120,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
    }
    gsap.fromTo(
      hero,
      { backgroundPositionY: '50%' },
      {
        backgroundPositionY: '80%',
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      }
    )
  }

  $$('#categories h2, #popular-products h2, #special-package h2').forEach(
    heading => reveal(heading, { y: 40 })
  )

  // ---------- Explore by Category ----------
  const sidebar = $('#categories aside')

  if (sidebar) {
    reveal($('#category-search')?.closest('div'), {
      trigger: sidebar,
      x: -30,
      y: 0,
      duration: 0.7
    })

    reveal($$('#category-list li'), {
      trigger: '#category-list',
      x: -30,
      y: 0,
      stagger: 0.06,
      duration: 0.6
    })

    reveal($('#all-categories'), { y: 20, duration: 0.7, start: 'top 95%' })
  }

  const categoryCards = $$('.category-card')

  if (categoryCards.length) {
    const showCards = (els, stagger = 0.12) => {
      els.forEach(el => (el.dataset.revealed = '1'))

      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger,
        overwrite: true,
        clearProps: 'opacity,transform'
      })
    }

    gsap.set(categoryCards, { opacity: 0, y: 60 })

    ScrollTrigger.batch(categoryCards, {
      start: 'top 90%',
      once: true,
      onEnter: batch => showCards(batch)
    })

    const categoriesSection = $('#categories')

    ;['click', 'input'].forEach(eventName => {
      categoriesSection?.addEventListener(eventName, () => {
        setTimeout(() => {
          const pending = categoryCards.filter(card => !card.dataset.revealed)
          if (pending.length) showCards(pending, 0.05)
          ScrollTrigger.refresh()
        }, 80)
      })
    })
  }

  // ---------- Popular Products ----------

  const sofaBg = $('#popular-products .pointer-events-none img')

  if (sofaBg) {
    gsap.fromTo(
      sofaBg,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '#popular-products',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    )
  }

  reveal($('#products-progress-track')?.parentElement, { y: 30 })

  reveal($('#popular-products a[href="#products"]')?.parentElement, {
    y: 30,
    start: 'top 95%'
  })

  // ---------- Special Package ----------
  const packageImage = $('#package-image')
  const packageFrame = packageImage?.parentElement

  if (packageFrame) {
    gsap.fromTo(
      packageFrame,
      { clipPath: 'inset(0 0 100% 0 round 12px)', y: 40 },
      {
        clipPath: 'inset(0 0 0% 0 round 12px)',
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        clearProps: 'clipPath,transform',
        scrollTrigger: {
          trigger: packageFrame,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )

  
    gsap.fromTo(
      packageImage,
      { scale: 1.18 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: packageFrame,
          start: 'top bottom',
          end: 'bottom 40%',
          scrub: true
        }
      }
    )
  }

  reveal($('#package-title')?.closest('.mt-5'), { y: 30 })

  reveal($$('#special-package [data-package]'), {
    trigger: '#package-list',
    y: 40,
    stagger: 0.12,
    duration: 0.7
  })

  // ---------- Our Own Creation ----------
  const creation = $('#our-creation')
  const creationPanel = $('#our-creation .rounded-r-2xl')
  const roomCards = $$('#rooms-slider > a')

  if (creation && creationPanel) {
    noTransition(roomCards)

    gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: creation,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      })
      .from(creationPanel, {
        xPercent: -100,
        duration: 1,
        clearProps: 'transform'
      })
      .from(
        $$(':scope > *', creationPanel),
        {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          clearProps: 'opacity,transform'
        },
        '-=0.5'
      )
      .from(
        roomCards,
        {
          opacity: 0,
          y: 70,
          scale: 0.96,
          duration: 0.8,
          stagger: 0.12,
          clearProps: 'opacity,transform',
          onComplete: () => restoreTransition(roomCards)
        },
        '-=0.6'
      )
  }
})

window.addEventListener('load', () => ScrollTrigger.refresh())
document.fonts?.ready.then(() => ScrollTrigger.refresh())