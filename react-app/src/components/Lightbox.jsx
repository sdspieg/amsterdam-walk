import { useEffect, useRef } from 'react';
import { useLightbox } from './LightboxContext';

export default function Lightbox() {
  const { isOpen, stop, index, close, setIndex } = useLightbox();
  const stageRef = useRef(null);
  const touchStart = useRef(null);
  const gallery = stop?.media?.gallery || [];
  const total = gallery.length;
  const item = gallery[index];

  /* Keyboard */
  useEffect(() => {
    if (!isOpen) return;
    function onKey(ev) {
      if (ev.key === 'Escape') { close(); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft') { setIndex((index - 1 + total) % total); ev.preventDefault(); }
      else if (ev.key === 'ArrowRight') { setIndex((index + 1) % total); ev.preventDefault(); }
      else if (ev.key === 'f' || ev.key === 'F') { toggleFullscreen(); ev.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, index, total]);

  function toggleFullscreen() {
    const el = stageRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      const r = el.requestFullscreen || el.webkitRequestFullscreen;
      r?.call(el).catch(() => {});
    } else {
      const x = document.exitFullscreen || document.webkitExitFullscreen;
      x?.call(document);
    }
  }

  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) setIndex((index + (dx < 0 ? 1 : -1) + total) % total);
    else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) close();
    touchStart.current = null;
  }

  if (!isOpen || !stop) return null;

  return (
    <div className="lightbox is-open" role="dialog" aria-modal="true" aria-label="Fullscreen slideshow">
      <header className="lightbox__bar">
        <button className="lightbox__close" onClick={close} aria-label="Close and resume the walk">
          <span className="lightbox__close-arrow" aria-hidden="true">←</span>
          <span className="lightbox__close-label">Back to the walk</span>
        </button>
        <div className="lightbox__title">{stop.title}</div>
        <div className="lightbox__bar-actions">
          <span className="lightbox__counter">
            <span>{index + 1}</span>
            <span className="lightbox__counter-sep">/</span>
            <span>{total}</span>
          </span>
          <button className="lightbox__icon-btn" onClick={toggleFullscreen} aria-label="Toggle browser fullscreen" title="Browser fullscreen">
            <span aria-hidden="true">⛶</span>
          </button>
        </div>
      </header>

      <div className="lightbox__stage" ref={stageRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button className="lightbox__nav lightbox__nav--prev" onClick={() => setIndex((index - 1 + total) % total)} aria-label="Previous">‹</button>
        <figure className="lightbox__figure">
          {item && <img className="lightbox__img" src={item.url} alt={item.alt || stop.title} />}
        </figure>
        <button className="lightbox__nav lightbox__nav--next" onClick={() => setIndex((index + 1) % total)} aria-label="Next">›</button>
      </div>

      <footer className="lightbox__caption">
        {item?.note && <p className="lightbox__note">{item.note}</p>}
        <p className="lightbox__credit">
          {item?.credit || ''}
          {item?.source_url && (
            <>
              {' · '}
              <a href={item.source_url} target="_blank" rel="noopener">view source ↗</a>
            </>
          )}
        </p>
      </footer>
    </div>
  );
}
