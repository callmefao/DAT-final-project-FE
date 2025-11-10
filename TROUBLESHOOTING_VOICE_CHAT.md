# Troubleshooting Voice Chat Issues

## Vấn đề: Transcript và Reply hiển thị "(no transcription)" và "(no reply)"

### Các bước debug:

#### 1. Kiểm tra Console Logs
Mở Developer Console (F12) và kiểm tra các log sau khi gửi voice message:

```
Sending voice message: { endpoint, fileName, fileSize, fileType }
Voice message API response: { transcript, reply }
Voice message response received: { transcript, reply, fullResponse }
```

#### 2. Kiểm tra Backend API
Đảm bảo backend đang chạy trên `http://localhost:8000`

Test bằng cURL hoặc Postman:
```bash
# Kiểm tra session tồn tại
curl http://localhost:8000/chats/sessions/{username}

# Test send voice
curl -X POST \
  "http://localhost:8000/chats/send-voice/{username}/{session_id}" \
  -F "user_voice=@path/to/audio.wav"
```

#### 3. Kiểm tra biến môi trường
Tạo file `.env` trong thư mục root nếu chưa có:

```bash
VITE_API_URL=http://localhost:8000
```

Sau đó restart dev server:
```bash
npm run dev
```

#### 4. Kiểm tra Format của Audio File
Backend có thể yêu cầu format audio cụ thể. Kiểm tra:
- File size (không quá lớn)
- File type (wav, mp3, webm, etc.)
- Sample rate và bit rate

#### 5. Kiểm tra Backend Response Format

Backend PHẢI trả về JSON với structure:
```json
{
  "transcript": "nội dung đã chuyển đổi",
  "reply": "phản hồi của bot"
}
```

Nếu backend trả về format khác, cần update type definition trong `src/types/api.ts`.

#### 6. Kiểm tra Network Tab
Trong Developer Tools > Network tab:
1. Tìm request đến `/chats/send-voice/...`
2. Kiểm tra Request payload có chứa audio file không
3. Kiểm tra Response có đúng format không
4. Kiểm tra Status code (200 = success, 500 = server error, 502 = n8n không hoạt động)

### Các lỗi thường gặp:

#### Lỗi 502 Bad Gateway
**Nguyên nhân:** n8n webhook không hoạt động hoặc timeout

**Giải pháp:**
- Kiểm tra n8n workflow có đang chạy không
- Kiểm tra connection giữa backend và n8n
- Tăng timeout nếu cần (hiện tại là 60s)

#### Lỗi 404 Not Found
**Nguyên nhân:** Session không tồn tại

**Giải pháp:**
- Kiểm tra session_id có đúng không
- Tạo session mới nếu cần

#### Lỗi 500 Internal Server Error
**Nguyên nhân:** Chat router chưa khởi tạo hoặc lỗi backend

**Giải pháp:**
- Restart backend server
- Kiểm tra backend logs

#### Response trả về empty strings
**Nguyên nhân:** 
- n8n workflow không xử lý được audio
- Audio file format không được hỗ trợ
- Transcription service lỗi

**Giải pháp:**
- Kiểm tra n8n workflow logs
- Thử với audio file khác
- Kiểm tra transcription service (Whisper, Google Speech, etc.)

### Debug Code Changes:

Các đoạn code đã được thêm logging:

1. **API Layer** (`src/api/chatApi.ts`):
```typescript
console.log('Sending voice message:', { endpoint, fileName, fileSize, fileType });
console.log('Voice message API response:', data);
```

2. **Component Layer** (`src/features/voicechat/VoiceChatPage.tsx`):
```typescript
console.log('Voice message response received:', { transcript, reply, fullResponse });
console.warn('No valid transcript received:', transcript);
console.warn('No valid reply received:', reply);
console.error('Voice message error details:', { error, message, response });
```

### Test với audio mẫu:

Tạo một file audio test nhỏ để verify:
```bash
# Sử dụng Text-to-Speech online hoặc record một đoạn ngắn
# File size nên < 5MB
# Duration nên < 30s
```

### Kiểm tra CORS:

Nếu gặp CORS error, đảm bảo backend có config:
```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Contact Support:

Nếu vẫn gặp vấn đề, cung cấp thông tin sau:
1. Console logs (tất cả logs từ sending đến response)
2. Network request/response (từ DevTools)
3. Backend logs (nếu có access)
4. Audio file format và size
5. Browser và version đang dùng
