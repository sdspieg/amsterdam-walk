import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { stops, findStopIndex } from '../data';

export default function MapWalkPage() {
  const [params, setParams] = useSearchParams();
  const initialId = params.get('s');
  const [activeIdx, setActiveIdx] = useState(() => {
    if (initialId) {
      const i = findStopIndex(initialId);
      if (i >= 0) return i;
    }
    return -1;
  });
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();

  /* Init map once */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const validStops = stops.filter(s => Array.isArray(s.coords) && s.coords.length === 2);
    const bounds = L.latLngBounds(validStops.map(s => s.coords));

    const map = L.map(containerRef.current, {
      zoomControl: false, scrollWheelZoom: true, attributionControl: false,
    }).fitBounds(bounds, { padding: [50, 50] });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution(
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>'
    ).addTo(map);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20, attribution: '' }
    ).addTo(map);

    L.polyline(validStops.map(s => s.coords), {
      color: '#d4a857', weight: 3, opacity: 0.7, dashArray: '4 8',
      lineCap: 'round', lineJoin: 'round'
    }).addTo(map);

    const markers = {};
    validStops.forEach((stop, idx) => {
      const html = `<div class="walk-pin"><span>${stop.number}</span></div>`;
      const icon = L.divIcon({
        className: 'walk-pin-wrap',
        html, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
      });
      const m = L.marker(stop.coords, { icon, title: stop.title }).addTo(map);
      m.on('click', () => {
        m.closePopup?.();
        setActiveIdx(idx);
      });
      markers[stop.id] = m;
    });
    mapRef.current = map;
    markersRef.current = markers;
    map._validBounds = bounds;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  /* Sync active pin styling + map pan + URL */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const stop = activeIdx >= 0 ? stops[activeIdx] : null;
    /* Mark active pin */
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement()?.querySelector('.walk-pin');
      if (el) el.classList.toggle('is-active', stop && id === stop.id);
    });
    if (stop) {
      /* Pan with offset so the active pin doesn't sit under the side panel */
      const offsetX = window.innerWidth >= 900 ? -180 : 0;
      const px = map.project(stop.coords, map.getZoom());
      px.x -= offsetX;
      const ll = map.unproject(px, map.getZoom());
      map.flyTo(ll, Math.max(map.getZoom(), 16), { duration: 0.7 });
      setParams({ s: stop.id }, { replace: true });
    } else {
      setParams({}, { replace: true });
    }
  }, [activeIdx]);

  /* Keyboard nav */
  useEffect(() => {
    function onKey(ev) {
      if (ev.target.matches('input, textarea, [contenteditable]')) return;
      if (ev.key === 'Escape') { navigate('/'); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft') { setActiveIdx(i => Math.max(0, (i < 0 ? 0 : i) - 1)); ev.preventDefault(); }
      else if (ev.key === 'ArrowRight') { setActiveIdx(i => Math.min(stops.length - 1, (i < 0 ? -1 : i) + 1)); ev.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stop = activeIdx >= 0 ? stops[activeIdx] : null;
  const heroImg = stop?.media?.hero_image;
  const galleryCount = stop?.media?.gallery?.length || 0;

  return (
    <div className="map-walk-page">
      <div className="map-walk-page__container">
        <div className="map-walk-page__map" ref={containerRef} />

        <aside className="map-walk-panel" aria-label="Stop details">
          <header className="map-walk-panel__header">
            <Link to="/" className="map-walk-panel__exit" aria-label="Exit map walk">
              <span aria-hidden="true">×</span>
              <span className="map-walk-panel__exit-label">Exit</span>
            </Link>
            <p className="map-walk-panel__progress">
              {stop ? (
                <>
                  <span className="map-walk-panel__progress-num">{stop.number}</span>
                  {' of '}{stops.length}
                  <span className="map-walk-panel__progress-sep"> · </span>
                  {stop.title}
                </>
              ) : 'Pick a pin to begin'}
            </p>
          </header>

          <div className="map-walk-panel__body">
            {!stop ? (
              <div className="map-walk-panel__placeholder">
                <p className="overline">Map walk</p>
                <h3>Click any pin on the map</h3>
                <p>Each pin opens that stop's photograph, summary, and a way to jump to its full entry.</p>
                <p className="map-walk-panel__hint">Use <kbd>‹</kbd> / <kbd>›</kbd> to step through stops in order.</p>
              </div>
            ) : (
              <>
                {heroImg && (
                  <div className="map-walk-panel__hero">
                    <img src={heroImg.url} alt={stop.title} />
                    {heroImg.credit && <p className="map-walk-panel__hero-credit">{heroImg.credit}</p>}
                  </div>
                )}
                <div className="map-walk-panel__content">
                  <p className="map-walk-panel__overline">
                    <span className="map-walk-panel__num">{String(stop.number).padStart(2, '0')}</span>
                    <span>{stop.title_nl || stop.title}</span>
                  </p>
                  <h3 className="map-walk-panel__title">{stop.title}</h3>
                  {stop.subtitle && <p className="map-walk-panel__subtitle">{stop.subtitle}</p>}
                  {stop.address && <p className="map-walk-panel__address">{stop.address}</p>}
                  {stop.summary && <p className="map-walk-panel__summary">{stop.summary}</p>}
                  {stop.facts && stop.facts.length > 0 && (
                    <ul className="map-walk-panel__facts">
                      {stop.facts.slice(0, 3).map((f, i) => <li key={i}>{f.claim}</li>)}
                    </ul>
                  )}
                  {galleryCount > 0 && (
                    <p className="map-walk-panel__more">
                      <strong>+ {galleryCount} photos</strong> in the slideshow on the full stop page.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {stop && (
            <footer className="map-walk-panel__footer">
              <button
                className="map-walk-panel__nav-btn"
                onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                aria-label="Previous stop"
              >
                <span aria-hidden="true">‹</span><span>Prev</span>
              </button>
              <Link className="map-walk-panel__read-full" to={`/stop/${stop.id}`}>
                Read full stop →
              </Link>
              <button
                className="map-walk-panel__nav-btn map-walk-panel__nav-btn--next"
                onClick={() => setActiveIdx(i => Math.min(stops.length - 1, i + 1))}
                disabled={activeIdx === stops.length - 1}
                aria-label="Next stop"
              >
                <span>Next</span><span aria-hidden="true">›</span>
              </button>
            </footer>
          )}
        </aside>
      </div>
    </div>
  );
}
