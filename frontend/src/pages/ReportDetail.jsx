import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { VerdictBanner, RuleList, FieldList } from '../components/ScanResult';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    api.get(`/api/scans/${id}`).then((res) => setScan(res.data)).finally(() => setLoading(false));
  }, [id]);

  async function downloadFile(kind) {
    setExporting(kind);
    try {
      const res = await api.get(`/api/scans/${id}/report.${kind}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan-${id}.${kind}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting('');
    }
  }

  if (loading) return <div className="view"><div className="placeholder">Loading…</div></div>;
  if (!scan) return <div className="view"><div className="placeholder">Scan not found.</div></div>;

  return (
    <div className="view">
      <div className="report-head">
        <button className="back-link" onClick={() => navigate(-1)}>&larr; Back</button>
        <div className="export-actions">
          <button onClick={() => downloadFile('csv')} disabled={exporting === 'csv'}>
            {exporting === 'csv' ? 'Exporting…' : 'Export CSV (editable)'}
          </button>
          <button className="primary" onClick={() => downloadFile('pdf')} disabled={exporting === 'pdf'}>
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <p className="panel-label">Scanned label</p>
          <img className="report-img" src={`${apiBase}${scan.imageUrl}`} alt="Scanned label" />
          <p className="panel-label" style={{ marginTop: 18 }}>Extracted declarations</p>
          <FieldList fields={scan.fields} />
        </div>

        <div className="panel">
          <p className="panel-label">Rule engine result</p>
          <VerdictBanner verdict={scan.verdict} verdictTitle={scan.verdictTitle} verdictSub={scan.verdictSub} />
          <RuleList rules={scan.rules} />
        </div>
      </div>
    </div>
  );
}
