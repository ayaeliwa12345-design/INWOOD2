import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const header = document.getElementById('site-header')

if (header) {

  const THRESHOLD = 24

  function updateHeader() {
    header.dataset.scrolled = String(window.scrollY > THRESHOLD)
  }

  updateHeader()
  window.addEventListener('scroll', updateHeader, { passive: true })


  const cartBadges = [...document.querySelectorAll('[data-cart-count]')]
  const cartLinks = [...document.querySelectorAll('[data-cart-link]')]
  let cartCount = 0

  function bumpCart() {
    cartCount++

    cartBadges.forEach(badge => {
      badge.textContent = cartCount > 99 ? '99+' : String(cartCount)
      badge.classList.remove('scale-0', 'opacity-0')

      gsap.fromTo(
        badge,
        { scale: 1.5 },
        { scale: 1, duration: 0.4, ease: 'back.out(2)', clearProps: 'transform' }
      )
    })

    cartLinks.forEach(link =>
      link.setAttribute(
        'aria-label',
        `Shopping Cart, ${cartCount} item${cartCount > 1 ? 's' : ''}`
      )
    )
  }

  document.addEventListener('cart:add', bumpCart)
  document.addEventListener('package:add', bumpCart)

  const menuBtn = document.getElementById('menu-btn')
  const closeBtn = document.getElementById('close-btn')

  document.querySelectorAll('[data-search-link]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById('categories')
      const input = document.getElementById('category-search')
      if (!target) return

      event.preventDefault()

      if (menuBtn?.getAttribute('aria-expanded') === 'true') {
        closeBtn?.click()
      }

      gsap.to(window, {
        scrollTo: { y: target, offsetY: 80 },
        duration: 1.1,
        ease: 'power3.inOut',
        onComplete: () => input?.focus({ preventScroll: true })
      })
    })
  })
}