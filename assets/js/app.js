/* ============================================================
   app.js
   - Leaflet map init (CARTO Voyager, custom gold pins, dashed
     polyline route)
   - Scroll-syncing between stops and map pins
   - Lightbox for gallery images
   - Click-to-load YouTube embeds
   - Keyboard navigation (J/K/M/arrows)
   - Sidebar progress rail
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Wait for data-loader to render the stops, then init.
     ---------------------------------------------------------- */
  window.addEventListener('walk:dataready', (ev) => {
    const { data, stops } = ev.detail;
    initMap(stops);
    initScrollSync(stops);
    initRail();
    initTopNav(stops);
    initTocDrawer(stops);
    initSlideshow();
    initGallery(data);
    initVideos();
    initKeyboard(stops);
    initKeyboardHint();
    initProgressBar();
  });

  /* ============================================================
     MAP
     ============================================================ */
  function initMap(stops) {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl || !window.L || !stops.length) return;

    const validStops = stops.filter(s => Array.isArray(s.coords) && s.coords.length === 2);
    if (!validStops.length) return;

    const bounds = L.latLngBounds(validStops.map(s => s.coords));

    const map = L.map(mapEl, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false
    }).fitBounds(bounds, { padding: [60, 60] });

    /* Re-enable zoom on hover/click; disable on out (memory walk feel) */
    map.on('focus click', () => map.scrollWheelZoom.enable());
    map.on('blur', () => map.scrollWheelZoom.disable());

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution(
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>'
    ).addTo(map);

    /* CARTO Voyager dark-friendly tiles */
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution: ''
      }
    ).addTo(map);

    /* Polyline route — dashed gold trail */
    const route = L.polyline(validStops.map(s => s.coords), {
      color: '#d4a857',
      weight: 3,
      opacity: 0.7,
      dashArray: '4 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    /* Custom numbered pins */
    const markers = {};
    validStops.forEach(stop => {
      const html = `<div class="walk-pin" data-stop-id="${stop.id}"><span>${stop.number}</span></div>`;
      const icon = L.divIcon({
        className: 'walk-pin-wrap',
        html,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
      const marker = L.marker(stop.coords, { icon, title: stop.title }).addTo(map);

      marker.bindPopup(`
        <h4>${stop.title}</h4>
        <p>${stop.subtitle || ''}</p>
        <a href="#${stop.id}" data-stop-link="${stop.id}">Read about this stop ↗</a>
      `);

      marker.on('click', () => {
        document.getElementById(stop.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      markers[stop.id] = marker;
    });

    /* Map controls */
    document.querySelector('[data-action="fit-route"]')?.addEventListener('click', () => {
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.0 });
    });

    /* Walk-via-map mode */
    initMapWalk(map, validStops, markers, bounds);

    document.querySelector('[data-action="show-current"]')?.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#d4a857',
            fillColor: '#e8c275',
            fillOpacity: 0.9,
            weight: 2
          }).addTo(map).bindPopup('You are here').openPopup();
          map.setView([latitude, longitude], 16);
        },
        () => alert('Unable to retrieve your location.')
      );
    });

    /* Expose for other modules */
    window.AmsterdamWalk = window.AmsterdamWalk || {};
    window.AmsterdamWalk.map = map;
    window.AmsterdamWalk.markers = markers;
    window.AmsterdamWalk.bounds = bounds;
  }

  /* ============================================================
     TOP NAV — current-stop indicator + prev/next + TOC button
     ============================================================ */
  function initTopNav(stops) {
    const here = document.getElementById('topnav-here');
    const hereNum = document.getElementById('topnav-here-num');
    const hereTitle = document.getElementById('topnav-here-title');
    const prevBtn = document.getElementById('topnav-prev');
    const nextBtn = document.getElementById('topnav-next');
    const tocBtn = document.getElementById('topnav-toc');

    function activeStopIdx() {
      const stopEls = document.querySelectorAll('.stop');
      const idx = Array.from(stopEls).findIndex(e => e.classList.contains('is-active'));
      return idx;
    }
    function go(delta) {
      const idx = activeStopIdx();
      const target = (idx === -1 && delta > 0) ? 0 : Math.max(0, Math.min(stops.length - 1, idx + delta));
      const id = stops[target]?.id;
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevBtn?.addEventListener('click', () => go(-1));
    nextBtn?.addEventListener('click', () => go(+1));
    tocBtn?.addEventListener('click', () => toggleTocDrawer(true));

    /* Update the "here" indicator on scroll */
    window.addEventListener('walk:stopchanged', (ev) => {
      const stop = ev.detail.stop;
      if (!stop) {
        hereNum.textContent = '—';
        hereTitle.textContent = 'the start';
        return;
      }
      hereNum.textContent = String(stop.number).padStart(2, '0');
      hereTitle.textContent = stop.title;
    });

    /* Show topnav after hero scrolls past */
    const topnav = document.getElementById('topnav');
    const heroEl = document.querySelector('.hero');
    const hideObs = new IntersectionObserver(
      ([e]) => topnav.classList.toggle('is-visible', !e.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' }
    );
    if (heroEl) hideObs.observe(heroEl);
  }

  /* ============================================================
     TOC DRAWER
     ============================================================ */
  function initTocDrawer(stops) {
    const drawer = document.getElementById('toc-drawer');
    const list = document.getElementById('toc-list');
    const closeBtn = document.getElementById('toc-close');
    const backdrop = document.getElementById('toc-backdrop');
    if (!drawer || !list) return;

    list.innerHTML = stops.map(s => `
      <li>
        <a class="toc-drawer__item" href="#${s.id}" data-target="${s.id}">
          <span class="toc-drawer__num">${String(s.number).padStart(2, '0')}</span>
          <span class="toc-drawer__title">${s.title}</span>
          ${s.title_nl ? `<span class="toc-drawer__sub">${s.title_nl}</span>` : ''}
        </a>
      </li>
    `).join('');

    closeBtn?.addEventListener('click', () => toggleTocDrawer(false));
    backdrop?.addEventListener('click', () => toggleTocDrawer(false));
    list.addEventListener('click', (ev) => {
      if (ev.target.closest('a')) toggleTocDrawer(false);
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && !drawer.hidden) toggleTocDrawer(false);
    });
  }
  function toggleTocDrawer(open) {
    const drawer = document.getElementById('toc-drawer');
    const btn = document.getElementById('topnav-toc');
    if (!drawer) return;
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add('is-open'));
      btn?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(() => { drawer.hidden = true; }, 250);
    }
  }

  /* ============================================================
     SLIDESHOW
     ============================================================ */
  function initSlideshow() {
    document.querySelectorAll('.slideshow').forEach(slideshow => {
      const slides = Array.from(slideshow.querySelectorAll('.slideshow__slide'));
      const dots = Array.from(slideshow.querySelectorAll('.slideshow__dot'));
      const counter = slideshow.querySelector('[data-counter-current]');
      let current = 0;

      function go(idx) {
        idx = (idx + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        if (counter) counter.textContent = idx + 1;
        current = idx;
      }

      slideshow.querySelector('.slideshow__nav--prev')?.addEventListener('click', () => go(current - 1));
      slideshow.querySelector('.slideshow__nav--next')?.addEventListener('click', () => go(current + 1));
      dots.forEach(d => d.addEventListener('click', () => go(parseInt(d.dataset.go, 10))));

      /* Keyboard arrows when slideshow is in viewport */
      slideshow.tabIndex = 0;
      slideshow.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowLeft') { go(current - 1); ev.preventDefault(); }
        else if (ev.key === 'ArrowRight') { go(current + 1); ev.preventDefault(); }
      });

      /* Touch swipe */
      let touchStartX = null;
      slideshow.addEventListener('touchstart', (ev) => { touchStartX = ev.touches[0].clientX; }, { passive: true });
      slideshow.addEventListener('touchend', (ev) => {
        if (touchStartX == null) return;
        const dx = ev.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
        touchStartX = null;
      });
    });
  }

  /* ============================================================
     PROGRESS BAR (top of topnav)
     ============================================================ */
  function initProgressBar() {
    const fill = document.getElementById('topnav-progress-fill');
    if (!fill) return;
    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      fill.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ============================================================
     MAP-WALK: click a pin → side panel shows that stop's content;
     prev/next steps through; "Read full stop" jumps to the page section.
     ============================================================ */
  function initMapWalk(map, stops, markers, bounds) {
    const section = document.querySelector('.map-section');
    const enterBtn = document.querySelector('[data-action="enter-walk-mode"]');
    const exitBtn = document.getElementById('map-walk-exit');
    const panel = document.getElementById('map-walk-panel');
    const body = document.getElementById('map-walk-body');
    const footer = document.getElementById('map-walk-footer');
    const prevBtn = document.getElementById('map-walk-prev');
    const nextBtn = document.getElementById('map-walk-next');
    const readFull = document.getElementById('map-walk-read-full');
    const progressEl = document.getElementById('map-walk-progress');
    if (!section || !enterBtn) return;

    let currentIdx = -1;
    let savedScroll = 0;
    let inWalkMode = false;

    function enter(startIdx = -1) {
      savedScroll = window.scrollY;
      section.classList.add('is-walk-mode');
      document.body.classList.add('map-walk-active');
      document.body.style.overflow = 'hidden';
      inWalkMode = true;
      requestAnimationFrame(() => {
        map.invalidateSize();
        if (startIdx >= 0) {
          select(startIdx);
        } else {
          map.flyToBounds(bounds, { padding: [50, 50], duration: 0.6 });
        }
      });
    }

    function exit() {
      section.classList.remove('is-walk-mode');
      document.body.classList.remove('map-walk-active');
      document.body.style.overflow = '';
      inWalkMode = false;
      currentIdx = -1;
      requestAnimationFrame(() => {
        map.invalidateSize();
        window.scrollTo({ top: savedScroll, behavior: 'instant' });
        /* Reset panel content */
        renderPlaceholder();
      });
    }

    function renderPlaceholder() {
      body.innerHTML = `
        <div class="map-walk-panel__placeholder">
          <p class="overline">Map walk</p>
          <h3>Click any pin on the map</h3>
          <p>Each pin opens that stop's photograph, summary, and a way to jump to its full entry on the page.</p>
          <p class="map-walk-panel__hint">Use <kbd>‹</kbd> / <kbd>›</kbd> to step through stops in order.</p>
        </div>`;
      footer.hidden = true;
      progressEl.textContent = 'Pick a pin to begin';
    }

    function esc(s) {
      if (s == null) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderStop(stop, idx) {
      const heroUrl = stop.media?.hero_image?.url;
      const heroCredit = stop.media?.hero_image?.credit;
      const galleryCount = stop.media?.gallery?.length || 0;
      const facts = (stop.facts || []).slice(0, 3).map(f => `
        <li>${esc(f.claim)}</li>`).join('');

      body.innerHTML = `
        ${heroUrl ? `
          <div class="map-walk-panel__hero">
            <img src="${esc(heroUrl)}" alt="${esc(stop.title)}" />
            ${heroCredit ? `<p class="map-walk-panel__hero-credit">${esc(heroCredit)}</p>` : ''}
          </div>` : ''}
        <div class="map-walk-panel__content">
          <p class="map-walk-panel__overline">
            <span class="map-walk-panel__num">${String(stop.number).padStart(2,'0')}</span>
            <span>${esc(stop.title_nl || stop.title)}</span>
          </p>
          <h3 class="map-walk-panel__title">${esc(stop.title)}</h3>
          ${stop.subtitle ? `<p class="map-walk-panel__subtitle">${esc(stop.subtitle)}</p>` : ''}
          ${stop.address ? `<p class="map-walk-panel__address">${esc(stop.address)}</p>` : ''}
          ${stop.summary ? `<p class="map-walk-panel__summary">${esc(stop.summary)}</p>` : ''}
          ${facts ? `<ul class="map-walk-panel__facts">${facts}</ul>` : ''}
          ${galleryCount ? `<p class="map-walk-panel__more"><strong>+ ${galleryCount} photos</strong> in the slideshow on the full stop page.</p>` : ''}
        </div>
      `;

      footer.hidden = false;
      progressEl.innerHTML = `<span class="map-walk-panel__progress-num">${stop.number}</span> of ${stops.length} <span class="map-walk-panel__progress-sep">·</span> ${esc(stop.title)}`;
      readFull.href = `#${stop.id}`;

      /* Update prev/next button enabled state */
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === stops.length - 1;
    }

    function select(idx) {
      idx = Math.max(0, Math.min(stops.length - 1, idx));
      const stop = stops[idx];
      if (!stop) return;
      currentIdx = idx;

      /* Mark active pin */
      Object.entries(markers).forEach(([id, marker]) => {
        const pin = marker.getElement()?.querySelector('.walk-pin');
        if (pin) pin.classList.toggle('is-active', id === stop.id);
      });

      /* Pan to pin (with offset to avoid panel overlap on desktop) */
      const offsetX = window.innerWidth >= 900 ? -180 : 0;  /* desktop panel is on the right */
      const px = map.project(stop.coords, map.getZoom());
      px.x -= offsetX;
      const offsetLatLng = map.unproject(px, map.getZoom());
      map.flyTo(offsetLatLng, Math.max(map.getZoom(), 16), { duration: 0.7 });

      renderStop(stop, idx);
    }

    /* Wire events */
    enterBtn.addEventListener('click', () => enter());
    exitBtn.addEventListener('click', exit);
    prevBtn.addEventListener('click', () => select(currentIdx - 1));
    nextBtn.addEventListener('click', () => select(currentIdx + 1));
    readFull.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = readFull.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      exit();
      setTimeout(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    });

    /* Pin clicks open in walk-mode if active; otherwise default scroll.
       Use stops[].id → markers map to find the index. */
    stops.forEach((stop, idx) => {
      const m = markers[stop.id];
      if (!m) return;
      m.on('click', () => {
        if (inWalkMode) {
          m.closePopup();  /* don't show inline popup; panel handles it */
          select(idx);
        }
      });
    });

    /* Keyboard nav within walk mode */
    document.addEventListener('keydown', (ev) => {
      if (!inWalkMode) return;
      if (ev.key === 'Escape') { exit(); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft') { select(currentIdx - 1); ev.preventDefault(); }
      else if (ev.key === 'ArrowRight') { select(currentIdx + 1); ev.preventDefault(); }
    });
  }

  /* ============================================================
     SCROLL-SYNC: highlight active stop in map + rail
     ============================================================ */
  function initScrollSync(stops) {
    const stopEls = Array.from(document.querySelectorAll('.stop'));
    if (!stopEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const id = el.dataset.stopId;
        if (!id) return;

        if (entry.isIntersecting) {
          /* Mark this stop active */
          stopEls.forEach(e => e.classList.toggle('is-active', e === el));

          /* Map pin */
          const markers = window.AmsterdamWalk?.markers || {};
          Object.entries(markers).forEach(([key, marker]) => {
            const elPin = marker.getElement()?.querySelector('.walk-pin');
            if (elPin) elPin.classList.toggle('is-active', key === id);
          });

          /* Rail */
          document.querySelectorAll('.rail__item').forEach(b =>
            b.classList.toggle('is-active', b.dataset.target === id));

          /* Soft pan map to active stop */
          const map = window.AmsterdamWalk?.map;
          const marker = markers[id];
          if (map && marker && !window.__userMapInteracting) {
            map.panTo(marker.getLatLng(), { animate: true, duration: 0.8 });
          }

          /* Update URL hash without scroll-jump */
          if (history.replaceState) {
            history.replaceState(null, '', '#' + id);
          }

          /* Notify top nav */
          const stop = stops.find(s => s.id === id);
          window.dispatchEvent(new CustomEvent('walk:stopchanged', { detail: { stop } }));
        }
      });
    }, {
      threshold: 0,
      rootMargin: '-90px 0px -50% 0px'
    });

    stopEls.forEach(el => observer.observe(el));
  }

  /* ============================================================
     RAIL
     ============================================================ */
  function initRail() {
    document.querySelectorAll('.rail__item').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ============================================================
     GALLERY → LIGHTBOX
     ============================================================ */
  function initGallery(data) {
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbNote = document.getElementById('lightbox-note');
    const lbCredit = document.getElementById('lightbox-credit');
    const lbStopTitle = document.getElementById('lightbox-stop-title');
    const lbCounterCurrent = document.getElementById('lightbox-counter-current');
    const lbCounterTotal = document.getElementById('lightbox-counter-total');
    const lbClose = document.getElementById('lightbox-close');
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');
    const lbFullscreen = document.getElementById('lightbox-fullscreen');
    if (!lightbox) return;

    let currentList = [];
    let currentIdx = 0;
    let currentStop = null;
    let savedScrollY = 0;

    function show(idx) {
      const item = currentList[idx];
      if (!item) return;
      currentIdx = (idx + currentList.length) % currentList.length;
      lbImg.src = currentList[currentIdx].src;
      lbImg.alt = currentList[currentIdx].alt || '';
      lbNote.textContent = currentList[currentIdx].note || '';
      lbCredit.innerHTML = '';
      if (currentList[currentIdx].credit) {
        const creditText = document.createTextNode(currentList[currentIdx].credit);
        lbCredit.appendChild(creditText);
      }
      if (currentList[currentIdx].source_url) {
        if (lbCredit.childNodes.length) lbCredit.appendChild(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = currentList[currentIdx].source_url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'view source ↗';
        lbCredit.appendChild(a);
      }
      if (lbCounterCurrent) lbCounterCurrent.textContent = currentIdx + 1;
      if (lbCounterTotal) lbCounterTotal.textContent = currentList.length;
    }

    function open(stopId, idx) {
      const stop = (data.stops || []).find(s => s.id === stopId);
      if (!stop) return;
      currentStop = stop;
      currentList = (stop.media?.gallery || []).map(g => ({
        src: g.url,
        alt: g.alt || stop.title,
        note: g.note || '',
        credit: g.credit || '',
        source_url: g.source_url || ''
      }));
      if (lbStopTitle) lbStopTitle.textContent = stop.title;
      savedScrollY = window.scrollY;
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      show(idx || 0);
      lbClose.focus();
    }

    function close() {
      lightbox.classList.remove('is-open');
      setTimeout(() => {
        lightbox.hidden = true;
        lbImg.src = '';
        document.body.style.overflow = '';
        /* Maintain scroll position so user resumes exactly where they left off. */
        window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        if (document.fullscreenElement) document.exitFullscreen?.();
      }, 220);
    }

    /* Click handlers for gallery thumbs + slideshow images */
    document.body.addEventListener('click', (ev) => {
      const thumb = ev.target.closest('.gallery-thumb, .slideshow__image-btn');
      if (!thumb) return;
      ev.preventDefault();
      const stopId = thumb.dataset.stop;
      const idx = parseInt(thumb.dataset.index, 10) || 0;
      open(stopId, idx);
    });

    /* "Open fullscreen" button on each slideshow */
    document.body.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.slideshow__open-fullscreen');
      if (!btn) return;
      ev.preventDefault();
      const slideshow = btn.closest('.slideshow');
      const stopId = slideshow?.dataset.stop;
      const activeSlide = slideshow?.querySelector('.slideshow__slide.is-active');
      const idx = activeSlide ? parseInt(activeSlide.dataset.index, 10) : 0;
      open(stopId, idx);
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', () => show(currentIdx - 1));
    lbNext.addEventListener('click', () => show(currentIdx + 1));

    /* Browser fullscreen toggle */
    lbFullscreen?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        const r = lightbox.requestFullscreen || lightbox.webkitRequestFullscreen;
        r?.call(lightbox).catch(() => {});
      } else {
        const x = document.exitFullscreen || document.webkitExitFullscreen;
        x?.call(document);
      }
    });

    /* Keyboard nav */
    document.addEventListener('keydown', (ev) => {
      if (lightbox.hidden) return;
      if (ev.key === 'Escape') { close(); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft') { show(currentIdx - 1); ev.preventDefault(); }
      else if (ev.key === 'ArrowRight') { show(currentIdx + 1); ev.preventDefault(); }
      else if (ev.key === 'f' || ev.key === 'F') { lbFullscreen?.click(); }
    });

    /* Touch swipe on the image */
    let touchX = null, touchY = null;
    const stage = lightbox.querySelector('.lightbox__stage');
    stage?.addEventListener('touchstart', (ev) => {
      touchX = ev.touches[0].clientX;
      touchY = ev.touches[0].clientY;
    }, { passive: true });
    stage?.addEventListener('touchend', (ev) => {
      if (touchX == null) return;
      const dx = ev.changedTouches[0].clientX - touchX;
      const dy = ev.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        show(currentIdx + (dx < 0 ? 1 : -1));
      } else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        /* swipe-down to close (mobile pattern) */
        close();
      }
      touchX = touchY = null;
    });

    /* Click on backdrop closes */
    lightbox.addEventListener('click', (ev) => {
      if (ev.target === lightbox) close();
    });
  }

  /* ============================================================
     YOUTUBE LAZY LOAD
     ============================================================ */
  function initVideos() {
    document.body.addEventListener('click', (ev) => {
      const thumb = ev.target.closest('.video-thumb');
      if (!thumb) return;
      ev.preventDefault();
      const id = thumb.dataset.youtube;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = thumb.querySelector('.video-thumb__title')?.textContent || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      iframe.style.position = 'absolute';
      iframe.style.inset = '0';
      thumb.replaceWith(iframe);
    });
  }

  /* ============================================================
     KEYBOARD NAVIGATION
     ============================================================ */
  function initKeyboard(stops) {
    document.addEventListener('keydown', (ev) => {
      if (ev.target.matches('input, textarea, [contenteditable]')) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

      const stopEls = Array.from(document.querySelectorAll('.stop'));
      const activeIdx = stopEls.findIndex(e => e.classList.contains('is-active'));

      if (ev.key === 'j' || ev.key === 'J' || ev.key === 'ArrowDown') {
        const next = stopEls[activeIdx + 1] || stopEls[0];
        next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        ev.preventDefault();
      } else if (ev.key === 'k' || ev.key === 'K' || ev.key === 'ArrowUp') {
        const prev = stopEls[activeIdx - 1] || stopEls[stopEls.length - 1];
        prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
        ev.preventDefault();
      } else if (ev.key === 'm' || ev.key === 'M') {
        document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        ev.preventDefault();
      } else if (ev.key === 'h' || ev.key === 'H') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        ev.preventDefault();
      }
    });
  }

  /* ============================================================
     KEYBOARD HINT (one-time)
     ============================================================ */
  function initKeyboardHint() {
    const hint = document.getElementById('keyboard-hint');
    if (!hint) return;
    if (localStorage.getItem('walk:hint-seen')) return;
    setTimeout(() => {
      hint.hidden = false;
      setTimeout(() => {
        hint.style.transition = 'opacity 600ms';
        hint.style.opacity = '0';
        setTimeout(() => { hint.hidden = true; hint.style.opacity = ''; }, 600);
      }, 6000);
      localStorage.setItem('walk:hint-seen', '1');
    }, 3000);
  }

  /* ============================================================
     Track user map interaction so scroll-sync doesn't fight.
     ============================================================ */
  document.addEventListener('mousedown', (ev) => {
    if (ev.target.closest('#leaflet-map')) {
      window.__userMapInteracting = true;
      clearTimeout(window.__mapInteractTimer);
      window.__mapInteractTimer = setTimeout(() => {
        window.__userMapInteracting = false;
      }, 3000);
    }
  });
})();
