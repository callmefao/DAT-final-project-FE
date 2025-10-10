import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import AudioRecorder from "../../components/AudioRecorder";
import InputField from "../../components/InputField";
import ResultCard from "../../components/ResultCard";
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
    if (response.result === "accepted") {
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
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">
          Choose how you want to sign in—use your password, or go passwordless with your voice.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handlePasswordLogin}>
          <h2 className="text-lg font-semibold text-slate-900">Login with Password</h2>
          <InputField
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
            required
          />
          <InputField
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full" isLoading={isPasswordLoading}>
            {isPasswordLoading ? "Signing in" : "Login with Password"}
          </Button>
        </form>

        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleVoiceLogin}>
          <h2 className="text-lg font-semibold text-slate-900">Login with Voice</h2>
          <InputField
            label="Username"
            placeholder="Enter your voice-registered username"
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
            required
          />
          <AudioRecorder
            label="Record a verification sample"
            description="Tap record and speak clearly to verify your identity."
            onRecordingComplete={setFile}
            file={file}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="w-full sm:w-auto" isLoading={isVoiceLoading}>
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
              Clear recording
            </Button>
          </div>
        </form>
      </div>

      {result && (
        <ResultCard
          status={result.result === "accepted" ? "success" : "error"}
          title={result.result === "accepted" ? "Verification successful" : "Verification failed"}
          subtitle={`Confidence: ${formatConfidence(result.score)}`}
          score={result.score}
        />
      )}
    </div>
  );
};

export default VerifyPage;
