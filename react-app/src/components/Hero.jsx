import { Link } from 'react-router-dom';
import { data, stops } from '../data';

export default function Hero() {
  return (
    <header className="hero" role="banner">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />
      <div className="hero__lines" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <div className="hero__inner">
        <p className="overline overline--gold">A walking guide</p>
        <h1 className="hero__title">
          <span className="hero__title-line">Katherine's</span>
          <span className="hero__title-line hero__title-line--em"><em>Amsterdam</em> Walk</span>
        </h1>
        <p className="hero__subtitle">{data.subtitle}</p>

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
          <Link className="cta cta--secondary" to="/map">Open the map</Link>
        </div>
      </div>

      <div className="hero__chrome">
        <span className="hero__chrome-text">Amsterdam · 1940 — 1945 · ad memoriam</span>
        <span className="hero__chrome-pulse" aria-hidden="true" />
      </div>
    </header>
  );
}
