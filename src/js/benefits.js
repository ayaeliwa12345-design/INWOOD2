import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const benefits = document.getElementById('benefits')
const prefersReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

if (benefits && !prefersReduced) {
  const title = benefits.querySelector('h2')
  const icons = gsap.utils.toArray('.benefit-icon', benefits)
  const titles = gsap.utils.toArray('.benefit-title', benefits)
  const texts = gsap.utils.toArray('.benefit-text', benefits)
  const strokes = gsap.utils.toArray(
    '.benefit-icon path, .benefit-icon circle, .benefit-icon rect',
    benefits
  )

  strokes.forEach(shape => {
    shape.setAttribute('pathLength', '1')
    gsap.set(shape, { strokeDasharray: 1, strokeDashoffset: 1 })
  })

  const intro = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: benefits,
      start: 'top 72%',
      toggleActions: 'play none none none'
    }
  })

  intro
    .from(title, {
      y: 30,
      opacity: 0,
      duration: 1.1,
      clearProps: 'opacity,transform'
    })
    .from(
      icons,
      {
        y: 26,
        scale: 0.85,
        opacity: 0,
        duration: 1,
        stagger: 0.22,
        clearProps: 'opacity,transform'
      },
      '-=0.6'
    )
    .to(
      strokes,
      {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power1.inOut',
        stagger: 0.06,
        clearProps: 'strokeDasharray,strokeDashoffset'
      },
      '<0.3'
    )
    .from(
      titles,
      {
        y: 18,
        opacity: 0,
        duration: 0.9,
        stagger: 0.22,
        clearProps: 'opacity,transform'
      },
      '-=1.2'
    )
    .from(
      texts,
      {
        y: 14,
        opacity: 0,
        duration: 0.9,
        stagger: 0.22,
        clearProps: 'opacity,transform'
      },
      '-=1.1'
    )
  const float = gsap.to(icons, {
    y: -5,
    duration: 2.8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    paused: true,
    stagger: { each: 0.45, from: 'start' }
  })

  ScrollTrigger.create({
    trigger: benefits,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: self => {
     
      if (self.isActive) {
        intro.isActive() ? intro.eventCallback('onComplete', () => float.play()) : float.play()
      } else {
        float.pause()
      }
    }
  })
}