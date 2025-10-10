export interface EnrollResponse {
  status: string;
  username: string;
  method: "voice" | "password" | string;
}

export interface VerifyResponse {
  result: "accepted" | "rejected" | string;
  score: number;
  username: string;
  method: "voice" | "password" | string;
}

export interface ApiError {
  statusCode?: number;
  message: string;
}

export interface ChatResponse {
  message: string;
  metadata?: Record<string, unknown>;
}
