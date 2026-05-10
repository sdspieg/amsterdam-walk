import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import intro from '../data/intro.json';

export default function IntroPage() {
  const langs = Object.keys(intro.transcripts || {});
  const [lang, setLang] = useState(langs[0] || 'en');
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const transcript = intro.transcripts?.[lang];

  useEffect(() => {
    function onKey(ev) {
      if (ev.key === 'Escape' && rationaleOpen) { setRationaleOpen(false); ev.preventDefault(); }
    }
    if (rationaleOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [rationaleOpen]);

  return (
    <article className="intro">
      <header className="intro__header">
        <p className="overline">Introduction</p>
        <h1 className="intro__title">{intro.title}</h1>
        {intro.subtitle && <p className="intro__subtitle">{intro.subtitle}</p>}
      </header>

      <section className="intro__video">
        {intro.youtube_id ? (
          <div className="intro__video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${intro.youtube_id}?rel=0&enablejsapi=1`}
              title={intro.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="intro__video-placeholder">
            <p className="overline">Video coming</p>
            <p>The introduction video will appear here once added to <code>src/data/intro.json</code>.</p>
          </div>
        )}
      </section>

      {langs.length > 0 && (
        <section className="intro__transcript" aria-label="Transcript">
          <header className="intro__transcript-header">
            <p className="overline">Transcript</p>
            {langs.length > 1 && (
              <div className="intro__lang-row">
                <div className="intro__lang-tabs" role="tablist" aria-label="Transcript language">
                  {langs.map(l => (
                    <button
                      key={l}
                      role="tab"
                      aria-selected={l === lang}
                      className={'intro__lang-tab' + (l === lang ? ' is-active' : '')}
                      onClick={() => setLang(l)}
                      title={intro.transcripts[l]?.language_full || intro.transcripts[l]?.language_label}
                    >
                      {intro.transcripts[l]?.language_label || l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="intro__lang-info-btn"
                  onClick={() => setRationaleOpen(true)}
                  aria-label="Why these languages?"
                  title="Why these languages?"
                >
                  <span aria-hidden="true">ⓘ</span>
                  <span className="intro__lang-info-label">Why these languages?</span>
                </button>
              </div>
            )}
          </header>

          {transcript?.credit && (
            <p className="intro__transcript-credit">{transcript.credit}</p>
          )}

          {transcript?.segments?.length > 0 ? (
            <ol
              className={'intro__segments' + (transcript.rtl ? ' intro__segments--rtl' : '')}
              dir={transcript.rtl ? 'rtl' : 'ltr'}
              lang={lang}
            >
              {transcript.segments.map((seg, i) => (
                <li key={i} className="intro__segment">
                  {seg.t != null && (
                    <button
                      type="button"
                      className="intro__segment-time"
                      onClick={() => seekVideo(seg.t)}
                      title={`Jump to ${formatTime(seg.t)}`}
                      dir="ltr"
                    >
                      {formatTime(seg.t)}
                    </button>
                  )}
                  <p className="intro__segment-text">{seg.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="intro__transcript-empty">
              Transcript text will appear here once the video is added and processed.
            </p>
          )}
        </section>
      )}

      {rationaleOpen && (
        <div className="lang-modal" role="dialog" aria-modal="true" aria-labelledby="lang-modal-title" onClick={(ev) => { if (ev.target.classList.contains('lang-modal')) setRationaleOpen(false); }}>
          <div className="lang-modal__panel">
            <header className="lang-modal__header">
              <p className="overline">Languages on this page</p>
              <h2 id="lang-modal-title">Why these languages?</h2>
              <button type="button" className="lang-modal__close" onClick={() => setRationaleOpen(false)} aria-label="Close">×</button>
            </header>
            <p className="lang-modal__intro">
              The walk visits monuments to people who were deported from Amsterdam between 1942 and 1944.
              Most never returned. Each transcript is offered in a language those people spoke at home,
              read in synagogue, taught their children, or were spoken to in by guards at the camps.
              Honoring those languages — especially the ones rarely included on memorial sites — is part
              of the act of remembrance.
            </p>
            <ul className="lang-modal__list">
              {langs.map(l => {
                const t = intro.transcripts[l];
                if (!t?.rationale) return null;
                return (
                  <li key={l} className="lang-modal__item">
                    <div className="lang-modal__item-head">
                      <span className="lang-modal__item-label">{t.language_label}</span>
                      {t.language_full && <span className="lang-modal__item-full">{t.language_full}</span>}
                    </div>
                    <p className="lang-modal__item-rationale">{t.rationale}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <nav className="intro__cta">
        <Link to="/" className="cta cta--secondary">← Back to start</Link>
        <Link to="/stop/homo-monument" className="cta cta--primary">Begin the walk <span aria-hidden="true">→</span></Link>
        <Link to="/map" className="cta cta--secondary">Open the map</Link>
      </nav>
    </article>
  );
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function seekVideo(t) {
  const iframe = document.querySelector('.intro__video iframe');
  if (!iframe) return;
  /* postMessage YouTube IFrame API */
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func: 'seekTo', args: [t, true] }),
    '*'
  );
}
