import { VERDICT_META } from './Icons';

export function VerdictBanner({ verdict, verdictTitle, verdictSub }) {
  const meta = VERDICT_META[verdict] || VERDICT_META.warn;
  const Icon = meta.icon;
  return (
    <div className={`verdict-banner ${meta.cls}`}>
      <div className="verdict-icon"><Icon color={meta.color} /></div>
      <div>
        <div className="verdict-title" style={{ color: meta.color }}>{verdictTitle}</div>
        <div className="verdict-sub">{verdictSub}</div>
      </div>
    </div>
  );
}

export function RuleList({ rules }) {
  if (!rules?.length) return <div className="placeholder">No rule results yet.</div>;
  return (
    <div className="rule-grid">
      {rules.map((r, i) => (
        <div className="rule-row" key={i}>
          <span className="rule-num mono">{String(i + 1).padStart(2, '0')}</span>
          <div className="rule-body">
            <div className="rule-head">
              <span className="rule-label">{r.label}</span>
              <span className={`pill ${r.status}`}>{r.status.toUpperCase()}</span>
            </div>
            <div className="rule-note">{r.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FieldList({ fields }) {
  if (!fields?.length) return <div className="placeholder">Run a scan to populate declaration fields.</div>;
  return (
    <div>
      {fields.map((f, i) => (
        <div className="field-row" key={i}>
          <span className="field-name">{f.label}</span>
          <span className={`field-val mono${f.value ? '' : ' empty'}`}>
            {f.value || 'not detected'}
            <span className={`badge ${f.value ? 'found' : 'miss'}`}>{f.value ? 'FOUND' : 'MISSING'}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
