import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';
import { downloadText } from '../utils';

interface TranscriptionResultProps {
  text: string;
  onReset: () => void;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    downloadText(text, `transcricao_${new Date().getTime()}.txt`);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-indigo-400">Resultado da Transcrição</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            title="Copiar para área de transferência"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            title="Baixar arquivo de texto"
          >
            <Download size={16} />
            Baixar
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
          >
            <RefreshCw size={16} />
            Novo
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-6 overflow-hidden relative">
        <div className="prose prose-invert prose-slate max-w-none max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;