import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import MapView from '../components/MapView';
import { stops, contextPanels } from '../data';
import Fact from '../components/Fact';

export default function HomePage() {
  const occupation = contextPanels.occupation_overview;

  return (
    <>
      <Hero />

      <section className="map-section" aria-labelledby="map-heading">
        <div className="map-section__inner">
          <div className="map-section__heading">
            <p className="overline">The route</p>
            <h2 id="map-heading">From the Westerkerk to the Names Monument</h2>
            <p className="map-section__sub">
              A continuous walking route of about four kilometres through Amsterdam's centre,
              Waterlooplein, and the Plantage quarter. Tap a pin to read about that stop, or
              use <strong>"Do the walk via the map"</strong> for a side-by-side experience.
            </p>
          </div>
          <div className="map-section__container">
            <MapView height={520} />
            <div className="map-section__controls">
              <Link className="map-btn map-btn--primary" to="/map">
                <span className="map-btn__icon" aria-hidden="true">⛶</span> Do the walk via the map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {occupation && (
        <section className="context-panel" id={occupation.id}>
          <p className="context-panel__overline">Context</p>
          <h2 className="context-panel__title">{occupation.title}</h2>
          {occupation.summary && <p className="context-panel__summary">{occupation.summary}</p>}
          {occupation.facts && occupation.facts.length > 0 && (
            <ol className="stop__facts">
              {occupation.facts.map((f, i) => <Fact key={i} fact={f} />)}
            </ol>
          )}
        </section>
      )}

      <section className="stops__intro">
        <p className="overline">The stops</p>
        <h2 className="stops__intro-title">Seventeen places, four kilometres,<br />eighty-five years of memory.</h2>
        <p className="stops__intro-body">
          Each stop pairs a physical site with a passage of history. Every claim is hyperlinked
          to its source — Anne Frank House, NIOD, the Joods Cultureel Kwartier, the Verzetsmuseum,
          and the Holocaust Encyclopedia of the United States Holocaust Memorial Museum.
        </p>
      </section>

      <ol className="stop-index" aria-label="All stops">
        {stops.map(s => (
          <li key={s.id}>
            <Link to={`/stop/${s.id}`} className="stop-index__item">
              <span className="stop-index__num">{String(s.number).padStart(2, '0')}</span>
              <div className="stop-index__body">
                <span className="stop-index__title">{s.title}</span>
                {s.title_nl && <span className="stop-index__sub">{s.title_nl}</span>}
                {s.subtitle && <span className="stop-index__meta">{s.subtitle}</span>}
              </div>
              <span className="stop-index__arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
