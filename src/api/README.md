# Chat API Documentation

## Overview
API client cho tính năng chat với chatbot. Tất cả các functions đều được implement theo tài liệu `CHATBOT_API_GUIDE.md`.

## Base Configuration
- **Base URL**: Được cấu hình qua biến môi trường `VITE_API_URL`
- **Timeout**: 
  - Text messages: 30 giây
  - Voice messages: 60 giây

## API Functions

### 1. `createChatSession(username, sessionName)`
Tạo một phiên chat mới cho người dùng.

**Parameters:**
- `username` (string): Tên người dùng
- `sessionName` (string): Tên của phiên chat

**Returns:** `Promise<CreateSessionResponse>`
```typescript
{
  session_id: string
}
```

**Usage:**
```typescript
const { session_id } = await createChatSession('john_doe', 'My Chat');
```

---

### 2. `getChatSessions(username)`
Lấy danh sách tất cả session_id của một người dùng.

**Parameters:**
- `username` (string): Tên người dùng

**Returns:** `Promise<SessionListResponse>` (Array of session IDs)
```typescript
string[]
```

**Usage:**
```typescript
const sessionIds = await getChatSessions('john_doe');
// ['550e8400-e29b-41d4-a716-446655440000', ...]
```

---

### 3. `getChatSessionDetail(username, sessionId)`
Lấy toàn bộ lịch sử chat của một phiên cụ thể.

**Parameters:**
- `username` (string): Tên người dùng
- `sessionId` (string): ID của phiên chat

**Returns:** `Promise<SessionDetailResponse>`
```typescript
{
  session_id: string;
  session_name: string;
  created_at: string; // ISO 8601 format
  messages: Array<{
    time: string;       // ISO 8601 format
    role: "human" | "bot";
    message: string;
  }>;
}
```

**Usage:**
```typescript
const session = await getChatSessionDetail('john_doe', 'session-id');
console.log(session.messages);
```

---

### 4. `sendTextMessage(username, sessionId, message)`
Gửi tin nhắn văn bản đến chatbot và nhận phản hồi.

**Parameters:**
- `username` (string): Tên người dùng
- `sessionId` (string): ID của phiên chat
- `message` (string): Nội dung tin nhắn

**Returns:** `Promise<SendMessageResponse>`
```typescript
{
  reply: string
}
```

**Usage:**
```typescript
const response = await sendTextMessage('john_doe', 'session-id', 'Xin chào!');
console.log(response.reply); // Bot's reply
```

**Note:** Tin nhắn người dùng và phản hồi của bot đều được tự động lưu vào database.

---

### 5. `sendVoiceMessage(username, sessionId, audioFile)`
Gửi file audio (giọng nói) đến chatbot. Hệ thống sẽ chuyển đổi giọng nói thành văn bản, sau đó gửi đến chatbot.

**Parameters:**
- `username` (string): Tên người dùng
- `sessionId` (string): ID của phiên chat
- `audioFile` (File): File audio cần gửi

**Returns:** `Promise<SendVoiceResponse>`
```typescript
{
  transcript: string; // Văn bản được chuyển đổi từ giọng nói
  reply: string;      // Phản hồi của chatbot
}
```

**Usage:**
```typescript
const file = document.getElementById('audioInput').files[0];
const response = await sendVoiceMessage('john_doe', 'session-id', file);
console.log('Transcription:', response.transcript);
console.log('Bot reply:', response.reply);
```

**Note:** Transcription và reply đều được tự động lưu vào database.

---

### 6. `deleteChatSession(username, sessionId)`
Xóa một phiên chat cụ thể và toàn bộ lịch sử tin nhắn.

**Parameters:**
- `username` (string): Tên người dùng
- `sessionId` (string): ID của phiên chat cần xóa

**Returns:** `Promise<DeleteSessionResponse>`
```typescript
{
  message: string
}
```

**Usage:**
```typescript
const result = await deleteChatSession('john_doe', 'session-id');
console.log(result.message);
```

---

## Error Handling

Tất cả các functions sử dụng Axios, vì vậy errors có thể được catch như sau:

```typescript
try {
  const response = await sendTextMessage('john_doe', 'session-id', 'Hello');
  console.log(response.reply);
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.detail);
  }
}
```

### Common Error Codes:
- **404 Not Found**: User hoặc session không tồn tại
- **500 Internal Server Error**: Chat router chưa khởi tạo hoặc lỗi server
- **502 Bad Gateway**: Không kết nối được với n8n webhook

---

## Integration Example

```typescript
// VoiceChatPage.tsx
import { 
  createChatSession,
  getChatSessions,
  getChatSessionDetail,
  sendTextMessage,
  sendVoiceMessage,
  deleteChatSession
} from '../../api/chatApi';

// Tạo session mới
const handleCreateSession = async () => {
  const { session_id } = await createChatSession(username, 'New Chat');
  // Use session_id...
};

// Gửi tin nhắn
const handleSendMessage = async (text: string) => {
  const response = await sendTextMessage(username, sessionId, text);
  // Display response.reply...
};

// Gửi giọng nói
const handleSendVoice = async (audioFile: File) => {
  const response = await sendVoiceMessage(username, sessionId, audioFile);
  // Display transcript and reply...
};

// Xóa session
const handleDelete = async (sessionId: string) => {
  await deleteChatSession(username, sessionId);
  // Update UI...
};
```

---

## Notes

1. **URL Encoding**: Tất cả username và sessionId đều được tự động encode bằng `encodeURIComponent()`
2. **Form Data**: Voice message sử dụng `FormData` với field name là `user_voice`
3. **Timeout**: Text message có timeout 30s, voice message có timeout 60s
4. **CORS**: Backend cần cấu hình CORS cho frontend URL
