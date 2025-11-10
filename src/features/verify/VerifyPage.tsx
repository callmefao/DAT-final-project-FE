import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import AudioRecorder from "../../components/AudioRecorder";
import InputField from "../../components/InputField";
import ResultCard from "../../components/ResultCard";
import FileUploader from "../../components/FileUploader";
import { verifyVoice } from "../../api/voiceApi";
import type { VerifyResponse } from "../../types/api";
import { formatConfidence } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";
import { useErrorOverlay } from "../../hooks/useErrorOverlay";
import { getErrorMessage } from "../../utils/error";

const VerifyPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<"password" | "voice" | null>(null);
  const { login } = useAuth();
  const { showError } = useErrorOverlay();
  const navigate = useNavigate();

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleResult = (
    response: VerifyResponse,
    fallbackUsername: string,
    successMessage: string,
    failureMessage: string
  ) => {
    setResult(response);
    if (response.status === "success") {
      const resolvedUsername = response.username ?? fallbackUsername;
      login({ username: resolvedUsername, hasVoiceProfile: true });
      toast.success(successMessage);
      // Navigate to home page after successful login
      setTimeout(() => {
        navigate("/");
      }, 500);
    } else {
      showError(failureMessage);
    }
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) {
      showError("Enter your username and password");
      return;
    }

    try {
      setIsPasswordLoading(true);
      const trimmed = username.trim();
      const response = await verifyVoice(trimmed, { password });
      handleResult(response, trimmed, "Logged in with password", "Password verification failed");
    } catch (error) {
      showError(getErrorMessage(error, "Login failed"));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleVoiceLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username) {
      showError("Please provide your username for voice login");
      return;
    }

    if (!file) {
      showError("Please record your voice sample before submitting");
      return;
    }

    try {
      setIsVoiceLoading(true);
      const trimmed = username.trim();
      const response = await verifyVoice(trimmed, { file });
      handleResult(response, trimmed, "Logged in with voice", "Voice verification failed");
    } catch (error) {
      showError(getErrorMessage(error, "Voice login failed"));
    } finally {
      setIsVoiceLoading(false);
    }
  };

  return (
    <>
      <div className="enroll-split w-full relative z-10 md:min-h-[calc(100vh-64px)] md:flex md:items-center md:justify-between">
        <div className="hidden md:block md:w-3/5 px-12">
          <div className="text-white/90 max-w-xl">
            <h1 className="text-5xl font-extrabold drop-shadow-lg">Welcome back</h1>
            <p className="mt-3 text-lg">Sign in quickly with your password or voice — same playful style as registration.</p>
          </div>
        </div>

        <div className="w-full md:w-2/5 flex justify-end pr-12">
          <div className="voice-card p-8 slide-panel max-w-md w-full">
            {step === 1 ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Sign in</h3>
                <div className="border-t border-slate-200 my-2" />

                <InputField
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="username"
                  required
                />

                <div className="mt-4 flex gap-3">
                  <Button
                    type="button"
                    className="fpt-accent-bg flex-1"
                    onClick={() => {
                      if (!username.trim()) {
                        showError("Please enter your username first");
                        return;
                      }
                      setResult(null);
                      setStep(2);
                      setMethod("password");
                    }}
                  >
                    Login with Password
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="fpt-accent-bg flex-1"
                    onClick={() => {
                      if (!username.trim()) {
                        showError("Please enter your username first");
                        return;
                      }
                      setResult(null);
                      setStep(2);
                      setMethod("voice");
                    }}
                  >
                    Login with Voice
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">Continue signing in</h3>
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                </div>

                {method === "password" && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <InputField label="Username" value={username} readOnly />
                    <InputField
                      type="password"
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      required
                    />
                    <div className="flex gap-3">
                      <Button type="submit" className="fpt-accent-bg flex-1" isLoading={isPasswordLoading}>
                        {isPasswordLoading ? "Signing in" : "Login with Password"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setPassword("")}>Clear</Button>
                    </div>
                  </form>
                )}

                {method === "voice" && (
                  <form onSubmit={handleVoiceLogin} className="space-y-4">
                    <InputField label="Username" value={username} readOnly />
                    
                    <p className="text-sm text-slate-700">Vui lòng đọc câu sau trong <span className="text-xl font-bold fpt-accent">5 giây</span>:</p>
                    <p className="text-lg font-bold text-primary">"Hãy cho tôi đăng nhập, vừng ơi mở ra"</p>
                    
                    <div className="space-y-3">
                      <AudioRecorder
                        label="Ghi âm xác thực"
                        description="Nhấn ghi âm và đọc câu trên rõ ràng trong vòng 5 giây."
                        onRecordingComplete={(f) => setFile(f)}
                        file={file}
                        maxDuration={5}
                      />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white px-2 text-slate-500">or</span>
                        </div>
                      </div>

                      <FileUploader
                        label="Upload audio file"
                        description="Upload a pre-recorded voice sample for testing"
                        onFileSelect={setFile}
                        file={file}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="fpt-accent-bg flex-1" isLoading={isVoiceLoading}>
                        {isVoiceLoading ? "Checking" : "Login with Voice"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setFile(null);
                          setResult(null);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                )}

                {result && (
                  <div className="mt-4">
                    <ResultCard
                      status={result.status === "success" ? "success" : "error"}
                      title={result.status === "success" ? "Verification successful" : "Verification failed"}
                      subtitle={`Confidence: ${formatConfidence(result.score)} | Assist: ${result.assist}`}
                      score={result.score}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyPage;
