# Factcheck report — Katherine's Amsterdam Walk

Compiled 2026-05-09. Source: `Katherine's Amsterdam Walk.md`. Output: `stops.json`.

This report summarises errors found in the source document, ambiguities resolved against authoritative sources, and any claims that could not be confirmed. Sources for every factual statement live in the JSON itself (`facts[*].sources[]` and `resources[]`).

## Summary

The source document is broadly accurate as a walking outline but contains a series of factual errors, mostly typos and slips on names, dates and figures. The most consequential corrections concern: the death toll of the 7 May 1945 Dam Square shooting; the designer of the Jewish Resistance Monument; the spelling of the Artis director's name; the apparent date contradiction for the Auschwitz Monument; and the Netherlands' Jewish population statistics.

## Significant corrections (numerical / factual)

1. **Groote Club shooting (Stop 4) — death toll 32, not 22.** The source doc says "22 people killed". Wikipedia, the Stichting Memorial voor Damslachtoffers 7 mei 1945 (the dedicated memorial foundation) and the Anne Frank House timeline all agree the verified civilian death toll is 32 (some died of wounds in the days and weeks following). The 22 figure was an early newspaper estimate that was never officially revised. Wounded: 100-120, not "dozens".

2. **Jewish Resistance Monument (Stop 5) — designer is Joseph Glatt, not Bennie Bluhm.** Source doc reads as if Bluhm designed the monument. Bluhm was the *initiator* and fundraiser, through his Stichting Comité Joods Verzet 1940-1945 (founded 1986). The actual sculptor was the Belgian-born stonemason Joseph (Josef) Glatt, who specialised in Jewish gravestones. Bluhm died in 1986, two years before unveiling on 16 October 1988.

3. **Auschwitz Monument (Stop 15) — apparent contradiction resolved.** Source doc says both "Unveiled in 1993" and "Jan Wolkers created the monument in 1977". Both are correct, in sequence. Wolkers designed and first installed a smaller version at the Oosterbegraafplaats (Eastern Cemetery) in 1977, where the urn of Auschwitz ashes had been buried in 1952. In 1993 the monument was enlarged and moved (with the urn) to the Wertheimpark, where annual commemorations have been held ever since. The night before the 1993 re-unveiling, an addicted glazier vandalised the panels with a pickaxe.

4. **Artis director's name (Stop 14) — Armand Sunier, not "Suner".** Full name: Armand Louis Jean Sunier (1886-1974), third director of Artis 1927-1953. Internationally known as a saviour of the European bison.

5. **Otto Treumann (Stop 6) — two n's, not one.** Source doc spells "Treuman".

6. **Jewish population numbers (occupation overview).** Source doc gives 115,000 Jews in NL and 85,000 in Amsterdam. The standard figures from Anne Frank House, USHMM and NIOD: ~140,000 Jews in NL and ~79,000 in Amsterdam in 1941. About 102,000 — roughly 75% — were murdered, the highest proportion in Western Europe.

7. **Population Register attack (Stop 12) — co-leader was Willem Arondeus.** Source doc names only Gerrit van der Veen. Arondeus (1894-1943), painter, writer and one of the few openly gay heroes of European resistance, was the principal organiser; Van der Veen was the operational leader. Arondeus was executed at Overveen on 2 July 1943 with eleven others. His final message: "Tell people that homosexuals are not cowards."

8. **Süskind's helpers (Stop 11) — names misspelled.** Source doc lists "Peimental, Ver Hulst". Correct: Henriëtte Henriques Pimentel (crèche director, murdered Auschwitz 17 September 1943) and Johan van Hulst (head of the teacher-training school next door, named Righteous Among the Nations 1972, lived to 106). Felix Halverstad — the in-house bookkeeper accomplice — should also be credited.

9. **Hollandsche Schouwburg deportation period (Stop 10) — 20 July 1942 to 19 November 1943.** The source doc lacks dates here. Roughly 46,000 Jews were processed through the building (some sources say up to 100,000 if you count brief overnight holds). Crucially, the new Nationaal Holocaustmuseum opened nearby on 10 March 2024 — the source doc was written before this and treats the Schouwburg as a stand-alone site.

10. **Artis "oldest zoo in Europe" — overstatement (Stop 14).** Artis (founded 1838) is the oldest zoo in the Netherlands and one of the oldest in continental Europe — but it is not the oldest. Vienna's Tiergarten Schönbrunn (1752) and Madrid's zoo (1770) are older.

## Spelling / typo fixes

- "loyatly" → "loyalty" (Stop 3)
- "Duch" → "Dutch" (Stop 15)
- "oppresso" → "oppressor" (Stop 7)
- "Suner" → "Sunier" (Stop 14)
- "Treuman" → "Treumann" (Stop 6)
- "Peimental" → "Pimentel"; "Ver Hulst" → "Van Hulst" (Stop 11)
- "his in Artis" → "hid in Artis" (Stop 14)
- "dies" → "died" (Stop 15)

## Ambiguities resolved

- **Number of resistance attackers on 27 March 1943 (Stop 12):** doc says 10. Wikipedia and the Anne Frank House timeline say 9. Other counts (10, 11, even 14) reflect different ways of counting peripheral helpers, lookouts and the technical accomplices who supplied the explosives. The figure 9 is best for the operational team that entered the building.

- **Number of Süskind children saved (Stop 11):** ranges from ~600 to ~1,000 in different accounts. The conservative and most-cited figure is 600. The documentary "Secret Courage" uses ~1,000 (including the broader network's reach). I've kept "approximately 600" but flagged the variance.

- **The Maccabi-or-Olympia boxing club (Stop 5):** doc says "Jewish boxing school". The most documented one is Olympia, where Bluhm boxed. Maccabi was a separate Jewish sports federation (founded 1888) — many of its athletes joined self-defence units, but the specific Bluhm group operated out of Olympia.

## Claims I could not verify

- The "1270" date for Amsterdam's founding (Stop 3) — varies in sources between c. 1250 and c. 1275. The first written record is the 1275 toll exemption from Count Floris V; Britannica gives "around 1250". I retained "around 1270" as plausible-and-consistent-with-doc.

- Specific Kriegsmarine unit at the Groote Club (Stop 4) — never officially identified; even the Wikipedia article notes "the shooting was never fully investigated". The full motive is also not securely established.

- Source doc mentions distributing flyers reading "Strike! Show solidarity with the Jewish part of our society which has been hit so hard." (Stop 7 / strike context). The Communist underground did circulate strike pamphlets on 24-25 February 1941 with that general message; the exact translated wording in the doc is plausible but I couldn't pin it to a specific archival reproduction.

## Items the JSON adds beyond the source doc

- **Anne Frank House** as Stop 2 (the doc treats it as the implied start; the JSON makes it an explicit stop with coordinates).
- **Walter Süskind** as Stop 11 — separated from the Hollandsche Schouwburg entry to give him his due weight.
- An **occupation overview context panel** with the corrected population numbers.
- **Coordinates** to 5 decimal places for every stop, sourced from Wikipedia infoboxes / OpenStreetMap.
- Wikimedia Commons hero images for stops where free-licence photos are clearly available; flagged "image-not-included" elsewhere so the app can fetch local copies.
- **YouTube videos** for Anne Frank House (official virtual tour, 2 episodes) and the Names Monument (Studio Libeskind tour film). Other stops do not yet have a strong, authoritative YouTube source identified.

## Sources of authority used

In descending priority: Anne Frank House (annefrank.org), Joods Cultureel Kwartier (jck.nl), Verzetsmuseum (verzetsmuseum.org), Studio Libeskind (libeskind.com), Nederlands Auschwitz Comité (auschwitz.nl), Stadscuratorium Amsterdam (stadscuratorium.nl), Stichting Memorial voor Damslachtoffers 7 mei 1945, Joods Monument (joodsmonument.nl), Nationaal Comité 4 en 5 mei (4en5mei.nl), USHMM Holocaust Encyclopedia (encyclopedia.ushmm.org), Yad Vashem, English and Dutch Wikipedia (cross-checked), TracesOfWar (tracesofwar.com / .nl).
