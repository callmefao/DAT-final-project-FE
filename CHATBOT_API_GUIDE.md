# Hướng Dẫn Sử Dụng Chatbot API cho Frontend Developer

## Tổng Quan

API Chatbot cung cấp các endpoint để quản lý phiên chat (sessions) và gửi tin nhắn văn bản/giọng nói đến chatbot. Base URL mặc định: `http://localhost:8000`

**Prefix:** `/chats`

---

## 1. Tạo Phiên Chat Mới

### **Endpoint**
```
POST /chats/session/{username}
```

### **Mô Tả**
Tạo một phiên chat mới cho người dùng với tên phiên cụ thể.

### **Parameters**
- **Path Parameters:**
  - `username` (string, required): Tên người dùng
  
- **Query Parameters:**
  - `session_name` (string, required): Tên của phiên chat

### **Request Example**
```bash
POST http://localhost:8000/chats/session/john_doe?session_name=My%20First%20Chat

# Hoặc với JavaScript
fetch('http://localhost:8000/chats/session/john_doe?session_name=My%20First%20Chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### **Response**

#### ✅ Thành công (200 OK)
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### ❌ Lỗi - User không tồn tại (404 Not Found)
```json
{
  "detail": "User not found"
}
```

#### ❌ Lỗi - Server chưa khởi tạo (500 Internal Server Error)
```json
{
  "detail": "Chat router not initialized"
}
```

---

## 2. Lấy Danh Sách Tất Cả Phiên Chat

### **Endpoint**
```
GET /chats/sessions/{username}
```

### **Mô Tả**
Lấy danh sách tất cả các session_id của một người dùng.

### **Parameters**
- **Path Parameters:**
  - `username` (string, required): Tên người dùng

### **Request Example**
```javascript
fetch('http://localhost:8000/chats/sessions/john_doe', {
  method: 'GET'
})
```

### **Response**

#### ✅ Thành công (200 OK)
```json
[
  "550e8400-e29b-41d4-a716-446655440000",
  "660e8400-e29b-41d4-a716-446655440001",
  "770e8400-e29b-41d4-a716-446655440002"
]
```

#### ❌ Lỗi - User không tồn tại (404 Not Found)
```json
{
  "detail": "User not found"
}
```

#### ❌ Lỗi - Server chưa khởi tạo (500 Internal Server Error)
```json
{
  "detail": "Chat router not initialized"
}
```

---

## 3. Lấy Chi Tiết Một Phiên Chat

### **Endpoint**
```
GET /chats/session/{username}/{session_id}
```

### **Mô Tả**
Lấy toàn bộ lịch sử chat của một phiên cụ thể, bao gồm tất cả tin nhắn.

### **Parameters**
- **Path Parameters:**
  - `username` (string, required): Tên người dùng
  - `session_id` (string, required): ID của phiên chat

### **Request Example**
```javascript
fetch('http://localhost:8000/chats/session/john_doe/550e8400-e29b-41d4-a716-446655440000', {
  method: 'GET'
})
```

### **Response**

#### ✅ Thành công (200 OK)
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_name": "My First Chat",
  "created_at": "2025-11-08T10:30:00.123456",
  "messages": [
    {
      "time": "2025-11-08T10:31:00.123456",
      "role": "human",
      "message": "Xin chào chatbot!"
    },
    {
      "time": "2025-11-08T10:31:02.654321",
      "role": "bot",
      "message": "Xin chào! Tôi có thể giúp gì cho bạn?"
    },
    {
      "time": "2025-11-08T10:32:00.789012",
      "role": "human",
      "message": "Thời tiết hôm nay thế nào?"
    },
    {
      "time": "2025-11-08T10:32:05.345678",
      "role": "bot",
      "message": "Tôi không có thông tin thời tiết thời gian thực, nhưng tôi có thể giúp bạn tìm kiếm thông tin khác."
    }
  ]
}
```

#### ❌ Lỗi - Session không tồn tại (404 Not Found)
```json
{
  "detail": "Session not found"
}
```

#### ❌ Lỗi - Server chưa khởi tạo (500 Internal Server Error)
```json
{
  "detail": "Chat router not initialized"
}
```

---

## 4. Gửi Tin Nhắn Văn Bản ⭐ (Endpoint Chính)

### **Endpoint**
```
POST /chats/send/{username}/{session_id}
```

### **Mô Tả**
Gửi tin nhắn văn bản từ người dùng đến chatbot và nhận phản hồi. Tin nhắn của người dùng và phản hồi của bot sẽ được lưu vào database.

### **Parameters**
- **Path Parameters:**
  - `username` (string, required): Tên người dùng
  - `session_id` (string, required): ID của phiên chat
  
- **Query Parameters:**
  - `user_message` (string, required): Nội dung tin nhắn của người dùng

### **Request Example**

#### cURL
```bash
POST http://localhost:8000/chats/send/john_doe/550e8400-e29b-41d4-a716-446655440000?user_message=Hello%20chatbot
```

#### JavaScript/TypeScript
```javascript
// Ví dụ 1: Fetch API
const sendMessage = async (username, sessionId, message) => {
  const url = `http://localhost:8000/chats/send/${username}/${sessionId}?user_message=${encodeURIComponent(message)}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Sử dụng
const result = await sendMessage('john_doe', '550e8400-e29b-41d4-a716-446655440000', 'Xin chào chatbot!');
console.log('Bot reply:', result.reply);
```

#### Axios
```javascript
import axios from 'axios';

const sendMessage = async (username, sessionId, message) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/chats/send/${username}/${sessionId}`,
      null,
      {
        params: {
          user_message: message
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};
```

### **Response**

#### ✅ Thành công (200 OK)
```json
{
  "reply": "Xin chào! Tôi là chatbot AI, tôi có thể giúp gì cho bạn hôm nay?"
}
```

**Lưu ý:** 
- Tin nhắn người dùng và phản hồi của bot đều được tự động lưu vào database
- Thời gian tin nhắn được lưu theo chuẩn ISO 8601 UTC

#### ❌ Lỗi - Không kết nối được với n8n (502 Bad Gateway)
```json
{
  "detail": "Failed to contact n8n"
}
```

**Nguyên nhân:** 
- n8n webhook không hoạt động
- Timeout (>30 giây)
- Lỗi mạng

#### ❌ Lỗi - Server chưa khởi tạo (500 Internal Server Error)
```json
{
  "detail": "Chat router not initialized"
}
```

---

## 5. Gửi Tin Nhắn Giọng Nói

### **Endpoint**
```
POST /chats/send-voice/{username}/{session_id}
```

### **Mô Tả**
Gửi file audio (giọng nói) đến chatbot. Hệ thống sẽ chuyển đổi giọng nói thành văn bản (transcription), sau đó gửi đến chatbot để nhận phản hồi.

### **Parameters**
- **Path Parameters:**
  - `username` (string, required): Tên người dùng
  - `session_id` (string, required): ID của phiên chat
  
- **Form Data:**
  - `user_voice` (file, required): File audio (UploadFile)

### **Request Example**

#### JavaScript với FormData
```javascript
const sendVoiceMessage = async (username, sessionId, audioFile) => {
  const formData = new FormData();
  formData.append('user_voice', audioFile);
  
  try {
    const response = await fetch(
      `http://localhost:8000/chats/send-voice/${username}/${sessionId}`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
};

// Sử dụng với input file
document.getElementById('voiceInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const result = await sendVoiceMessage('john_doe', '550e8400-e29b-41d4-a716-446655440000', file);
  console.log('Transcription:', result.transcript);
  console.log('Bot reply:', result.reply);
});
```

#### HTML Form
```html
<form id="voiceForm">
  <input type="file" id="voiceInput" accept="audio/*" />
  <button type="submit">Gửi Giọng Nói</button>
</form>

<script>
document.getElementById('voiceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('voiceInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Vui lòng chọn file audio');
    return;
  }
  
  const formData = new FormData();
  formData.append('user_voice', file);
  
  try {
    const response = await fetch(
      'http://localhost:8000/chats/send-voice/john_doe/550e8400-e29b-41d4-a716-446655440000',
      {
        method: 'POST',
        body: formData
      }
    );
    
    const data = await response.json();
    console.log('Transcription:', data.transcript);
    console.log('Bot reply:', data.reply);
  } catch (error) {
    console.error('Error:', error);
  }
});
</script>
```

### **Response**

#### ✅ Thành công (200 OK)
```json
{
  "transcript": "Xin chào chatbot, hôm nay thời tiết thế nào?",
  "reply": "Xin chào! Tôi không có thông tin thời tiết thời gian thực, nhưng tôi có thể giúp bạn với nhiều câu hỏi khác."
}
```

**Lưu ý:**
- Transcription (văn bản được chuyển đổi từ giọng nói) được lưu với prefix `[TRANSCRIPTION]`
- Cả transcription và reply đều được tự động lưu vào database

#### ❌ Lỗi - File không hợp lệ (400 Bad Request)
```json
{
  "detail": "Invalid file upload"
}
```

#### ❌ Lỗi - Không kết nối được với n8n (502 Bad Gateway)
```json
{
  "detail": "Failed to contact n8n"
}
```

**Nguyên nhân:**
- n8n webhook không hoạt động
- Timeout (>60 giây)
- File quá lớn
- Lỗi mạng

#### ❌ Lỗi - Server chưa khởi tạo (500 Internal Server Error)
```json
{
  "detail": "Chat router not initialized"
}
```

---

## 6. Xóa Phiên Chat

### **Endpoint**
```
DELETE /chats/session/{username}/{session_id}
```

### **Mô Tả**
Xóa một phiên chat cụ thể và toàn bộ lịch sử tin nhắn trong phiên đó.

### **Parameters**
- **Path Parameters:**
  - `username` (string, required): Tên người dùng
  - `session_id` (string, required): ID của phiên chat cần xóa

### **Request Example**
```javascript
const deleteSession = async (username, sessionId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/chats/session/${username}/${sessionId}`,
      {
        method: 'DELETE'
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Sử dụng
await deleteSession('john_doe', '550e8400-e29b-41d4-a716-446655440000');
```

### **Response**

#### ✅ Thành công (200 OK)
```json
{
  "message": "Session 550e8400-e29b-41d4-a716-446655440000 deleted for user john_doe"
}
```

#### ❌ Lỗi - Session không tồn tại (404 Not Found)
```json
{
  "detail": "Session not found"
}
```

#### ❌ Lỗi - Server chưa khởi tạo (500 Internal Server Error)
```json
{
  "detail": "Chat router not initialized"
}
```

---

## Flow Sử Dụng Tiêu Biểu

### Kịch Bản 1: Chat Mới
```javascript
// 1. Tạo session mới
const sessionResponse = await fetch(
  'http://localhost:8000/chats/session/john_doe?session_name=Chat về AI',
  { method: 'POST' }
);
const { session_id } = await sessionResponse.json();

// 2. Gửi tin nhắn
const messageResponse = await fetch(
  `http://localhost:8000/chats/send/john_doe/${session_id}?user_message=Xin chào`,
  { method: 'POST' }
);
const { reply } = await messageResponse.json();
console.log('Bot:', reply);

// 3. Tiếp tục chat...
const nextMessage = await fetch(
  `http://localhost:8000/chats/send/john_doe/${session_id}?user_message=AI là gì?`,
  { method: 'POST' }
);
```

### Kịch Bản 2: Tiếp Tục Chat Cũ
```javascript
// 1. Lấy danh sách sessions
const sessionsResponse = await fetch(
  'http://localhost:8000/chats/sessions/john_doe'
);
const sessions = await sessionsResponse.json();
const latestSessionId = sessions[sessions.length - 1];

// 2. Lấy lịch sử chat
const historyResponse = await fetch(
  `http://localhost:8000/chats/session/john_doe/${latestSessionId}`
);
const chatHistory = await historyResponse.json();
console.log('Lịch sử:', chatHistory.messages);

// 3. Gửi tin nhắn tiếp theo
const messageResponse = await fetch(
  `http://localhost:8000/chats/send/john_doe/${latestSessionId}?user_message=Tiếp tục nào`,
  { method: 'POST' }
);
```

---

## Xử Lý Lỗi Khuyến Nghị

```javascript
const handleChatError = (error, statusCode) => {
  switch (statusCode) {
    case 404:
      return 'Không tìm thấy người dùng hoặc phiên chat. Vui lòng kiểm tra lại.';
    case 500:
      return 'Lỗi server. Vui lòng thử lại sau.';
    case 502:
      return 'Không thể kết nối đến chatbot. Vui lòng kiểm tra kết nối mạng.';
    default:
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  }
};

// Sử dụng
try {
  const response = await sendMessage('john_doe', sessionId, 'Hello');
  console.log('Success:', response);
} catch (error) {
  const errorMessage = handleChatError(error, error.response?.status);
  console.error(errorMessage);
  // Hiển thị thông báo lỗi cho người dùng
}
```

---

## Lưu Ý Quan Trọng

1. **CORS**: Server đã cấu hình CORS cho `http://localhost:5173` và `http://localhost:8081`. Nếu frontend chạy ở port khác, cần cập nhật trong `main.py`.

2. **Timeout**: 
   - Gửi tin nhắn văn bản: 30 giây
   - Gửi tin nhắn giọng nói: 60 giây

3. **Encoding**: Luôn sử dụng `encodeURIComponent()` khi truyền `user_message` qua query parameter để xử lý ký tự đặc biệt.

4. **Session Management**: Mỗi session_id là duy nhất và được tạo tự động. Frontend nên lưu session_id để sử dụng cho các tin nhắn tiếp theo.

5. **Message Storage**: Tất cả tin nhắn được tự động lưu vào database với timestamp UTC (ISO 8601).

6. **Backend URL**: Mặc định là `http://localhost:8000`. Có thể thay đổi tùy theo cấu hình deployment.

---

## Testing với Postman/Insomnia

### 1. Tạo Session
```
POST http://localhost:8000/chats/session/testuser?session_name=Test Chat
```

### 2. Gửi Tin Nhắn
```
POST http://localhost:8000/chats/send/testuser/{session_id}?user_message=Hello
```

### 3. Xem Lịch Sử
```
GET http://localhost:8000/chats/session/testuser/{session_id}
```

---

## Liên Hệ & Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng kiểm tra:
- Server log để xem chi tiết lỗi
- Database connection status
- N8N webhook availability

**Backend Repository:** InferenceVertificationEcapatdnn
