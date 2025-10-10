import axios from "axios";

import type { EnrollResponse, VerifyResponse } from "../types/api";

const baseURL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL,
  timeout: 15000
});

type FormDataPayload = {
  file?: File | null;
  password?: string;
};

const buildFormData = ({ file, password }: FormDataPayload) => {
  const formData = new FormData();
  if (password !== undefined) {
    formData.append("password", password);
  }
  if (file) {
    formData.append("file", file, file.name);
  }
  return formData;
};

export const enrollVoice = async (username: string, file: File, password: string): Promise<EnrollResponse> => {
  const endpoint = `/enroll/${encodeURIComponent(username)}`;
  const { data } = await client.post<EnrollResponse>(endpoint, buildFormData({ file, password }), {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const verifyVoice = async (
  username: string,
  payload: { file?: File | null; password?: string }
): Promise<VerifyResponse> => {
  const endpoint = `/verify/${encodeURIComponent(username)}`;
  const { data } = await client.post<VerifyResponse>(endpoint, buildFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};
