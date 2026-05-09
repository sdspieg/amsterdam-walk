export default function SourcePill({ source }) {
  if (!source || !source.url) return null;
  let label = source.title || '';
  try {
    const u = new URL(source.url);
    const host = u.hostname.replace(/^www\./, '');
    label = host.split('.').slice(0, -1).join('.') || host;
    if (label.length > 20) label = label.slice(0, 20) + '…';
  } catch (e) { /* keep title */ }
  return (
    <a className="source-pill" href={source.url} target="_blank" rel="noopener" title={source.title || ''}>
      {label}
    </a>
  );
}
