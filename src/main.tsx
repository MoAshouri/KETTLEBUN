import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Hero } from './Hero'
import { Icon, Teapot } from './Icons'
import { Menu } from './Menu'
import { Receipt } from './Receipt'
import { cafeName, money, readOrder, saveOrder, summarize } from './order'
import type { ItemId } from './catalog'
import './styles.css'

function App() {
  const [order, setOrder] = useState(readOrder)
  const [heroReady, setHeroReady] = useState(false)
  const [loading, setLoading] = useState(!window.location.hash)
  const [section, setSection] = useState<'home' | 'menu'>(/^#menu(?:-|$)/.test(window.location.hash) ? 'menu' : 'home')
  const menuSection = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const review = useRef<HTMLButtonElement>(null)
  const openedAt = useRef(performance.now())
  const summary = summarize(order)
  const ready = useCallback(() => setHeroReady(true), [])

  useEffect(() => {
    const deadline = window.setTimeout(() => setLoading(false), 1800)
    return () => window.clearTimeout(deadline)
  }, [])

  useEffect(() => {
    if (!heroReady) return
    const timer = window.setTimeout(() => setLoading(false), Math.max(0, 440 - (performance.now() - openedAt.current)))
    return () => window.clearTimeout(timer)
  }, [heroReady])

  useEffect(() => saveOrder(order), [order])

  useEffect(() => {
    const element = menuSection.current
    if (!element) return
    const update = () => setSection(element.getBoundingClientRect().top < window.innerHeight * 0.48 ? 'menu' : 'home')
    const initial = requestAnimationFrame(() => {
      const destination = document.getElementById(window.location.hash.slice(1))
      if (destination && element.contains(destination)) destination.scrollIntoView({ behavior: 'instant' })
      update()
    })
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(initial)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  function changeQuantity(id: ItemId, difference: number) {
    setOrder((current) => ({
      ...current,
      quantities: { ...current.quantities, [id]: Math.max(0, (current.quantities[id] ?? 0) + difference) },
    }))
  }

  return (
    <>
      <a className="skip-link" href="#menu">Skip to menu</a>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#home" aria-label={`${cafeName} home`}><span className="brand-icon"><Teapot /></span><span>Kettle <i>&amp;</i> Bun</span></a>
          <nav aria-label="Main navigation">
            <a href="#home" aria-current={section === 'home' ? 'location' : undefined}>Home</a>
            <a href="#menu" aria-current={section === 'menu' ? 'location' : undefined}>Menu</a>
          </nav>
        </div>
      </header>
      <main>
        <Hero onReady={ready} />
        <Menu section={menuSection} quantities={order.quantities} changeQuantity={changeQuantity} />
      </main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <span className="wordmark"><span className="brand-icon"><Teapot /></span><span>Kettle <i>&amp;</i> Bun</span></span>
          <a href="#home">Back to top</a>
        </div>
      </footer>
      {summary.count > 0 && <button className="review-button" type="button" ref={review} onClick={() => dialog.current?.showModal()}>
        <span className="review-icon"><Icon name="bag" /></span>
        <span className="review-label"><strong>Review Order</strong><span>{summary.count} {summary.count === 1 ? 'item' : 'items'}</span></span>
        <strong className="review-price">{money(summary.total)}</strong>
      </button>}
      <Receipt dialog={dialog} summary={summary} order={order} onNotesChange={(notes) => setOrder((current) => ({ ...current, notes }))} onClose={() => review.current?.focus({ preventScroll: true })} />
      <div className={`loader${loading ? '' : ' loader--done'}`} aria-hidden={!loading}>
        <div role="status"><Teapot ceramic /><span>Brewing up the café…</span></div>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
