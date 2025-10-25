import { ChangeEvent, FormEvent, useRef, useState } from "react";

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
  const [step, setStep] = useState<1 | 2>(1);
  // single recording mode: no recordCount needed
  const [isRecording, setIsRecording] = useState(false);
  const recorderStartedRef = useRef(false);

  const { login, updateUser } = useAuth();
  const { showError } = useErrorOverlay();

  const passwordsMatch = password !== "" && password === passwordConfirm;

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

    if (!passwordsMatch) {
      showError("Passwords do not match.");
      return;
    }

    // advance to voice step
    setStep(2);
  };

  const handleFinalize = async () => {
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
      const trimmedUsername = username.trim();
      const response = await enrollVoice(trimmedUsername, file, password);

      setResult(response);
      login({ username: trimmedUsername, hasVoiceProfile: true });
      updateUser({ hasVoiceProfile: true });
      setPassword("");
      setPasswordConfirm("");
      setFile(null);
      setVoiceDuration(0);
  setStep(1);
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
    setStep(1);
  // no recordCount to reset in single recording mode
  };

  return (
    <>
      {/* full-screen background */}
      <div className="fun-bg-full" aria-hidden>
        <img src="/fun_bg.jpg" alt="background" />
        <div className="fun-overlay-full" />
      </div>

      <div className="enroll-split w-full relative z-10 md:min-h-[calc(100vh-64px)] md:flex md:items-center md:justify-between">
        <div className="hidden md:block md:w-3/5 px-12">
          <div className="text-white/90 max-w-xl">
            <h1 className="text-5xl font-extrabold drop-shadow-lg">Tech Fun — FPT x Voice Biometrics</h1>
            <p className="mt-3 text-lg">A playful approach to secure, passwordless voice authentication</p>
          </div>
        </div>

        <div className="w-full md:w-2/5 flex justify-end pr-12">
          <div className="voice-card p-8 slide-panel max-w-md w-full">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-semibold">Register your account</h3>
                <div className="border-t border-slate-200 my-2" />

                <div className="grid gap-4">
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
                    className={passwordsMatch ? "border-green-400" : undefined}
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
                    className={passwordConfirm === "" ? undefined : passwordsMatch ? "border-green-400" : "border-red-400"}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Button type="submit" className="fpt-accent-bg" disabled={!passwordsMatch || username.trim() === ""}>
                    Continue ➜
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetAll}>
                    Reset
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Voice Registration</h3>
                <div className="border-t border-slate-200 my-2" />

                <p className="text-sm text-slate-700">lease read the following sentence <span className="text-2xl font-bold fpt-accent">5 times</span>:</p>
                <p className="text-lg font-semibold mt-2">"Vừng ơi mở ra"</p>

                <div className="mt-4">
                  <AudioRecorder
                    label="Voice sample"
                    description="Click the mic and read the phrase clearly once."
                    onRecordingComplete={(f) => {
                      if (f) {
                        setFile(f);
                      }
                    }}
                    onDurationChange={(d) => setVoiceDuration(d)}
                    file={file}
                    onStartRecording={() => setIsRecording(true)}
                    onStopRecording={() => setIsRecording(false)}
                  />

                  {/* single recording mode — no progress dots */}

                  <div className="mt-4">
                    <Button onClick={handleFinalize} className="fpt-accent-bg w-full" disabled={!file || isRegistering}>
                      Complete Register
                    </Button>
                  </div>

                  <div className="mt-4">{isRegistering && <div className="wave-loader" />}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrollPage;
