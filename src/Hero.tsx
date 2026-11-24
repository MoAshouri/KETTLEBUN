import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Icon } from './Icons'

const BurgerScene = lazy(() => import('./BurgerScene'))
const motionQuery = '(prefers-reduced-motion: reduce)'
const staticBurger = `${import.meta.env.BASE_URL}burger-static.webp`

function supportsWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch {
    return false
  }
}

class SceneBoundary extends Component<PropsWithChildren<{ onFailure: () => void }>, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFailure()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Hero({ onReady }: { onReady: () => void }) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(motionQuery).matches)
  const [available, setAvailable] = useState<boolean | undefined>(() => window.matchMedia(motionQuery).matches ? undefined : supportsWebGL())
  const animated = !reducedMotion && available === true
  const [sceneReady, setSceneReady] = useState(false)
  const track = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const showScene = useCallback(() => {
    setSceneReady(true)
    onReady()
  }, [onReady])
  const useFallback = useCallback(() => setAvailable(false), [])

  useEffect(() => {
    const query = window.matchMedia(motionQuery)
    const update = () => {
      setReducedMotion(query.matches)
      if (!query.matches) setAvailable((current) => current ?? supportsWebGL())
    }
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!animated) onReady()
  }, [animated, onReady])

  useLayoutEffect(() => {
    const element = pin.current
    if (!animated || !element) return
    const sizePin = () => {
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
      element.style.setProperty('--pin-top', `${Math.min(header, window.innerHeight - element.offsetHeight)}px`)
    }
    sizePin()
    const observer = new ResizeObserver(sizePin)
    observer.observe(element)
    window.addEventListener('resize', sizePin)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sizePin)
    }
  }, [animated])

  return (
    <section id="home" ref={track} className={`home${animated ? ' home--animated' : ''}`} aria-labelledby="welcome-title">
      <div className="hero-pin" ref={pin}>
        <div className="shell hero-layout">
          <div className="hero-copy">
            <p className="eyebrow"><span /> BURGERS &amp; TEA</p>
            <h1 id="welcome-title">Stacked<br className="hero-break" /> fresh. <em>Brewed slow.</em></h1>
            <p className="hero-description">Hot-off-the-griddle burgers and slow-brewed house tea. Welcome to Kettle &amp; Bun.</p>
            <a className="button hero-button" href="#menu">View Menu</a>
          </div>
          <div className="hero-stage" ref={stage} role="img" aria-label={animated ? 'The Classic Smash. Seven floating layers assemble as you scroll: bottom bun, beef patty, cheddar, pickles, tomato, lettuce and sesame top bun.' : 'The Classic Smash with a sesame bun, lettuce, tomato, pickles, cheddar and grilled beef.'}>
            <div className="stage-frame" aria-hidden="true" />
            <div className="stage-orbits" aria-hidden="true" />
            <span className="stage-name" aria-hidden="true">THE CLASSIC SMASH</span>
            <span className="stage-spark" aria-hidden="true">✦</span>
            <span className="stage-spark stage-spark--small" aria-hidden="true">✦</span>
            <div className="stage-product" aria-hidden="true">
              {(!animated || !sceneReady) && <img className="burger-static" src={staticBurger} alt="" fetchPriority="high" />}
              {animated && <SceneBoundary onFailure={useFallback}>
                <Suspense fallback={null}>
                  <BurgerScene track={track} pin={pin} stage={stage} onReady={showScene} onFailure={useFallback} />
                </Suspense>
              </SceneBoundary>}
            </div>
            {animated && <span className="stage-hint" aria-hidden="true"><Icon name="down" size={14} /> SCROLL TO STACK</span>}
          </div>
        </div>
      </div>
    </section>
  )
}
