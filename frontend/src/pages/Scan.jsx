import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { VerdictBanner, RuleList, FieldList } from '../components/ScanResult';

export default function Scan() {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  function reset() {
    setPreviewUrl(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('uploading');
    setResult(null);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/api/scans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Scan failed — please try another image.');
      setStatus('error');
    }
  }

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <p className="eyebrow"><span className="dot" /> Live scan</p>
          <h1>Scan a label</h1>
          <p className="sub">Upload a packaged-commodity label photo. OCR and the 10-category Legal Metrology rule engine run on the server, then the result is saved to the repository.</p>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <p className="panel-label">Input</p>

          {!previewUrl ? (
            <div
              className={`dropzone${dragging ? ' drag' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a94a3" strokeWidth="1.4">
                <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10.5" r="1.5" /><path d="M21 15l-5-5L5 19" />
              </svg>
              <div className="hint"><b>Drop a label image</b> or click to upload<br />JPG or PNG</div>
            </div>
          ) : (
            <div className="stage">
              <img src={previewUrl} alt="Uploaded label" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />

          <div className="toolbar">
            <span className={`status mono${status === 'uploading' ? ' busy' : ''}`}>
              {status === 'idle' && 'Awaiting image'}
              {status === 'uploading' && 'Scanning — running OCR + rule engine…'}
              {status === 'done' && 'Done — saved to repository'}
              {status === 'error' && 'Scan failed'}
            </span>
            {previewUrl && <button onClick={reset}>New scan</button>}
          </div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          {status === 'done' && result && (
            <div className="verdict-banner pass" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                Saved. <Link to={`/reports/${result._id}`} style={{ color: 'var(--accent-strong)', fontWeight: 600 }}>View full report →</Link>
              </span>
            </div>
          )}
        </div>

        <div className="panel">
          <p className="panel-label">Extracted declarations</p>
          <FieldList fields={result?.fields} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <p className="panel-label">Rule engine result &middot; Legal Metrology (Packaged Commodities) Rules, 2011</p>
        {result ? (
          <>
            <VerdictBanner verdict={result.verdict} verdictTitle={result.verdictTitle} verdictSub={result.verdictSub} />
            <RuleList rules={result.rules} />
          </>
        ) : (
          <div className="placeholder">Run a scan above to generate the compliance verdict.</div>
        )}
      </div>
    </div>
  );
}
