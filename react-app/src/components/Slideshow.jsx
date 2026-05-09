import { useState, useEffect, useRef } from 'react';
import { useLightbox } from './LightboxContext';

export default function Slideshow({ stop }) {
  const gallery = stop?.media?.gallery || [];
  const [idx, setIdx] = useState(0);
  const lightbox = useLightbox();
  const ref = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => { setIdx(0); }, [stop?.id]);

  if (!gallery.length) return null;
  const total = gallery.length;
  const go = (n) => setIdx((n + total) % total);

  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') { go(idx - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); }
  }

  return (
    <div
      className="slideshow"
      ref={ref}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="slideshow__overline">
        <p className="overline">Slideshow · {total} images</p>
        <span className="slideshow__overline-meta">
          <span className="slideshow__counter">
            <span data-counter-current>{idx + 1}</span> / {total}
          </span>
          <button
            type="button"
            className="slideshow__open-fullscreen"
            onClick={() => lightbox.open(stop, idx)}
            aria-label="Open slideshow full-screen"
          >
            <span className="slideshow__open-fullscreen-icon" aria-hidden="true">⛶</span>
            <span className="slideshow__open-fullscreen-label">Full screen</span>
          </button>
        </span>
      </div>

      <ol className="slideshow__track">
        {gallery.map((g, i) => (
          <li key={i} className={'slideshow__slide' + (i === idx ? ' is-active' : '')} data-index={i}>
            <button
              type="button"
              className="slideshow__image-btn"
              onClick={() => lightbox.open(stop, i)}
              aria-label={`Zoom image ${i + 1}`}
            >
              <img src={g.url} alt={g.alt || stop.title} loading="lazy" />
            </button>
            <div className="slideshow__caption">
              {g.note && <p className="slideshow__note">{g.note}</p>}
              <p className="slideshow__credit">
                {g.credit || ''}
                {g.source_url && ' '}
                {g.source_url && <a href={g.source_url} target="_blank" rel="noopener">↗</a>}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="slideshow__controls">
        <button className="slideshow__nav slideshow__nav--prev" onClick={() => go(idx - 1)} aria-label="Previous image">‹</button>
        <div className="slideshow__dots" role="tablist">
          {gallery.map((_, i) => (
            <button
              key={i}
              className={'slideshow__dot' + (i === idx ? ' is-active' : '')}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="slideshow__nav slideshow__nav--next" onClick={() => go(idx + 1)} aria-label="Next image">›</button>
      </div>
    </div>
  );
}
