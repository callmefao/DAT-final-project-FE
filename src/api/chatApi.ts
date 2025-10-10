import axios from "axios";

import type { ChatResponse } from "../types/api";

const baseURL = import.meta.env.VITE_API_URL;

const chatClient = axios.create({
  baseURL,
  timeout: 15000
});

export const sendTextMessage = async (username: string, message: string): Promise<ChatResponse> => {
  const endpoint = `/text/${encodeURIComponent(username)}`;
  const { data } = await chatClient.post<ChatResponse>(
    endpoint,
    { message },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return data;
};

export const sendVoiceMessage = async (
  username: string,
  payload: { file: File; duration?: number }
): Promise<ChatResponse> => {
  const endpoint = `/voice/${encodeURIComponent(username)}`;
  const formData = new FormData();
  formData.append("file", payload.file, payload.file.name);
  if (typeof payload.duration === "number") {
    formData.append("duration", payload.duration.toString());
  }

  const { data } = await chatClient.post<ChatResponse>(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};
