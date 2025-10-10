import { ChangeEvent } from "react";
import clsx from "clsx";

import { useErrorOverlay } from "../hooks/useErrorOverlay";

const ACCEPTED_TYPES = [
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/m4a"
];

type FileUploaderProps = {
  id?: string;
  label?: string;
  description?: string;
  onFileSelect: (file: File | null) => void;
  file?: File | null;
  error?: string;
};

const formatFileSize = (size: number) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** exponent;
  return `${value.toFixed(value > 10 ? 0 : 1)} ${units[exponent]}`;
};

const FileUploader = ({ id = "voice-file", label, description, onFileSelect, file, error }: FileUploaderProps) => {
  const { showError } = useErrorOverlay();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && !ACCEPTED_TYPES.includes(selectedFile.type)) {
      showError("Unsupported file type. Please upload a WAV or MP3 file.");
      onFileSelect(null);
      event.target.value = "";
      return;
    }

    onFileSelect(selectedFile ?? null);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      {description && <span className="text-xs text-slate-500">{description}</span>}
      <label
        htmlFor={id}
        className={clsx(
          "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-5 py-8 text-center transition-colors duration-200 hover:border-primary hover:bg-white",
          error && "border-red-400 hover:border-red-400"
        )}
      >
        <input
          id={id}
          type="file"
          accept=".wav,.mp3,.webm,.ogg,.m4a,audio/wav,audio/mpeg,audio/webm,audio/ogg,audio/mp4"
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 3v12m0 0l4-4m-4 4l-4-4m12 7H8a3 3 0 01-3-3V7"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">Drop your voice file here or click to browse</p>
            <p className="text-xs text-slate-500">Supported formats: WAV, MP3, WEBM • Max 10MB</p>
          </div>
        </div>
        {file && (
          <div className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600">
            <p className="truncate font-medium text-slate-800">{file.name}</p>
            <p className="text-slate-500">{formatFileSize(file.size)}</p>
          </div>
        )}
      </label>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default FileUploader;
