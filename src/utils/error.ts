import { AxiosError } from "axios";

import type { ApiError, VerifyErrorResponse } from "../types/api";

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<ApiError | VerifyErrorResponse>;
    const data = axiosError.response?.data;
    
    // Check for 'detail' field (used in 403 responses)
    if (data && 'detail' in data && typeof data.detail === 'string') {
      return data.detail;
    }
    
    // Check for 'message' field (generic API errors)
    if (data && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
    
    return fallback;
  }

  return fallback;
};
