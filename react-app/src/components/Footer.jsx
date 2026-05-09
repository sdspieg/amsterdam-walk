export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__rule" aria-hidden="true" />
      <div className="site-footer__inner">
        <div className="site-footer__col site-footer__col--lead">
          <h3 className="site-footer__heading">In remembrance</h3>
          <p>
            Of the roughly 107,000 Jews deported from the Netherlands during the Nazi occupation,
            some 5,200 survived. May their memory be a blessing.
          </p>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__heading">Sources</h3>
          <p>
            Every claim is hyperlinked to authoritative sources — Anne Frank House,
            NIOD, the Joods Cultureel Kwartier, the Verzetsmuseum, the Anne Frank Stichting research
            database, and the United States Holocaust Memorial Museum.
          </p>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__heading">Credits</h3>
          <p>
            Original itinerary by Katherine. Fact-checking, sourcing, photography selection and
            interactive presentation by Claude. Photographs from <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a> attributed in line.
          </p>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__heading">Walk</h3>
          <p>
            Map tiles by <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>,
            data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors.
            Built with <a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a> and React.
          </p>
        </div>
      </div>
      <div className="site-footer__date">
        <span>Published 2026 · hosted on <code>amsterdam-walk.rubase.org</code> · <a href="https://github.com/sdspieg/amsterdam-walk" target="_blank" rel="noopener">source on GitHub</a></span>
        <span>v2.0 — React</span>
      </div>
    </footer>
  );
}
