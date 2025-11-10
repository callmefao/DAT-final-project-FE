import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import clsx from "clsx";

import { convertToWav } from "../../../utils/audioConverter";

const preferredMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
  "audio/webm",
  "audio/ogg"
];

type VoiceRecorderButtonProps = {
  disabled?: boolean;
  onRecordingComplete: (file: File | null, meta?: { audioUrl?: string; duration: number }) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onError?: (message: string) => void;
};

const VoiceRecorderButton = ({
  disabled = false,
  onRecordingComplete,
  onRecordingStateChange,
  onError
}: VoiceRecorderButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string | undefined>();

  const emitError = useCallback(
    (message: string) => {
      if (typeof onError === "function") {
        onError(message);
      }
    },
    [onError]
  );

  const detectMimeType = useCallback(() => {
    if (typeof window === "undefined" || !window.MediaRecorder) {
      return undefined;
    }

    for (const type of preferredMimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return undefined;
  }, []);

  useEffect(() => {
    mimeTypeRef.current = detectMimeType();
  }, [detectMimeType]);

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

  const resetState = useCallback(() => {
    resetTimer();
    cleanupStream();
    recorderRef.current = null;
    chunksRef.current = [];
    setDuration(0);
    setIsRecording(false);
    setIsProcessing(false);
    if (typeof onRecordingStateChange === "function") {
      onRecordingStateChange(false);
    }
  }, [cleanupStream, onRecordingStateChange, resetTimer]);

  const handleStop = useCallback(async () => {
    setIsProcessing(true);
    const mimeType = mimeTypeRef.current ?? recorderRef.current?.mimeType ?? "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });

    if (!blob.size) {
      emitError("No audio captured. Please try again.");
      onRecordingComplete(null);
      resetState();
      return;
    }

    try {
      // Convert to WAV format for backend compatibility
      const wavBlob = await convertToWav(blob);
      const file = new File([wavBlob], `voice-chat-${Date.now()}.wav`, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(wavBlob);

      onRecordingComplete(file, { audioUrl, duration });
    } catch (error) {
      console.error('Error converting audio to WAV:', error);
      emitError("Failed to process audio. Please try again.");
      onRecordingComplete(null);
    } finally {
      setIsProcessing(false);
      resetState();
    }
  }, [duration, emitError, onRecordingComplete, resetState]);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setDuration((value) => value + 1);
    }, 1000);
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording || isProcessing) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      emitError("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = mimeTypeRef.current;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = handleStop;
      recorder.start();

      setIsRecording(true);
      setDuration(0);
      startTimer();

      if (typeof onRecordingStateChange === "function") {
        onRecordingStateChange(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to access the microphone.";
      emitError(message);
      resetState();
    }
  }, [disabled, emitError, handleStop, isProcessing, isRecording, onRecordingStateChange, resetState, startTimer]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !recorderRef.current) {
      return;
    }

    resetTimer();
    recorderRef.current.stop();
  }, [isRecording, resetTimer]);

  const cancelRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    onRecordingComplete(null);
    resetState();
  }, [onRecordingComplete, resetState]);

  useEffect(
    () => () => {
      resetState();
    },
    [resetState]
  );

  const handlePointerDown = useCallback(
    (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      startRecording();
    },
    [startRecording]
  );

  const handlePointerUp = useCallback(
    (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      stopRecording();
    },
    [stopRecording]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isRecording) return;
    cancelRecording();
  }, [cancelRecording, isRecording]);

  return (
    <button
      type="button"
      disabled={disabled || isProcessing}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerLeave}
      className={clsx(
        "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50",
        disabled || isProcessing
          ? "bg-slate-200 text-slate-400"
          : isRecording
          ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
          : "bg-primary text-white shadow-sm hover:bg-primary/90"
      )}
      aria-label={isRecording ? "Stop recording" : "Hold to record voice message"}
    >
      {isRecording ? (
        <span className="text-xs font-semibold">REC</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3 3 0 003-3v-6a3 3 0 10-6 0v6a3 3 0 003 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11v1a7 7 0 11-14 0v-1" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v2" />
        </svg>
      )}

      {isRecording && (
        <span className="absolute -bottom-8 whitespace-nowrap rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
          Đang ghi âm…
        </span>
      )}

      {!isRecording && !isProcessing && (
        <span className="absolute -bottom-8 hidden whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white shadow-md lg:block">
          Nhấn giữ để nói
        </span>
      )}
    </button>
  );
};

export default VoiceRecorderButton;
