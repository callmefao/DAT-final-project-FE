import type { EnrollResponse, VerifyResponse } from "../types/api";
import { enrollVoice, verifyVoice } from "./voiceApi";

export const registerUser = async (username: string, password: string, file: File): Promise<EnrollResponse> => {
  return enrollVoice(username, file, password);
};

export const loginWithPassword = async (username: string, password: string): Promise<VerifyResponse> => {
  return verifyVoice(username, { password });
};

export const loginWithVoice = async (username: string, file: File): Promise<VerifyResponse> => {
  return verifyVoice(username, { file });
};
