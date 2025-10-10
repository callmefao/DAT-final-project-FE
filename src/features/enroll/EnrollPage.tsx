import { ChangeEvent, FormEvent, useState } from "react";

import Button from "../../components/Button";
import AudioRecorder from "../../components/AudioRecorder";
import InputField from "../../components/InputField";
import ResultCard from "../../components/ResultCard";
import { enrollVoice } from "../../api/voiceApi";
import type { EnrollResponse } from "../../types/api";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/error";
import { useErrorOverlay } from "../../hooks/useErrorOverlay";

const EnrollPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [result, setResult] = useState<EnrollResponse | null>(null);
  const { login, updateUser } = useAuth();
  const { showError } = useErrorOverlay();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setResult(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      showError("Please enter a username.");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== passwordConfirm) {
      showError("Passwords do not match.");
      return;
    }

    if (!file) {
      showError("Please record a voice sample before submitting.");
      return;
    }

    if (voiceDuration < 5) {
      showError("Voice sample must be at least 5 seconds long.");
      return;
    }

    try {
      setIsRegistering(true);
      const response = await enrollVoice(trimmedUsername, file, password);

      setResult(response);
      login({ username: trimmedUsername, hasVoiceProfile: true });
      updateUser({ hasVoiceProfile: true });
      setPassword("");
      setPasswordConfirm("");
      setFile(null);
      setVoiceDuration(0);
    } catch (error) {
      showError(getErrorMessage(error, "Registration failed"));
    } finally {
      setIsRegistering(false);
    }
  };

  const resetAll = () => {
    setUsername("");
    setPassword("");
    setPasswordConfirm("");
    setFile(null);
    setVoiceDuration(0);
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Register your account</h1>
        <p className="text-sm text-slate-600">
          Create your credentials and record a voice sample to unlock seamless authentication.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Username"
            placeholder="Choose a unique username"
            value={username}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
            autoComplete="username"
            minLength={3}
            required
          />
          <InputField
            type="password"
            label="Password"
            placeholder="Create a secure password"
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <InputField
            type="password"
            label="Confirm password"
            placeholder="Re-enter your password"
            value={passwordConfirm}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Record your voice</h2>
          <p className="mt-2 text-sm text-slate-600">
            Record at least five seconds of clear audio to complete your registration.
          </p>

          <div className="mt-6">
            <AudioRecorder
              label="Voice Sample"
              description="Use your microphone and speak clearly for at least 5 seconds."
              onRecordingComplete={setFile}
              onDurationChange={setVoiceDuration}
              file={file}
            />
            <p className="mt-3 text-center text-xs text-slate-500">
              Current recording length: {voiceDuration.toFixed(0)} seconds
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="w-full sm:w-auto" isLoading={isRegistering}>
            {isRegistering ? "Submitting" : "Complete registration"}
          </Button>
          <Button type="button" variant="ghost" onClick={resetAll}>
            Reset form
          </Button>
        </div>
      </form>

      {result && (
        <ResultCard
          status="success"
          title="Voice profile added"
          subtitle={`Voice profile created for @${result.username}`}
        />
      )}
    </div>
  );
};

export default EnrollPage;
