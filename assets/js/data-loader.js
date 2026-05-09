/* ============================================================
   data-loader.js
   Fetches stops.json (with fallback to stops.sample.json) and
   renders the stops list into #stops-container.
   ============================================================ */

(function () {
  'use strict';

  const CONTAINER = document.getElementById('stops-container');
  const LOADING_EL = document.getElementById('stops-loading');

  /* Try the real data file first; fall back to the sample. */
  async function loadData() {
    const candidates = ['data/stops.json', 'data/stops.sample.json'];
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const json = await res.json();
          json.__source = url;
          return json;
        }
      } catch (e) { /* try next */ }
    }
    throw new Error('Could not load any stops data file.');
  }

  /* HTML escaping */
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Source pill — uses the source's hostname as the visible label,
     falls back to the title if hostname isn't useful. */
  function renderSourcePill(src) {
    if (!src || !src.url) return '';
    let label = src.title || '';
    try {
      const u = new URL(src.url);
      const host = u.hostname.replace(/^www\./, '');
      label = host.split('.').slice(0, -1).join('.') || host;
      label = label.length > 20 ? label.slice(0, 20) + '…' : label;
    } catch (e) { /* keep title */ }
    return `<a class="source-pill" href="${esc(src.url)}" target="_blank" rel="noopener" title="${esc(src.title || '')}">${esc(label)}</a>`;
  }

  function renderFact(fact) {
    const verifiedClass = fact.verified === false ? ' fact__bullet--unverified' : '';
    const claim = `
      <p class="fact__claim">
        <span class="fact__bullet${verifiedClass}" aria-hidden="true"></span>
        <span class="fact__claim-text">${esc(fact.claim)}</span>
      </p>`;

    const amp = fact.amplification
      ? `<details class="fact__amplification">
           <summary>More context</summary>
           <p>${esc(fact.amplification)}</p>
         </details>`
      : '';

    const sources = (fact.sources && fact.sources.length)
      ? `<div class="fact__sources">${fact.sources.map(renderSourcePill).join('')}</div>`
      : '';

    return `<li class="fact">${claim}${amp}${sources}</li>`;
  }

  function renderHeroImage(stop) {
    const m = stop.media || {};
    if (m.hero_image && m.hero_image.url) {
      return `
        <div class="stop__media-card">
          <img src="${esc(m.hero_image.url)}" alt="${esc(stop.title)}" loading="lazy" />
        </div>
        <p class="stop__media-credit">
          ${esc(m.hero_image.credit || '')}
          ${m.hero_image.source_url
            ? `<a href="${esc(m.hero_image.source_url)}" target="_blank" rel="noopener">view source</a>`
            : ''}
        </p>`;
    }
    return `
      <div class="stop__media-card">
        <div class="stop__media-placeholder">
          <span>No photograph yet · ${esc(stop.title)}</span>
        </div>
      </div>`;
  }

  function renderGallery(stop) {
    const gallery = (stop.media && stop.media.gallery) || [];
    if (!gallery.length) return '';

    /* If any image has a 'note', render as captioned slideshow.
       Otherwise fall back to thumbnail grid. */
    const hasNotes = gallery.some(g => g.note);

    if (!hasNotes) {
      const items = gallery.map((img, i) => `
        <button class="gallery-thumb"
                data-stop="${esc(stop.id)}"
                data-index="${i}"
                aria-label="View image ${i + 1}">
          <img src="${esc(img.url)}" alt="${esc(img.alt || '')}" loading="lazy" />
        </button>
      `).join('');
      return `<div class="stop__gallery">${items}</div>`;
    }

    const slides = gallery.map((img, i) => `
      <li class="slideshow__slide ${i === 0 ? 'is-active' : ''}" data-index="${i}">
        <button class="slideshow__image-btn" data-stop="${esc(stop.id)}" data-index="${i}" aria-label="Zoom image ${i + 1}">
          <img src="${esc(img.url)}" alt="${esc(img.alt || '')}" loading="lazy" />
        </button>
        <div class="slideshow__caption">
          ${img.note ? `<p class="slideshow__note">${esc(img.note)}</p>` : ''}
          <p class="slideshow__credit">
            ${esc(img.credit || '')}
            ${img.source_url ? `<a href="${esc(img.source_url)}" target="_blank" rel="noopener">↗</a>` : ''}
          </p>
        </div>
      </li>
    `).join('');

    const dots = gallery.map((_, i) => `
      <button class="slideshow__dot ${i === 0 ? 'is-active' : ''}" data-go="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');

    return `
      <div class="slideshow" data-stop="${esc(stop.id)}" data-count="${gallery.length}">
        <div class="slideshow__overline">
          <p class="overline">Slideshow · ${gallery.length} images</p>
          <span class="slideshow__overline-meta">
            <span class="slideshow__counter"><span data-counter-current>1</span> / ${gallery.length}</span>
            <button class="slideshow__open-fullscreen" type="button" aria-label="Open slideshow full-screen">
              <span class="slideshow__open-fullscreen-icon" aria-hidden="true">⛶</span>
              <span class="slideshow__open-fullscreen-label">Full screen</span>
            </button>
          </span>
        </div>
        <ol class="slideshow__track">${slides}</ol>
        <div class="slideshow__controls">
          <button class="slideshow__nav slideshow__nav--prev" aria-label="Previous image">‹</button>
          <div class="slideshow__dots" role="tablist">${dots}</div>
          <button class="slideshow__nav slideshow__nav--next" aria-label="Next image">›</button>
        </div>
      </div>`;
  }

  function renderVideos(stop) {
    const videos = (stop.media && stop.media.videos) || [];
    if (!videos.length) return '';
    const items = videos.map(v => {
      const id = v.youtube_id;
      const title = v.title || '';
      if (!id) return '';
      return `
        <button class="video-thumb" data-youtube="${esc(id)}" aria-label="Play: ${esc(title)}">
          <img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="${esc(title)}" loading="lazy" />
          <span class="video-thumb__overlay">
            <span class="video-thumb__title">${esc(title)}</span>
          </span>
          <span class="video-thumb__play" aria-hidden="true">▶</span>
        </button>`;
    }).join('');
    return `<div class="stop__videos">${items}</div>`;
  }

  function renderResources(stop) {
    if (!stop.resources || !stop.resources.length) return '';
    const items = stop.resources.map(r =>
      `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a></li>`
    ).join('');
    return `
      <div class="stop__resources">
        <p class="stop__resources-title">Further resources</p>
        <ul>${items}</ul>
      </div>`;
  }

  function renderCorrections(stop) {
    if (!stop.corrections || !stop.corrections.length) return '';
    const items = stop.corrections.map(c => `<li>${esc(c)}</li>`).join('');
    return `
      <div class="stop__corrections">
        <p class="stop__corrections-title">Editor's note</p>
        <ul>${items}</ul>
      </div>`;
  }

  function renderStopNav(prev, next) {
    if (!prev && !next) return '';
    const prevHtml = prev ? `
      <a class="stop-nav__btn stop-nav__btn--prev" href="#${esc(prev.id)}">
        <span class="stop-nav__btn-arrow">‹</span>
        <span class="stop-nav__btn-meta">
          <span class="stop-nav__btn-overline">Previous · stop ${esc(prev.number)}</span>
          <span class="stop-nav__btn-title">${esc(prev.title)}</span>
        </span>
      </a>` : '<span class="stop-nav__btn stop-nav__btn--placeholder"></span>';
    const nextHtml = next ? `
      <a class="stop-nav__btn stop-nav__btn--next" href="#${esc(next.id)}">
        <span class="stop-nav__btn-meta">
          <span class="stop-nav__btn-overline">Next · stop ${esc(next.number)}</span>
          <span class="stop-nav__btn-title">${esc(next.title)}</span>
        </span>
        <span class="stop-nav__btn-arrow">›</span>
      </a>` : '<span class="stop-nav__btn stop-nav__btn--placeholder"></span>';
    return `<nav class="stop-nav" aria-label="Stop navigation">
      ${prevHtml}
      <a class="stop-nav__btn stop-nav__btn--map" href="#map" aria-label="Back to map">
        <span class="stop-nav__btn-arrow">◉</span>
        <span class="stop-nav__btn-meta">
          <span class="stop-nav__btn-overline">Back to</span>
          <span class="stop-nav__btn-title">The map</span>
        </span>
      </a>
      ${nextHtml}
    </nav>`;
  }

  function renderStop(stop, prev, next) {
    const numStr = String(stop.number ?? '').padStart(2, '0');

    const facts = (stop.facts && stop.facts.length)
      ? `<ol class="stop__facts">${stop.facts.map(renderFact).join('')}</ol>`
      : '';

    const lat = stop.coords ? stop.coords[0] : null;
    const lng = stop.coords ? stop.coords[1] : null;
    const mapsUrl = lat != null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
      : null;

    return `
      <article class="stop" id="${esc(stop.id)}" data-stop-id="${esc(stop.id)}" data-number="${esc(stop.number)}">
        <span class="stop__rule" aria-hidden="true"></span>
        <span class="stop__numeral" aria-hidden="true">${esc(numStr)}</span>
        <div class="stop__media">
          ${renderHeroImage(stop)}
        </div>
        <div class="stop__content">
          <p class="stop__overline">Stop ${esc(stop.number)} · ${stop.title_nl ? esc(stop.title_nl) : esc(stop.title)}</p>
          <h2 class="stop__title">${esc(stop.title)}</h2>
          ${stop.title_nl ? `<span class="stop__title-nl">${esc(stop.title_nl)}</span>` : ''}
          ${stop.subtitle ? `<p class="stop__subtitle">${esc(stop.subtitle)}</p>` : ''}

          ${stop.address || mapsUrl ? `
            <p class="stop__address">
              <span class="stop__address-text">${esc(stop.address || '')}</span>
              ${mapsUrl
                ? `<a class="stop__address-link" href="${mapsUrl}" target="_blank" rel="noopener">Open in map ↗</a>`
                : ''}
            </p>` : ''}

          ${stop.summary ? `<p class="stop__summary">${esc(stop.summary)}</p>` : ''}

          ${facts}
          ${renderCorrections(stop)}
          ${renderGallery(stop)}
          ${renderVideos(stop)}
          ${renderResources(stop)}
        </div>
        ${renderStopNav(prev, next)}
      </article>
    `;
  }

  function renderContextPanel(panel) {
    if (!panel || !panel.id) return '';
    const facts = (panel.facts && panel.facts.length)
      ? `<ol class="stop__facts">${panel.facts.map(renderFact).join('')}</ol>`
      : '';
    const corrections = (panel.corrections && panel.corrections.length)
      ? `<div class="stop__corrections">
           <p class="stop__corrections-title">Editor's note</p>
           <ul>${panel.corrections.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
         </div>` : '';
    return `
      <section class="context-panel" id="${esc(panel.id)}">
        <p class="context-panel__overline">Context</p>
        <h2 class="context-panel__title">${esc(panel.title)}</h2>
        ${panel.summary ? `<p class="context-panel__summary">${esc(panel.summary)}</p>` : ''}
        ${facts}
        ${corrections}
      </section>`;
  }

  function renderRail(stops) {
    const railList = document.getElementById('rail-list');
    const rail = document.getElementById('rail');
    if (!railList || !rail) return;
    railList.innerHTML = stops.map(s => {
      const shortTitle = (s.title || '').length > 24
        ? s.title.split(/[—\-—:]/)[0].trim().slice(0, 24)
        : s.title;
      return `
      <li>
        <button class="rail__item" data-target="${esc(s.id)}" type="button" title="${esc(s.title)}">
          ${String(s.number).padStart(2, '0')} · ${esc(shortTitle)}
        </button>
      </li>`;
    }).join('');
    rail.hidden = false;
  }

  /* Main */
  loadData()
    .then(data => {
      /* Hero intro */
      const introEl = document.getElementById('hero-intro');
      if (introEl && data.intro) {
        introEl.textContent = data.intro;
      }
      const subtitleEl = document.getElementById('hero-subtitle');
      if (subtitleEl && data.subtitle) {
        subtitleEl.textContent = data.subtitle;
      }
      const metaStops = document.getElementById('meta-stops');
      if (metaStops && data.stops) {
        metaStops.textContent = data.stops.length;
      }

      /* Stops + context panels */
      const stops = data.stops || [];
      const panels = data.context_panels || {};
      const panelList = Array.isArray(panels) ? panels : Object.values(panels);

      const panelsHtml = panelList.map(renderContextPanel).join('');
      const stopsHtml = stops.map((s, i) => renderStop(s, stops[i - 1], stops[i + 1])).join('');
      CONTAINER.innerHTML = panelsHtml + stopsHtml;
      if (LOADING_EL) LOADING_EL.remove();

      renderRail(stops);

      /* Notify the app the data is ready */
      window.AmsterdamWalk = { data, stops };
      window.dispatchEvent(new CustomEvent('walk:dataready', { detail: { data, stops } }));
    })
    .catch(err => {
      console.error('Walk data load failed:', err);
      if (LOADING_EL) {
        LOADING_EL.textContent = 'Could not load route data. Please refresh.';
      }
    });
})();
