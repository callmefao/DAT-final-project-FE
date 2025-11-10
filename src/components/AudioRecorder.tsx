import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { useErrorOverlay } from "../hooks/useErrorOverlay";
import { convertToWav } from "../utils/audioConverter";

const buildMimeType = () => {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return undefined;
  }

  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/webm",
    "audio/ogg"
  ];

  for (const type of preferredTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return undefined;
};

type AudioRecorderProps = {
  label?: string;
  description?: string;
  onRecordingComplete: (file: File | null) => void;
  disabled?: boolean;
  file?: File | null;
  onDurationChange?: (durationSeconds: number) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  maxDuration?: number; // Maximum recording duration in seconds
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
};

const AudioRecorder = ({
  label,
  description,
  onRecordingComplete,
  disabled = false,
  file,
  onDurationChange,
  onStartRecording,
  onStopRecording,
  maxDuration
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useErrorOverlay();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mimeTypeRef = useRef<string | undefined>(buildMimeType());

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecordingState = useCallback(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setIsProcessing(false);
    resetTimer();
    cleanupStream();
  }, [cleanupStream, resetTimer]);

  const handleStop = useCallback(async () => {
    setIsProcessing(true);
    const mimeType = mimeTypeRef.current ?? recorderRef.current?.mimeType ?? "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });

    if (!blob.size) {
      showError("No audio captured. Please try recording again.");
      onRecordingComplete(null);
      setIsProcessing(false);
      resetRecordingState();
      return;
    }

    try {
      // Convert to WAV format
      const wavBlob = await convertToWav(blob);
      const recordingFile = new File([wavBlob], `voice-recording-${Date.now()}.wav`, {
        type: 'audio/wav'
      });

      const objectURL = URL.createObjectURL(wavBlob);
      setAudioURL((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return objectURL;
      });

      onRecordingComplete(recordingFile);
    } catch (error) {
      console.error('Error converting audio to WAV:', error);
      showError("Failed to process audio. Please try again.");
      onRecordingComplete(null);
    } finally {
      setIsProcessing(false);
      resetRecordingState();
    }
  }, [onRecordingComplete, resetRecordingState, showError]);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;
    setIsRecording(false);
    resetTimer();
    recorderRef.current.stop();
    if (typeof onStopRecording === "function") onStopRecording();
  }, [resetTimer, onStopRecording]);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording) return;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      showError("Recording is not supported in this browser.");
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = mimeTypeRef.current;
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();

      setIsRecording(true);
      if (typeof onStartRecording === "function") onStartRecording();
      timerRef.current = window.setInterval(() => {
        setDuration((value) => {
          const newValue = value + 1;
          // Auto-stop when reaching maxDuration
          if (maxDuration && newValue >= maxDuration) {
            stopRecording();
          }
          return newValue;
        });
      }, 1000);

      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      onRecordingComplete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to access microphone.";
      setError(message);
      showError("Could not access the microphone. Please allow permission.");
      cleanupStream();
    }
  }, [audioURL, cleanupStream, disabled, handleStop, isRecording, onRecordingComplete, showError, onStartRecording, maxDuration, stopRecording]);

  const cancelRecording = useCallback(() => {
    if (isRecording && recorderRef.current?.state === "recording") {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    resetRecordingState();
    setDuration(0);
    setIsRecording(false);
    chunksRef.current = [];
    onRecordingComplete(null);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
  }, [audioURL, isRecording, onRecordingComplete, resetRecordingState]);

  useEffect(() => () => {
    resetTimer();
    cleanupStream();
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  }, [audioURL, cleanupStream, resetTimer]);

  useEffect(() => {
    if (!file && audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
  }, [audioURL, file]);

  useEffect(() => {
    if (typeof onDurationChange === "function") {
      onDurationChange(duration);
    }
  }, [duration, onDurationChange]);

  const supported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!window.MediaRecorder &&
    !!navigator.mediaDevices;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      {description && <span className="text-xs text-slate-500">{description}</span>}

      <div
        className={clsx(
          "flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
          !supported && "opacity-60"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-full",
              isRecording ? "bg-red-100 text-red-500" : "bg-primary/10 text-primary"
            )}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3 3 0 003-3v-6a3 3 0 10-6 0v6a3 3 0 003 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11v1a7 7 0 11-14 0v-1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v2" />
              </svg>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {supported ? (isRecording ? "Đang ghi âm" : "Ghi âm mới") : "Không hỗ trợ ghi âm"}
            </p>
            <p className="text-xs text-slate-500">
              {supported
                ? isRecording
                  ? maxDuration
                    ? `Đọc rõ ràng câu trên. Sẽ tự động dừng sau ${maxDuration} giây.`
                    : "Đọc rõ ràng và nhấn dừng khi hoàn tất."
                  : "Nhấn nút bắt đầu để ghi âm bằng micro."
                : "Trình duyệt không hỗ trợ ghi âm micro."}
            </p>
          </div>

          {supported && (
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
              <span className={clsx(isRecording ? "text-red-500" : "text-slate-500")}>
                {maxDuration && isRecording ? "Còn lại" : "Thời lượng"}
              </span>
              <span className="tabular-nums text-sm text-slate-800">
                {maxDuration && isRecording 
                  ? formatDuration(Math.max(0, maxDuration - duration))
                  : formatDuration(duration)}
              </span>
              {isRecording && <span className="ml-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {supported && !isRecording && (
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={startRecording}
              disabled={disabled || isProcessing}
            >
              Bắt đầu ghi âm
            </button>
          )}

          {supported && isRecording && (
            <>
              <button
                type="button"
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500/90"
                onClick={stopRecording}
              >
                Dừng
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                onClick={cancelRecording}
              >
                Hủy
              </button>
            </>
          )}

          {supported && audioURL && !isRecording && (
            <button
              type="button"
              className="rounded-full bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              onClick={() => {
                onRecordingComplete(null);
                URL.revokeObjectURL(audioURL);
                setAudioURL(null);
                setDuration(0);
              }}
            >
              Xóa ghi âm
            </button>
          )}
        </div>

        {supported && audioURL && !isRecording && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <audio controls src={audioURL} className="w-full" />
            <span className="text-xs text-slate-500">Preview your captured audio before submitting.</span>
          </div>
        )}

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
};

export default AudioRecorder;
