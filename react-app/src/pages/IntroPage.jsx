import { useState } from 'react';
import { Link } from 'react-router-dom';
import intro from '../data/intro.json';

export default function IntroPage() {
  const langs = Object.keys(intro.transcripts || {});
  const [lang, setLang] = useState(langs[0] || 'en');
  const transcript = intro.transcripts?.[lang];

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
              <div className="intro__lang-tabs" role="tablist" aria-label="Transcript language">
                {langs.map(l => (
                  <button
                    key={l}
                    role="tab"
                    aria-selected={l === lang}
                    className={'intro__lang-tab' + (l === lang ? ' is-active' : '')}
                    onClick={() => setLang(l)}
                  >
                    {intro.transcripts[l]?.language_label || l.toUpperCase()}
                  </button>
                ))}
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
