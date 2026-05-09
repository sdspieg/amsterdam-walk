import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { stops } from '../data';

export default function MapView({ height = 580, fitOnMount = true, onPinClick = null, activeId = null, scrollWheelZoom = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;  /* already initialized */

    const validStops = stops.filter(s => Array.isArray(s.coords) && s.coords.length === 2);
    if (!validStops.length) return;
    const bounds = L.latLngBounds(validStops.map(s => s.coords));

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom,
      attributionControl: false,
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
      color: '#d4a857',
      weight: 3,
      opacity: 0.7,
      dashArray: '4 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const markers = {};
    validStops.forEach(stop => {
      const html = `<div class="walk-pin"><span>${stop.number}</span></div>`;
      const icon = L.divIcon({
        className: 'walk-pin-wrap',
        html, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
      });
      const marker = L.marker(stop.coords, { icon, title: stop.title }).addTo(map);
      marker.bindPopup(`
        <h4>${stop.title}</h4>
        <p>${stop.subtitle || ''}</p>
        <a href="#" data-stop-link="${stop.id}">Read about this stop ↗</a>
      `);
      marker.on('click', (ev) => {
        if (onPinClick) {
          onPinClick(stop, ev);
          ev.originalEvent?.stopPropagation?.();
        }
      });
      markers[stop.id] = marker;
    });

    /* Popup link → navigate to stop page */
    map.on('popupopen', (ev) => {
      const a = ev.popup._contentNode?.querySelector('[data-stop-link]');
      if (a) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(`/stop/${a.dataset.stopLink}`);
        });
      }
    });

    mapRef.current = map;
    markersRef.current = markers;
    map._validBounds = bounds;
    map._validStops = validStops;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  /* Mark active pin */
  useEffect(() => {
    if (!mapRef.current) return;
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement()?.querySelector('.walk-pin');
      if (el) el.classList.toggle('is-active', id === activeId);
    });
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className="leaflet-map"
      style={{ height: typeof height === 'number' ? height + 'px' : height }}
      aria-label="Map of the walking route"
    />
  );
}

/* expose for MapWalkPage */
export function getMapRef(viewRef) {
  return viewRef.current;
}
