import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const section = document.getElementById('testimonials')
const viewport = document.getElementById('testimonials-viewport')
const track = document.getElementById('testimonials-track')
const progressBar = document.getElementById('testimonials-progress')
const countLabel = document.getElementById('testimonials-count')
const prevBtn = document.getElementById('testimonials-prev')
const nextBtn = document.getElementById('testimonials-next')
const arrows = document.getElementById('testimonials-arrows')

if (section && viewport && track && progressBar) {
  const cards = gsap.utils.toArray('.testimonial-card', track)
  const total = cards.length
  const pad = n => String(n).padStart(2, '0')

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const getDistance = () =>
      Math.max(0, track.scrollWidth - window.innerWidth)

    let currentIndex = 0

    function updateUI(progress) {
      currentIndex = Math.round(progress * (total - 1))

      countLabel.textContent = `${pad(currentIndex + 1)} / ${pad(total)}`
      prevBtn.disabled = currentIndex <= 0
      nextBtn.disabled = currentIndex >= total - 1
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => updateUI(self.progress),
        onRefresh: self => updateUI(self.progress)
      }
    })

    tl.fromTo(progressBar, { scaleX: 0 }, { scaleX: 1 }, 0).to(
      track,
      { x: () => -getDistance() },
      0
    )

    function goTo(index) {
      const st = tl.scrollTrigger
      const safe = gsap.utils.clamp(0, total - 1, index)
      const y = st.start + (safe / (total - 1)) * (st.end - st.start)

      gsap.to(window, {
        scrollTo: y,
        duration: 1,
        ease: 'power2.inOut',
        overwrite: true
      })
    }

    const onPrev = () => goTo(currentIndex - 1)
    const onNext = () => goTo(currentIndex + 1)

    prevBtn.addEventListener('click', onPrev)
    nextBtn.addEventListener('click', onNext)


    gsap.from('#testimonials-header > *', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.15,
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: section, start: 'top 80%', once: true }
    })

    gsap.from(cards, {
      y: 50,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.12,
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: section, start: 'top 70%', once: true }
    })

    updateUI(0)

    return () => {
      prevBtn.removeEventListener('click', onPrev)
      nextBtn.removeEventListener('click', onNext)
    }
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    section.style.height = 'auto'
    section.style.minHeight = '0'
    section.style.paddingBlock = '4rem'
    viewport.style.overflowX = 'auto'
    if (arrows) arrows.style.display = 'none'

    return () => {
      section.removeAttribute('style')
      viewport.removeAttribute('style')
      if (arrows) arrows.removeAttribute('style')
    }
  })

  window.addEventListener('load', () => ScrollTrigger.refresh())
}