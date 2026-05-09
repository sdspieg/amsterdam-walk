import SourcePill from './SourcePill';

export default function Fact({ fact }) {
  return (
    <li className="fact">
      <p className="fact__claim">
        <span className={'fact__bullet' + (fact.verified === false ? ' fact__bullet--unverified' : '')} aria-hidden="true" />
        <span className="fact__claim-text">{fact.claim}</span>
      </p>
      {fact.amplification && (
        <details className="fact__amplification">
          <summary>More context</summary>
          <p>{fact.amplification}</p>
        </details>
      )}
      {fact.sources && fact.sources.length > 0 && (
        <div className="fact__sources">
          {fact.sources.map((s, i) => <SourcePill key={i} source={s} />)}
        </div>
      )}
    </li>
  );
}
