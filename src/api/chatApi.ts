import axios from "axios";

import type { 
  CreateSessionResponse,
  SessionListResponse,
  SessionDetailResponse,
  SendMessageResponse,
  SendVoiceResponse,
  DeleteSessionResponse
} from "../types/api";

const baseURL = import.meta.env.VITE_API_URL;

const chatClient = axios.create({
  baseURL,
  timeout: 30000 // Text messages: 30s as per documentation
});

const voiceChatClient = axios.create({
  baseURL,
  timeout: 60000 // Voice messages: 60s as per documentation
});

/**
 * Create a new chat session for a user
 * @param username - The username of the user
 * @param sessionName - Name of the chat session
 * @returns Session ID of the created session
 */
export const createChatSession = async (
  username: string,
  sessionName: string
): Promise<CreateSessionResponse> => {
  const endpoint = `/chats/session/${encodeURIComponent(username)}`;
  const { data } = await chatClient.post<CreateSessionResponse>(
    endpoint,
    null,
    {
      params: {
        session_name: sessionName
      }
    }
  );
  return data;
};

/**
 * Get all chat sessions for a user
 * @param username - The username of the user
 * @returns Array of session IDs
 */
export const getChatSessions = async (username: string): Promise<SessionListResponse> => {
  const endpoint = `/chats/sessions/${encodeURIComponent(username)}`;
  const { data } = await chatClient.get<SessionListResponse>(endpoint);
  return data;
};

/**
 * Get details of a specific chat session including message history
 * @param username - The username of the user
 * @param sessionId - ID of the session
 * @returns Session details with messages
 */
export const getChatSessionDetail = async (
  username: string,
  sessionId: string
): Promise<SessionDetailResponse> => {
  const endpoint = `/chats/session/${encodeURIComponent(username)}/${encodeURIComponent(sessionId)}`;
  const { data } = await chatClient.get<SessionDetailResponse>(endpoint);
  return data;
};

/**
 * Send a text message to the chatbot
 * @param username - The username of the user
 * @param sessionId - ID of the session
 * @param message - Text message to send
 * @returns Bot's reply
 */
export const sendTextMessage = async (
  username: string,
  sessionId: string,
  message: string
): Promise<SendMessageResponse> => {
  const endpoint = `/chats/send/${encodeURIComponent(username)}/${encodeURIComponent(sessionId)}`;
  const { data } = await chatClient.post<SendMessageResponse>(
    endpoint,
    null,
    {
      params: {
        user_message: message
      }
    }
  );
  return data;
};

/**
 * Send a voice message to the chatbot
 * @param username - The username of the user
 * @param sessionId - ID of the session
 * @param audioFile - Audio file to send
 * @returns Transcription and bot's reply
 */
export const sendVoiceMessage = async (
  username: string,
  sessionId: string,
  audioFile: File
): Promise<SendVoiceResponse> => {
  const endpoint = `/chats/send-voice/${encodeURIComponent(username)}/${encodeURIComponent(sessionId)}`;
  const formData = new FormData();
  formData.append("user_voice", audioFile, audioFile.name);

  console.log('Sending voice message:', {
    endpoint,
    fileName: audioFile.name,
    fileSize: audioFile.size,
    fileType: audioFile.type
  });

  const { data } = await voiceChatClient.post<SendVoiceResponse>(
    endpoint,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  
  console.log('Voice message API response:', {
    transcript: data?.transcript,
    reply: data?.reply
  });
  
  // Ensure response has the expected structure
  if (!data || typeof data !== 'object') {
    console.error('Invalid API response structure:', data);
    throw new Error('Invalid response from server');
  }
  
  return data;
};

/**
 * Delete a chat session
 * @param username - The username of the user
 * @param sessionId - ID of the session to delete
 * @returns Deletion confirmation message
 */
export const deleteChatSession = async (
  username: string,
  sessionId: string
): Promise<DeleteSessionResponse> => {
  const endpoint = `/chats/session/${encodeURIComponent(username)}/${encodeURIComponent(sessionId)}`;
  const { data } = await chatClient.delete<DeleteSessionResponse>(endpoint);
  return data;
};
