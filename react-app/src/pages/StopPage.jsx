import { useParams, Link, Navigate } from 'react-router-dom';
import { findStop, adjacentStops } from '../data';
import Fact from '../components/Fact';
import Slideshow from '../components/Slideshow';

export default function StopPage() {
  const { id } = useParams();
  const stop = findStop(id);

  if (!stop) return <Navigate to="/" replace />;

  const { prev, next, index, total } = adjacentStops(id);
  const numStr = String(stop.number).padStart(2, '0');
  const lat = stop.coords?.[0];
  const lng = stop.coords?.[1];
  const mapsUrl = lat != null
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
    : null;
  const heroImg = stop.media?.hero_image;

  return (
    <article className={'stop ' + (stop.number % 2 === 0 ? 'stop--alt' : '')} id={stop.id}>
      <span className="stop__numeral" aria-hidden="true">{numStr}</span>

      <div className="stop__media">
        {heroImg ? (
          <>
            <div className="stop__media-card">
              <img src={heroImg.url} alt={stop.title} />
            </div>
            {heroImg.credit && (
              <p className="stop__media-credit">
                {heroImg.credit}
                {heroImg.source_url && (
                  <> · <a href={heroImg.source_url} target="_blank" rel="noopener">view source</a></>
                )}
              </p>
            )}
          </>
        ) : (
          <div className="stop__media-card">
            <div className="stop__media-placeholder">
              <span>{stop.title}</span>
            </div>
          </div>
        )}
      </div>

      <div className="stop__content">
        <p className="stop__overline">
          Stop {stop.number} of {total}
          {stop.title_nl && <> · {stop.title_nl}</>}
        </p>
        <h1 className="stop__title">{stop.title}</h1>
        {stop.title_nl && <span className="stop__title-nl">{stop.title_nl}</span>}
        {stop.subtitle && <p className="stop__subtitle">{stop.subtitle}</p>}

        {(stop.address || mapsUrl) && (
          <p className="stop__address">
            <span className="stop__address-text">{stop.address || ''}</span>
            {mapsUrl && <a className="stop__address-link" href={mapsUrl} target="_blank" rel="noopener">Open in map ↗</a>}
          </p>
        )}

        {stop.summary && <p className="stop__summary">{stop.summary}</p>}

        {stop.facts && stop.facts.length > 0 && (
          <ol className="stop__facts">
            {stop.facts.map((f, i) => <Fact key={i} fact={f} />)}
          </ol>
        )}

        <Slideshow stop={stop} />

        {stop.media?.videos && stop.media.videos.length > 0 && (
          <div className="stop__videos">
            {stop.media.videos.map((v, i) => v.youtube_id && (
              <YoutubeThumb key={i} video={v} />
            ))}
          </div>
        )}

        {stop.resources && stop.resources.length > 0 && (
          <div className="stop__resources">
            <p className="stop__resources-title">Further resources</p>
            <ul>
              {stop.resources.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noopener">{r.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <nav className="stop-nav" aria-label="Stop navigation">
        {prev ? (
          <Link className="stop-nav__btn stop-nav__btn--prev" to={`/stop/${prev.id}`}>
            <span className="stop-nav__btn-arrow">‹</span>
            <span className="stop-nav__btn-meta">
              <span className="stop-nav__btn-overline">Previous · stop {prev.number}</span>
              <span className="stop-nav__btn-title">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <Link className="stop-nav__btn stop-nav__btn--prev" to="/">
            <span className="stop-nav__btn-arrow">‹</span>
            <span className="stop-nav__btn-meta">
              <span className="stop-nav__btn-overline">Back to</span>
              <span className="stop-nav__btn-title">Start of walk</span>
            </span>
          </Link>
        )}

        <Link className="stop-nav__btn stop-nav__btn--map" to="/map">
          <span className="stop-nav__btn-arrow">◉</span>
          <span className="stop-nav__btn-meta">
            <span className="stop-nav__btn-overline">Open</span>
            <span className="stop-nav__btn-title">The map</span>
          </span>
        </Link>

        {next ? (
          <Link className="stop-nav__btn stop-nav__btn--next" to={`/stop/${next.id}`}>
            <span className="stop-nav__btn-meta">
              <span className="stop-nav__btn-overline">Next · stop {next.number}</span>
              <span className="stop-nav__btn-title">{next.title}</span>
            </span>
            <span className="stop-nav__btn-arrow">›</span>
          </Link>
        ) : (
          <Link className="stop-nav__btn stop-nav__btn--next" to="/">
            <span className="stop-nav__btn-meta">
              <span className="stop-nav__btn-overline">End of walk</span>
              <span className="stop-nav__btn-title">Back to start</span>
            </span>
            <span className="stop-nav__btn-arrow">›</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

function YoutubeThumb({ video }) {
  const id = video.youtube_id;
  return (
    <a className="video-thumb" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener">
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={video.title || 'Video'} loading="lazy" />
      <span className="video-thumb__overlay">
        <span className="video-thumb__title">{video.title || ''}</span>
      </span>
      <span className="video-thumb__play" aria-hidden="true">▶</span>
    </a>
  );
}
