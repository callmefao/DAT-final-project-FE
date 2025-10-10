import { AxiosError } from "axios";

import type { ApiError } from "../types/api";

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if ((error as AxiosError<ApiError>).isAxiosError) {
    const axiosError = error as AxiosError<ApiError>;
    return axiosError.response?.data?.message ?? fallback;
  }

  return fallback;
};
