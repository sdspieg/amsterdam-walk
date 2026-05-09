# Gallery enrichment report

Generated 2026-05-09 by populating `media.gallery` for each of the 17 stops in `stops.json` from Wikimedia Commons categories. Hero images were not modified.

## Counts

| # | Stop | Images |
|---|------|--------|
| 1 | homo-monument | 8 |
| 2 | anne-frank-house | 8 |
| 3 | national-monument-dam | 7 |
| 4 | groote-club-shooting | 5 |
| 5 | jewish-resistance-monument | 6 |
| 6 | jewish-boys-orphanage | 5 |
| 7 | dokwerker | 8 |
| 8 | portuguese-synagogue | 7 |
| 9 | jewish-historical-museum | 6 |
| 10 | hollandsche-schouwburg | 8 |
| 11 | suskind | 8 |
| 12 | population-register-attack | 5 |
| 13 | verzetsmuseum | 7 |
| 14 | artis-zoo | 6 |
| 15 | auschwitz-monument | 6 |
| 16 | namenmonument | 8 |
| 17 | suskind-bridge | 7 |
| | **Total** | **115** |

All stops are within the 5–8 target range.

## Sources

All images were sourced from Wikimedia Commons. The dominant source for archival WWII-era and post-war photographs is the **Anefo press-photo collection** (Nationaal Archief, donated to Wikimedia under CC0). Other major sources used:

- **Stadsarchief Amsterdam** (city archive — pre-war photographs of buildings, mostly Public Domain)
- **Joods Historisch Museum** (Jewish Historical Museum) image collection — Public Domain photographs of named Jewish residents
- **NIOD / Anne Frank House** photo collection (Public Domain wartime photographs)
- **Bundesarchiv** (CC BY-SA 3.0 de — used once: Miep Gies 1989)
- **IISG Amsterdam** (post-war archival photographs, CC BY-SA 2.0)
- **Crèche Plantage Middenlaan** archival children's photographs (Public Domain, c.1942 — these are the actual children Walter Süskind smuggled out)
- Original photographers credited in the `credit` field for each entry

## Categories searched

Most categories used the canonical English/Dutch Commons category names (e.g. `Category:Anne Frank House`, `Category:Hollandsche Schouwburg`). Several required searching with diacritic variants (`Süskind` vs `Suskind`) or Dutch synonyms (`Joods Verzetsmonument` is in `Category:Monument Joods Verzet`, not the English-style "Jewish Resistance Monument"). The harvesting script saved candidate metadata in `/tmp/galleries/` for each stop.

For event-based stops with no single architectural subject, additional searches were used:
- **dokwerker**: also pulled Razzia archival photos via direct title-lookup (`Category:February strike` was empty; the actual Razzia images live as standalone files).
- **anne-frank-house**: also pulled Otto Frank, Miep Gies, bookcase and diary photos via direct lookup, since the category leans modern.
- **suskind**: also pulled Crèche photos directly from `Category:Crèche - Plantage Middenlaan 31-33, Amsterdam` and the Hervormde Kweekschool building from `Category:Plantage Middenlaan 27, Amsterdam`.
- **population-register-attack**: also pulled Willem Arondéus portraits and resistance commemoration photos via direct lookup.

## Constraints encountered

1. **No CC-licensed photo of Walter Süskind himself.** The `Category:Walter Süskind` on Commons holds 4 files: the 1972 plaque-unveiling photos (used), a modern bridge plaque close-up (used), and a Stolperstein in Bergen op Zoom. The famous portrait of Süskind that appears in books on him is held by the Joods Historisch Museum and is not on Commons under a free license. The walk's Süskind stop therefore relies on photos of the children he saved (the Crèche c.1942 archival photos), the surrounding buildings, and the bridge plaque, rather than a portrait of the man.

2. **Population Register Attack — 1943 fire damage photo is single-source.** Only one wartime photo (Politie Amsterdam, 28 March 1943) of the post-attack interior is on Commons; the rest of the gallery uses the Willem Arondéus portrait, his pre-war drawing, and post-war commemoration photos. This is acceptable but means the gallery has fewer "in-the-moment" archival images than e.g. the Razzia stop.

3. **Jewish Boys' Orphanage (Megádle Jethomim) is sparse.** Commons has only 5 modern photos of the building at Rapenburgerstraat 171 — no archival pre-war photos of the boys, and no portrait of the head of the orphanage. The gallery is at the floor of the 5–8 range and is necessarily heavy on building photos. Note that some online sources mistakenly identify this address as the girls' orphanage; the gallery notes the historical correction.

4. **Groote Club shooting (7 May 1945) has no in-the-moment photos.** The shooting itself was not photographed (or those photos are not on Commons). The gallery uses pre-war and turn-of-the-century photographs of the building from various angles, with notes that explain what happened on the balcony.

5. **National Monument Dam — Wikimedia category is heavy on tourism shots.** The most evocative gallery images are the 4 May 1956 unveiling photos by Anefo. Modern post-1990 photos of the monument are mostly unremarkable tourist shots and were not selected.

6. **Some `credit` fields contain a slightly raw artist string** (e.g. `Willem Arondéus (1894 -1943)` or `Schuitvlot, Nic. (1859-1947)` — written as the file's original metadata gave it). These are accurate but not stylistically polished; the front-end may want to apply a final cleanup pass if desired.

## License distribution

All entries are one of: **CC0**, **Public domain**, **CC BY 2.0/3.0/4.0**, or **CC BY-SA 2.0/3.0/3.0 nl/4.0**. No copyrighted or restricted-license images are included.

The Bundesarchiv image (Miep Gies 1989) carries `CC BY-SA 3.0 de` (German variant) — fully compatible with the rest.

## Notes on the captions (`note` field)

Each `note` was written by the assistant, drawing on Wikipedia (English and Dutch), the Anne Frank House website, the NIOD WWII institute, and the original Anefo / Stadsarchief / NIOD captions visible in the file metadata. Substantive historical claims (numbers deported, dates, names, fates) were cross-checked. The notes are 1–4 sentences and avoid simply paraphrasing the file's auto-description; instead they offer historical context and connect the image to the rest of the walk.

The crèche children's photos at Plantage Middenlaan are particularly affecting: **Sally de Leeuw, Hanna Reimer, Robbie de Jong, Appie Prins** — these are real named children, and the captions name them. Some were saved by Süskind's network; the fates of others are unknown. Visitors standing in front of the crèche (now part of the National Holocaust Museum) can look at the same windows the photos were taken behind.
