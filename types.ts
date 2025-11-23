export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING_FILE = 'PROCESSING_FILE',
  READY_TO_TRANSCRIBE = 'READY_TO_TRANSCRIBE',
  TRANSCRIBING = 'TRANSCRIBING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
  type: 'audio' | 'video';
}

export interface TranscriptionResponse {
  text: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
}