import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const section = document.getElementById('newsletter')
const form = document.getElementById('newsletter-form')
const emailInput = document.getElementById('newsletter-email')
const message = document.getElementById('newsletter-message')
const submitBtn = document.getElementById('newsletter-submit')
const submitLabel = document.getElementById('newsletter-submit-label')

if (section && form && emailInput && message && submitBtn) {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  // ---------- Entrance + parallax ----------
  if (!prefersReduced) {
    const image = document.getElementById('newsletter-image')
    const photo = section.querySelector('.newsletter-img')
    const items = gsap.utils.toArray('.newsletter-item', section)

    gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      })
      .from(image, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1.2,
        ease: 'power3.inOut',
        clearProps: 'clipPath'
      })
      .from(
        items,
        {
          y: 26,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          clearProps: 'opacity,transform'
        },
        '-=0.6'
      )


    if (photo) {
      gsap.fromTo(
        photo,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      )
    }
  }

  // ---------- Validation + submit ----------
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  function setMessage(text, type = 'info') {
    const colors = {
      info: 'text-primary/70',
      error: 'text-rose-500',
      success: 'text-emerald-700'
    }

    message.textContent = text
    message.className = `mt-3 min-h-[1.25rem] text-xs transition-colors ${colors[type]}`
  }

  function setInvalid(isInvalid) {
    emailInput.setAttribute('aria-invalid', String(isInvalid))
  }

  function shake() {
    if (prefersReduced) return

    gsap.fromTo(
      emailInput,
      { x: -6 },
      { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)', clearProps: 'transform' }
    )
  }

  emailInput.addEventListener('input', () => {
    setInvalid(false)
    if (message.textContent) setMessage('')
  })

  form.addEventListener('submit', async event => {
    event.preventDefault()

    const email = emailInput.value.trim()

    if (!email) {
      setInvalid(true)
      setMessage('Please enter your email address.', 'error')
      shake()
      emailInput.focus()
      return
    }

    if (!emailPattern.test(email)) {
      setInvalid(true)
      setMessage('That email doesn’t look right. Please check it.', 'error')
      shake()
      emailInput.focus()
      return
    }

    submitBtn.disabled = true
    submitLabel.textContent = 'Sending...'

    try {

      await new Promise(resolve => setTimeout(resolve, 900))

      document.dispatchEvent(
        new CustomEvent('newsletter:subscribe', { detail: { email } })
      )

      form.reset()
      setInvalid(false)
      setMessage('Thank you! You’re subscribed.', 'success')
      submitLabel.textContent = 'Subscribed'

      setTimeout(() => {
        submitLabel.textContent = 'Subscribe'
        submitBtn.disabled = false
      }, 2500)
    } catch {
      setMessage('Something went wrong. Please try again.', 'error')
      submitLabel.textContent = 'Subscribe'
      submitBtn.disabled = false
    }
  })
}