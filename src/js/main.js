
import '../css/style.css'

// Mobile Sidebar Elements
const menuBtn = document.getElementById('menu-btn')
const closeBtn = document.getElementById('close-btn')
const mobileMenu = document.getElementById('mobile-menu')
const menuOverlay = document.getElementById('menu-overlay')

// Open Sidebar
function openMenu() {
  mobileMenu.classList.remove('translate-x-full')

  menuOverlay.classList.remove('invisible', 'opacity-0')
  menuOverlay.classList.add('visible', 'opacity-100')

  menuBtn.setAttribute('aria-expanded', 'true')
}

// Close Sidebar
function closeMenu() {
  mobileMenu.classList.add('translate-x-full')

  menuOverlay.classList.remove('visible', 'opacity-100')
  menuOverlay.classList.add('invisible', 'opacity-0')

  menuBtn.setAttribute('aria-expanded', 'false')
}

// Event Listeners
menuBtn.addEventListener('click', openMenu)
closeBtn.addEventListener('click', closeMenu)
menuOverlay.addEventListener('click', closeMenu)

// Close menu when clicking a navigation link
mobileMenu.querySelectorAll('ul a').forEach(link => {
  link.addEventListener('click', closeMenu)
})

// Close menu with Escape key
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMenu()
  }
})

// Popular Products Slider

const productsSlider = document.getElementById('products-slider')
const productsPrev = document.getElementById('products-prev')
const productsNext = document.getElementById('products-next')
const progressTrack = document.getElementById('products-progress-track')
const progressThumb = document.getElementById('products-progress-thumb')
const productsToast = document.getElementById('products-toast')

if (
  productsSlider &&
  productsPrev &&
  productsNext &&
  progressTrack &&
  progressThumb
) {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  // ---------- Progress + arrows ----------
  function updateProductsProgress() {
    const maxScroll =
      productsSlider.scrollWidth - productsSlider.clientWidth

    if (maxScroll <= 0) {
      progressThumb.style.width = '100%'
      progressThumb.style.left = '0%'
      productsPrev.disabled = true
      productsNext.disabled = true
      return
    }

    const visibleRatio =
      productsSlider.clientWidth / productsSlider.scrollWidth
    const scrollRatio = productsSlider.scrollLeft / maxScroll

    const thumbWidth = Math.max(visibleRatio * 100, 12)
    const thumbPosition = scrollRatio * (100 - thumbWidth)

    progressThumb.style.width = `${thumbWidth}%`
    progressThumb.style.left = `${thumbPosition}%`

    productsPrev.disabled = productsSlider.scrollLeft <= 1
    productsNext.disabled = productsSlider.scrollLeft >= maxScroll - 1
  }

  function getCardScrollAmount() {
    const firstCard = productsSlider.querySelector('.product-card')
    if (!firstCard) return 265

    const cardWidth = firstCard.getBoundingClientRect().width
    const gap =
      parseFloat(getComputedStyle(productsSlider).columnGap) || 0

    return cardWidth + gap
  }

  productsNext.addEventListener('click', () => {
    productsSlider.scrollBy({ left: getCardScrollAmount() })
  })

  productsPrev.addEventListener('click', () => {
    productsSlider.scrollBy({ left: -getCardScrollAmount() })
  })

  // Keyboard arrows when the slider is focused
  productsSlider.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      productsNext.click()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      productsPrev.click()
    }
  })

  productsSlider.addEventListener(
    'scroll',
    () => requestAnimationFrame(updateProductsProgress),
    { passive: true }
  )

  // Click on progress track to navigate
  progressTrack.addEventListener('click', event => {
    const rect = progressTrack.getBoundingClientRect()
    const clickRatio = (event.clientX - rect.left) / rect.width
    const maxScroll =
      productsSlider.scrollWidth - productsSlider.clientWidth

    productsSlider.scrollTo({ left: clickRatio * maxScroll })
  })

  // ---------- Drag with mouse ----------
  let isDragging = false
  let hasMoved = false
  let startX = 0
  let scrollStart = 0

  // Tailwind classes toggled during drag (snap + smooth must be off)
  const snapClasses = ['snap-x', 'snap-mandatory', 'scroll-smooth']

  function endDrag() {
    if (!isDragging) return
    isDragging = false

    productsSlider.classList.remove('cursor-grabbing')
    productsSlider.classList.add('cursor-grab')

    if (hasMoved) {
      // Snap to the nearest card smoothly
      const step = getCardScrollAmount()
      const target = Math.round(productsSlider.scrollLeft / step) * step

      productsSlider.classList.add(...snapClasses)
      productsSlider.scrollTo({ left: target })
    }
  }

  productsSlider.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    if (event.target.closest('button')) return

    isDragging = true
    hasMoved = false
    startX = event.clientX
    scrollStart = productsSlider.scrollLeft
  })

  window.addEventListener('pointermove', event => {
    if (!isDragging) return

    const distance = event.clientX - startX

    if (!hasMoved && Math.abs(distance) > 5) {
      hasMoved = true
      productsSlider.classList.remove(...snapClasses)
      productsSlider.classList.replace('cursor-grab', 'cursor-grabbing')
    }

    if (hasMoved) {
      productsSlider.scrollLeft = scrollStart - distance
    }
  })

  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)

  // Stop clicks firing right after a drag
  productsSlider.addEventListener(
    'click',
    event => {
      if (hasMoved) {
        event.preventDefault()
        event.stopPropagation()
        hasMoved = false
      }
    },
    true
  )

  // ---------- Wishlist + cart ----------
  let toastTimer
  let cartCount = 0

  function showToast(message) {
    if (!productsToast) return

    productsToast.textContent = message
    productsToast.classList.remove('translate-y-4', 'opacity-0')

    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      productsToast.classList.add('translate-y-4', 'opacity-0')
    }, 2000)
  }

  productsSlider.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]')
    if (!button) return

    const card = button.closest('.product-card')
    const name = card.querySelector('.product-name').textContent.trim()

    if (button.dataset.action === 'wishlist') {
      const isActive = button.getAttribute('aria-pressed') === 'true'
      button.setAttribute('aria-pressed', String(!isActive))
      showToast(
        isActive
          ? `${name} removed from wishlist`
          : `${name} added to wishlist`
      )
    }

    if (button.dataset.action === 'cart') {
      cartCount++
      showToast(
        `${name} added to cart (${cartCount} item${cartCount > 1 ? 's' : ''})`
      )

      // Hook for your real cart logic
      document.dispatchEvent(
        new CustomEvent('cart:add', { detail: { name } })
      )
    }
  })

  // ---------- Entrance animation (once) ----------
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const cards = [...productsSlider.querySelectorAll('.product-card')]

    cards.forEach(card => {
      card.classList.add(
        'opacity-0',
        'translate-y-6',
        'transition-[opacity,transform,box-shadow]',
        'duration-700'
      )
    })

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return

          const index = cards.indexOf(entry.target)
          entry.target.style.transitionDelay = `${index * 80}ms`
          entry.target.classList.remove('opacity-0', 'translate-y-6')
          observer.unobserve(entry.target)

          // Clear the delay so the hover shadow stays instant
          setTimeout(() => {
            entry.target.style.transitionDelay = ''
          }, 900)
        })
      },
      { threshold: 0.15 }
    )

    cards.forEach(card => observer.observe(card))
  }

  // ---------- Init ----------
  updateProductsProgress()
  window.addEventListener('resize', updateProductsProgress)
}
// Special Package

const pkgList = document.getElementById('package-list')
const pkgTrack = document.getElementById('package-progress-track')
const pkgThumb = document.getElementById('package-progress-thumb')
const pkgUp = document.getElementById('package-up')
const pkgDown = document.getElementById('package-down')

const pkgImage = document.getElementById('package-image')
const pkgTitle = document.getElementById('package-title')
const pkgPrice = document.getElementById('package-price')
const pkgStars = document.getElementById('package-stars')
const pkgDesc = document.getElementById('package-desc')
const pkgDescToggle = document.getElementById('package-desc-toggle')
const pkgAdd = document.getElementById('package-add')
const pkgAddLabel = document.getElementById('package-add-label')
const pkgExpand = document.getElementById('package-expand')

const pkgLightbox = document.getElementById('package-lightbox')
const pkgLightboxImg = document.getElementById('package-lightbox-img')
const pkgLightboxClose = document.getElementById('package-lightbox-close')
const pkgToast = document.getElementById('package-toast')

if (
  pkgList &&
  pkgTrack &&
  pkgThumb &&
  pkgUp &&
  pkgDown &&
  pkgImage &&
  pkgTitle &&
  pkgPrice &&
  pkgStars &&
  pkgDesc &&
  pkgDescToggle
) {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  const items = [...pkgList.querySelectorAll('[data-package]')]
  const fadeBlocks = document.querySelectorAll(
    '#special-package [data-fade]'
  )

  let activeItem =
    items.find(item => item.dataset.active === 'true') || items[0]

  // ---------- Stars ----------
  function renderStars(element) {
    const rating = Number(element.dataset.stars) || 0
    const size = element.dataset.size === 'lg' ? 'h-6 w-6' : 'h-3.5 w-3.5'

    element.innerHTML = Array.from({ length: 5 }, (_, index) => {
      const color = index < rating ? 'fill-[#FFC107]' : 'fill-[#D9D9D9]'

      return `<svg viewBox="0 0 24 24" class="${size} ${color}" aria-hidden="true"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/></svg>`
    }).join('')

    element.setAttribute('role', 'img')
    element.setAttribute('aria-label', `${rating} out of 5 stars`)
  }

  document
    .querySelectorAll('#special-package [data-stars]')
    .forEach(renderStars)

  // ---------- Description (See More) ----------
  function setDescription(text) {
    pkgDesc.textContent = text
    pkgDesc.classList.add('max-h-[60px]')
    pkgDesc.classList.remove('max-h-60')

    pkgDescToggle.setAttribute('aria-expanded', 'false')
    pkgDescToggle.querySelector('span').textContent = 'See More'
    pkgDescToggle.querySelector('svg').classList.remove('rotate-180')

    pkgDescToggle.classList.toggle(
      'hidden',
      pkgDesc.scrollHeight <= pkgDesc.clientHeight + 1
    )
  }

  pkgDescToggle.addEventListener('click', () => {
    const isOpen = pkgDescToggle.getAttribute('aria-expanded') === 'true'

    pkgDesc.classList.toggle('max-h-60', !isOpen)
    pkgDesc.classList.toggle('max-h-[60px]', isOpen)

    pkgDescToggle.setAttribute('aria-expanded', String(!isOpen))
    pkgDescToggle.querySelector('span').textContent = isOpen
      ? 'See More'
      : 'See Less'
    pkgDescToggle.querySelector('svg').classList.toggle('rotate-180', !isOpen)
  })

  // ---------- Select a package ----------
  function applyPackage(item) {
    pkgImage.src = item.dataset.image
    pkgImage.alt = item.dataset.title
    pkgTitle.textContent = item.dataset.title
    pkgPrice.textContent = item.dataset.price

    pkgStars.dataset.stars = item.dataset.rating
    renderStars(pkgStars)

    setDescription(item.dataset.desc)
  }

  function selectPackage(item) {
    activeItem = item

    items.forEach(element => {
      const isActive = element === item
      element.dataset.active = String(isActive)
      element.setAttribute('aria-selected', String(isActive))
    })

    if (reduceMotion) {
      applyPackage(item)
      return
    }

    fadeBlocks.forEach(block => block.classList.add('opacity-0'))

    setTimeout(() => {
      applyPackage(item)
      fadeBlocks.forEach(block => block.classList.remove('opacity-0'))
    }, 180)
  }

  // ---------- Lightbox ----------
  function openLightbox() {
    if (!pkgLightbox) return

    pkgLightboxImg.src = pkgImage.src
    pkgLightboxImg.alt = pkgImage.alt
    pkgLightbox.showModal()
  }

  if (pkgLightbox) {
    pkgExpand?.addEventListener('click', openLightbox)
    pkgLightboxClose?.addEventListener('click', () => pkgLightbox.close())

    // Click on the dark backdrop closes it
    pkgLightbox.addEventListener('click', event => {
      if (event.target === pkgLightbox) pkgLightbox.close()
    })
  }

  // ---------- List interactions ----------
  pkgList.addEventListener('click', event => {
    const item = event.target.closest('[data-package]')
    if (!item) return

    // "See More" inside a card
    const moreButton = event.target.closest('[data-toggle-more]')
    if (moreButton) {
      const text = item.querySelector('[data-more]')
      const isOpen = text.classList.toggle('max-h-40')

      text.classList.toggle('max-h-8', !isOpen)
      moreButton.setAttribute('aria-expanded', String(isOpen))
      moreButton.querySelector('span').textContent = isOpen
        ? 'See Less'
        : 'See More'
      moreButton.querySelector('svg').classList.toggle('rotate-180', isOpen)
      return
    }

    // "See Details" on the active card
    if (event.target.closest('[data-open-lightbox]')) {
      openLightbox()
      return
    }

    if (item !== activeItem) selectPackage(item)
  })

  pkgList.addEventListener('keydown', event => {
    const item = event.target.closest('[data-package]')
    if (!item || event.target !== item) return

    const index = items.indexOf(item)

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (item !== activeItem) selectPackage(item)
    }

    if (event.key === 'ArrowDown' && items[index + 1]) {
      event.preventDefault()
      items[index + 1].focus()
    }

    if (event.key === 'ArrowUp' && items[index - 1]) {
      event.preventDefault()
      items[index - 1].focus()
    }
  })

  // ---------- Vertical progress + arrows ----------
  function updatePackageRail() {
    const maxScroll = pkgList.scrollHeight - pkgList.clientHeight

    if (maxScroll <= 0) {
      pkgThumb.style.height = '100%'
      pkgThumb.style.top = '0%'
      pkgUp.disabled = true
      pkgDown.disabled = true
      return
    }

    const visibleRatio = pkgList.clientHeight / pkgList.scrollHeight
    const scrollRatio = pkgList.scrollTop / maxScroll

    const thumbHeight = Math.max(visibleRatio * 100, 12)
    const thumbTop = scrollRatio * (100 - thumbHeight)

    pkgThumb.style.height = `${thumbHeight}%`
    pkgThumb.style.top = `${thumbTop}%`

    pkgUp.disabled = pkgList.scrollTop <= 1
    pkgDown.disabled = pkgList.scrollTop >= maxScroll - 1
  }

  function getPackageScrollAmount() {
    const firstItem = items[0]
    if (!firstItem) return 120

    const gap = parseFloat(getComputedStyle(pkgList).rowGap) || 0
    return firstItem.getBoundingClientRect().height + gap
  }

  pkgDown.addEventListener('click', () => {
    pkgList.scrollBy({ top: getPackageScrollAmount() })
  })

  pkgUp.addEventListener('click', () => {
    pkgList.scrollBy({ top: -getPackageScrollAmount() })
  })

  pkgList.addEventListener(
    'scroll',
    () => requestAnimationFrame(updatePackageRail),
    { passive: true }
  )

  pkgTrack.addEventListener('click', event => {
    const rect = pkgTrack.getBoundingClientRect()
    const clickRatio = (event.clientY - rect.top) / rect.height
    const maxScroll = pkgList.scrollHeight - pkgList.clientHeight

    pkgList.scrollTo({ top: clickRatio * maxScroll })
  })

  // ---------- Add to cart ----------
  let toastTimer

  function showPackageToast(message) {
    if (!pkgToast) return

    pkgToast.textContent = message
    pkgToast.classList.remove('translate-y-4', 'opacity-0')

    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      pkgToast.classList.add('translate-y-4', 'opacity-0')
    }, 2000)
  }

  pkgAdd?.addEventListener('click', () => {
    const name = pkgTitle.textContent.trim()

    pkgAddLabel.textContent = 'Added'
    setTimeout(() => {
      pkgAddLabel.textContent = 'Add to cart'
    }, 1500)

    showPackageToast(`${name} added to cart`)

    document.dispatchEvent(
      new CustomEvent('package:add', {
        detail: { name, price: pkgPrice.textContent.trim() }
      })
    )
  })

  // ---------- Init ----------
  setDescription(pkgDesc.textContent.trim())
  updatePackageRail()
  window.addEventListener('resize', updatePackageRail)
}


// Our Own Creation (Rooms Slider)


const roomsSlider = document.getElementById('rooms-slider')
const roomsPrev = document.getElementById('rooms-prev')
const roomsNext = document.getElementById('rooms-next')
const roomsTrack = document.getElementById('rooms-progress-track')
const roomsThumb = document.getElementById('rooms-progress-thumb')

if (roomsSlider && roomsPrev && roomsNext && roomsTrack && roomsThumb) {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  const maxScroll = () =>
    roomsSlider.scrollWidth - roomsSlider.clientWidth

  // ---------- Smooth scroll engine ----------
  let rafId = null
  let targetX = 0

  function cancelMotion() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const easeInOutCubic = t =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  function animateScrollTo(target, duration = 650) {
    cancelMotion()

    targetX = Math.max(0, Math.min(target, maxScroll()))
    const start = roomsSlider.scrollLeft
    const distance = targetX - start

    if (reduceMotion || Math.abs(distance) < 1) {
      roomsSlider.scrollLeft = targetX
      return
    }

    const startTime = performance.now()

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      roomsSlider.scrollLeft = start + distance * easeInOutCubic(progress)

      rafId = progress < 1 ? requestAnimationFrame(frame) : null
    }

    rafId = requestAnimationFrame(frame)
  }

  function getStep() {
    const firstCard = roomsSlider.querySelector('a')
    if (!firstCard) return 300

    const gap = parseFloat(getComputedStyle(roomsSlider).columnGap) || 0
    return firstCard.getBoundingClientRect().width + gap
  }

  // ---------- Arrows ----------
  function moveBy(direction) {
    // Quick repeated clicks add up instead of restarting
    const base = rafId ? targetX : roomsSlider.scrollLeft
    animateScrollTo(base + direction * getStep())
  }

  roomsNext.addEventListener('click', () => moveBy(1))
  roomsPrev.addEventListener('click', () => moveBy(-1))

  roomsSlider.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveBy(1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveBy(-1)
    }
  })

  // ---------- Progress ----------
  function updateRoomsProgress() {
    const max = maxScroll()

    if (max <= 0) {
      roomsThumb.style.width = '100%'
      roomsThumb.style.left = '0%'
      roomsPrev.disabled = true
      roomsNext.disabled = true
      return
    }

    const visibleRatio = roomsSlider.clientWidth / roomsSlider.scrollWidth
    const scrollRatio = roomsSlider.scrollLeft / max

    const thumbWidth = Math.max(visibleRatio * 100, 18)
    const thumbPosition = scrollRatio * (100 - thumbWidth)

    roomsThumb.style.width = `${thumbWidth}%`
    roomsThumb.style.left = `${thumbPosition}%`

    roomsPrev.disabled = roomsSlider.scrollLeft <= 1
    roomsNext.disabled = roomsSlider.scrollLeft >= max - 1
  }

  roomsSlider.addEventListener(
    'scroll',
    () => requestAnimationFrame(updateRoomsProgress),
    { passive: true }
  )

  roomsTrack.addEventListener('click', event => {
    const rect = roomsTrack.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width

    animateScrollTo(ratio * maxScroll(), 800)
  })

  // ---------- Drag with momentum ----------
  let isDown = false
  let hasMoved = false
  let startX = 0
  let startLeft = 0
  let lastX = 0
  let lastTime = 0
  let velocity = 0

  function startMomentum() {
    let last = performance.now()

    function step(now) {
      const dt = now - last
      last = now

      const before = roomsSlider.scrollLeft
      roomsSlider.scrollLeft += velocity * dt
      velocity *= Math.pow(0.94, dt / 16)

      const hitEdge = roomsSlider.scrollLeft === before
      rafId =
        Math.abs(velocity) > 0.02 && !hitEdge
          ? requestAnimationFrame(step)
          : null
    }

    rafId = requestAnimationFrame(step)
  }

  roomsSlider.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return

    cancelMotion()
    isDown = true
    hasMoved = false
    startX = event.clientX
    startLeft = roomsSlider.scrollLeft
    lastX = event.clientX
    lastTime = performance.now()
    velocity = 0
  })

  window.addEventListener('pointermove', event => {
    if (!isDown) return

    const distance = event.clientX - startX

    if (!hasMoved && Math.abs(distance) > 5) {
      hasMoved = true
      roomsSlider.classList.replace('cursor-grab', 'cursor-grabbing')
    }

    if (!hasMoved) return

    roomsSlider.scrollLeft = startLeft - distance

    const now = performance.now()
    const dt = now - lastTime

    if (dt > 0) {
      const instant = (lastX - event.clientX) / dt
      velocity = velocity * 0.7 + instant * 0.3
      lastX = event.clientX
      lastTime = now
    }
  })

  function endDrag() {
    if (!isDown) return
    isDown = false

    roomsSlider.classList.replace('cursor-grabbing', 'cursor-grab')

    // Only glide if the pointer was still moving when released
    if (hasMoved && performance.now() - lastTime < 80 && !reduceMotion) {
      startMomentum()
    }
  }

  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)

  // Stop the link from opening right after a drag
  roomsSlider.addEventListener(
    'click',
    event => {
      if (hasMoved) {
        event.preventDefault()
        event.stopPropagation()
        hasMoved = false
      }
    },
    true
  )

  // Wheel or touch should always win over a running animation
  roomsSlider.addEventListener('wheel', cancelMotion, { passive: true })
  roomsSlider.addEventListener('touchstart', cancelMotion, { passive: true })

  // ---------- Init ----------
  updateRoomsProgress()
  window.addEventListener('resize', updateRoomsProgress)
}




// ..............................................

import './animations.js'
import './testimonials.js'
import './newsletter.js'
import './footer.js'
import './categories.js'
import './header.js'