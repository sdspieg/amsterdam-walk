import raw from './stops.json';

/* Normalize image URLs from "assets/img/foo.jpg" → "/assets/img/foo.jpg" so
   they resolve against the site root regardless of which page renders them. */
function normalizeUrl(u) {
  if (!u || typeof u !== 'string') return u;
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')) return u;
  return '/' + u;
}

function normalizeMedia(media) {
  if (!media) return media;
  const out = { ...media };
  if (out.hero_image && out.hero_image.url) {
    out.hero_image = { ...out.hero_image, url: normalizeUrl(out.hero_image.url) };
  }
  if (Array.isArray(out.gallery)) {
    out.gallery = out.gallery.map(g => ({ ...g, url: normalizeUrl(g.url) }));
  }
  return out;
}

export const data = {
  ...raw,
  stops: (raw.stops || []).map(s => ({
    ...s,
    media: normalizeMedia(s.media),
  })),
};

export const stops = data.stops;
export const contextPanels = data.context_panels || {};

export function findStop(id) {
  return stops.find(s => s.id === id);
}
export function findStopIndex(id) {
  return stops.findIndex(s => s.id === id);
}
export function adjacentStops(id) {
  const i = findStopIndex(id);
  return {
    prev: i > 0 ? stops[i - 1] : null,
    next: i < stops.length - 1 ? stops[i + 1] : null,
    index: i,
    total: stops.length,
  };
}
