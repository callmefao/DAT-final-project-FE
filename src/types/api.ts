export interface EnrollResponse {
  status: string;
  username: string;
  method: "voice" | "password" | string;
}

export interface VerifyResponse {
  status: "success" | "error" | string;
  username: string;
  method: "voice" | "password" | string;
  score: number;
  assist: string;
}

export interface VerifyErrorResponse {
  detail: string;
}

export interface ApiError {
  statusCode?: number;
  message: string;
}

export interface ChatResponse {
  message: string;
  metadata?: Record<string, unknown>;
}

// Chatbot API types
export interface CreateSessionResponse {
  session_id: string;
}

export type SessionListResponse = string[];

export interface ChatMessageData {
  time: string;
  role: "human" | "bot";
  message: string;
}

export interface SessionDetailResponse {
  session_id: string;
  session_name: string;
  created_at: string;
  messages: ChatMessageData[];
}

export interface SendMessageResponse {
  reply: string;
}

export interface SendVoiceResponse {
  transcript: string;
  reply: string;
}

export interface DeleteSessionResponse {
  message: string;
}
