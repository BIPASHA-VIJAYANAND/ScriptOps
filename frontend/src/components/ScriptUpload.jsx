import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

export default function ScriptUpload({ onFileSelect }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'fountain'].includes(ext)) {
      setError('Please upload a PDF, TXT, or Fountain file');
      return;
    }
    setError('');
    onFileSelect(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-16 cursor-pointer
        ${dragging ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-accent/40 hover:bg-white/[0.02]'}
      `}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
    >
      <input ref={fileRef} type="file" accept=".pdf,.txt,.fountain" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />

      <motion.div 
        key="idle"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
         <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-accent/20 to-purple-500/20 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(124,58,237,0.15)] group-hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-all">
           <UploadCloud size={48} strokeWidth={1.5} />
         </div>
         <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Drop your script here</h3>
         <p className="text-slate-400 font-medium tracking-wide">Or click to browse files</p>
         <div className="mt-8 flex gap-3">
           {['.PDF', '.TXT', '.FOUNTAIN'].map(ext => (
             <span key={ext} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-500">{ext}</span>
           ))}
         </div>
      </motion.div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-8 text-red-400 font-medium text-sm mt-8 border border-red-500/30 bg-red-500/10 px-4 py-2 rounded-lg">
          ⚠️ {error}
        </motion.p>
      )}
    </motion.div>
  );
}
