import React, { useState, useEffect } from 'react';
import { Mic2, Loader2, PlayCircle, AlertCircle, X, Wand2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TranscriptionResult from './components/TranscriptionResult';
import { fileToBase64 } from './utils';
import { transcribeMedia } from './services/geminiService';
import { AppStatus, FileData, ErrorState } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '' });

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (fileData?.previewUrl) {
        URL.revokeObjectURL(fileData.previewUrl);
      }
    };
  }, [fileData]);

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.PROCESSING_FILE);
    setError({ hasError: false, message: '' });

    try {
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);

      setFileData({
        file,
        previewUrl,
        base64,
        mimeType: file.type,
        type: isVideo ? 'video' : 'audio'
      });
      setStatus(AppStatus.READY_TO_TRANSCRIBE);
    } catch (err) {
      console.error(err);
      setError({ hasError: true, message: 'Falha ao processar o arquivo. Tente novamente.' });
      setStatus(AppStatus.IDLE);
    }
  };

  const handleTranscribe = async () => {
    if (!fileData) return;

    setStatus(AppStatus.TRANSCRIBING);
    setError({ hasError: false, message: '' });

    try {
      const response = await transcribeMedia(fileData.base64, fileData.mimeType);
      setTranscription(response.text);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Ocorreu um erro durante a transcrição.';
      if (err.message && err.message.includes('API_KEY')) {
        errorMessage = 'Erro de configuração: Chave da API inválida ou ausente.';
      } else if (err.status === 413) {
         errorMessage = 'O arquivo é muito grande para ser processado diretamente.';
      }
      setError({ hasError: true, message: errorMessage });
      setStatus(AppStatus.READY_TO_TRANSCRIBE); // Let user try again or change file
    }
  };

  const handleReset = () => {
    setFileData(null);
    setTranscription('');
    setError({ hasError: false, message: '' });
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Mic2 className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FluxoScribe</h1>
          </div>
          <div className="text-sm font-medium text-slate-400 hidden sm:block">
            Desenvolvido com Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Intro */}
        {status === AppStatus.IDLE && (
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Transforme Áudio e Vídeo em Texto
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Carregue suas gravações e obtenha transcrições precisas em segundos com tecnologia de IA avançada.
            </p>
          </div>
        )}

        {/* File Upload Area */}
        {status === AppStatus.IDLE && (
          <div className="animate-in zoom-in-95 duration-500">
            <FileUpload onFileSelect={handleFileSelect} disabled={false} />
          </div>
        )}

        {/* Processing State */}
        {status === AppStatus.PROCESSING_FILE && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
            <p className="text-slate-300">Preparando seu arquivo...</p>
          </div>
        )}

        {/* Preview & Actions */}
        {(status === AppStatus.READY_TO_TRANSCRIBE || status === AppStatus.TRANSCRIBING || status === AppStatus.COMPLETED || status === AppStatus.ERROR) && fileData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* File Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-slate-800 p-2 rounded-lg shrink-0">
                    <PlayCircle className="text-indigo-400" size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-medium text-slate-200 truncate pr-4" title={fileData.file.name}>
                      {fileData.file.name}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB • {fileData.mimeType}
                    </p>
                  </div>
                </div>
                {status !== AppStatus.TRANSCRIBING && (
                  <button 
                    onClick={handleReset}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Media Player */}
              <div className="w-full bg-black/40 rounded-lg overflow-hidden border border-slate-800">
                {fileData.type === 'video' ? (
                  <video 
                    controls 
                    src={fileData.previewUrl} 
                    className="w-full max-h-[400px] mx-auto"
                  />
                ) : (
                  <audio 
                    controls 
                    src={fileData.previewUrl} 
                    className="w-full mt-2 mb-2" 
                  />
                )}
              </div>

              {/* Action Area */}
              {status === AppStatus.READY_TO_TRANSCRIBE && (
                <div className="mt-6 flex justify-end">
                   <button
                    onClick={handleTranscribe}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Wand2 size={20} />
                    Iniciar Transcrição
                  </button>
                </div>
              )}

              {/* Loading Bar */}
              {status === AppStatus.TRANSCRIBING && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm text-indigo-300">
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      A IA está ouvindo e escrevendo...
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-pulse rounded-full w-2/3"></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error.hasError && (
                <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-sm">Erro</h4>
                    <p className="text-sm opacity-90">{error.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Result Section */}
            {status === AppStatus.COMPLETED && (
              <TranscriptionResult text={transcription} onReset={handleReset} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} FluxoScribe. Privacidade protegida.</p>
      </footer>
    </div>
  );
};

export default App;