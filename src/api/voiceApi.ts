import axios from "axios";

import type { EnrollResponse, VerifyResponse } from "../types/api";

const baseURL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL,
  timeout: 15000
});

// Add response interceptor to handle error responses
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // If there's a response with data, enhance the error object
    if (error.response?.data) {
      // Check for 'detail' field (common in FastAPI/Python backends for 403/422 errors)
      if (error.response.data.detail) {
        error.message = error.response.data.detail;
      }
      // Also check for 'message' field
      else if (error.response.data.message) {
        error.message = error.response.data.message;
      }
    }
    
    return Promise.reject(error);
  }
);

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
    // append both 'file' and 'fIle' to be tolerant of backend naming
    formData.append("file", file, file.name);
    try {
      formData.append("fIle", file, file.name);
    } catch (e) {
      // some environments may not allow duplicate file entries; ignore if so
    }
  }
  return formData;
};

export const enrollVoice = async (username: string, file: File, password: string): Promise<EnrollResponse> => {
  const endpoint = `/voice/enroll/${encodeURIComponent(username)}`;
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
  // If a file is provided, call the voice verification endpoint that expects a multipart/form-data with the audio file
  if (payload.file) {
    const endpoint = `/voice/verify/voice/${encodeURIComponent(username)}`;
    const { data } = await client.post<VerifyResponse>(endpoint, buildFormData({ file: payload.file }), {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data;
  }

  // If password provided, call the password verification endpoint. Send JSON body { password }.
  if (payload.password !== undefined) {
    const endpoint = `/voice/verify/password/${encodeURIComponent(username)}`;
    const { data } = await client.post<VerifyResponse>(
      endpoint,
      { password: payload.password },
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return data;
  }

  // Fallback: call generic verify endpoint with empty form data
  const endpoint = `/voice/verify/${encodeURIComponent(username)}`;
  const { data } = await client.post<VerifyResponse>(endpoint, buildFormData({}), {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};
