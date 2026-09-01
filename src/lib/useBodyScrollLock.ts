import { useEffect } from 'react'

// Locks background scroll while a fullscreen overlay (modal/sheet) is open,
// so dragging inside it on iOS Safari doesn't rubber-band the page behind it.
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const { overflow, position, top, width } = document.body.style
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = overflow
      document.body.style.position = position
      document.body.style.top = top
      document.body.style.width = width
      window.scrollTo(0, scrollY)
    }
  }, [active])
}
