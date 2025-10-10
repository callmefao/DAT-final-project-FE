import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../features/home/HomePage";
import EnrollPage from "../features/enroll/EnrollPage";
import VerifyPage from "../features/verify/VerifyPage";
import VoiceChatPage from "../features/voicechat/VoiceChatPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<EnrollPage />} />
      <Route path="/login" element={<VerifyPage />} />
      <Route path="/voice-chat" element={<VoiceChatPage />} />
      <Route path="/enroll" element={<Navigate to="/register" replace />} />
      <Route path="/verify" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
