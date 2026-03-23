import { useRef, useState } from 'react';

const API = 'http://localhost:8000/api/v1';

export default function ScriptUpload({ onUploadComplete }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'fountain'].includes(ext)) {
      setError('Please upload a PDF or text file');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('script', file);
      const res = await fetch(`${API}/upload`, { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Upload failed');
      }
      const data = await res.json();
      // Fetch full analysis
      const analysisRes = await fetch(`${API}/analysis`);
      const analysis = await analysisRes.json();
      onUploadComplete(analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
    >
      <div className="icon">🎬</div>
      <h3>{uploading ? 'Analyzing Script...' : 'Drop your script here'}</h3>
      <p>Supports PDF, TXT, Fountain files</p>
      <input ref={fileRef} type="file" accept=".pdf,.txt,.fountain" onChange={(e) => handleFile(e.target.files[0])} />
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: '60%' }} /></div>
        </div>
      )}
      {error && <p style={{ color: 'var(--accent-danger)', marginTop: 12, fontSize: '0.85rem' }}>{error}</p>}
    </div>
  );
}
