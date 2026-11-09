import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const footer = document.getElementById('footer')

if (footer) {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  const year = document.getElementById('footer-year')
  if (year) year.textContent = new Date().getFullYear()

  // ---------- Back to top ----------
  const backToTop = document.getElementById('back-to-top')

  backToTop?.addEventListener('click', () => {
    if (prefersReduced) {
      window.scrollTo(0, 0)
      return
    }

    gsap.to(window, {
      scrollTo: 0,
      duration: 1.4,
      ease: 'power3.inOut'
    })
  })

  // ---------- Entrance ----------
  if (!prefersReduced) {
    const cols = gsap.utils.toArray('.footer-col', footer)
    const bottom = footer.querySelector('.footer-bottom')

    gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: footer,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      })
      .from(cols, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        clearProps: 'opacity,transform'
      })
      .from(
        bottom,
        {
          y: 20,
          opacity: 0,
          duration: 0.8,
          clearProps: 'opacity,transform'
        },
        '-=0.4'
      )
  }
}