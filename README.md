# Katherine's Amsterdam Walk

A memorial walking guide through Anne Frank's Amsterdam — Jewish history, Nazi occupation, resistance, and remembrance. Seventeen stops, every claim hyperlinked to authoritative sources.

**Live site:** [amsterdam-walk.rubase.org](https://amsterdam-walk.rubase.org/)

## What's in this repo

This repo holds two implementations side-by-side:

- **`v1.0-static/`** (tagged `v1.0-static` in git) — the original single-page static HTML/CSS/JS site. No build step. Deployed and live.
- **`react/` branch** — Vite + React SPA with per-stop URL routes (in progress).

## Static site (v1)

```
index.html               Single-page entry
assets/css/style.css     All styles (HCSS navy + gold palette)
assets/js/app.js         Map, slideshow, top nav, scroll-sync, keyboard
assets/js/data-loader.js Renders stops from data/stops.json
assets/img/              Hero images (one per stop)
assets/img/gallery/      Slideshow images (4-8 per stop)
data/stops.json          17 stops, fact-checked, sourced
deploy/deploy.sh         rsync to /stratbase/apps/webapps/amsterdam-walk on the
                         RuBase server (138.201.62.161)
deploy/nginx.*.conf      nginx vhost
```

### Local dev

```bash
python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

### Deploy

```bash
./deploy/deploy.sh
```

## Content

- **Original walk** by Katherine
- **Fact-checking, sourcing, photography selection, and presentation** by Claude (Anthropic). Every claim is hyperlinked to its source — Anne Frank House, NIOD, the Joods Cultureel Kwartier, the Verzetsmuseum, and the Holocaust Encyclopedia of the United States Holocaust Memorial Museum.
- **Photographs** from [Wikimedia Commons](https://commons.wikimedia.org/) (CC0 / CC BY / CC BY-SA / Public Domain). Each image carries inline credit.

## Stops

1. Homomonument (Westermarkt)
2. Anne Frank House (Prinsengracht 263)
3. National Monument on the Dam
4. Site of the Groote Club shooting
5. Jewish Resistance Monument (Joods Verzetsmonument)
6. Jewish Boys' Orphanage Memorial (Megádle Jethomim)
7. The Dock Worker (De Dokwerker)
8. Portuguese Synagogue (Esnoga)
9. Jewish Historical Museum (Great Synagogue)
10. Hollandsche Schouwburg / National Holocaust Museum
11. Walter Süskind & the children of the crèche
12. Attack on the Amsterdam Civil Registry
13. Dutch Resistance Museum (Verzetsmuseum)
14. Artis Royal Zoo — hiding place for onderduikers
15. Auschwitz Monument — *Nooit meer Auschwitz*
16. National Holocaust Names Monument
17. Walter Süskind Bridge

## License

Code released under MIT. Photographs retain their original Commons licenses (per inline credits). Walk content (summaries, facts, captions) © 2026 — non-commercial reuse welcome with attribution.
