# Backend Voice Transcription Issue

## Vấn đề phát hiện

Backend đang trả về placeholder text thay vì actual transcription:
```json
{
  "transcript": "(no transcription)",
  "reply": "(no reply)"
}
```

## Root Cause Analysis

### 1. Kiểm tra Backend Logs

Chạy backend và check logs khi gửi voice message:
```bash
# Terminal chạy backend
python main.py
# hoặc
uvicorn main:app --reload
```

Tìm logs liên quan đến:
- `/chats/send-voice` endpoint
- n8n webhook call
- Transcription errors

### 2. Kiểm tra n8n Workflow

n8n workflow cần:
1. **Nhận audio file** từ FastAPI
2. **Transcribe audio** (Whisper/Google Speech/Azure STT)
3. **Gửi text đến chatbot**
4. **Trả về response**

**Các vấn đề thường gặp:**

#### A. Audio Format không được hỗ trợ
Frontend đang gửi `audio/webm;codecs=opus` format.

**Giải pháp:**
- Kiểm tra transcription service có hỗ trợ WebM không
- Nếu không, cần convert sang WAV/MP3:
  ```python
  # Trong backend hoặc n8n
  from pydub import AudioSegment
  
  audio = AudioSegment.from_file(file, format="webm")
  audio.export("output.wav", format="wav")
  ```

#### B. n8n Webhook không nhận được file
Kiểm tra n8n workflow:
1. Mở n8n editor (`http://localhost:5678`)
2. Tìm workflow xử lý voice chat
3. Check node nhận HTTP request
4. Verify binary data có được pass đúng không

#### C. Transcription Service Error
**OpenAI Whisper:**
```python
# Check API key
import openai
openai.api_key = "your-key"

# Test transcription
audio_file = open("test.wav", "rb")
transcript = openai.Audio.transcribe("whisper-1", audio_file)
```

**Google Speech:**
```python
from google.cloud import speech

client = speech.SpeechClient()
# Check credentials và test
```

### 3. Kiểm tra Backend Code

File cần check: `chats_router.py` hoặc tương tự

```python
@router.post("/send-voice/{username}/{session_id}")
async def send_voice_message(
    username: str,
    session_id: str,
    user_voice: UploadFile = File(...)
):
    try:
        # Gửi đến n8n
        response = await call_n8n_webhook(user_voice)
        
        # LOG RA ĐÂY!
        print(f"n8n response: {response}")
        
        # Kiểm tra response format
        transcript = response.get("transcript", "(no transcription)")
        reply = response.get("reply", "(no reply)")
        
        return {
            "transcript": transcript,
            "reply": reply
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        # Trả về placeholder khi lỗi
        return {
            "transcript": "(no transcription)",
            "reply": "(no reply)"
        }
```

### 4. Test từng bước

#### Step 1: Test audio file có được gửi đúng không
```python
@router.post("/send-voice/{username}/{session_id}")
async def send_voice_message(...):
    # Log file info
    print(f"Received file: {user_voice.filename}")
    print(f"Content type: {user_voice.content_type}")
    print(f"File size: {user_voice.size}")
    
    # Save file để test
    with open(f"test_{user_voice.filename}", "wb") as f:
        content = await user_voice.read()
        f.write(content)
    print("File saved for testing")
```

#### Step 2: Test n8n connection
```python
import httpx

async def test_n8n_connection():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:5678/webhook-test/...")
        print(f"n8n status: {response.status_code}")
```

#### Step 3: Test transcription trực tiếp
```python
# Bypass n8n, test transcription trực tiếp
import openai

async def test_transcription(audio_file_path: str):
    with open(audio_file_path, "rb") as audio:
        transcript = openai.Audio.transcribe("whisper-1", audio)
        print(f"Transcript: {transcript}")
```

### 5. Temporary Workaround

Nếu transcription không hoạt động, có thể:

**Option 1:** Sử dụng alternative transcription service
```python
# Thay vì OpenAI Whisper, dùng Google Speech hoặc Azure
```

**Option 2:** Convert audio format trước
```python
from pydub import AudioSegment

def convert_webm_to_wav(webm_file):
    audio = AudioSegment.from_file(webm_file, format="webm")
    wav_file = "converted.wav"
    audio.export(wav_file, format="wav", parameters=[
        "-ar", "16000",  # Sample rate
        "-ac", "1"       # Mono
    ])
    return wav_file
```

**Option 3:** Log và return proper error
```python
return {
    "transcript": "Error: Could not transcribe audio",
    "reply": "Xin lỗi, hệ thống không thể chuyển đổi giọng nói của bạn lúc này. Vui lòng thử lại sau hoặc sử dụng tin nhắn văn bản."
}
```

## Action Items

1. ✅ **Kiểm tra backend logs** - Xem error gì đang xảy ra
2. ✅ **Kiểm tra n8n workflow** - Verify workflow có chạy đúng không
3. ✅ **Test transcription service** - Đảm bảo service hoạt động
4. ✅ **Kiểm tra audio format** - WebM có được hỗ trợ không
5. ✅ **Update error handling** - Trả về error message rõ ràng thay vì placeholder

## Frontend đã được update

Frontend bây giờ sẽ:
- Detect placeholder text `"(no transcription)"` và `"(no reply)"`
- Hiển thị error message rõ ràng hơn
- Gợi ý user thử lại hoặc dùng text message

## Next Steps

1. Share backend logs khi gửi voice message
2. Check n8n workflow execution logs
3. Verify transcription service credentials và status
4. Test với audio file format khác (WAV thay vì WebM) nếu cần

