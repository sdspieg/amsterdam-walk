import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stops } from '../data';
import title from '../data/title.json';

export default function Hero() {
  const [titleModalOpen, setTitleModalOpen] = useState(false);

  useEffect(() => {
    function onKey(ev) { if (ev.key === 'Escape' && titleModalOpen) { setTitleModalOpen(false); ev.preventDefault(); } }
    if (titleModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [titleModalOpen]);

  return (
    <header className="hero" role="banner">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />
      <div className="hero__lines" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <div className="hero__inner">
        <p className="overline overline--gold">A walking guide</p>
        <h1 className="hero__title hero__title--inline">
          <em>Even</em> <span className="hero__title-em">Here</span><span className="hero__title-ellipsis" aria-hidden="true">…</span>
        </h1>
        <p className="hero__subtitle">{title.subtitle}</p>

        <button
          type="button"
          className="hero__title-info"
          onClick={() => setTitleModalOpen(true)}
          aria-label="Read why this title"
        >
          <span aria-hidden="true">ⓘ</span>
          <span>Why “Even Here”?</span>
        </button>

        <div className="hero__meta" aria-label="Walk overview">
          <span className="hero__meta-item"><span className="hero__meta-value">{stops.length}</span> stops</span>
          <span className="hero__meta-divider" aria-hidden="true">·</span>
          <span className="hero__meta-item"><span className="hero__meta-value">≈ 4</span> km</span>
          <span className="hero__meta-divider" aria-hidden="true">·</span>
          <span className="hero__meta-item"><span className="hero__meta-value">2 — 3</span> hours</span>
        </div>

        <div className="hero__cta-row">
          <Link className="cta cta--primary" to={`/stop/${stops[0]?.id}`}>
            Begin the walk <span className="cta__arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="cta cta--secondary" to="/intro">▷ Watch video</Link>
          <Link className="cta cta--secondary" to="/map">Open the map</Link>
        </div>
      </div>

      <div className="hero__chrome">
        <span className="hero__chrome-text">Amsterdam · 1940 — 1945 · ad memoriam</span>
        <span className="hero__chrome-pulse" aria-hidden="true" />
      </div>

      {titleModalOpen && (
        <div className="title-modal" role="dialog" aria-modal="true" aria-labelledby="title-modal-heading"
             onClick={(ev) => { if (ev.target.classList.contains('title-modal')) setTitleModalOpen(false); }}>
          <article className="title-modal__panel">
            <header className="title-modal__header">
              <p className="overline">About the title</p>
              <h2 id="title-modal-heading">{title.modal.heading}</h2>
              <button type="button" className="title-modal__close" onClick={() => setTitleModalOpen(false)} aria-label="Close">×</button>
            </header>
            {title.modal.sections.map((sec, i) => (
              <section key={i} className="title-modal__section">
                <h3 className="title-modal__section-heading">{sec.heading}</h3>
                {sec.body.split('\n\n').map((para, j) => (
                  <p key={j} className="title-modal__body">{para}</p>
                ))}
              </section>
            ))}
            {title.modal.closing && (
              <p className="title-modal__closing">{title.modal.closing}</p>
            )}
          </article>
        </div>
      )}
    </header>
  );
}
