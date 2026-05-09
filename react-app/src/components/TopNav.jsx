import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { stops, findStopIndex } from '../data';
import TocDrawer from './TocDrawer';

export default function TopNav() {
  const [tocOpen, setTocOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  /* Determine "where am I" for the breadcrumb */
  const onStopPage = location.pathname.startsWith('/stop/');
  const onMapPage = location.pathname === '/map';
  const stopIdx = id ? findStopIndex(id) : -1;
  const stop = stopIdx >= 0 ? stops[stopIdx] : null;

  function go(delta) {
    const idx = stopIdx >= 0 ? stopIdx : -1;
    const next = idx + delta;
    if (next < 0) navigate('/');
    else if (next >= stops.length) return;
    else navigate(`/stop/${stops[next].id}`);
  }

  /* Keyboard shortcuts */
  useEffect(() => {
    function onKey(ev) {
      const t = ev.target;
      if (t && typeof t.matches === 'function' && t.matches('input, textarea, [contenteditable]')) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (tocOpen) return;
      if (ev.key === 'j' || ev.key === 'J' || ev.key === 'ArrowDown') { go(+1); ev.preventDefault(); }
      else if (ev.key === 'k' || ev.key === 'K' || ev.key === 'ArrowUp') { go(-1); ev.preventDefault(); }
      else if (ev.key === 'm' || ev.key === 'M') { navigate('/map'); ev.preventDefault(); }
      else if (ev.key === 'h' || ev.key === 'H') { navigate('/'); ev.preventDefault(); }
      else if (ev.key === 't' || ev.key === 'T') { setTocOpen(true); ev.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stopIdx, tocOpen]);

  /* Topnav visibility:
     - Home page: hidden until hero scrolls past, then is-visible.
     - All other routes: always is-visible. */
  const isHome = location.pathname === '/';
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (!isHome) { setPastHero(false); return; }
    function onScroll() {
      const heroEl = document.querySelector('.hero');
      if (!heroEl) { setPastHero(true); return; }
      const rect = heroEl.getBoundingClientRect();
      setPastHero(rect.bottom < 80);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, location.pathname]);
  const navVisible = !isHome || pastHero;

  return (
    <>
      <nav className={'topnav' + (navVisible ? ' is-visible' : '')} aria-label="Walk navigation">
        <Link to="/" className="topnav__brand" aria-label="Back to start">
          <span className="topnav__brand-mark" aria-hidden="true">⌂</span>
          <span className="topnav__brand-text">Amsterdam Walk</span>
        </Link>

        <div className="topnav__here" aria-live="polite">
          <span className="topnav__here-label">You're at</span>
          {stop ? (
            <>
              <span className="topnav__here-num">{String(stop.number).padStart(2, '0')}</span>
              <span className="topnav__here-title">{stop.title}</span>
            </>
          ) : onMapPage ? (
            <>
              <span className="topnav__here-num">⌖</span>
              <span className="topnav__here-title">The map</span>
            </>
          ) : (
            <>
              <span className="topnav__here-num">—</span>
              <span className="topnav__here-title">the start</span>
            </>
          )}
        </div>

        <div className="topnav__actions">
          <button className="topnav__btn" onClick={() => setTocOpen(true)} aria-label="Open all stops" aria-expanded={tocOpen}>
            <span className="topnav__btn-icon" aria-hidden="true">≡</span>
            <span className="topnav__btn-label">All stops</span>
          </button>
          <Link to="/map" className="topnav__btn topnav__btn--icon" aria-label="Map walk">
            <span aria-hidden="true">◉</span>
          </Link>
          <button
            className="topnav__btn topnav__btn--icon"
            onClick={() => go(-1)}
            disabled={onStopPage && stopIdx === 0}
            aria-label="Previous stop"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            className="topnav__btn topnav__btn--icon"
            onClick={() => go(+1)}
            disabled={onStopPage && stopIdx === stops.length - 1}
            aria-label="Next stop"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </nav>
      <TocDrawer open={tocOpen} onClose={() => setTocOpen(false)} currentStopId={id} />
    </>
  );
}
