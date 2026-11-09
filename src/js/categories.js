import gsap from 'gsap'

const section = document.getElementById('categories')
const searchInput = document.getElementById('category-search')
const list = document.getElementById('category-list')
const grid = document.getElementById('category-grid')
const noResults = document.getElementById('no-results')
const allButton = document.getElementById('all-categories')

const track = document.getElementById('category-progress-track')
const thumb = document.getElementById('category-progress-thumb')
const upBtn = document.getElementById('category-up')
const downBtn = document.getElementById('category-down')

if (section && searchInput && list && grid && noResults) {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  const filterButtons = [...list.querySelectorAll('.category-filter')]
  const cards = [...grid.querySelectorAll('.category-card')]

  let activeFilter = ''
  let query = ''

  const normalize = text => text.trim().toLowerCase()

  // ---------- Filtering ----------
  function cardMatches(name) {
    const value = normalize(name)

    return (
      (!activeFilter || value === normalize(activeFilter)) &&
      (!query || value.includes(query))
    )
  }

  function applyFilters() {
    const visibleCards = []

    cards.forEach(card => {
      const show = cardMatches(card.dataset.category)
      card.classList.toggle('hidden', !show)
      if (show) visibleCards.push(card)
    })

    filterButtons.forEach(button => {
      const name = normalize(button.dataset.filter)
      const inSearch = !query || name.includes(query)
      const isActive = !!activeFilter && name === normalize(activeFilter)

      button.parentElement.classList.toggle('hidden', !inSearch)
      button.dataset.active = String(isActive)
      button.setAttribute('aria-pressed', String(isActive))
    })

    noResults.classList.toggle('hidden', visibleCards.length > 0)

    grid.scrollTo({ top: 0 })
    list.scrollTo({ top: 0, left: 0 })
    updateRail()

    if (!prefersReduced && visibleCards.length) {
      
      visibleCards.forEach(card => (card.dataset.revealed = '1'))

      gsap.fromTo(
        visibleCards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
          clearProps: 'opacity,transform'
        }
      )
    }

    document.dispatchEvent(
      new CustomEvent('category:change', {
        detail: {
          category: activeFilter || 'all',
          query,
          count: visibleCards.length
        }
      })
    )
  }

  // ---------- Events ----------
  searchInput.addEventListener('input', () => {
    query = normalize(searchInput.value)
    activeFilter = ''
    applyFilters()
  })

  list.addEventListener('click', event => {
    const button = event.target.closest('.category-filter')
    if (!button) return

    const name = button.dataset.filter
    activeFilter = normalize(activeFilter) === normalize(name) ? '' : name
    applyFilters()
  })

  list.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return

    const visible = filterButtons.filter(
      button => !button.parentElement.classList.contains('hidden')
    )
    const index = visible.indexOf(document.activeElement)
    if (index === -1) return

    event.preventDefault()
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1
    visible[next]?.focus()
  })

  allButton?.addEventListener('click', () => {
    activeFilter = ''
    query = ''
    searchInput.value = ''
    applyFilters()
  })

  // ---------- Vertical progress + arrows ----------
  function updateRail() {
    if (!track || !thumb) return

    const maxScroll = list.scrollHeight - list.clientHeight

    if (maxScroll <= 1) {
      thumb.style.height = '100%'
      thumb.style.top = '0%'
      if (upBtn) upBtn.disabled = true
      if (downBtn) downBtn.disabled = true
      return
    }

    const visibleRatio = list.clientHeight / list.scrollHeight
    const scrollRatio = list.scrollTop / maxScroll

    const thumbHeight = Math.max(visibleRatio * 100, 14)
    const thumbTop = scrollRatio * (100 - thumbHeight)

    thumb.style.height = `${thumbHeight}%`
    thumb.style.top = `${thumbTop}%`

    if (upBtn) upBtn.disabled = list.scrollTop <= 1
    if (downBtn) downBtn.disabled = list.scrollTop >= maxScroll - 1
  }

  function getStep() {
    const item = list.querySelector('li:not(.hidden)')
    if (!item) return 120

    const gap = parseFloat(getComputedStyle(list).rowGap) || 0
    return (item.getBoundingClientRect().height + gap) * 3
  }

  upBtn?.addEventListener('click', () => {
    list.scrollBy({ top: -getStep(), behavior: 'smooth' })
  })

  downBtn?.addEventListener('click', () => {
    list.scrollBy({ top: getStep(), behavior: 'smooth' })
  })

  list.addEventListener(
    'scroll',
    () => requestAnimationFrame(updateRail),
    { passive: true }
  )

  track?.addEventListener('click', event => {
    const rect = track.getBoundingClientRect()
    const ratio = (event.clientY - rect.top) / rect.height
    const maxScroll = list.scrollHeight - list.clientHeight

    list.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' })
  })

  grid.addEventListener(
    'scroll',
    () => {
      const pending = cards.filter(
        card => !card.dataset.revealed && !card.classList.contains('hidden')
      )
      if (!pending.length) return

      pending.forEach(card => (card.dataset.revealed = '1'))

      gsap.to(pending, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.06,
        overwrite: 'auto',
        clearProps: 'opacity,transform'
      })
    },
    { passive: true }
  )

  // ---------- Init ----------
  updateRail()
  window.addEventListener('resize', updateRail)
}