import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileAudio, FileVideo } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndPassFile(file);
    }
  }, [disabled, onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    const validTypes = ['audio/', 'video/'];
    if (validTypes.some(type => file.type.startsWith(type))) {
      onFileSelect(file);
    } else {
      alert("Por favor, selecione apenas arquivos de áudio ou vídeo.");
    }
  };

  const triggerSelect = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerSelect}
      className={`
        relative flex flex-col items-center justify-center w-full h-64 
        border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-900/50' : 
          isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
            : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="audio/*,video/*"
        onChange={handleInputChange}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50'}`}>
          <Upload size={32} />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-200">
            Clique para carregar ou arraste e solte
          </p>
          <p className="text-sm mt-1">
            Suporta MP3, WAV, MP4, WebM, etc.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium opacity-60">
          <span className="flex items-center gap-1"><FileAudio size={14}/> Áudio</span>
          <span className="flex items-center gap-1"><FileVideo size={14}/> Vídeo</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;