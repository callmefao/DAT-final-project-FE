# Audio Recording Requirements Update

## Changes Summary

### 1. Maximum Duration Limit
Audio recordings cho Enroll và Verify bây giờ bị giới hạn **tối đa 5 giây**.

### 2. Updated Passphrase
Câu yêu cầu đọc đã được thay đổi thành:
> **"Hãy cho tôi đăng nhập, vừng ơi mở ra"**

## Component Changes

### AudioRecorder Component (`src/components/AudioRecorder.tsx`)

#### New Props:
- `maxDuration?: number` - Giới hạn thời gian ghi âm tối đa (giây)

#### Features Added:
1. **Auto-stop Recording**: Tự động dừng ghi âm khi đạt `maxDuration`
2. **Countdown Timer**: Hiển thị thời gian còn lại thay vì thời gian đã trôi qua khi có `maxDuration`
3. **Vietnamese UI**: Tất cả text được dịch sang tiếng Việt

#### UI Changes:
- "Start recording" → "Bắt đầu ghi âm"
- "Stop" → "Dừng"
- "Cancel" → "Hủy"
- "Clear recording" → "Xóa ghi âm"
- "Recording in progress" → "Đang ghi âm"
- "Duration" → "Thời lượng" (hoặc "Còn lại" khi recording với maxDuration)

#### Logic:
```typescript
// Timer with auto-stop
timerRef.current = window.setInterval(() => {
  setDuration((value) => {
    const newValue = value + 1;
    // Auto-stop when reaching maxDuration
    if (maxDuration && newValue >= maxDuration) {
      stopRecording();
    }
    return newValue;
  });
}, 1000);
```

### EnrollPage (`src/features/enroll/EnrollPage.tsx`)

#### Updates:
1. **Passphrase Text**:
   ```tsx
   <p>Vui lòng đọc câu sau trong <span>5 giây</span>:</p>
   <p>"Hãy cho tôi đăng nhập, vừng ơi mở ra"</p>
   ```

2. **AudioRecorder Props**:
   ```tsx
   <AudioRecorder
     label="Ghi âm giọng nói"
     description="Nhấn mic và đọc câu trên rõ ràng trong vòng 5 giây."
     maxDuration={5}
     // ... other props
   />
   ```

3. **Labels**: 
   - "Voice sample" → "Ghi âm giọng nói"
   - Description updated to Vietnamese

### VerifyPage (`src/features/verify/VerifyPage.tsx`)

#### Updates:
1. **Added Passphrase Display**:
   ```tsx
   <p>Vui lòng đọc câu sau trong <span>5 giây</span>:</p>
   <p>"Hãy cho tôi đăng nhập, vừng ơi mở ra"</p>
   ```

2. **AudioRecorder Props**:
   ```tsx
   <AudioRecorder
     label="Ghi âm xác thực"
     description="Nhấn ghi âm và đọc câu trên rõ ràng trong vòng 5 giây."
     maxDuration={5}
     // ... other props
   />
   ```

## User Experience Flow

### Enroll (Register):
1. User nhập username và password
2. User thấy câu: **"Hãy cho tôi đăng nhập, vừng ơi mở ra"**
3. User nhấn "Bắt đầu ghi âm"
4. Countdown hiển thị từ 5s → 0s
5. Tự động dừng sau 5 giây (hoặc user nhấn "Dừng" sớm hơn)
6. Audio được convert sang WAV và gửi lên backend

### Verify (Login):
1. User nhập username
2. User chọn Voice method
3. User thấy câu: **"Hãy cho tôi đăng nhập, vừng ơi mở ra"**
4. User nhấn "Bắt đầu ghi âm"
5. Countdown hiển thị từ 5s → 0s
6. Tự động dừng sau 5 giây (hoặc user nhấn "Dừng" sớm hơn)
7. Audio được convert sang WAV và gửi lên backend

## Technical Details

### Timer Display Logic:
```typescript
// Without maxDuration: show elapsed time
"Thời lượng: 00:03"

// With maxDuration while recording: show countdown
"Còn lại: 00:02"

// After recording: show final duration
"Thời lượng: 00:05"
```

### Auto-stop Mechanism:
- Interval checks duration every second
- When `duration >= maxDuration`, calls `stopRecording()`
- MediaRecorder stops gracefully
- Audio is processed and converted to WAV

### Backend Compatibility:
- File format: WAV (unchanged from previous update)
- Max duration: 5 seconds
- File size: ~480KB (for 5s at 48kHz mono)
- Passphrase: "Hãy cho tôi đăng nhập, vừng ơi mở ra"

## Testing Checklist

- [ ] Enroll: Recording auto-stops at 5 seconds
- [ ] Enroll: Countdown displays correctly
- [ ] Enroll: Passphrase is displayed clearly
- [ ] Verify: Recording auto-stops at 5 seconds
- [ ] Verify: Countdown displays correctly
- [ ] Verify: Passphrase is displayed clearly
- [ ] Backend receives 5-second WAV files
- [ ] Voice verification works with new passphrase
- [ ] UI text is all in Vietnamese

## Benefits

✅ **Consistent Duration**: All voice samples are exactly (or up to) 5 seconds
✅ **Better UX**: User knows exactly how long to speak
✅ **Backend Optimization**: Shorter files = faster processing
✅ **Clear Instructions**: Users know what to say
✅ **Vietnamese Localization**: Better for Vietnamese users
✅ **Automatic Control**: No need to manually stop at exact time

## Notes

- Minimum duration validation (5s) still exists in EnrollPage
- Users can still stop early if needed with "Dừng" button
- File uploader still available as alternative
- WAV conversion still happens automatically
- All existing features (cancel, clear, etc.) still work
