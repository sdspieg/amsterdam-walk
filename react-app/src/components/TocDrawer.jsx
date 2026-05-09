import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stops } from '../data';

export default function TocDrawer({ open, onClose, currentStopId }) {
  useEffect(() => {
    function onKey(ev) {
      if (ev.key === 'Escape' && open) { onClose(); ev.preventDefault(); }
    }
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={'toc-drawer' + (open ? ' is-open' : '')} hidden={!open} role="dialog" aria-modal="true" aria-labelledby="toc-heading">
      <div className="toc-drawer__backdrop" onClick={onClose} />
      <aside className="toc-drawer__panel">
        <header className="toc-drawer__header">
          <p className="overline">All stops</p>
          <h2 id="toc-heading">The walk · seventeen stops</h2>
          <button className="toc-drawer__close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <ol className="toc-drawer__list">
          {stops.map(s => (
            <li key={s.id}>
              <Link
                to={`/stop/${s.id}`}
                onClick={onClose}
                className={'toc-drawer__item' + (s.id === currentStopId ? ' is-current' : '')}
              >
                <span className="toc-drawer__num">{String(s.number).padStart(2, '0')}</span>
                <span className="toc-drawer__title">{s.title}</span>
                {s.title_nl && <span className="toc-drawer__sub">{s.title_nl}</span>}
              </Link>
            </li>
          ))}
        </ol>
        <footer className="toc-drawer__footer">
          <kbd>J</kbd> next · <kbd>K</kbd> previous · <kbd>M</kbd> map · <kbd>T</kbd> toc · <kbd>Esc</kbd> close
        </footer>
      </aside>
    </div>
  );
}
